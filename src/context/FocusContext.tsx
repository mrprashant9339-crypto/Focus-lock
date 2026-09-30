import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  SelectedApp, 
  FocusProfile, 
  FocusSession, 
  DailyUsage, 
  DeviceInfo, 
  InterventionType, 
  OutboundEmailLog 
} from '../types';
import { 
  DEFAULT_SELECTED_APPS, 
  DEFAULT_PROFILES, 
  DEFAULT_DEVICE 
} from '../constants/initialData';
import { dbService } from '../services/dbService';
import { useAuth } from './AuthContext';

interface FocusContextType {
  // Session
  activeSession: FocusSession | null;
  timeRemaining: number; // seconds
  isPaused: boolean;
  isOnBreak: boolean;
  breakTimeRemaining: number;
  startSession: (profileId: string, durationMinutes: number, goal?: string) => void;
  pauseSession: () => boolean; // returns false if strict mode prevents
  resumeSession: () => void;
  endSession: (completed?: boolean) => void;
  takeBreak: (minutes?: number) => void;
  emergencyUnlock: () => void;

  // Apps & Profiles
  apps: SelectedApp[];
  profiles: FocusProfile[];
  activeProfile: FocusProfile;
  setActiveProfile: (profile: FocusProfile) => void;
  toggleAppStatus: (appId: string) => void;
  updateAppRule: (appId: string, ruleType: SelectedApp['ruleType'], intervention: InterventionType, limitSeconds?: number) => void;
  addNewApp: (name: string, identifier: string, category: SelectedApp['category'], ruleType: SelectedApp['ruleType'], intervention: InterventionType) => void;
  deleteApp: (appId: string) => void;
  toggleProfileStatus: (profileId: string) => void;
  updateProfile: (profile: FocusProfile) => void;

  // Daily Usage & Stats
  dailyUsage: DailyUsage;
  recordAppBlockedAttempt: (appName: string) => void;
  recordInterventionPassed: (appName: string) => void;
  recordInterventionSkipped: (appName: string) => void;

  // Device & Permissions
  device: DeviceInfo;
  updatePermission: (key: keyof DeviceInfo['permissions'], granted: boolean) => void;

  // Interventions Simulator
  simulatedInterventionApp: SelectedApp | null;
  triggerInterventionSimulator: (app: SelectedApp) => void;
  dismissInterventionSimulator: () => void;

  // Emails queue
  outboundEmails: OutboundEmailLog[];
  triggerEmailNotification: (category: OutboundEmailLog['category'], subject: string, template: string, snippet: string) => void;

  // Biometric / PIN guard
  isBiometricAuthenticated: boolean;
  verifyBiometric: (reason: string) => Promise<boolean>;
}

const FocusContext = createContext<FocusContextType | null>(null);

const TODAY_DATE = new Date().toISOString().split('T')[0];

export const FocusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  // App & Profile State
  const [apps, setApps] = useState<SelectedApp[]>(DEFAULT_SELECTED_APPS);
  const [profiles, setProfiles] = useState<FocusProfile[]>(DEFAULT_PROFILES);
  const [activeProfile, setActiveProfile] = useState<FocusProfile>(DEFAULT_PROFILES[0]);

  // Session State
  const [activeSession, setActiveSession] = useState<FocusSession | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isOnBreak, setIsOnBreak] = useState<boolean>(false);
  const [breakTimeRemaining, setBreakTimeRemaining] = useState<number>(0);

  // Daily Stats State
  const [dailyUsage, setDailyUsage] = useState<DailyUsage>({
    date: TODAY_DATE,
    screenTimeSeconds: 11400, // 3h 10m
    unlockCount: 42,
    focusTimeSeconds: 5400,   // 1h 30m
    blockedAttempts: 18,
    interventionAttempts: 12,
    interventionPassed: 4,
    interventionSkipped: 8,
    emergencyUnlocks: 1,
    breakMinutes: 10
  });

  // Device State
  const [device, setDevice] = useState<DeviceInfo>(DEFAULT_DEVICE);

  // Interventions Simulator State
  const [simulatedInterventionApp, setSimulatedInterventionApp] = useState<SelectedApp | null>(null);

  // Outbound email logs
  const [outboundEmails, setOutboundEmails] = useState<OutboundEmailLog[]>([
    {
      id: 'mail_welcome_001',
      to: user?.email || 'mrprashant9339@gmail.com',
      subject: 'Welcome to FocusLock — Reclaim Your Attention',
      category: 'ACCOUNT',
      template: 'welcome_onboarding',
      sentAt: Date.now() - 3600000 * 24 * 2,
      previewSnippet: 'Your digital wellbeing guardian is configured. Your daily target: 2 hours of focused deep work.'
    },
    {
      id: 'mail_weekly_002',
      to: user?.email || 'mrprashant9339@gmail.com',
      subject: 'Your FocusLock Weekly Report: 12.4 Hours Saved',
      category: 'FOCUS',
      template: 'weekly_progress_report',
      sentAt: Date.now() - 3600000 * 24,
      previewSnippet: 'Outstanding week! You completed 14 focus sessions with an 84% pass rate on gentle interventions.'
    }
  ]);

  const [isBiometricAuthenticated, setIsBiometricAuthenticated] = useState<boolean>(false);

  // Load user data from Firestore on sign-in
  useEffect(() => {
    if (!user) return;
    const loadData = async () => {
      try {
        const [cloudApps, cloudProfiles, cloudUsage, cloudDevices] = await Promise.all([
          dbService.getSelectedApps(user.uid),
          dbService.getFocusProfiles(user.uid),
          dbService.getDailyUsage(user.uid, TODAY_DATE),
          dbService.getDevices(user.uid)
        ]);

        if (cloudApps.length > 0) setApps(cloudApps);
        if (cloudProfiles.length > 0) {
          setProfiles(cloudProfiles);
          setActiveProfile(cloudProfiles[0]);
        }
        if (cloudUsage) setDailyUsage(cloudUsage);
        if (cloudDevices.length > 0) setDevice(cloudDevices[0]);
      } catch (err) {
        console.warn("Could not load from Firestore, using offline cache", err);
      }
    };
    loadData();
  }, [user]);

  // Main Session Countdown Timer
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (activeSession && !isPaused && !isOnBreak && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            // Session completed!
            endSession(true);
            return 0;
          }
          return prev - 1;
        });

        // Increment focus time in daily usage every minute
        setDailyUsage(prev => ({
          ...prev,
          focusTimeSeconds: prev.focusTimeSeconds + 1
        }));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [activeSession, isPaused, isOnBreak, timeRemaining]);

  // Break Countdown Timer
  useEffect(() => {
    let breakTimer: NodeJS.Timeout | null = null;
    if (isOnBreak && breakTimeRemaining > 0) {
      breakTimer = setInterval(() => {
        setBreakTimeRemaining(prev => {
          if (prev <= 1) {
            setIsOnBreak(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (breakTimer) clearInterval(breakTimer);
    };
  }, [isOnBreak, breakTimeRemaining]);

  const triggerEmailNotification = useCallback((
    category: OutboundEmailLog['category'], 
    subject: string, 
    template: string, 
    snippet: string
  ) => {
    const newMail: OutboundEmailLog = {
      id: `mail_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      to: user?.email || 'mrprashant9339@gmail.com',
      subject,
      category,
      template,
      sentAt: Date.now(),
      previewSnippet: snippet
    };
    setOutboundEmails(prev => [newMail, ...prev]);
    if (user) {
      dbService.queueEmail(newMail).catch(e => console.error("Mail queue error", e));
    }
  }, [user]);

  const startSession = (profileId: string, durationMinutes: number, goal: string = 'Deep Focus & Flow') => {
    const matchedProfile = profiles.find(p => p.id === profileId) || activeProfile;
    const session: FocusSession = {
      id: `session_${Date.now()}`,
      profileId: matchedProfile.id,
      profileName: matchedProfile.name,
      startTime: Date.now(),
      plannedDuration: durationMinutes * 60,
      actualDuration: 0,
      goal,
      completed: false,
      bypassed: false,
      emergencyUnlockUsed: false,
      breakUsed: false,
      skipUsed: false,
      deviceId: device.deviceId
    };

    setActiveSession(session);
    setTimeRemaining(durationMinutes * 60);
    setIsPaused(false);
    setIsOnBreak(false);

    // Sync to Firestore
    if (user) {
      dbService.recordFocusSession(user.uid, session);
    }
  };

  const pauseSession = (): boolean => {
    // If profile has strict lock enabled, pausing is forbidden
    if (activeProfile.strictLock) {
      return false;
    }
    setIsPaused(prev => !prev);
    return true;
  };

  const resumeSession = () => {
    setIsPaused(false);
    setIsOnBreak(false);
  };

  const endSession = (completed: boolean = false) => {
    if (!activeSession) return;
    const finished: FocusSession = {
      ...activeSession,
      endTime: Date.now(),
      actualDuration: activeSession.plannedDuration - timeRemaining,
      completed
    };

    setActiveSession(null);
    setTimeRemaining(0);
    setIsPaused(false);
    setIsOnBreak(false);

    if (user) {
      dbService.recordFocusSession(user.uid, finished);
    }

    if (completed) {
      triggerEmailNotification(
        'FOCUS',
        `Focus Goal Achieved: ${activeSession.profileName}`,
        'goal_completed',
        `Great discipline! You completed your ${Math.round(activeSession.plannedDuration / 60)}-minute focus session toward "${activeSession.goal}".`
      );
    }
  };

  const takeBreak = (minutes: number = 5) => {
    if (!activeSession) return;
    setIsOnBreak(true);
    setBreakTimeRemaining(minutes * 60);
    setDailyUsage(prev => ({
      ...prev,
      breakMinutes: prev.breakMinutes + minutes
    }));
  };

  const emergencyUnlock = () => {
    if (!activeSession) return;
    const finished: FocusSession = {
      ...activeSession,
      endTime: Date.now(),
      actualDuration: activeSession.plannedDuration - timeRemaining,
      completed: false,
      emergencyUnlockUsed: true
    };
    setActiveSession(null);
    setTimeRemaining(0);
    setIsPaused(false);
    setIsOnBreak(false);

    setDailyUsage(prev => ({
      ...prev,
      emergencyUnlocks: prev.emergencyUnlocks + 1
    }));

    triggerEmailNotification(
      'SECURITY',
      'Emergency Unlock Activated on FocusLock',
      'emergency_unlock_alert',
      `Emergency unlock was used on ${device.deviceName}. Session terminated ahead of planned schedule.`
    );
  };

  const toggleAppStatus = (appId: string) => {
    setApps(prev => prev.map(a => {
      if (a.id === appId) {
        const updated = { ...a, enabled: !a.enabled };
        if (user) dbService.syncSelectedApp(user.uid, updated);
        return updated;
      }
      return a;
    }));
  };

  const updateAppRule = (
    appId: string, 
    ruleType: SelectedApp['ruleType'], 
    intervention: InterventionType, 
    limitSeconds?: number
  ) => {
    setApps(prev => prev.map(a => {
      if (a.id === appId) {
        const updated: SelectedApp = {
          ...a,
          ruleType,
          interventionId: intervention,
          dailyLimitSeconds: limitSeconds ?? a.dailyLimitSeconds
        };
        if (user) dbService.syncSelectedApp(user.uid, updated);
        return updated;
      }
      return a;
    }));
  };

  const addNewApp = (
    name: string, 
    identifier: string, 
    category: SelectedApp['category'], 
    ruleType: SelectedApp['ruleType'], 
    intervention: InterventionType
  ) => {
    const isDomain = identifier.includes('.');
    const newApp: SelectedApp = {
      id: identifier.replace(/[^a-z0-9]/gi, '_').toLowerCase(),
      name,
      packageName: isDomain ? `web.${identifier}` : identifier,
      domain: isDomain ? identifier : undefined,
      category,
      enabled: true,
      ruleType,
      dailyLimitSeconds: 1800,
      usedTodaySeconds: 0,
      yesterdayUsageSeconds: 0,
      last7DaysUsageSeconds: 0,
      launchCountToday: 0,
      longestSessionSeconds: 0,
      interventionId: intervention,
      priority: 3,
      isEssential: false
    };

    setApps(prev => [newApp, ...prev]);
    if (user) dbService.syncSelectedApp(user.uid, newApp);
  };

  const deleteApp = (appId: string) => {
    setApps(prev => prev.filter(a => a.id !== appId));
    if (user) dbService.deleteSelectedApp(user.uid, appId);
  };

  const toggleProfileStatus = (profileId: string) => {
    setProfiles(prev => prev.map(p => {
      if (p.id === profileId) {
        const updated = { ...p, enabled: !p.enabled };
        if (user) dbService.saveFocusProfile(user.uid, updated);
        return updated;
      }
      return p;
    }));
  };

  const updateProfile = (profile: FocusProfile) => {
    setProfiles(prev => prev.map(p => p.id === profile.id ? profile : p));
    if (activeProfile.id === profile.id) {
      setActiveProfile(profile);
    }
    if (user) dbService.saveFocusProfile(user.uid, profile);
  };

  const recordAppBlockedAttempt = (appName: string) => {
    setDailyUsage(prev => {
      const updated = {
        ...prev,
        blockedAttempts: prev.blockedAttempts + 1
      };
      if (user) dbService.recordDailyUsage(user.uid, updated);
      return updated;
    });
  };

  const recordInterventionPassed = (appName: string) => {
    setDailyUsage(prev => {
      const updated = {
        ...prev,
        interventionAttempts: prev.interventionAttempts + 1,
        interventionPassed: prev.interventionPassed + 1
      };
      if (user) dbService.recordDailyUsage(user.uid, updated);
      return updated;
    });
  };

  const recordInterventionSkipped = (appName: string) => {
    setDailyUsage(prev => {
      const updated = {
        ...prev,
        interventionAttempts: prev.interventionAttempts + 1,
        interventionSkipped: prev.interventionSkipped + 1
      };
      if (user) dbService.recordDailyUsage(user.uid, updated);
      return updated;
    });
  };

  const updatePermission = (key: keyof DeviceInfo['permissions'], granted: boolean) => {
    setDevice(prev => {
      const updated: DeviceInfo = {
        ...prev,
        permissions: {
          ...prev.permissions,
          [key]: granted
        },
        usageAccess: key === 'usageAccess' ? granted : prev.usageAccess,
        overlayPermission: key === 'overlay' ? granted : prev.overlayPermission,
        batteryOptimization: key === 'batteryOptimization' ? granted : prev.batteryOptimization,
        biometricEnabled: key === 'biometric' ? granted : prev.biometricEnabled,
        lastSeen: new Date().toISOString()
      };
      if (user) dbService.syncDevice(user.uid, updated);
      return updated;
    });
  };

  const triggerInterventionSimulator = (app: SelectedApp) => {
    setSimulatedInterventionApp(app);
  };

  const dismissInterventionSimulator = () => {
    setSimulatedInterventionApp(null);
  };

  const verifyBiometric = async (reason: string): Promise<boolean> => {
    // Simulates Android BiometricPrompt with cryptographic success feedback
    return new Promise(resolve => {
      setTimeout(() => {
        setIsBiometricAuthenticated(true);
        resolve(true);
      }, 700);
    });
  };

  return (
    <FocusContext.Provider
      value={{
        activeSession,
        timeRemaining,
        isPaused,
        isOnBreak,
        breakTimeRemaining,
        startSession,
        pauseSession,
        resumeSession,
        endSession,
        takeBreak,
        emergencyUnlock,
        apps,
        profiles,
        activeProfile,
        setActiveProfile,
        toggleAppStatus,
        updateAppRule,
        addNewApp,
        deleteApp,
        toggleProfileStatus,
        updateProfile,
        dailyUsage,
        recordAppBlockedAttempt,
        recordInterventionPassed,
        recordInterventionSkipped,
        device,
        updatePermission,
        simulatedInterventionApp,
        triggerInterventionSimulator,
        dismissInterventionSimulator,
        outboundEmails,
        triggerEmailNotification,
        isBiometricAuthenticated,
        verifyBiometric
      }}
    >
      {children}
    </FocusContext.Provider>
  );
};

export const useFocus = () => {
  const context = useContext(FocusContext);
  if (!context) {
    throw new Error('useFocus must be used within a FocusProvider');
  }
  return context;
};
