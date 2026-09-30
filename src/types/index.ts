export type RuleType = 'hard_block' | 'intervention' | 'daily_limit' | 'scheduled';

export type InterventionType = 
  | 'breathing' 
  | 'math' 
  | 'rotate_phone' 
  | 'wait_timer' 
  | 'mirror' 
  | 'typing' 
  | 'strict_block';

export type AppCategory = 
  | 'Social' 
  | 'Games' 
  | 'Video' 
  | 'Shopping' 
  | 'Entertainment' 
  | 'Communication' 
  | 'Productivity' 
  | 'Browsers' 
  | 'Other';

export interface ScheduleInterval {
  id: string;
  start: string; // e.g. "22:00"
  end: string;   // e.g. "07:00"
  days: number[]; // 0=Sun, 1=Mon, ..., 6=Sat
}

export interface SelectedApp {
  id: string;
  name: string;
  packageName: string;
  domain?: string;
  category: AppCategory;
  iconReference?: string;
  enabled: boolean;
  ruleType: RuleType;
  dailyLimitSeconds: number; // e.g. 1800 for 30m
  usedTodaySeconds: number;
  yesterdayUsageSeconds: number;
  last7DaysUsageSeconds: number;
  launchCountToday: number;
  longestSessionSeconds: number;
  scheduleIntervals?: ScheduleInterval[];
  interventionId: InterventionType;
  priority: number;
  isEssential?: boolean; // Whitelist flag
}

export type ProfileType = 'game' | 'sleep' | 'workout' | 'social' | 'custom';

export interface FocusProfile {
  id: string;
  name: string;
  type: ProfileType;
  enabled: boolean;
  days: number[]; // 0=Sun, 1=Mon, ..., 6=Sat
  startTime: string; // "09:00"
  endTime: string;   // "17:00"
  selectedApps: string[]; // List of app/domain IDs
  blockedDomains: string[];
  dailyLimitHours?: number; // Allowed maximum engagement limit: max 4 hours for game/social
  intervention: InterventionType;
  strictLock: boolean;
  color: string;
  // Specific profile parameters (Sections 23)
  wakeUpBufferMinutes?: number; // Sleep mode
  windDownMinutes?: number;     // Sleep mode
  workoutDurationMinutes?: number; // Workout profile
  prepTimeMinutes?: number;     // Workout profile
  recoveryTimeMinutes?: number; // Workout profile
  priorityOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export type AdditionalFocusMode = 
  | 'cooldown' 
  | 'pomodoro' 
  | 'deep_work' 
  | 'notification_silence' 
  | 'wind_down' 
  | 'morning' 
  | 'reentry_friction' 
  | 'weekend' 
  | 'exam';

export interface FocusSession {
  id: string;
  profileId: string;
  profileName: string;
  startTime: number;
  endTime?: number;
  plannedDuration: number; // seconds
  actualDuration: number;  // seconds
  goal: string;
  completed: boolean;
  bypassed: boolean;
  emergencyUnlockUsed: boolean;
  breakUsed: boolean;
  skipUsed: boolean;
  deviceId?: string;
}

export interface DailyUsage {
  date: string; // YYYY-MM-DD
  screenTimeSeconds: number;
  unlockCount: number;
  focusTimeSeconds: number;
  blockedAttempts: number;
  interventionAttempts: number;
  interventionPassed: number;
  interventionSkipped: number;
  emergencyUnlocks: number;
  breakMinutes: number;
  appBreakdown?: Record<string, number>; // appId -> seconds
}

export type PlatformType = 'android' | 'extension' | 'web' | 'desktop';

export interface DeviceInfo {
  deviceId: string;
  platform: PlatformType;
  deviceName: string;
  appVersion: string;
  lastSeen: string;
  permissions: {
    usageAccess: boolean;
    overlay: boolean;
    notifications: boolean;
    foregroundService: boolean;
    batteryOptimization: boolean;
    camera: boolean;
    biometric: boolean;
    sensors: boolean;
  };
  batteryOptimization: boolean;
  autostartEnabled: boolean;
  usageAccess: boolean;
  overlayPermission: boolean;
  biometricEnabled: boolean;
}

export type SubscriptionTier = 'free' | 'premium_21d' | 'premium_6m' | 'premium_1y';
export type SubscriptionStatus = 'active' | 'trialing' | 'canceled' | 'expired';

export interface SubscriptionInfo {
  tier: SubscriptionTier;
  productId: string;
  status: SubscriptionStatus;
  startAt: number;
  expiresAt: number;
  store: string;
  priceFormatted: string; // e.g. "₹10", "₹50", "₹80"
  isAutoRenewing: boolean; // ₹10 is a 21-day non-renewing pass
  verifiedAt: number;
}

export interface NotificationPreferences {
  allImportant: boolean;
  securityOnly: boolean;
  weeklyDigest: boolean;
  monthlyDigest: boolean;
  marketing: boolean;
  emailOnEmergencyUnlock: boolean;
  emailOnGoalComplete: boolean;
}

export interface PrivacySettings {
  shareAnonymousAnalytics: boolean;
  sendDetailedUsageReports: boolean;
  biometricProtectedSettings: boolean;
  strictModeEnabled: boolean;
  emergencyUnlockDelaySeconds: number; // e.g. 60s friction delay
  lastBiometricAuthenticatedAt?: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  phoneNumber?: string;
  phoneVerified?: boolean;
  settings: PrivacySettings;
  notificationPreferences: NotificationPreferences;
  privacySettings: PrivacySettings;
  subscriptionSummary: SubscriptionInfo;
  currentStreak: number;
  longestStreak: number;
  lifetimeSecondsSaved: number;
  skipsUsedToday: number;
  createdAt: string;
  updatedAt: string;
}

export interface OutboundEmailLog {
  id: string;
  to: string;
  subject: string;
  category: 'ACCOUNT' | 'SUBSCRIPTION' | 'FOCUS' | 'PROFILE' | 'SECURITY';
  template: string;
  sentAt: number;
  previewSnippet: string;
}

export type EngineDecision = 'ALLOW' | 'BLOCK' | 'INTERVENE' | 'WAIT' | 'BREAK' | 'EMERGENCY';

export type ManufacturerBrand = 
  | 'xiaomi' 
  | 'vivo' 
  | 'iqoo' 
  | 'oppo' 
  | 'realme' 
  | 'oneplus' 
  | 'samsung';

export interface CalendarDayRecord {
  date: string; // YYYY-MM-DD
  dayNumber: number;
  status: 'completed' | 'partially_completed' | 'missed' | 'no_data';
  focusMinutes: number;
  screenTimeMinutes: number;
  bypassOccurred: boolean;
  streakEligible: boolean;
}
