import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail, 
  sendEmailVerification, 
  deleteUser,
  updateProfile 
} from 'firebase/auth';
import { auth, testFirestoreConnection } from '../firebase/config';
import { dbService } from '../services/dbService';
import { UserProfile, SubscriptionInfo } from '../types';
import { DEFAULT_SUBSCRIPTION } from '../constants/initialData';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isEmailVerified: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (name: string, email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  updateUserPreferences: (updater: (prev: UserProfile) => UserProfile) => Promise<void>;
  updateSubscriptionState: (sub: SubscriptionInfo) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Test firestore connection on mount
    testFirestoreConnection();

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          let userProf = await dbService.getUserProfile(currentUser.uid);
          if (!userProf) {
            // Initialize new user profile
            userProf = {
              uid: currentUser.uid,
              email: currentUser.email || 'user@focuslock.app',
              displayName: currentUser.displayName || 'Focus Explorer',
              photoURL: currentUser.photoURL || undefined,
              phoneNumber: currentUser.phoneNumber || undefined,
              phoneVerified: Boolean(currentUser.phoneNumber),
              settings: {
                shareAnonymousAnalytics: true,
                sendDetailedUsageReports: true,
                biometricProtectedSettings: true,
                strictModeEnabled: false,
                emergencyUnlockDelaySeconds: 60
              },
              notificationPreferences: {
                allImportant: true,
                securityOnly: false,
                weeklyDigest: true,
                monthlyDigest: true,
                marketing: false,
                emailOnEmergencyUnlock: true,
                emailOnGoalComplete: true
              },
              privacySettings: {
                shareAnonymousAnalytics: true,
                sendDetailedUsageReports: true,
                biometricProtectedSettings: true,
                strictModeEnabled: false,
                emergencyUnlockDelaySeconds: 60
              },
              subscriptionSummary: DEFAULT_SUBSCRIPTION,
              currentStreak: 6,
              longestStreak: 14,
              lifetimeSecondsSaved: 168400, // ~46.7 hours saved so far
              skipsUsedToday: 0,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            await dbService.saveUserProfile(userProf as UserProfile);
          }
          setProfile(userProf);
        } catch (e) {
          console.error("Error loading user profile:", e);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const signInWithEmail = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const signUpWithEmail = async (name: string, email: string, pass: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    if (cred.user) {
      await updateProfile(cred.user, { displayName: name });
      try {
        await sendEmailVerification(cred.user);
      } catch (err) {
        console.warn("Could not dispatch verification email immediately", err);
      }
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const resendVerificationEmail = async () => {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
    }
  };

  const deleteAccount = async () => {
    if (auth.currentUser) {
      await deleteUser(auth.currentUser);
    }
  };

  const updateUserPreferences = async (updater: (prev: UserProfile) => UserProfile) => {
    if (!profile) return;
    const updated = updater(profile);
    setProfile(updated);
    await dbService.saveUserProfile(updated);
  };

  const updateSubscriptionState = async (sub: SubscriptionInfo) => {
    if (!profile) return;
    const updated = {
      ...profile,
      subscriptionSummary: sub,
      updatedAt: new Date().toISOString()
    };
    setProfile(updated);
    await dbService.saveUserProfile(updated);
    await dbService.updateSubscription(profile.uid, sub);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isEmailVerified: user?.emailVerified ?? true,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        logout,
        resetPassword,
        resendVerificationEmail,
        deleteAccount,
        updateUserPreferences,
        updateSubscriptionState
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
