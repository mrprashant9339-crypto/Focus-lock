import React from 'react';
import { 
  Shield, 
  Smartphone, 
  Sparkles, 
  User as UserIcon, 
  LogOut, 
  Settings as SettingsIcon,
  Crown,
  Bell
} from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';
import { useAuth } from '../../context/AuthContext';
import { useFocus } from '../../context/FocusContext';

export type MainNavDestination = 'home' | 'focus' | 'profiles' | 'stats' | 'settings' | 'apps' | 'companions';

interface HeaderProps {
  currentTab: MainNavDestination;
  onSelectTab: (tab: MainNavDestination) => void;
  onOpenAuth: () => void;
  onOpenPaywall: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  currentTab, 
  onSelectTab, 
  onOpenAuth,
  onOpenPaywall
}) => {
  const { user, profile, logout } = useAuth();
  const { activeSession, activeProfile } = useFocus();

  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        
        {/* Zone 1: Single text element wordmark + brand icon */}
        <div 
          onClick={() => onSelectTab('home')}
          className="flex items-center gap-2 cursor-pointer shrink-0"
        >
          <BrandLogo size="sm" />
        </div>

        {/* Zone 2: 4-6 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-5 text-xs font-semibold text-slate-600 dark:text-slate-300">
          <button
            onClick={() => onSelectTab('home')}
            className={`transition-colors whitespace-nowrap ${
              currentTab === 'home' 
                ? 'text-emerald-600 dark:text-emerald-400 font-bold' 
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Home
          </button>

          <button
            onClick={() => onSelectTab('focus')}
            className={`transition-colors whitespace-nowrap ${
              currentTab === 'focus' 
                ? 'text-emerald-600 dark:text-emerald-400 font-bold' 
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Focus
          </button>

          <button
            onClick={() => onSelectTab('profiles')}
            className={`transition-colors whitespace-nowrap ${
              currentTab === 'profiles' 
                ? 'text-emerald-600 dark:text-emerald-400 font-bold' 
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Profiles
          </button>

          <button
            onClick={() => onSelectTab('stats')}
            className={`transition-colors whitespace-nowrap ${
              currentTab === 'stats' 
                ? 'text-emerald-600 dark:text-emerald-400 font-bold' 
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Stats & Projections
          </button>

          <button
            onClick={() => onSelectTab('apps')}
            className={`transition-colors whitespace-nowrap ${
              currentTab === 'apps' 
                ? 'text-emerald-600 dark:text-emerald-400 font-bold' 
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Apps & Rules
          </button>

          <button
            onClick={() => onSelectTab('companions')}
            className={`transition-colors whitespace-nowrap ${
              currentTab === 'companions' 
                ? 'text-emerald-600 dark:text-emerald-400 font-bold' 
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Companions
          </button>

          <button
            onClick={() => onSelectTab('settings')}
            className={`transition-colors whitespace-nowrap ${
              currentTab === 'settings' 
                ? 'text-emerald-600 dark:text-emerald-400 font-bold' 
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Settings
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Active session badge indicator if running */}
          {activeSession && (
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500/20 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="truncate max-w-[100px]">{activeSession.profileName}</span>
            </div>
          )}

          {/* Pro Subscription trigger */}
          {profile?.subscriptionSummary.tier && profile.subscriptionSummary.tier !== 'free' ? (
            <button
              onClick={onOpenPaywall}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold hover:bg-amber-500/20 transition-colors"
            >
              <Crown className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Pro Member</span>
            </button>
          ) : (
            <button
              onClick={onOpenPaywall}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors shadow-sm"
            >
              <Crown className="w-3.5 h-3.5" />
              <span>Upgrade</span>
            </button>
          )}

          {/* User Account / Auth */}
          {user ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onSelectTab('settings')}
                title="Account Settings"
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:border-emerald-500 transition-colors"
              >
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span className="text-xs font-bold uppercase">
                    {user.displayName ? user.displayName[0] : (user.email ? user.email[0] : 'U')}
                  </span>
                )}
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
            >
              Sign In
            </button>
          )}
        </div>

      </div>
    </header>
  );
};
