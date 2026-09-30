import { 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  collection, 
  updateDoc, 
  deleteDoc, 
  onSnapshot 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import { 
  UserProfile, 
  SelectedApp, 
  FocusProfile, 
  FocusSession, 
  DailyUsage, 
  DeviceInfo, 
  SubscriptionInfo, 
  OutboundEmailLog 
} from '../types';

export const dbService = {
  // --- USER PROFILE ---
  async saveUserProfile(user: UserProfile): Promise<void> {
    const path = `users/${user.uid}`;
    try {
      await setDoc(doc(db, 'users', user.uid), user, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  },

  async getUserProfile(uid: string): Promise<UserProfile | null> {
    const path = `users/${uid}`;
    try {
      const snap = await getDoc(doc(db, 'users', uid));
      if (snap.exists()) {
        return snap.data() as UserProfile;
      }
      return null;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, path);
      return null;
    }
  },

  // --- APPS & DOMAINS ---
  async syncSelectedApp(uid: string, app: SelectedApp): Promise<void> {
    const path = `users/${uid}/selectedApps/${app.id}`;
    try {
      await setDoc(doc(db, 'users', uid, 'selectedApps', app.id), app, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  },

  async getSelectedApps(uid: string): Promise<SelectedApp[]> {
    const path = `users/${uid}/selectedApps`;
    try {
      const snap = await getDocs(collection(db, 'users', uid, 'selectedApps'));
      return snap.docs.map(d => d.data() as SelectedApp);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, path);
      return [];
    }
  },

  async deleteSelectedApp(uid: string, appId: string): Promise<void> {
    const path = `users/${uid}/selectedApps/${appId}`;
    try {
      await deleteDoc(doc(db, 'users', uid, 'selectedApps', appId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  },

  // --- FOCUS PROFILES ---
  async saveFocusProfile(uid: string, profile: FocusProfile): Promise<void> {
    const path = `users/${uid}/profiles/${profile.id}`;
    try {
      await setDoc(doc(db, 'users', uid, 'profiles', profile.id), profile, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  },

  async getFocusProfiles(uid: string): Promise<FocusProfile[]> {
    const path = `users/${uid}/profiles`;
    try {
      const snap = await getDocs(collection(db, 'users', uid, 'profiles'));
      return snap.docs.map(d => d.data() as FocusProfile);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, path);
      return [];
    }
  },

  async deleteFocusProfile(uid: string, profileId: string): Promise<void> {
    const path = `users/${uid}/profiles/${profileId}`;
    try {
      await deleteDoc(doc(db, 'users', uid, 'profiles', profileId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  },

  // --- FOCUS SESSIONS ---
  async recordFocusSession(uid: string, session: FocusSession): Promise<void> {
    const path = `users/${uid}/focusSessions/${session.id}`;
    try {
      await setDoc(doc(db, 'users', uid, 'focusSessions', session.id), session, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  },

  async getRecentFocusSessions(uid: string): Promise<FocusSession[]> {
    const path = `users/${uid}/focusSessions`;
    try {
      const snap = await getDocs(collection(db, 'users', uid, 'focusSessions'));
      return snap.docs.map(d => d.data() as FocusSession);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, path);
      return [];
    }
  },

  // --- DAILY USAGE ---
  async recordDailyUsage(uid: string, usage: DailyUsage): Promise<void> {
    const path = `users/${uid}/usageDaily/${usage.date}`;
    try {
      await setDoc(doc(db, 'users', uid, 'usageDaily', usage.date), usage, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  },

  async getDailyUsage(uid: string, date: string): Promise<DailyUsage | null> {
    const path = `users/${uid}/usageDaily/${date}`;
    try {
      const snap = await getDoc(doc(db, 'users', uid, 'usageDaily', date));
      if (snap.exists()) {
        return snap.data() as DailyUsage;
      }
      return null;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, path);
      return null;
    }
  },

  // --- DEVICES ---
  async syncDevice(uid: string, device: DeviceInfo): Promise<void> {
    const path = `users/${uid}/devices/${device.deviceId}`;
    try {
      await setDoc(doc(db, 'users', uid, 'devices', device.deviceId), device, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  },

  async getDevices(uid: string): Promise<DeviceInfo[]> {
    const path = `users/${uid}/devices`;
    try {
      const snap = await getDocs(collection(db, 'users', uid, 'devices'));
      return snap.docs.map(d => d.data() as DeviceInfo);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, path);
      return [];
    }
  },

  // --- SUBSCRIPTION ---
  async updateSubscription(uid: string, sub: SubscriptionInfo): Promise<void> {
    const path = `users/${uid}/subscriptions/current`;
    try {
      await setDoc(doc(db, 'users', uid, 'subscriptions', 'current'), sub, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  },

  // --- MAIL LOGS TRIGGER ---
  async queueEmail(mail: OutboundEmailLog): Promise<void> {
    const path = `mail/${mail.id}`;
    try {
      await setDoc(doc(db, 'mail', mail.id), {
        to: mail.to,
        template: mail.template,
        subject: mail.subject,
        message: {
          subject: mail.subject,
          text: mail.previewSnippet
        },
        createdAt: Date.now()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  }
};
