import React from 'react';
import { 
  Play, 
  Clock, 
  Flame, 
  ShieldCheck, 
  ShieldAlert, 
  Sparkles, 
  ChevronRight, 
  Sliders,
  CheckCircle2,
  Hourglass,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useFocus } from '../../context/FocusContext';

interface HomeScreenProps {
  onNavigate: (tab: 'home' | 'focus' | 'profiles' | 'stats' | 'settings') => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate }) => {
  const { user, profile } = useAuth();
  const { dailyUsage, activeProfile, activeSession, apps } = useFocus();

  // Dynamic greeting based on current local hour (Section 15)
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const displayName = profile?.displayName || user?.displayName?.split(' ')[0] || 'Friend';

  // Format seconds into "Xh Ym"
  const formatHAndM = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs === 0) return `${mins}m`;
    return `${hrs}h ${mins}m`;
  };

  const protectedAppsCount = apps.filter(a => a.enabled && !a.isEssential).length;
  const timeSavedSeconds = Math.max(0, 18000 - dailyUsage.screenTimeSeconds); // Baseline comparison

  return (
    <div className="space-y-5 max-w-xl mx-auto text-left">
      
      {/* 1. TOP GREETING */}
      <div className="pt-2">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {greeting}, {displayName}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Conscious control over your digital attention.
        </p>
      </div>

      {/* 2. MAIN HERO CARD */}
      <div className="p-6 rounded-3xl bg-slate-900 text-white shadow-xl relative overflow-hidden">
        {/* Subtle ambient emerald aura */}
        <div className="absolute top-0 right-0 w-56 h-56 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-emerald-400">
              Today’s Focus
            </span>
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-[11px] font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{activeSession ? 'Session Active' : 'Guardian Active'}</span>
            </div>
          </div>

          <div className="text-3xl sm:text-4xl font-extrabold tracking-tight font-mono mb-4 tabular-nums">
            {formatHAndM(dailyUsage.focusTimeSeconds)} protected
          </div>

          {/* Secondary Metrics */}
          <div className="grid grid-cols-3 gap-2 py-3 border-t border-white/10 mb-5 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Screen Time</span>
              <strong className="font-mono text-sm">{formatHAndM(dailyUsage.screenTimeSeconds)}</strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Focus Time</span>
              <strong className="font-mono text-sm text-emerald-400">{formatHAndM(dailyUsage.focusTimeSeconds)}</strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Streak</span>
              <strong className="font-mono text-sm text-amber-400">{profile?.currentStreak || 6} days</strong>
            </div>
          </div>

          {/* Quick Action: "Start Focus" */}
          <button
            onClick={() => onNavigate('focus')}
            className="w-full h-12 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-transform active:scale-[0.99] shadow-lg shadow-emerald-500/20"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{activeSession ? 'View Running Session' : 'Start Focus'}</span>
          </button>
        </div>
      </div>

      {/* 3. CURRENT PROFILE (Small Active Profile Card) */}
      <div 
        onClick={() => onNavigate('profiles')}
        className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono text-slate-400 tracking-wider block">
              Current Profile
            </span>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">
              {activeProfile?.name || 'Deep Work'}
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>{protectedAppsCount} apps guarded</span>
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>

      {/* 4. TODAY (Screen-time ring, Time saved, Blocked attempts) */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
          Today at a Glance
        </h4>

        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
            <span className="text-[10px] text-slate-400 block mb-1">Time Saved</span>
            <span className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
              +{formatHAndM(timeSavedSeconds)}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
            <span className="text-[10px] text-slate-400 block mb-1">Interventions</span>
            <span className="text-base font-bold font-mono text-indigo-600 dark:text-indigo-400 tabular-nums">
              {dailyUsage.blockedAttempts}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
            <span className="text-[10px] text-slate-400 block mb-1">Unlocks</span>
            <span className="text-base font-bold font-mono text-slate-700 dark:text-slate-300 tabular-nums">
              {dailyUsage.unlockCount}
            </span>
          </div>
        </div>
      </div>

      {/* 5. ONE MOTIVATIONAL CARD (Section 15) */}
      <div className="p-5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/60 flex items-start gap-3.5">
        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <p className="text-xs font-medium text-emerald-900 dark:text-emerald-200 leading-relaxed">
            “You protected {Math.round(dailyUsage.focusTimeSeconds / 60)} minutes today. Your attention is becoming a habit.”
          </p>
          <span className="text-[10px] text-emerald-700/70 dark:text-emerald-400/70 mt-1 block font-mono">
            Conscious discipline milestone
          </span>
        </div>
      </div>

    </div>
  );
};
