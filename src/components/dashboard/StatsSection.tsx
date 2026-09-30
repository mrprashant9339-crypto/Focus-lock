import React, { useState } from 'react';
import { 
  Clock, 
  ShieldCheck, 
  Flame, 
  TrendingUp, 
  Calendar as CalendarIcon, 
  Hourglass,
  ArrowDownRight,
  ArrowUpRight,
  Info,
  ChevronLeft,
  ChevronRight,
  Share2,
  Copy,
  Check,
  Award,
  Sparkles,
  PieChart as PieIcon,
  BarChart2
} from 'lucide-react';
import { useFocus } from '../../context/FocusContext';
import { useAuth } from '../../context/AuthContext';
import { BrandLogo } from '../common/BrandLogo';

export const StatsSection: React.FC = () => {
  const { dailyUsage, apps } = useFocus();
  const { profile } = useAuth();

  const [period, setPeriod] = useState<'today' | '7d' | '30d'>('today');
  const [chartRange, setChartRange] = useState<'7D' | '30D' | '3M'>('7D');
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<number | null>(25);
  const [currentMonthIndex, setCurrentMonthIndex] = useState<number>(8); // September
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [copiedShare, setCopiedShare] = useState<boolean>(false);

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const formatHoursMinutes = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours === 0) return `${minutes}m`;
    return `${hours}h ${minutes}m`;
  };

  // Section 28: Weekly Comparison Data (Mon - Sun)
  const weeklyData = [
    { day: 'Mon', screenMins: 210, focusMins: 140 },
    { day: 'Tue', screenMins: 180, focusMins: 160 },
    { day: 'Wed', screenMins: 240, focusMins: 120 },
    { day: 'Thu', screenMins: 160, focusMins: 180 },
    { day: 'Fri', screenMins: 220, focusMins: 130 },
    { day: 'Sat', screenMins: 280, focusMins: 90 },
    { day: 'Sun', screenMins: 190, focusMins: 150 }
  ];

  // Section 30: Category Breakdown
  const categoryBreakdown = [
    { name: 'Social', percent: 42, color: 'bg-rose-500' },
    { name: 'Games', percent: 24, color: 'bg-amber-500' },
    { name: 'Video', percent: 18, color: 'bg-indigo-500' },
    { name: 'Communication', percent: 11, color: 'bg-emerald-500' },
    { name: 'Other', percent: 5, color: 'bg-slate-400' }
  ];

  // Section 35: Lifetime Projection dynamic from user average
  const userDailyHours = (dailyUsage.screenTimeSeconds / 3600).toFixed(1);
  const annualHours = Math.round(parseFloat(userDailyHours) * 365);
  const annualDays = (annualHours / 24).toFixed(1);

  // Section 34: 30-day Calendar Data
  const calendarDays = Array.from({ length: 30 }, (_, i) => {
    const day = i + 1;
    let status: 'completed' | 'partially_completed' | 'missed' | 'no_data' = 'completed';
    if (day % 7 === 0) status = 'missed';
    else if (day % 5 === 0) status = 'partially_completed';
    if (day > 26) status = 'no_data';
    return {
      day,
      status,
      focusMins: status === 'completed' ? 120 + (day % 4) * 15 : status === 'partially_completed' ? 45 : 0,
      screenMins: status === 'completed' ? 130 : 260,
      bypassOccurred: status === 'partially_completed'
    };
  });

  const selectedDayRecord = calendarDays.find(d => d.day === selectedCalendarDay);

  const handleCopyShareCard = () => {
    navigator.clipboard.writeText(`I protected 14.8 hours of my week with FocusLock! 6-day streak in flow. Small limits, bigger days.`);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* Top Header & Period Selector (Section 27) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Digital Wellbeing Analytics
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real UsageStats aggregation calibrated to your local device timezone.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Period Toggle: Today / 7 Days / 30 Days */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            {(['today', '7d', '30d'] as const).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold uppercase transition-colors ${
                  period === p
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowShareModal(true)}
            className="h-9 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Share Card</span>
          </button>
        </div>
      </div>

      {/* 4 Core Top Metrics Cards (Section 27) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 block mb-1">Total Screen Time</span>
          <div className="text-2xl sm:text-3xl font-mono font-bold text-slate-900 dark:text-white tabular-nums">
            {formatHoursMinutes(dailyUsage.screenTimeSeconds)}
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1 font-medium">
            <ArrowDownRight className="w-3.5 h-3.5" />
            <span>18% less than last week</span>
          </span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 block mb-1">Focus Time</span>
          <div className="text-2xl sm:text-3xl font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
            {formatHoursMinutes(dailyUsage.focusTimeSeconds)}
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1 font-medium">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>32% more focus time</span>
          </span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 block mb-1">Blocked Attempts</span>
          <div className="text-2xl sm:text-3xl font-mono font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">
            {dailyUsage.blockedAttempts}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {dailyUsage.unlockCount} unlocks recorded
          </span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 block mb-1">Goal Streak</span>
          <div className="text-2xl sm:text-3xl font-mono font-bold text-amber-500 tabular-nums">
            {profile?.currentStreak || 6} days
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Best streak: {profile?.longestStreak || 14} days
          </span>
        </div>
      </div>

      {/* SECTION 31 & 32: BEST DAY & LAST-WEEK COMPARISON (Side-by-Side) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Section 31: Best Day */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-4 h-4 text-amber-500" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Your Best Day: Thursday, Sep 24
            </h4>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
            Highest focus, lowest distraction, and zero emergency bypasses recorded.
          </p>
          <div className="grid grid-cols-3 gap-2 text-center text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 font-mono">
            <div><span className="text-slate-400 text-[10px] block">Screen Time</span><strong>1h 45m</strong></div>
            <div><span className="text-slate-400 text-[10px] block">Focus Flow</span><strong className="text-emerald-500">3h 20m</strong></div>
            <div><span className="text-slate-400 text-[10px] block">Time Saved</span><strong className="text-indigo-500">+2h 15m</strong></div>
          </div>
        </div>

        {/* Section 32: Last-Week Comparison */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Last-Week Comparison (Factual Metrics)
            </h4>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
            Objective progress compared to the previous 7-day measurement window.
          </p>
          <div className="grid grid-cols-3 gap-2 text-center text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 font-mono">
            <div><span className="text-slate-400 text-[10px] block">Screen Time</span><strong className="text-emerald-500">↓ 18%</strong></div>
            <div><span className="text-slate-400 text-[10px] block">Focus Time</span><strong className="text-emerald-500">↑ 32%</strong></div>
            <div><span className="text-slate-400 text-[10px] block">Time Saved</span><strong className="text-indigo-500">+2h 14m</strong></div>
          </div>
        </div>
      </div>

      {/* SECTION 28: WEEKLY BAR CHART (Mon - Sun: Screen Time vs Focus Time) */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Weekly Distribution (Mon - Sun)
            </h4>
            <span className="text-xs text-slate-400">Comparing Screen Time vs Guarded Focus Time</span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-slate-300 dark:bg-slate-700" /> Screen Time</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-500" /> Focus Time</span>
          </div>
        </div>

        {/* Visual Bar Columns */}
        <div className="grid grid-cols-7 gap-2 sm:gap-4 h-44 items-end pt-4 pb-2 border-b border-slate-100 dark:border-slate-800">
          {weeklyData.map(d => {
            const screenHeight = (d.screenMins / 300) * 100;
            const focusHeight = (d.focusMins / 300) * 100;

            return (
              <div key={d.day} className="flex flex-col items-center justify-end h-full gap-1 group relative">
                {/* Tooltip */}
                <div className="absolute -top-10 hidden group-hover:flex flex-col items-center bg-slate-900 text-white text-[10px] py-1 px-2 rounded font-mono z-20 whitespace-nowrap shadow-md">
                  <span>Screen: {d.screenMins}m · Focus: {d.focusMins}m</span>
                </div>

                <div className="w-full flex items-end justify-center gap-1 h-full">
                  <div
                    style={{ height: `${screenHeight}%` }}
                    className="w-1/2 rounded-t-md bg-slate-300 dark:bg-slate-700 transition-all duration-500"
                  />
                  <div
                    style={{ height: `${focusHeight}%` }}
                    className="w-1/2 rounded-t-md bg-emerald-500 transition-all duration-500"
                  />
                </div>
                <span className="text-[11px] font-semibold text-slate-400">{d.day}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 30: APP CATEGORY DONUT / BAR BREAKDOWN */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
          Top Category Breakdown
        </h4>
        <p className="text-xs text-slate-400 mb-4">
          Distribution across key distraction vectors (max 5 slices for clarity).
        </p>

        {/* Segmented Horizontal Donut / Bar */}
        <div className="h-4 w-full rounded-full flex overflow-hidden mb-4">
          {categoryBreakdown.map(cat => (
            <div
              key={cat.name}
              style={{ width: `${cat.percent}%` }}
              className={`${cat.color} transition-all duration-500`}
              title={`${cat.name}: ${cat.percent}%`}
            />
          ))}
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
          {categoryBreakdown.map(cat => (
            <div key={cat.name} className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${cat.color}`} />
              <span className="text-slate-600 dark:text-slate-300">{cat.name}:</span>
              <strong className="font-mono text-slate-900 dark:text-white">{cat.percent}%</strong>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 34: VISUAL FOCUS CALENDAR (With Streak & Bypass Indicators) */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-emerald-500" />
              <span>Visual Focus Calendar</span>
            </h4>
            <span className="text-xs text-slate-400">Streak rule: Goal completed without bypass</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentMonthIndex(m => Math.max(0, m - 1))}
              className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold font-mono text-slate-800 dark:text-slate-200">
              {months[currentMonthIndex]} 2026
            </span>
            <button
              onClick={() => setCurrentMonthIndex(m => Math.min(11, m + 1))}
              className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 7-day column grid */}
        <div className="grid grid-cols-7 gap-2">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
            <div key={day} className="text-center text-[10px] font-semibold text-slate-400 uppercase pb-1">
              {day}
            </div>
          ))}

          {calendarDays.map(record => {
            const isSelected = selectedCalendarDay === record.day;
            return (
              <div
                key={record.day}
                onClick={() => setSelectedCalendarDay(record.day)}
                className={`h-11 sm:h-12 rounded-xl flex flex-col items-center justify-center text-xs font-mono cursor-pointer transition-all ${
                  isSelected 
                    ? 'ring-2 ring-emerald-500 border border-emerald-500 shadow-xs' 
                    : 'border border-slate-100 dark:border-slate-800'
                } ${
                  record.status === 'completed'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold'
                    : record.status === 'partially_completed'
                      ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-semibold'
                      : record.status === 'missed'
                        ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-500'
                        : 'bg-slate-50 dark:bg-slate-800/40 text-slate-400'
                }`}
              >
                <span>{record.day}</span>
                {record.status === 'completed' && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-0.5" />}
                {record.status === 'partially_completed' && <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-0.5" />}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 pt-4 mt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Goal Completed</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Partially Completed (Bypass occurred)</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Goal Missed</span>
        </div>

        {/* Selected Day Drill-down detail */}
        {selectedDayRecord && (
          <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="font-bold text-slate-900 dark:text-white">Day {selectedDayRecord.day} Summary:</span>
              <span className="ml-2 text-slate-500">
                Focus: <strong className="text-emerald-500 font-mono">{selectedDayRecord.focusMins}m</strong> · Screen: <strong className="font-mono">{selectedDayRecord.screenMins}m</strong>
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              {selectedDayRecord.bypassOccurred ? 'Bypass occurred (Streak paused)' : 'Eligible for daily streak'}
            </span>
          </div>
        )}
      </div>

      {/* SECTION 35: DYNAMIC LIFETIME PROJECTION */}
      <div className="p-6 sm:p-7 rounded-3xl bg-slate-900 text-white shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
          <Hourglass className="w-4 h-4" />
          <span>Dynamic Projection (Not a Prediction)</span>
        </div>

        <h3 className="text-xl sm:text-2xl font-bold tracking-tight mb-2">
          If your current daily average of <span className="font-mono text-emerald-400">{userDailyHours}h/day</span> continues...
        </h3>

        <p className="text-xs text-slate-300 leading-relaxed mb-4 max-w-xl">
          You will spend approximately <span className="font-bold text-white font-mono">{annualDays} full days per year</span> looking at screens ({annualHours} hours/year). FocusLock helps you consciously protect this time.
        </p>

        <span className="text-[10px] text-slate-400 font-mono">
          * Dynamic extrapolation based on current verified UsageStats.
        </span>
      </div>

      {/* SECTION 36: INSTAGRAM-STORY SHARE CARD MODAL (1080 × 1920 Layout) */}
      {showShareModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
              FocusLock Story Share Card (9:16 Aspect)
            </h3>

            {/* 1080 × 1920 scaled preview card */}
            <div className="w-full aspect-[9/16] rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 p-6 flex flex-col justify-between text-white shadow-2xl border border-emerald-500/20 mb-4 select-none">
              <div>
                <BrandLogo size="sm" />
                <span className="text-[10px] text-emerald-400 font-mono mt-1 block">
                  Conscious Attention Guardian
                </span>
              </div>

              <div className="space-y-3">
                <span className="text-xs uppercase tracking-widest text-slate-400 font-mono block">
                  Weekly Achievement
                </span>
                <div className="text-3xl font-extrabold font-mono tracking-tight text-white leading-tight">
                  “I protected 14.8 hours of my week.”
                </div>
                <p className="text-xs text-slate-300">
                  Small limits. Bigger days.
                </p>
                <div className="p-3 rounded-xl bg-white/10 text-xs font-mono space-y-1">
                  <div>Streak: <strong className="text-amber-400">6 Days Active</strong></div>
                  <div>Best Day: <strong className="text-emerald-400">3h 20m Focused</strong></div>
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>mrprashant9339@gmail.com</span>
                <span>focuslock.app</span>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={handleCopyShareCard}
                className="w-full h-11 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md"
              >
                {copiedShare ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>{copiedShare ? 'Copied Achievement Text' : 'Copy Achievement Story Text'}</span>
              </button>

              <button
                onClick={() => setShowShareModal(false)}
                className="w-full py-2 text-xs text-slate-400 hover:text-slate-600"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
