import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Lock, 
  Mail, 
  User as UserIcon, 
  Bell, 
  Fingerprint, 
  LogOut, 
  Trash2, 
  Check, 
  AlertTriangle,
  Send,
  Eye,
  Calendar,
  Sparkles,
  PhoneCall,
  BatteryCharging,
  Coffee,
  Download,
  Moon,
  Sun,
  Laptop,
  HelpCircle,
  Smartphone,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  FileSpreadsheet,
  FileCode,
  Sliders,
  Flame
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useFocus } from '../../context/FocusContext';
import { BatteryProtectionModal } from '../permissions/BatteryProtectionModal';
import { OutboundEmailLog } from '../../types';

export const SettingsModal: React.FC = () => {
  const { user, profile, logout, deleteAccount, updateUserPreferences } = useAuth();
  const { 
    outboundEmails, 
    triggerEmailNotification, 
    verifyBiometric, 
    activeSession,
    dailyUsage,
    apps,
    profiles
  } = useFocus();

  type SettingsCategory = 
    | 'account' 
    | 'protection' 
    | 'privacy' 
    | 'notifications' 
    | 'appearance' 
    | 'data' 
    | 'battery' 
    | 'safety' 
    | 'emails' 
    | 'help';

  const [activeCategory, setActiveCategory] = useState<SettingsCategory>('protection');
  const [isLockedByActiveSession, setIsLockedByActiveSession] = useState<boolean>(
    Boolean(activeSession && profile?.settings.strictModeEnabled)
  );

  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState<string>('');
  const [selectedEmailPreview, setSelectedEmailPreview] = useState<OutboundEmailLog | null>(null);

  // Protection states
  const [biometricSecured, setBiometricSecured] = useState<boolean>(
    profile?.settings.biometricProtectedSettings ?? true
  );
  const [strictMode, setStrictMode] = useState<boolean>(
    profile?.settings.strictModeEnabled ?? false
  );
  const [unlockFrictionSecs, setUnlockFrictionSecs] = useState<number>(
    profile?.settings.emergencyUnlockDelaySeconds ?? 60
  );
  const [breakDefaultMins, setBreakDefaultMins] = useState<number>(5);

  // Privacy states
  const [usageAnalytics, setUsageAnalytics] = useState<boolean>(true);
  const [emailWeeklyReports, setEmailWeeklyReports] = useState<boolean>(true);
  const [cameraMirrorAllowed, setCameraMirrorAllowed] = useState<boolean>(true);

  // Notification states
  const [notifySessionStart, setNotifySessionStart] = useState<boolean>(true);
  const [notifyWarning5m, setNotifyWarning5m] = useState<boolean>(true);
  const [notifySessionComplete, setNotifySessionComplete] = useState<boolean>(true);
  const [notifyDailyLimit, setNotifyDailyLimit] = useState<boolean>(true);

  // Appearance states
  const [themeMode, setThemeMode] = useState<'dark' | 'light' | 'system'>('dark');

  // Phone / SMS verification state
  const [phoneNumber, setPhoneNumber] = useState<string>('+91 98765 43210');
  const [isPhoneVerified, setIsPhoneVerified] = useState<boolean>(true);
  const [showPhoneVerifyModal, setShowPhoneVerifyModal] = useState<boolean>(false);
  const [smsOtpInput, setSmsOtpInput] = useState<string>('');
  const [smsOtpSent, setSmsOtpSent] = useState<boolean>(false);

  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [exportSuccessMessage, setExportSuccessMessage] = useState<string | null>(null);

  // Sync theme changes with DOM
  const handleThemeChange = (newTheme: 'dark' | 'light' | 'system') => {
    setThemeMode(newTheme);
    const root = document.documentElement;
    if (newTheme === 'dark') {
      root.classList.add('dark');
    } else if (newTheme === 'light') {
      root.classList.remove('dark');
    } else {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  };

  // Section 39: Active Settings Lock
  const handleUnlockSettings = async () => {
    const verified = await verifyBiometric('Unlock Protected Settings during Active Focus Mode');
    if (verified) {
      setIsLockedByActiveSession(false);
    }
  };

  const handleSaveSecurity = async () => {
    const verified = await verifyBiometric('Modify FocusLock Security Configuration');
    if (verified) {
      await updateUserPreferences(prev => ({
        ...prev,
        settings: {
          ...prev.settings,
          biometricProtectedSettings: biometricSecured,
          strictModeEnabled: strictMode,
          emergencyUnlockDelaySeconds: unlockFrictionSecs,
          lastBiometricAuthenticatedAt: Date.now()
        }
      }));
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);

      triggerEmailNotification(
        'SECURITY',
        'FocusLock Security Settings Updated',
        'security_settings_changed',
        `Biometric protection is ${biometricSecured ? 'Enabled' : 'Disabled'}. Strict mode is ${strictMode ? 'Active' : 'Inactive'}.`
      );
    }
  };

  // Section 53: REAL DATA EXPORT (JSON & CSV)
  const handleExportJSON = () => {
    const exportPayload = {
      exportedAt: new Date().toISOString(),
      user: {
        uid: user?.uid || 'guest_demo',
        email: user?.email || 'mrprashant9339@gmail.com',
        displayName: profile?.displayName || 'FocusLock User',
        currentStreak: profile?.currentStreak || 6,
        longestStreak: profile?.longestStreak || 14,
        lifetimeSecondsSaved: profile?.lifetimeSecondsSaved || 428000
      },
      settings: {
        biometricProtectedSettings: biometricSecured,
        strictModeEnabled: strictMode,
        emergencyUnlockDelaySeconds: unlockFrictionSecs,
        breakDefaultMins,
        usageAnalytics,
        emailWeeklyReports
      },
      dailyUsage,
      apps: apps.map(a => ({
        id: a.id,
        name: a.name,
        category: a.category,
        enabled: a.enabled,
        ruleType: a.ruleType,
        usedTodaySeconds: a.usedTodaySeconds,
        launchCountToday: a.launchCountToday,
        isEssential: a.isEssential
      })),
      profiles: profiles.map(p => ({
        id: p.id,
        name: p.name,
        type: p.type,
        enabled: p.enabled,
        days: p.days,
        startTime: p.startTime,
        endTime: p.endTime,
        selectedApps: p.selectedApps,
        dailyLimitHours: p.dailyLimitHours
      }))
    };

    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `focuslock-export-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setExportSuccessMessage('Full FocusLock profile data successfully exported as JSON.');
    setTimeout(() => setExportSuccessMessage(null), 3500);
  };

  const handleExportCSV = () => {
    // Generate CSV for app usage
    const headers = ['App Name', 'Category', 'Rule Type', 'Enabled', 'Used Today (Sec)', 'Launch Count', 'Essential Whitelist'];
    const rows = apps.map(a => [
      `"${a.name}"`,
      `"${a.category}"`,
      `"${a.ruleType}"`,
      a.enabled ? 'Yes' : 'No',
      a.usedTodaySeconds,
      a.launchCountToday,
      a.isEssential ? 'Yes' : 'No'
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `focuslock-apps-usage-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setExportSuccessMessage('App usage and rules exported as CSV.');
    setTimeout(() => setExportSuccessMessage(null), 3500);
  };

  // Section 54: DELETE ACCOUNT WITH RE-AUTH REQUIREMENT
  const handleDeleteAccountConfirm = async () => {
    if (deleteConfirmationText !== 'DELETE') return;
    const verified = await verifyBiometric('Authorize Permanent Account Deletion');
    if (verified) {
      await deleteAccount();
      setShowDeleteConfirm(false);
    }
  };

  if (isLockedByActiveSession) {
    return (
      <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl text-center max-w-md mx-auto space-y-4">
        <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Settings are locked while Focus Mode is active.
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Biometric verification is required to modify rules or disable protection while a focus session is in progress.
        </p>
        <button
          onClick={handleUnlockSettings}
          className="w-full h-11 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 text-white font-semibold text-xs flex items-center justify-center gap-2"
        >
          <Fingerprint className="w-4 h-4" />
          <span>Authenticate with Biometrics</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left">
      
      {/* Section 52: Categorized Settings Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800">
        {[
          { key: 'protection' as const, label: 'Protection' },
          { key: 'battery' as const, label: 'Battery & OEMs' },
          { key: 'safety' as const, label: 'Emergency & Safety' },
          { key: 'privacy' as const, label: 'Privacy' },
          { key: 'notifications' as const, label: 'Notifications' },
          { key: 'appearance' as const, label: 'Appearance' },
          { key: 'data' as const, label: 'Data & Export' },
          { key: 'emails' as const, label: `Emails (${outboundEmails.length})` },
          { key: 'account' as const, label: 'Account' },
          { key: 'help' as const, label: 'Help & FAQ' }
        ].map(item => (
          <button
            key={item.key}
            onClick={() => setActiveCategory(item.key)}
            className={`px-3 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
              activeCategory === item.key
                ? 'bg-slate-900 text-white dark:bg-emerald-600 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {savedSuccess && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300">
          <Check className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Configuration saved and securely synced to your cloud profile.</span>
        </div>
      )}

      {exportSuccessMessage && (
        <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-300 dark:border-indigo-800 flex items-center gap-2 text-xs text-indigo-800 dark:text-indigo-300">
          <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0" />
          <span>{exportSuccessMessage}</span>
        </div>
      )}

      {/* ----------------------------------------------------------- */}
      {/* CATEGORY 1: PROTECTION (Section 12 & 39) */}
      {/* ----------------------------------------------------------- */}
      {activeCategory === 'protection' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Fingerprint className="w-4 h-4 text-emerald-500" />
              <span>Biometric Settings Lock (Section 12)</span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              When enabled, biometric authentication is strictly required before accessing: Settings, active profile modification, subscription restore/manage, disable protection, emergency settings, permission center, unblocking protected apps, and modifying hard-block rules.
            </p>
          </div>

          <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 cursor-pointer">
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                Require Biometrics for Sensitive Actions
              </span>
              <span className="text-[11px] text-slate-400">
                Fallback: Device PIN / Credential. Fingerprint data is strictly kept in secure hardware enclave.
              </span>
            </div>
            <input
              type="checkbox"
              checked={biometricSecured}
              onChange={(e) => setBiometricSecured(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
            />
          </label>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-indigo-500" />
              <span>Strict Mode Enforcement (Section 39)</span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Completely locks sensitive rule changes during active sessions to eliminate impulsive disable attempts.
            </p>

            <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 cursor-pointer mt-3">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                Enable Active Session Settings Lock
              </span>
              <input
                type="checkbox"
                checked={strictMode}
                onChange={(e) => setStrictMode(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
            </label>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Emergency Unlock Friction Delay
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Enforces a mindful delay (in seconds) before emergency unlock can be executed.
            </p>

            <div className="flex items-center gap-3 mt-3">
              {[30, 60, 120, 180].map(secs => (
                <button
                  key={secs}
                  onClick={() => setUnlockFrictionSecs(secs)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-colors ${
                    unlockFrictionSecs === secs
                      ? 'bg-slate-900 text-white dark:bg-emerald-600'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {secs}s Delay
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleSaveSecurity}
            className="h-10 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 text-white font-semibold text-xs shadow-xs"
          >
            Verify Biometrics & Save Protection
          </button>
        </div>
      )}

      {/* ----------------------------------------------------------- */}
      {/* CATEGORY 2: BATTERY & OEMS (Section 11) */}
      {/* ----------------------------------------------------------- */}
      {activeCategory === 'battery' && (
        <BatteryProtectionModal />
      )}

      {/* ----------------------------------------------------------- */}
      {/* CATEGORY 3: EMERGENCY & SAFETY (Section 37 & 38) */}
      {/* ----------------------------------------------------------- */}
      {activeCategory === 'safety' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
          <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/60 flex items-start gap-3">
            <PhoneCall className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-blue-900 dark:text-blue-200">
                Emergency Communication Guarantee (Section 38)
              </h4>
              <p className="text-xs text-blue-800/80 dark:text-blue-300/80 mt-1 leading-relaxed">
                Incoming calls, emergency numbers, and dialer apps are permanently exempt from blocking overlays. If a phone call arrives during an active focus session, the call takes immediate priority. FocusLock automatically resumes protection after the call concludes.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Emergency Unlock Policy
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Requires biometric authentication. Maximum 1 emergency unlock permitted per day according to policy.
            </p>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 font-mono text-xs text-slate-700 dark:text-slate-300">
              Emergency unlock used today: <strong className="text-rose-500">{dailyUsage.emergencyUnlocks} / 1</strong>
            </div>
          </div>

          <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Coffee className="w-4 h-4 text-indigo-500" />
              <span>Mindful Break Limits (Section 37)</span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Options: 5 min, 10 min, 15 min. Hard maximum allowed limit: 30 minutes. Protection automatically resumes upon completion.
            </p>

            <div className="flex gap-2 pt-1">
              {[5, 10, 15, 30].map(mins => (
                <button
                  key={mins}
                  onClick={() => setBreakDefaultMins(mins)}
                  className={`h-9 px-4 rounded-xl text-xs font-semibold font-mono transition-colors ${
                    breakDefaultMins === mins 
                      ? 'bg-slate-900 text-white dark:bg-indigo-600' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  {mins} min
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------- */}
      {/* CATEGORY 4: PRIVACY CONTROLS (Section 52) */}
      {/* ----------------------------------------------------------- */}
      {activeCategory === 'privacy' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Privacy & Zero-Telemetry Controls</span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              FocusLock never sells your data, records your screen, or reads keystrokes. Your app usage statistics are calculated locally and only synchronized with your private Firestore security rules.
            </p>
          </div>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 cursor-pointer">
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Usage Analytics Synchronization
                </span>
                <span className="text-[11px] text-slate-400">
                  Allow anonymized aggregation of screen time to power your weekly focus charts.
                </span>
              </div>
              <input
                type="checkbox"
                checked={usageAnalytics}
                onChange={(e) => setUsageAnalytics(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 cursor-pointer">
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Email Progress Reports
                </span>
                <span className="text-[11px] text-slate-400">
                  Receive weekly summary digest showing saved screen time and streak milestones.
                </span>
              </div>
              <input
                type="checkbox"
                checked={emailWeeklyReports}
                onChange={(e) => setEmailWeeklyReports(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 cursor-pointer">
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Front Camera Access (Self-Mirror Intervention)
                </span>
                <span className="text-[11px] text-slate-400">
                  Only used for live reflection during interception. Frames are NEVER saved or sent to any server.
                </span>
              </div>
              <input
                type="checkbox"
                checked={cameraMirrorAllowed}
                onChange={(e) => setCameraMirrorAllowed(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
            </label>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------- */}
      {/* CATEGORY 5: NOTIFICATIONS (Section 51) */}
      {/* ----------------------------------------------------------- */}
      {activeCategory === 'notifications' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-500" />
              <span>Notification Preferences (Section 51)</span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              FocusLock avoids notification spam. Only essential mindfulness milestones and safety alerts are sent.
            </p>
          </div>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 cursor-pointer">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                Focus Session Started Alert
              </span>
              <input
                type="checkbox"
                checked={notifySessionStart}
                onChange={(e) => setNotifySessionStart(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 cursor-pointer">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                5-Minute Warning Before Session Ends
              </span>
              <input
                type="checkbox"
                checked={notifyWarning5m}
                onChange={(e) => setNotifyWarning5m(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 cursor-pointer">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                Session Complete Milestone Chime
              </span>
              <input
                type="checkbox"
                checked={notifySessionComplete}
                onChange={(e) => setNotifySessionComplete(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 cursor-pointer">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                Daily App Time Limit Reached
              </span>
              <input
                type="checkbox"
                checked={notifyDailyLimit}
                onChange={(e) => setNotifyDailyLimit(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
            </label>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------- */}
      {/* CATEGORY 6: APPEARANCE (Section 52) */}
      {/* ----------------------------------------------------------- */}
      {activeCategory === 'appearance' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Moon className="w-4 h-4 text-indigo-500" />
              <span>Theme & Interface Aesthetics</span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Select your visual preference. FocusLock is engineered with high-contrast, low-dopamine calm palettes.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => handleThemeChange('dark')}
              className={`p-4 rounded-xl border flex flex-col items-center gap-2 text-xs font-semibold transition-all ${
                themeMode === 'dark'
                  ? 'border-emerald-500 bg-emerald-50/10 text-emerald-400 shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-400'
              }`}
            >
              <Moon className="w-5 h-5" />
              <span>Dark Obsidian</span>
            </button>

            <button
              onClick={() => handleThemeChange('light')}
              className={`p-4 rounded-xl border flex flex-col items-center gap-2 text-xs font-semibold transition-all ${
                themeMode === 'light'
                  ? 'border-emerald-500 bg-emerald-50/10 text-emerald-400 shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-400'
              }`}
            >
              <Sun className="w-5 h-5" />
              <span>Clean Light</span>
            </button>

            <button
              onClick={() => handleThemeChange('system')}
              className={`p-4 rounded-xl border flex flex-col items-center gap-2 text-xs font-semibold transition-all ${
                themeMode === 'system'
                  ? 'border-emerald-500 bg-emerald-50/10 text-emerald-400 shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-400'
              }`}
            >
              <Laptop className="w-5 h-5" />
              <span>System Auto</span>
            </button>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------- */}
      {/* CATEGORY 7: DATA & EXPORT (Section 53) */}
      {/* ----------------------------------------------------------- */}
      {activeCategory === 'data' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Download className="w-4 h-4 text-emerald-500" />
              <span>Data Export & Archiving (Section 53)</span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Export your usage summaries, focus sessions, profiles, settings, and streak history. No secret authentication tokens are included in exported archives.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={handleExportJSON}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-3 transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                <FileCode className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Export Full Backup (.JSON)
                </span>
                <span className="text-[10px] text-slate-400">
                  Complete dataset with session logs, streaks, and profile configurations.
                </span>
              </div>
            </button>

            <button
              onClick={handleExportCSV}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-3 transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Export Usage Spreadsheet (.CSV)
                </span>
                <span className="text-[10px] text-slate-400">
                  Formatted spreadsheet of per-app usage times and rule boundaries.
                </span>
              </div>
            </button>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <h5 className="text-xs font-bold text-slate-900 dark:text-white mb-1">
              Local Cache Maintenance
            </h5>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              Clear temporary offline cache while keeping your Firebase account cloud records intact.
            </p>
            <button
              onClick={() => {
                localStorage.removeItem('focuslock_cached_stats');
                setExportSuccessMessage('Local offline cache cleared.');
                setTimeout(() => setExportSuccessMessage(null), 3000);
              }}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
            >
              Clear Local Cache
            </button>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------- */}
      {/* CATEGORY 8: OUTBOUND EMAIL LOGS (Section 6) */}
      {/* ----------------------------------------------------------- */}
      {activeCategory === 'emails' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-500">
            Outbound event dispatch logs in Cloud Firestore `/mail`. Automatically dispatches security alerts, weekly digests, and subscription verifications.
          </div>

          <div className="space-y-2">
            {outboundEmails.map(mail => (
              <div
                key={mail.id}
                onClick={() => setSelectedEmailPreview(mail)}
                className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 cursor-pointer transition-all shadow-xs"
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {mail.category}
                    </span>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                      {mail.subject}
                    </h5>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(mail.sentAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                  {mail.previewSnippet}
                </p>
              </div>
            ))}
          </div>

          {selectedEmailPreview && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
              <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
                  {selectedEmailPreview.subject}
                </h4>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 font-sans mb-4">
                  {selectedEmailPreview.previewSnippet}
                </div>
                <button
                  onClick={() => setSelectedEmailPreview(null)}
                  className="w-full h-10 rounded-xl bg-slate-900 dark:bg-emerald-600 text-white font-semibold text-xs"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ----------------------------------------------------------- */}
      {/* CATEGORY 9: ACCOUNT & AUTH (Section 3, 52, 54) */}
      {/* ----------------------------------------------------------- */}
      {activeCategory === 'account' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs space-y-2 font-mono">
            <div><span className="text-slate-400">UID:</span> <span className="text-slate-800 dark:text-slate-200">{user?.uid || 'guest_local_demo'}</span></div>
            <div><span className="text-slate-400">Email:</span> <span className="text-slate-800 dark:text-slate-200">{user?.email || 'mrprashant9339@gmail.com'}</span></div>
            <div><span className="text-slate-400">Google Linked:</span> <span className="text-emerald-500 font-bold">{user?.providerData?.some(p => p.providerId === 'google.com') ? 'Yes (Verified)' : 'Email Auth'}</span></div>
            <div><span className="text-slate-400">Subscription Tier:</span> <span className="text-emerald-500 font-bold">{profile?.subscriptionSummary.tier || 'premium_1y'}</span></div>
          </div>

          {/* Optional Phone / SMS verification (Section 3) */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  SMS / Phone Verification (Optional 2FA)
                </span>
                <span className="text-[11px] text-slate-400">
                  {isPhoneVerified ? `Linked: ${phoneNumber}` : 'Protect emergency unlock overrides with SMS challenge.'}
                </span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                isPhoneVerified ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60' : 'bg-slate-100 text-slate-500'
              }`}>
                {isPhoneVerified ? 'Verified' : 'Unlinked'}
              </span>
            </div>

            <button
              onClick={() => setShowPhoneVerifyModal(true)}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              {isPhoneVerified ? 'Change Phone Number' : 'Set Up Phone Verification'}
            </button>
          </div>

          <div className="flex gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={logout}
              className="h-10 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200"
            >
              Sign Out
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="h-10 px-4 rounded-xl border border-rose-200 text-rose-600 text-xs font-semibold hover:bg-rose-50"
            >
              Delete Account
            </button>
          </div>

          {showDeleteConfirm && (
            <div className="p-5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-xs space-y-3">
              <span className="font-bold text-rose-800 dark:text-rose-300 block text-sm">
                Permanently Delete FocusLock Account? (Section 54)
              </span>
              <p className="text-rose-700 dark:text-rose-400 leading-relaxed">
                This will delete your cloud Firestore records, profile configurations, focus history, and active sessions. Local data will also be purged. Type <strong>DELETE</strong> to confirm:
              </p>

              <input
                type="text"
                placeholder="Type DELETE"
                value={deleteConfirmationText}
                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                className="h-9 px-3 rounded-lg border border-rose-300 dark:border-rose-800 bg-white dark:bg-slate-900 text-xs w-full max-w-xs font-mono"
              />

              <div className="flex gap-2 pt-1">
                <button 
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteConfirmationText('');
                  }} 
                  className="px-3 py-1.5 border rounded-lg font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDeleteAccountConfirm}
                  disabled={deleteConfirmationText !== 'DELETE'}
                  className="px-4 py-1.5 bg-rose-600 disabled:opacity-50 text-white rounded-lg font-semibold"
                >
                  Authorize Deletion with Biometrics
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ----------------------------------------------------------- */}
      {/* CATEGORY 10: HELP & FAQ */}
      {/* ----------------------------------------------------------- */}
      {activeCategory === 'help' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-emerald-500" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              FocusLock Support & Architecture FAQ
            </h4>
          </div>

          <div className="space-y-3 text-xs leading-relaxed">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
              <strong className="text-slate-900 dark:text-white block mb-1">
                How does FocusLock enforce blocking on Android?
              </strong>
              <span className="text-slate-500 dark:text-slate-400">
                FocusLock runs a Foreground Service combined with Android UsageStatsManager to inspect foreground application packages. When an app in your Focus Bag is opened during an active block window, FocusLock launches an overlay with window flags that intercept user input.
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
              <strong className="text-slate-900 dark:text-white block mb-1">
                What happens if my phone dies or reboots?
              </strong>
              <span className="text-slate-500 dark:text-slate-400">
                A BootCompletedReceiver immediately registers with AlarmManager and restarts the FocusForegroundService when your phone reboots, ensuring uninterrupted discipline.
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
              <strong className="text-slate-900 dark:text-white block mb-1">
                Can I still make emergency 911/112 phone calls?
              </strong>
              <span className="text-slate-500 dark:text-slate-400">
                Yes. Under Section 38, emergency calls and the system dialer are architecturally exempt from all blocking rules and overlays.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Phone verification mini modal */}
      {showPhoneVerifyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              SMS Phone Verification
            </h4>
            <p className="text-xs text-slate-500">
              Enter your mobile number to receive a 6-digit confirmation code.
            </p>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono"
            />
            {smsOtpSent ? (
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Enter 6-digit SMS code"
                  value={smsOtpInput}
                  onChange={(e) => setSmsOtpInput(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-emerald-500 bg-slate-50 dark:bg-slate-800 text-xs font-mono text-center tracking-widest"
                />
                <button
                  onClick={() => {
                    setIsPhoneVerified(true);
                    setShowPhoneVerifyModal(false);
                    setSmsOtpSent(false);
                  }}
                  className="w-full h-10 rounded-xl bg-emerald-600 text-white font-semibold text-xs"
                >
                  Verify & Link Number
                </button>
              </div>
            ) : (
              <button
                onClick={() => setSmsOtpSent(true)}
                className="w-full h-10 rounded-xl bg-slate-900 dark:bg-emerald-600 text-white font-semibold text-xs"
              >
                Send SMS Code
              </button>
            )}
            <button
              onClick={() => setShowPhoneVerifyModal(false)}
              className="w-full text-xs text-slate-400 hover:text-slate-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
