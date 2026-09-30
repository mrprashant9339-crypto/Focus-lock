import { SelectedApp, FocusProfile, DeviceInfo, SubscriptionInfo, ManufacturerBrand } from '../types';

export const DEFAULT_SELECTED_APPS: SelectedApp[] = [
  {
    id: 'instagram',
    name: 'Instagram',
    packageName: 'com.instagram.android',
    domain: 'instagram.com',
    category: 'Social',
    enabled: true,
    ruleType: 'intervention',
    dailyLimitSeconds: 1800, // 30 mins
    usedTodaySeconds: 1420,
    yesterdayUsageSeconds: 2200,
    last7DaysUsageSeconds: 13800,
    launchCountToday: 19,
    longestSessionSeconds: 1140,
    interventionId: 'breathing',
    priority: 1,
    isEssential: false
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    packageName: 'com.zhiliaoapp.musically',
    domain: 'tiktok.com',
    category: 'Social',
    enabled: true,
    ruleType: 'hard_block',
    dailyLimitSeconds: 900, // 15 mins
    usedTodaySeconds: 900,
    yesterdayUsageSeconds: 3100,
    last7DaysUsageSeconds: 18400,
    launchCountToday: 24,
    longestSessionSeconds: 1680,
    interventionId: 'strict_block',
    priority: 1,
    isEssential: false
  },
  {
    id: 'youtube',
    name: 'YouTube',
    packageName: 'com.google.android.youtube',
    domain: 'youtube.com',
    category: 'Video',
    enabled: true,
    ruleType: 'daily_limit',
    dailyLimitSeconds: 2700, // 45 mins
    usedTodaySeconds: 1650,
    yesterdayUsageSeconds: 2400,
    last7DaysUsageSeconds: 15200,
    launchCountToday: 11,
    longestSessionSeconds: 1200,
    interventionId: 'wait_timer',
    priority: 2,
    isEssential: false
  },
  {
    id: 'candy_crush',
    name: 'Candy Crush Saga',
    packageName: 'com.king.candycrushsaga',
    domain: '',
    category: 'Games',
    enabled: true,
    ruleType: 'hard_block',
    dailyLimitSeconds: 600,
    usedTodaySeconds: 420,
    yesterdayUsageSeconds: 1800,
    last7DaysUsageSeconds: 7400,
    launchCountToday: 7,
    longestSessionSeconds: 900,
    interventionId: 'strict_block',
    priority: 2,
    isEssential: false
  },
  {
    id: 'bgmi_pubg',
    name: 'Battlegrounds Mobile India',
    packageName: 'com.pubg.imobile',
    domain: '',
    category: 'Games',
    enabled: true,
    ruleType: 'daily_limit',
    dailyLimitSeconds: 3600,
    usedTodaySeconds: 1800,
    yesterdayUsageSeconds: 4200,
    last7DaysUsageSeconds: 19800,
    launchCountToday: 4,
    longestSessionSeconds: 1800,
    interventionId: 'math',
    priority: 2,
    isEssential: false
  },
  {
    id: 'reddit',
    name: 'Reddit',
    packageName: 'com.reddit.frontpage',
    domain: 'reddit.com',
    category: 'Entertainment',
    enabled: true,
    ruleType: 'intervention',
    dailyLimitSeconds: 1800,
    usedTodaySeconds: 840,
    yesterdayUsageSeconds: 1200,
    last7DaysUsageSeconds: 8400,
    launchCountToday: 14,
    longestSessionSeconds: 620,
    interventionId: 'typing',
    priority: 3,
    isEssential: false
  },
  {
    id: 'x_twitter',
    name: 'X (Twitter)',
    packageName: 'com.twitter.android',
    domain: 'x.com',
    category: 'Social',
    enabled: true,
    ruleType: 'intervention',
    dailyLimitSeconds: 1200,
    usedTodaySeconds: 1100,
    yesterdayUsageSeconds: 1950,
    last7DaysUsageSeconds: 9200,
    launchCountToday: 16,
    longestSessionSeconds: 700,
    interventionId: 'rotate_phone',
    priority: 2,
    isEssential: false
  },
  {
    id: 'amazon_shopping',
    name: 'Amazon Shopping',
    packageName: 'in.amazon.mShop.android.shopping',
    domain: 'amazon.in',
    category: 'Shopping',
    enabled: false,
    ruleType: 'daily_limit',
    dailyLimitSeconds: 1800,
    usedTodaySeconds: 340,
    yesterdayUsageSeconds: 600,
    last7DaysUsageSeconds: 3200,
    launchCountToday: 5,
    longestSessionSeconds: 300,
    interventionId: 'wait_timer',
    priority: 3,
    isEssential: false
  },
  {
    id: 'chrome_browser',
    name: 'Google Chrome',
    packageName: 'com.android.chrome',
    domain: '',
    category: 'Browsers',
    enabled: false,
    ruleType: 'daily_limit',
    dailyLimitSeconds: 5400,
    usedTodaySeconds: 1400,
    yesterdayUsageSeconds: 2100,
    last7DaysUsageSeconds: 14500,
    launchCountToday: 22,
    longestSessionSeconds: 850,
    interventionId: 'breathing',
    priority: 4,
    isEssential: false
  },
  {
    id: 'netflix',
    name: 'Netflix',
    packageName: 'com.netflix.mediaclient',
    domain: 'netflix.com',
    category: 'Video',
    enabled: true,
    ruleType: 'scheduled',
    dailyLimitSeconds: 3600,
    usedTodaySeconds: 0,
    yesterdayUsageSeconds: 4800,
    last7DaysUsageSeconds: 12000,
    launchCountToday: 0,
    longestSessionSeconds: 0,
    scheduleIntervals: [
      { id: 'sch_1', start: '22:00', end: '07:00', days: [0, 1, 2, 3, 4, 5, 6] }
    ],
    interventionId: 'strict_block',
    priority: 4,
    isEssential: false
  },
  // Recommended Essential Whitelist (Phone, Emergency dialer, SMS, WhatsApp, Banking, Authenticator, Maps)
  {
    id: 'phone_dialer',
    name: 'Phone & Emergency Calls',
    packageName: 'com.google.android.dialer',
    domain: '',
    category: 'Communication',
    enabled: false,
    ruleType: 'daily_limit',
    dailyLimitSeconds: 86400,
    usedTodaySeconds: 420,
    yesterdayUsageSeconds: 680,
    last7DaysUsageSeconds: 4100,
    launchCountToday: 8,
    longestSessionSeconds: 320,
    interventionId: 'breathing',
    priority: 0,
    isEssential: true
  },
  {
    id: 'messages_sms',
    name: 'Messages / SMS',
    packageName: 'com.google.android.apps.messaging',
    domain: '',
    category: 'Communication',
    enabled: false,
    ruleType: 'daily_limit',
    dailyLimitSeconds: 86400,
    usedTodaySeconds: 180,
    yesterdayUsageSeconds: 320,
    last7DaysUsageSeconds: 1800,
    launchCountToday: 6,
    longestSessionSeconds: 120,
    interventionId: 'breathing',
    priority: 0,
    isEssential: true
  },
  {
    id: 'whatsapp_comm',
    name: 'WhatsApp (Work/Family)',
    packageName: 'com.whatsapp',
    domain: 'web.whatsapp.com',
    category: 'Communication',
    enabled: false,
    ruleType: 'daily_limit',
    dailyLimitSeconds: 7200,
    usedTodaySeconds: 1540,
    yesterdayUsageSeconds: 2400,
    last7DaysUsageSeconds: 16500,
    launchCountToday: 35,
    longestSessionSeconds: 400,
    interventionId: 'wait_timer',
    priority: 0,
    isEssential: true
  },
  {
    id: 'maps_navigation',
    name: 'Google Maps',
    packageName: 'com.google.android.apps.maps',
    domain: 'maps.google.com',
    category: 'Productivity',
    enabled: false,
    ruleType: 'daily_limit',
    dailyLimitSeconds: 86400,
    usedTodaySeconds: 640,
    yesterdayUsageSeconds: 890,
    last7DaysUsageSeconds: 4900,
    launchCountToday: 3,
    longestSessionSeconds: 520,
    interventionId: 'breathing',
    priority: 0,
    isEssential: true
  },
  {
    id: 'banking_auth',
    name: 'Banking & Authenticator',
    packageName: 'com.google.android.apps.authenticator2',
    domain: '',
    category: 'Productivity',
    enabled: false,
    ruleType: 'daily_limit',
    dailyLimitSeconds: 86400,
    usedTodaySeconds: 90,
    yesterdayUsageSeconds: 120,
    last7DaysUsageSeconds: 650,
    launchCountToday: 4,
    longestSessionSeconds: 60,
    interventionId: 'breathing',
    priority: 0,
    isEssential: true
  }
];

// Clean Four Core Profiles as explicitly specified in Section 23
export const DEFAULT_PROFILES: FocusProfile[] = [
  {
    id: 'games_profile',
    name: 'Games',
    type: 'game',
    enabled: true,
    days: [0, 6], // Weekend default or custom
    startTime: '09:00',
    endTime: '22:00',
    selectedApps: ['candy_crush', 'bgmi_pubg'],
    blockedDomains: [],
    dailyLimitHours: 2, // Maximum 4 hours limit options: 1, 2, 3, 4
    intervention: 'strict_block',
    strictLock: true,
    color: 'rose',
    priorityOrder: 1
  },
  {
    id: 'sleep_mode',
    name: 'Sleep Mode',
    type: 'sleep',
    enabled: true,
    days: [0, 1, 2, 3, 4, 5, 6],
    startTime: '22:00',
    endTime: '07:00',
    selectedApps: ['instagram', 'tiktok', 'youtube', 'candy_crush', 'bgmi_pubg', 'reddit', 'x_twitter', 'netflix'],
    blockedDomains: ['*'],
    wakeUpBufferMinutes: 15,
    windDownMinutes: 30,
    intervention: 'strict_block',
    strictLock: true,
    color: 'indigo',
    priorityOrder: 2
  },
  {
    id: 'workout_mode',
    name: 'Workout',
    type: 'workout',
    enabled: false,
    days: [1, 3, 5], // Mon, Wed, Fri
    startTime: '18:00',
    endTime: '19:15',
    selectedApps: ['instagram', 'tiktok', 'reddit', 'x_twitter', 'candy_crush'],
    blockedDomains: ['instagram.com', 'tiktok.com'],
    workoutDurationMinutes: 60,
    prepTimeMinutes: 15,
    recoveryTimeMinutes: 15,
    intervention: 'rotate_phone',
    strictLock: false,
    color: 'amber',
    priorityOrder: 3
  },
  {
    id: 'social_media',
    name: 'Social Media',
    type: 'social',
    enabled: true,
    days: [1, 2, 3, 4, 5], // Weekdays
    startTime: '09:00',
    endTime: '17:00',
    selectedApps: ['instagram', 'tiktok', 'x_twitter', 'reddit'],
    blockedDomains: ['instagram.com', 'tiktok.com', 'x.com', 'reddit.com'],
    dailyLimitHours: 1, // Maximum 4 hours allowed
    intervention: 'breathing',
    strictLock: false,
    color: 'emerald',
    priorityOrder: 4
  }
];

// Additional Focus Modes (Section 19: Under "More Focus Modes")
export const MORE_FOCUS_MODES = [
  { id: 'cooldown', name: 'Cooldown Mode', description: 'Brief 10-minute mental buffer after closing distracting apps.' },
  { id: 'pomodoro', name: 'Pomodoro Mode', description: '25 min focus sprints with 5 min structured breaks.' },
  { id: 'deep_work', name: 'Deep Work Mode', description: 'Strict lock blocking all notifications and communication tools.' },
  { id: 'notification_silence', name: 'Notification Silence Mode', description: 'Mutes push dopamine triggers while keeping apps openable.' },
  { id: 'wind_down', name: 'Wind Down Mode', description: 'Progressively limits video feeds 45 minutes before sleep.' },
  { id: 'morning', name: 'Morning Sanctuary Mode', description: 'Blocks feeds during the first hour after waking up.' },
  { id: 'reentry_friction', name: 'Re-entry Friction Mode', description: 'Forces a 60-second breathing pause when switching between apps.' },
  { id: 'weekend', name: 'Weekend Reset Mode', description: 'Allows gaming/leisure while guarding against endless short-form loops.' },
  { id: 'exam', name: 'Exam / Sprint Mode', description: 'Multi-day impenetrable lock with zero emergency unlock bypass.' }
];

export const DEFAULT_DEVICE: DeviceInfo = {
  deviceId: 'android_pixel_8',
  platform: 'android',
  deviceName: 'Google Pixel 8 Pro',
  appVersion: '2.5.0-release',
  lastSeen: new Date().toISOString(),
  permissions: {
    usageAccess: true,
    overlay: true,
    notifications: true,
    foregroundService: true,
    batteryOptimization: true,
    camera: false,
    biometric: true,
    sensors: true
  },
  batteryOptimization: true,
  autostartEnabled: true,
  usageAccess: true,
  overlayPermission: true,
  biometricEnabled: true
};

// Section 21 & 22: Three Pricing Plans in ₹ (INR)
export const SUBSCRIPTION_PLANS = [
  {
    tier: 'premium_21d' as const,
    productId: 'focuslock_pass_21d',
    title: '₹10 — 3-Week Pass',
    priceFormatted: '₹10',
    durationLabel: '21-Day Entitlement Pass',
    isAutoRenewing: false,
    description: 'One-time 21-day premium pass. Non-renewing, perfect for trial sprints.',
    badge: 'Popular Sprint'
  },
  {
    tier: 'premium_6m' as const,
    productId: 'focuslock_sub_6m',
    title: '₹50 — 6 Months',
    priceFormatted: '₹50',
    durationLabel: '6 Months Premium',
    isAutoRenewing: true,
    description: 'Billed every 6 months. Ideal for building long-term discipline.',
    badge: 'Best Value'
  },
  {
    tier: 'premium_1y' as const,
    productId: 'focuslock_sub_1y',
    title: '₹80 — 1 Year',
    priceFormatted: '₹80',
    durationLabel: '1 Year Full Access',
    isAutoRenewing: true,
    description: 'Full annual protection. Only ₹6.6/month for complete control.',
    badge: 'Recommended'
  }
];

export const DEFAULT_SUBSCRIPTION: SubscriptionInfo = {
  tier: 'premium_1y',
  productId: 'focuslock_sub_1y',
  status: 'active',
  startAt: Date.now() - 15 * 86400 * 1000,
  expiresAt: Date.now() + 350 * 86400 * 1000,
  store: 'google_play',
  priceFormatted: '₹80',
  isAutoRenewing: true,
  verifiedAt: Date.now()
};

// Section 11: Manufacturer-Specific Battery Optimization & Autostart Guides
export const MANUFACTURER_GUIDES: Record<ManufacturerBrand, {
  name: string;
  autostartStep: string;
  batteryStep: string;
  appPinStep: string;
  settingsIntent: string;
}> = {
  xiaomi: {
    name: 'Xiaomi / Redmi / POCO (MIUI / HyperOS)',
    autostartStep: 'Go to Settings → Apps → Permissions → Autostart. Toggle FocusLock ON.',
    batteryStep: 'Go to Settings → Battery → App Battery Saver → FocusLock → Select "No Restrictions".',
    appPinStep: 'Open Recent Apps screen → Long press FocusLock → Tap the Padlock icon to lock in memory.',
    settingsIntent: 'com.miui.securitycenter/com.miui.permcenter.autostart.AutoStartManagementActivity'
  },
  samsung: {
    name: 'Samsung (One UI)',
    autostartStep: 'Go to Settings → Battery and Device Care → Battery → Background Usage Limits.',
    batteryStep: 'Tap "Never sleeping apps" → Add (+) FocusLock to this list.',
    appPinStep: 'Open Recents screen → Tap FocusLock app icon → Tap "Keep open for quick launching".',
    settingsIntent: 'com.samsung.android.sm/com.samsung.android.sm.battery.ui.BatteryActivity'
  },
  oneplus: {
    name: 'OnePlus (OxygenOS)',
    autostartStep: 'Go to Settings → Apps → Auto-launch → Toggle FocusLock to Allowed.',
    batteryStep: 'Go to Settings → Battery → Advanced Settings → App Battery Management → FocusLock → Allow foreground & background activity.',
    appPinStep: 'Open Recents → Tap 3 dots on FocusLock → Select Lock.',
    settingsIntent: 'com.oneplus.security'
  },
  oppo: {
    name: 'OPPO (ColorOS)',
    autostartStep: 'Go to Settings → Apps → Auto-launch → Enable FocusLock.',
    batteryStep: 'Go to Settings → Battery → More Battery Settings → App Battery Management → FocusLock → Allow all background activities.',
    appPinStep: 'In Recent tasks, tap menu on FocusLock card → Select Lock.',
    settingsIntent: 'com.coloros.safecenter'
  },
  vivo: {
    name: 'Vivo (FuntouchOS / OriginOS)',
    autostartStep: 'Go to Settings → More Settings → Applications → Autostart → Enable FocusLock.',
    batteryStep: 'Go to Settings → Battery → High Background Power Consumption → Enable FocusLock to run without throttle.',
    appPinStep: 'In Recent apps preview, swipe down on FocusLock card to lock it.',
    settingsIntent: 'com.iqoo.secure'
  },
  iqoo: {
    name: 'iQOO (FuntouchOS)',
    autostartStep: 'Go to i Manager → App Manager → Autostart manager → Enable FocusLock.',
    batteryStep: 'Go to Settings → Battery → Background power consumption management → FocusLock → Allow high power usage.',
    appPinStep: 'In Recent Apps overview, slide down on FocusLock and tap the lock symbol.',
    settingsIntent: 'com.iqoo.secure'
  },
  realme: {
    name: 'Realme (Realme UI)',
    autostartStep: 'Go to Settings → App Management → Auto-launch apps → Toggle FocusLock ON.',
    batteryStep: 'Go to Settings → Battery → App battery management → FocusLock → Allow background activity.',
    appPinStep: 'In Task Switcher, tap 2 dots on FocusLock card and select Lock.',
    settingsIntent: 'com.coloros.safecenter'
  }
};
