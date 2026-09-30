import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Coffee, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  Sparkles,
  Target,
  Clock,
  Zap,
  Lock,
  Smartphone,
  ChevronDown,
  Layers,
  ChevronRight
} from 'lucide-react';
import { useFocus } from '../../context/FocusContext';
import { MORE_FOCUS_MODES } from '../../constants/initialData';
import { InterventionType } from '../../types';

interface FocusTimerCardProps {
  onOpenApps: () => void;
  onOpenProfiles: () => void;
}

export const FocusTimerCard: React.FC<FocusTimerCardProps> = ({ onOpenApps, onOpenProfiles }) => {
  const { 
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
    profiles, 
    activeProfile, 
    setActiveProfile,
    apps,
    dailyUsage 
  } = useFocus();

  // Section 17: Presets 25 min, 45 min, 60 min, 90 min, Custom
  const [selectedDuration, setSelectedDuration] = useState<number>(25);
  const [customDurationInput, setCustomDurationInput] = useState<string>('30');
  const [isCustomDuration, setIsCustomDuration] = useState<boolean>(false);
  const [goalText, setGoalText] = useState<string>('Deep Work & System Design');
  const [selectedIntervention, setSelectedIntervention] = useState<InterventionType>('strict_block');

  // Modal states
  const [showEmergencyModal, setShowEmergencyModal] = useState<boolean>(false);
  const [emergencyDelayCountdown, setEmergencyDelayCountdown] = useState<number>(15);
  const [strictAlert, setStrictAlert] = useState<string | null>(null);
  const [showMoreModes, setShowMoreModes] = useState<boolean>(false);
  const [selectedModeDetail, setSelectedModeDetail] = useState<string | null>(null);

  // Section 17: Completion Modal
  const [completionData, setCompletionData] = useState<{
    plannedMins: number;
    actualMins: number;
    appsCount: number;
    timeProtectedMins: number;
  } | null>(null);

  const blockedAppsCount = apps.filter(a => a.enabled && !a.isEssential).length;

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    const duration = isCustomDuration ? (parseInt(customDurationInput) || 25) : selectedDuration;
    startSession(activeProfile.id, duration, goalText);
  };

  const handlePause = () => {
    const success = pauseSession();
    if (!success) {
      setStrictAlert('Strict Lock is active. Pausing is disabled to protect your flow.');
      setTimeout(() => setStrictAlert(null), 3500);
    }
  };

  const handleEmergencyTrigger = () => {
    setShowEmergencyModal(true);
    setEmergencyDelayCountdown(15);
    const interval = setInterval(() => {
      setEmergencyDelayCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const confirmEmergencyUnlock = () => {
    emergencyUnlock();
    setShowEmergencyModal(false);
  };

  const handleFinishSession = () => {
    if (!activeSession) return;
    const plannedMins = Math.round(activeSession.plannedDuration / 60);
    const actualMins = Math.round((activeSession.plannedDuration - timeRemaining) / 60);
    endSession(true);

    // Show Section 17 completion modal
    setCompletionData({
      plannedMins,
      actualMins,
      appsCount: blockedAppsCount,
      timeProtectedMins: actualMins
    });
  };

  // SVG Progress calculation
  const totalSeconds = activeSession?.plannedDuration || (selectedDuration * 60);
  const progressPercent = activeSession 
    ? ((totalSeconds - timeRemaining) / totalSeconds) * 100 
    : 0;
  const strokeDashoffset = 283 - (283 * progressPercent) / 100;

  return (
    <div className="space-y-6 text-left">
      
      {/* Main Focus Card */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs">
        
        {/* Top Profile Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Active Profile:
            </span>
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
              {profiles.slice(0, 4).map(p => (
                <button
                  key={p.id}
                  onClick={() => !activeSession && setActiveProfile(p)}
                  disabled={Boolean(activeSession)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                    activeProfile.id === p.id 
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-slate-700 dark:text-slate-200">{blockedAppsCount}</span>
            <span>apps guarded</span>
            <button 
              onClick={onOpenApps}
              className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline ml-1"
            >
              Choose Apps
            </button>
          </div>
        </div>

        {/* Strict Alert Banner */}
        {strictAlert && (
          <div className="mb-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 flex items-center gap-2 text-xs text-amber-800 dark:text-amber-300">
            <Lock className="w-4 h-4 shrink-0" />
            <span>{strictAlert}</span>
          </div>
        )}

        {/* Large Circular Timer Ring (Section 17) */}
        <div className="flex flex-col items-center justify-center my-4">
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="transparent"
                stroke="currentColor"
                strokeWidth="4.5"
                className="text-slate-100 dark:text-slate-800/80"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="transparent"
                stroke="currentColor"
                strokeWidth="4.5"
                strokeDasharray="283"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="text-emerald-500 transition-all duration-1000 ease-linear"
              />
            </svg>

            {/* Center Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
              {isOnBreak ? (
                <>
                  <span className="text-xs font-semibold text-indigo-500 uppercase tracking-widest flex items-center gap-1 mb-1">
                    <Coffee className="w-3.5 h-3.5" /> Mindful Break
                  </span>
                  <span className="text-4xl sm:text-5xl font-mono font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
                    {formatTime(breakTimeRemaining)}
                  </span>
                  <span className="text-[11px] text-slate-400 mt-1">Take 3 deep breaths</span>
                </>
              ) : (
                <>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    {activeSession ? (isPaused ? 'Session Paused' : 'Focus In Progress') : 'Session Duration'}
                  </span>
                  <span className="text-5xl sm:text-6xl font-mono font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
                    {activeSession ? formatTime(timeRemaining) : (isCustomDuration ? `${customDurationInput}:00` : `${selectedDuration}:00`)}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 truncate max-w-[200px]">
                    {activeSession ? activeSession.goal : goalText}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Presets & Configurations when idle */}
          {!activeSession && (
            <div className="flex flex-col items-center gap-4 mt-6 w-full max-w-sm">
              
              {/* Duration Presets: 25 min, 45 min, 60 min, 90 min, Custom */}
              <div className="flex flex-wrap items-center justify-center gap-2">
                {[25, 45, 60, 90].map(mins => (
                  <button
                    key={mins}
                    onClick={() => { setSelectedDuration(mins); setIsCustomDuration(false); }}
                    className={`h-9 px-3.5 rounded-xl text-xs font-semibold transition-all ${
                      selectedDuration === mins && !isCustomDuration
                        ? 'bg-slate-900 text-white dark:bg-emerald-600 shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {mins} min
                  </button>
                ))}

                <button
                  onClick={() => setIsCustomDuration(true)}
                  className={`h-9 px-3.5 rounded-xl text-xs font-semibold transition-all ${
                    isCustomDuration
                      ? 'bg-slate-900 text-white dark:bg-emerald-600 shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  Custom
                </button>
              </div>

              {isCustomDuration && (
                <div className="flex items-center gap-2 w-full">
                  <input
                    type="number"
                    min="5"
                    max="360"
                    value={customDurationInput}
                    onChange={(e) => setCustomDurationInput(e.target.value)}
                    placeholder="Enter minutes"
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-mono text-center"
                  />
                  <span className="text-xs text-slate-400">minutes</span>
                </div>
              )}

              {/* Goal Input */}
              <div className="relative w-full">
                <Target className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={goalText}
                  onChange={(e) => setGoalText(e.target.value)}
                  placeholder="Focus Goal (e.g. Finish quarterly presentation)"
                  className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Enforcement Style Selector */}
              <div className="w-full">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Enforcement Style
                </label>
                <select
                  value={selectedIntervention}
                  onChange={(e) => setSelectedIntervention(e.target.value as InterventionType)}
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
                >
                  <option value="strict_block">Hard Block (Zero bypassing)</option>
                  <option value="breathing">Mindful Box Breathing Challenge</option>
                  <option value="math">Prefrontal Math Challenge</option>
                  <option value="wait_timer">Friction Wait Timer</option>
                  <option value="typing">Conscious Typing Challenge</option>
                  <option value="rotate_phone">Tactile Sensor Rotation</option>
                </select>
              </div>

              {/* Big "Start Focus" CTA (Section 17) */}
              <button
                onClick={handleStart}
                className="w-full h-12 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-transform active:scale-[0.99] shadow-md shadow-emerald-500/10"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Start Focus</span>
              </button>
            </div>
          )}

          {/* Active Session Status & Controls (Section 17) */}
          {activeSession && (
            <div className="flex flex-col items-center gap-3 mt-4 w-full max-w-md">
              
              {/* During Session Status Grid */}
              <div className="grid grid-cols-3 gap-2 w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-center mb-2">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Guarded Apps</span>
                  <strong className="font-mono text-sm">{blockedAppsCount} apps</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Profile</span>
                  <strong className="text-xs truncate block">{activeSession.profileName}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Blocked Attempts</span>
                  <strong className="font-mono text-sm text-indigo-500">{dailyUsage.blockedAttempts}</strong>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2.5 w-full">
                <button
                  onClick={isPaused ? resumeSession : handlePause}
                  className="flex-1 h-11 rounded-xl border border-slate-200 dark:border-slate-800 font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                  <span>{isPaused ? 'Resume' : 'Pause'}</span>
                </button>

                <button
                  onClick={() => takeBreak(5)}
                  disabled={isOnBreak}
                  className="flex-1 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 text-indigo-700 dark:text-indigo-300 font-semibold text-xs flex items-center justify-center gap-1.5"
                >
                  <Coffee className="w-4 h-4" />
                  <span>5m Break</span>
                </button>

                <button
                  onClick={handleFinishSession}
                  className="h-11 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Complete</span>
                </button>
              </div>

              <button
                onClick={handleEmergencyTrigger}
                className="text-[11px] text-slate-400 hover:text-rose-500 transition-colors flex items-center gap-1 mt-1"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Emergency Unlock</span>
              </button>
            </div>
          )}
        </div>

        {/* Section 26: Compact Toggles & Widgets */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Focus Protection: Active
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">Android / Desktop Widget:</span>
            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[11px]">
              {activeProfile.name} · {formatTime(activeSession ? timeRemaining : selectedDuration * 60)}
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 19: "MORE FOCUS MODES" ACCORDION */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <button
          onClick={() => setShowMoreModes(!showMoreModes)}
          className="flex items-center justify-between w-full text-xs font-bold text-slate-900 dark:text-white"
        >
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-500" />
            <span>More Focus Modes ({MORE_FOCUS_MODES.length} Special Routines)</span>
          </div>
          <ChevronDown className={`w-4 h-4 transition-transform ${showMoreModes ? 'rotate-180' : ''}`} />
        </button>

        {showMoreModes && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 mt-3 border-t border-slate-100 dark:border-slate-800">
            {MORE_FOCUS_MODES.map(mode => (
              <div
                key={mode.id}
                onClick={() => setSelectedModeDetail(mode.name)}
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-800/40"
              >
                <strong className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">
                  {mode.name}
                </strong>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                  {mode.description}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 17: COMPLETION MODAL */}
      {completionData && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in zoom-in-95">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-800 p-7 text-center shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              Focus Session Complete
            </h3>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mb-4">
              “Another distraction loop is behind you. Your focus muscle just got stronger.”
            </p>

            <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 mb-6 text-xs text-left">
              <div><span className="text-slate-400">Planned Time:</span> <strong className="block text-slate-900 dark:text-white font-mono">{completionData.plannedMins}m</strong></div>
              <div><span className="text-slate-400">Actual Time:</span> <strong className="block text-slate-900 dark:text-white font-mono">{completionData.actualMins}m</strong></div>
              <div><span className="text-slate-400">Apps Blocked:</span> <strong className="block text-slate-900 dark:text-white font-mono">{completionData.appsCount} apps</strong></div>
              <div><span className="text-slate-400">Time Protected:</span> <strong className="block text-emerald-500 font-mono">{completionData.timeProtectedMins}m saved</strong></div>
            </div>

            <button
              onClick={() => setCompletionData(null)}
              className="w-full h-11 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 text-white font-semibold text-xs shadow-md"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Emergency Unlock Friction Modal */}
      {showEmergencyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900 p-6 text-center shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-3">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              Conscious Friction Delay
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
              To protect you from impulsive scrolling habits, FocusLock requires a reflection delay before an emergency release can be confirmed.
            </p>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 mb-6">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">
                Cooling Down
              </span>
              <span className="text-3xl font-mono font-bold text-rose-500 tabular-nums">
                {emergencyDelayCountdown}s
              </span>
            </div>

            <div className="space-y-2">
              <button
                onClick={confirmEmergencyUnlock}
                disabled={emergencyDelayCountdown > 0}
                className={`w-full h-11 rounded-xl font-semibold text-xs transition-colors ${
                  emergencyDelayCountdown === 0
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                }`}
              >
                {emergencyDelayCountdown > 0 ? 'Wait for Timer...' : 'Confirm Emergency Unlock'}
              </button>

              <button
                onClick={() => setShowEmergencyModal(false)}
                className="w-full py-2.5 text-xs font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                Keep Focusing (Stay Protected)
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
