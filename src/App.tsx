import React, { useState } from 'react';
import { 
  AuthProvider, 
  useAuth 
} from './context/AuthContext';
import { 
  FocusProvider, 
  useFocus 
} from './context/FocusContext';
import { Header } from './components/dashboard/Header';
import { HomeScreen } from './components/dashboard/HomeScreen';
import { FocusTimerCard } from './components/dashboard/FocusTimerCard';
import { StatsSection } from './components/dashboard/StatsSection';
import { AppSelectorModal } from './components/apps/AppSelectorModal';
import { ProfilesView } from './components/profiles/ProfilesView';
import { PermissionCenter } from './components/permissions/PermissionCenter';
import { BatteryProtectionModal } from './components/permissions/BatteryProtectionModal';
import { AndroidCompanionModal } from './components/companions/AndroidCompanionModal';
import { BrowserExtensionModal } from './components/companions/BrowserExtensionModal';
import { SettingsModal } from './components/settings/SettingsModal';
import { PaywallModal } from './components/subscription/PaywallModal';
import { AuthModal } from './components/auth/AuthModal';
import { OnboardingFlow } from './components/onboarding/OnboardingFlow';
import { InterventionOverlay } from './components/interventions/InterventionOverlay';
import { BrandLogo } from './components/common/BrandLogo';
import { 
  Home, 
  Shield, 
  Sliders, 
  BarChart3, 
  Settings as SettingsIcon,
  Smartphone,
  Layers,
  Crown,
  Play,
  Sparkles,
  ShoppingBag,
  BatteryCharging,
  Globe
} from 'lucide-react';

type MainNavDestination = 'home' | 'focus' | 'profiles' | 'stats' | 'settings' | 'apps' | 'companions';

function DashboardContent() {
  const { user, profile } = useAuth();
  const { apps, activeProfile, activeSession, triggerInterventionSimulator, timeRemaining } = useFocus();

  // Primary destinations as specified in Section 16: Home, Focus, Profiles, Stats, Settings
  const [currentNav, setCurrentNav] = useState<MainNavDestination>('home');
  const [companionSubTab, setCompanionSubTab] = useState<'android' | 'extension' | 'permissions'>('android');

  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [showPaywallModal, setShowPaywallModal] = useState<boolean>(false);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => {
    return !localStorage.getItem('focuslock_onboarding_dismissed');
  });

  const handleDismissOnboarding = () => {
    localStorage.setItem('focuslock_onboarding_dismissed', 'true');
    setShowOnboarding(false);
  };

  const instagramApp = apps.find(a => a.id === 'instagram') || apps[0];
  const tiktokApp = apps.find(a => a.id === 'tiktok') || apps[1];

  const formatHAndM = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-emerald-500/20">
      
      {/* 3-Zone Top Bar (Desktop & Mobile) */}
      <Header
        currentTab={currentNav as any}
        onSelectTab={(tab: any) => setCurrentNav(tab)}
        onOpenAuth={() => setShowAuthModal(true)}
        onOpenPaywall={() => setShowPaywallModal(true)}
      />

      <div className="flex-1 max-w-7xl w-full mx-auto flex">
        
        {/* DESKTOP COMPACT LEFT SIDEBAR (Section 16 & 45) */}
        <aside className="hidden lg:flex flex-col justify-between w-56 p-4 border-r border-slate-200 dark:border-slate-800 shrink-0 min-h-[calc(100vh-3.5rem)]">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1 block">
              Navigation
            </span>

            <button
              onClick={() => setCurrentNav('home')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                currentNav === 'home'
                  ? 'bg-slate-900 text-white dark:bg-emerald-600 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </button>

            <button
              onClick={() => setCurrentNav('focus')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                currentNav === 'focus'
                  ? 'bg-slate-900 text-white dark:bg-emerald-600 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Focus</span>
            </button>

            <button
              onClick={() => setCurrentNav('profiles')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                currentNav === 'profiles'
                  ? 'bg-slate-900 text-white dark:bg-emerald-600 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>Profiles</span>
            </button>

            <button
              onClick={() => setCurrentNav('stats')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                currentNav === 'stats'
                  ? 'bg-slate-900 text-white dark:bg-emerald-600 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Stats</span>
            </button>

            <button
              onClick={() => setCurrentNav('settings')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                currentNav === 'settings'
                  ? 'bg-slate-900 text-white dark:bg-emerald-600 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <SettingsIcon className="w-4 h-4" />
              <span>Settings</span>
            </button>

            <div className="pt-4 mt-2 border-t border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1 block">
                Tools & Devices
              </span>

              <button
                onClick={() => setCurrentNav('apps')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                  currentNav === 'apps'
                    ? 'bg-slate-900 text-white dark:bg-emerald-600 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>Protected Apps</span>
              </button>

              <button
                onClick={() => setCurrentNav('companions')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                  currentNav === 'companions'
                    ? 'bg-slate-900 text-white dark:bg-emerald-600 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <Globe className="w-4 h-4" />
                <span>Companions</span>
              </button>
            </div>
          </div>

          {/* Sidebar Pro Teaser */}
          <div className="p-3.5 rounded-2xl bg-slate-900 text-white border border-slate-800 text-left space-y-2">
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold">FocusLock Pro</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-tight">
              ₹10 for 3-week pass or ₹80 for 1-year complete protection.
            </p>
            <button
              onClick={() => setShowPaywallModal(true)}
              className="w-full py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold"
            >
              View Plans
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT AREA (Section 45) */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 pb-20 md:pb-8">
          
          {/* TAB 1: HOME SCREEN (Section 15) */}
          {currentNav === 'home' && (
            <HomeScreen onNavigate={(tab) => setCurrentNav(tab)} />
          )}

          {/* TAB 2: FOCUS (Section 17) */}
          {currentNav === 'focus' && (
            <FocusTimerCard
              onOpenApps={() => setCurrentNav('apps')}
              onOpenProfiles={() => setCurrentNav('profiles')}
            />
          )}

          {/* TAB 3: PROFILES (Section 23, 24, 25) */}
          {currentNav === 'profiles' && (
            <ProfilesView />
          )}

          {/* TAB 4: STATS (Section 27 - 36) */}
          {currentNav === 'stats' && (
            <StatsSection />
          )}

          {/* TAB 5: SETTINGS (Section 11, 12, 37, 38, 39) */}
          {currentNav === 'settings' && (
            <SettingsModal />
          )}

          {/* DRILL-DOWN: PROTECTED APPS & FOCUS BAG (Section 13 & 40) */}
          {currentNav === 'apps' && (
            <AppSelectorModal />
          )}

          {/* DRILL-DOWN: COMPANIONS & ENFORCEMENT */}
          {currentNav === 'companions' && (
            <div className="space-y-6 text-left">
              <div className="flex items-center gap-1.5 p-1 bg-slate-200/60 dark:bg-slate-800/80 rounded-xl max-w-md">
                <button
                  onClick={() => setCompanionSubTab('android')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    companionSubTab === 'android'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Android Native Kotlin
                </button>
                <button
                  onClick={() => setCompanionSubTab('extension')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    companionSubTab === 'extension'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Chrome Extension (V3)
                </button>
                <button
                  onClick={() => setCompanionSubTab('permissions')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    companionSubTab === 'permissions'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Permission Center
                </button>
              </div>

              {companionSubTab === 'android' && <AndroidCompanionModal />}
              {companionSubTab === 'extension' && <BrowserExtensionModal />}
              {companionSubTab === 'permissions' && <PermissionCenter />}
            </div>
          )}

        </main>

        {/* RIGHT CONTEXT WIDGET AREA (Section 45: Small right context area for desktop) */}
        <aside className="hidden xl:flex flex-col w-72 p-4 border-l border-slate-200 dark:border-slate-800 shrink-0 space-y-4 text-left">
          
          {/* Active Session Status Widget */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Active Focus Status
            </span>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {activeSession ? activeSession.profileName : activeProfile.name}
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="text-xl font-mono font-bold text-emerald-500">
              {activeSession ? formatHAndM(timeRemaining) : 'Standby / Ready'}
            </div>
          </div>

          {/* Quick Intervention Test Simulator */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              <span>Test Interventions</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Trigger live simulated interception overlays:
            </p>
            <div className="space-y-1.5">
              <button
                onClick={() => triggerInterventionSimulator(instagramApp)}
                className="w-full py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[11px] font-semibold flex items-center justify-between hover:bg-slate-100"
              >
                <span>Instagram (Breathing)</span>
                <Play className="w-3 h-3 text-emerald-500 fill-current" />
              </button>

              <button
                onClick={() => triggerInterventionSimulator(tiktokApp)}
                className="w-full py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[11px] font-semibold flex items-center justify-between hover:bg-slate-100"
              >
                <span>TikTok (Hard Block)</span>
                <Play className="w-3 h-3 text-rose-500 fill-current" />
              </button>
            </div>
          </div>

          {/* Replay Onboarding link */}
          <button
            onClick={() => setShowOnboarding(true)}
            className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-center w-full py-1 underline"
          >
            Replay 5-Screen Onboarding Guide
          </button>
        </aside>

      </div>

      {/* MOBILE FIXED BOTTOM NAVIGATION BAR (Section 16: Home, Focus, Profiles, Stats, Settings) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 grid grid-cols-5 items-center h-16 pb-safe px-2 shadow-lg">
        <button
          onClick={() => setCurrentNav('home')}
          className={`flex flex-col items-center justify-center min-h-[44px] transition-colors ${
            currentNav === 'home' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight mt-0.5">Home</span>
        </button>

        <button
          onClick={() => setCurrentNav('focus')}
          className={`flex flex-col items-center justify-center min-h-[44px] transition-colors ${
            currentNav === 'focus' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
          }`}
        >
          <Shield className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight mt-0.5">Focus</span>
        </button>

        <button
          onClick={() => setCurrentNav('profiles')}
          className={`flex flex-col items-center justify-center min-h-[44px] transition-colors ${
            currentNav === 'profiles' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
          }`}
        >
          <Sliders className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight mt-0.5">Profiles</span>
        </button>

        <button
          onClick={() => setCurrentNav('stats')}
          className={`flex flex-col items-center justify-center min-h-[44px] transition-colors ${
            currentNav === 'stats' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
          }`}
        >
          <BarChart3 className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight mt-0.5">Stats</span>
        </button>

        <button
          onClick={() => setCurrentNav('settings')}
          className={`flex flex-col items-center justify-center min-h-[44px] transition-colors ${
            currentNav === 'settings' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
          }`}
        >
          <SettingsIcon className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight mt-0.5">Settings</span>
        </button>
      </nav>

      {/* MODALS */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      <PaywallModal
        isOpen={showPaywallModal}
        onClose={() => setShowPaywallModal(false)}
      />

      {showOnboarding && (
        <OnboardingFlow
          onComplete={handleDismissOnboarding}
        />
      )}

      {/* Full-screen Gentle Intervention / Hard Block Simulator */}
      <InterventionOverlay />

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <FocusProvider>
        <DashboardContent />
      </FocusProvider>
    </AuthProvider>
  );
}
