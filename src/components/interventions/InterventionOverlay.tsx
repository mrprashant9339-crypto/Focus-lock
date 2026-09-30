import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  ShieldAlert, 
  Clock, 
  RotateCw, 
  Camera, 
  Sparkles, 
  ArrowLeft, 
  Check, 
  Heart,
  Smartphone,
  CheckCircle2,
  Lock,
  Calculator,
  Keyboard,
  Coffee,
  AlertTriangle,
  Crown
} from 'lucide-react';
import { useFocus } from '../../context/FocusContext';
import { useAuth } from '../../context/AuthContext';
import { InterventionType } from '../../types';

export const InterventionOverlay: React.FC = () => {
  const { 
    simulatedInterventionApp, 
    dismissInterventionSimulator,
    recordInterventionPassed,
    recordInterventionSkipped,
    recordAppBlockedAttempt,
    activeSession,
    timeRemaining,
    activeProfile,
    takeBreak,
    emergencyUnlock
  } = useFocus();

  const { profile } = useAuth();

  const [activeIntervention, setActiveIntervention] = useState<InterventionType>('breathing');
  const [showSkipPaywall, setShowSkipPaywall] = useState<boolean>(false);

  // A. BREATHING STATE (Section 20.A)
  const [breathStage, setBreathStage] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [breathDurationSeconds, setBreathDurationSeconds] = useState<number>(5); // 5s, 10s, 15s presets
  const [breathTimerCount, setBreathTimerCount] = useState<number>(5);
  const [breathCyclesCompleted, setBreathCyclesCompleted] = useState<number>(0);

  // B. MATH CHALLENGE STATE (Section 20.B)
  const [mathDifficulty, setMathDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Easy');
  const [mathProblem, setMathProblem] = useState<{ question: string; answer: number }>({ question: '7 + 5', answer: 12 });
  const [userMathAnswer, setUserMathAnswer] = useState<string>('');
  const [mathStatus, setMathStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');

  // C. ROTATE PHONE STATE (Section 20.C)
  const [rotationCount, setRotationCount] = useState<number>(0);
  const [sensorAvailable, setSensorAvailable] = useState<boolean>(true);
  const targetRotations = 3;

  // D. WAIT TIMER STATE (Section 20.D)
  const [waitDuration, setWaitDuration] = useState<number>(30); // 30s, 60s, 90s
  const [waitRemaining, setWaitRemaining] = useState<number>(30);
  const [isWaiting, setIsWaiting] = useState<boolean>(true);

  // E. MIRROR PROMPT STATE (Section 20.E)
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [mirrorSecondsLeft, setMirrorSecondsLeft] = useState<number>(8);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // F. TYPING CHALLENGE STATE (Section 20.F)
  const motivationalPhrases = [
    'I will focus.',
    'My attention is my most valuable resource.',
    'Conscious time beats endless scrolling.',
    'I choose to protect my mental clarity.',
    'Presence over dopamine.'
  ];
  const [typingPrompt, setTypingPrompt] = useState<string>('I will focus.');
  const [userTypedText, setUserTypedText] = useState<string>('');

  // Daily skip allowance (Section 21)
  const isPremium = profile?.subscriptionSummary.tier && profile.subscriptionSummary.tier !== 'free';
  const skipsUsedToday = profile?.skipsUsedToday || 0;
  const maxSkipsAllowed = isPremium ? 999 : 2;

  useEffect(() => {
    if (simulatedInterventionApp) {
      setActiveIntervention(simulatedInterventionApp.interventionId || 'breathing');
      recordAppBlockedAttempt(simulatedInterventionApp.name);
      generateNewMath('Easy');
      generateNewTypingPrompt();
      setWaitRemaining(waitDuration);
      setRotationCount(0);
      setBreathCyclesCompleted(0);
    }
  }, [simulatedInterventionApp]);

  // Breathing interval
  useEffect(() => {
    if (!simulatedInterventionApp || activeIntervention !== 'breathing') return;

    const timer = setInterval(() => {
      setBreathTimerCount(prev => {
        if (prev <= 1) {
          setBreathStage(current => {
            if (current === 'Inhale') return 'Hold';
            if (current === 'Hold') return 'Exhale';
            setBreathCyclesCompleted(c => c + 1);
            return 'Inhale';
          });
          return breathDurationSeconds;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [simulatedInterventionApp, activeIntervention, breathDurationSeconds]);

  // Wait Timer countdown
  useEffect(() => {
    if (!simulatedInterventionApp || activeIntervention !== 'wait_timer' || !isWaiting) return;

    const timer = setInterval(() => {
      setWaitRemaining(prev => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [simulatedInterventionApp, activeIntervention, isWaiting]);

  // Mirror Camera setup (Section 20.E: Only activate when Mirror is selected, NEVER save image)
  useEffect(() => {
    if (!simulatedInterventionApp || activeIntervention !== 'mirror') {
      if (cameraStream) {
        cameraStream.getTracks().forEach(t => t.stop());
        setCameraStream(null);
      }
      return;
    }

    setMirrorSecondsLeft(8);
    let streamInstance: MediaStream | null = null;

    navigator.mediaDevices?.getUserMedia({ video: { facingMode: 'user' } })
      .then(stream => {
        streamInstance = stream;
        setCameraStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch(err => {
        console.warn('Camera access unavailable:', err);
        setCameraError('Front camera permission not granted or device camera in use.');
      });

    const countdown = setInterval(() => {
      setMirrorSecondsLeft(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => {
      clearInterval(countdown);
      if (streamInstance) {
        streamInstance.getTracks().forEach(t => t.stop());
      }
    };
  }, [simulatedInterventionApp, activeIntervention]);

  // Gyroscope / DeviceOrientation test listener
  useEffect(() => {
    if (!simulatedInterventionApp || activeIntervention !== 'rotate_phone') return;

    let lastBeta: number | null = null;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.beta !== null) {
        setSensorAvailable(true);
        if (lastBeta !== null && Math.abs(e.beta - lastBeta) > 45) {
          setRotationCount(prev => Math.min(targetRotations, prev + 1));
        }
        lastBeta = e.beta;
      }
    };

    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation);
    } else {
      setSensorAvailable(false);
    }

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [simulatedInterventionApp, activeIntervention]);

  if (!simulatedInterventionApp) return null;

  const app = simulatedInterventionApp;

  // DYNAMIC MATH GENERATOR (Section 20.B)
  function generateNewMath(difficulty: 'Easy' | 'Medium' | 'Hard') {
    setMathDifficulty(difficulty);
    setUserMathAnswer('');
    setMathStatus('idle');

    if (difficulty === 'Easy') {
      const a = Math.floor(Math.random() * 12) + 3;
      const b = Math.floor(Math.random() * 12) + 3;
      setMathProblem({ question: `${a} + ${b}`, answer: a + b });
    } else if (difficulty === 'Medium') {
      const a = Math.floor(Math.random() * 18) + 11;
      const b = Math.floor(Math.random() * 8) + 3;
      setMathProblem({ question: `${a} × ${b}`, answer: a * b });
    } else {
      const b = Math.floor(Math.random() * 11) + 6;
      const quotient = Math.floor(Math.random() * 15) + 10;
      const a = b * quotient;
      setMathProblem({ question: `${a} ÷ ${b}`, answer: quotient });
    }
  }

  function handleCheckMath(e: React.FormEvent) {
    e.preventDefault();
    if (parseInt(userMathAnswer) === mathProblem.answer) {
      setMathStatus('correct');
    } else {
      setMathStatus('wrong');
      setTimeout(() => setMathStatus('idle'), 1500);
    }
  }

  function generateNewTypingPrompt() {
    const random = motivationalPhrases[Math.floor(Math.random() * motivationalPhrases.length)];
    setTypingPrompt(random);
    setUserTypedText('');
  }

  const handleSkipOrPass = () => {
    if (!isPremium && skipsUsedToday >= maxSkipsAllowed) {
      setShowSkipPaywall(true);
      return;
    }
    recordInterventionPassed(app.name);
    dismissInterventionSimulator();
  };

  const handleCloseAndFocus = () => {
    recordInterventionSkipped(app.name);
    dismissInterventionSimulator();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-md p-4 animate-in fade-in duration-200">
      
      {/* Simulation Frame */}
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 text-center overflow-hidden">
        
        {/* Close & Return to Focus */}
        <button
          onClick={handleCloseAndFocus}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
          title="Return to Focus"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header App Target */}
        <div className="flex flex-col items-center mb-5">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 mb-2 border border-slate-200 dark:border-slate-700 shadow-inner">
            <Smartphone className="w-6 h-6" />
          </div>
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
            You’re about to open {app.name}
          </span>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
            Take a moment first.
          </h2>
        </div>

        {/* ---------------------------------------------------- */}
        {/* MODE 1: HARD BLOCK SCREEN (Section 49) */}
        {/* ---------------------------------------------------- */}
        {activeIntervention === 'strict_block' && (
          <div className="flex flex-col items-center py-2 text-center">
            <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mb-3">
              <Lock className="w-8 h-8" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              Focus first.
            </h3>
            <span className="text-xs text-rose-600 dark:text-rose-400 font-semibold mb-3">
              Focus Mode is active.
            </span>

            <div className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 mb-6 text-xs text-left space-y-1.5">
              <div><span className="text-slate-400">Protected app:</span> <strong className="text-slate-900 dark:text-white">{app.name}</strong></div>
              <div><span className="text-slate-400">Remaining time:</span> <strong className="text-emerald-500 font-mono">{activeSession ? `${Math.round(timeRemaining / 60)} min` : '42 min'}</strong></div>
              <div><span className="text-slate-400">Reason:</span> <span className="text-slate-700 dark:text-slate-300">Your {activeProfile?.name || 'Social Media'} profile is active.</span></div>
            </div>

            <div className="space-y-2 w-full">
              <button
                onClick={handleCloseAndFocus}
                className="w-full h-12 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-500/10"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Focus</span>
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => { takeBreak(5); dismissInterventionSimulator(); }}
                  className="flex-1 py-2.5 rounded-xl border border-indigo-200 dark:border-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
                >
                  <Coffee className="w-3.5 h-3.5 inline mr-1" />
                  <span>5m Break Mode</span>
                </button>

                <button
                  onClick={() => { emergencyUnlock(); dismissInterventionSimulator(); }}
                  className="flex-1 py-2.5 rounded-xl border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs font-semibold hover:bg-rose-50 dark:hover:bg-rose-950/40"
                >
                  <AlertTriangle className="w-3.5 h-3.5 inline mr-1" />
                  <span>Emergency Unlock</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* INTERVENTION A: BREATHING (Section 20.A) */}
        {/* ---------------------------------------------------- */}
        {activeIntervention === 'breathing' && (
          <div className="flex flex-col items-center py-2">
            {/* Duration presets: 5s, 10s, 15s */}
            <div className="flex items-center gap-2 mb-4">
              {[5, 10, 15].map(sec => (
                <button
                  key={sec}
                  onClick={() => { setBreathDurationSeconds(sec); setBreathTimerCount(sec); }}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    breathDurationSeconds === sec
                      ? 'bg-slate-900 text-white dark:bg-emerald-600'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  {sec}s Stage
                </button>
              ))}
            </div>

            {/* Expanding/Contracting Breathing Circle */}
            <div className="relative w-44 h-44 flex items-center justify-center my-3">
              <div 
                className={`absolute inset-0 rounded-full bg-emerald-500/10 border-2 border-emerald-500/40 transition-transform duration-1000 ease-in-out ${
                  breathStage === 'Inhale' 
                    ? 'scale-110' 
                    : breathStage === 'Hold' 
                      ? 'scale-110 ring-4 ring-emerald-500/20' 
                      : 'scale-70'
                }`}
              />
              <div className="relative z-10 flex flex-col items-center">
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-1">
                  {breathStage}
                </span>
                <span className="text-4xl font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                  {breathTimerCount}s
                </span>
                <span className="text-[10px] text-slate-400 mt-1">
                  {breathCyclesCompleted} completed cycle{breathCyclesCompleted === 1 ? '' : 's'}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mb-6">
              Inhale deeply, hold your center, and exhale slowly to reset your dopaminergic drive.
            </p>

            <div className="space-y-2 w-full">
              <button
                onClick={handleCloseAndFocus}
                className="w-full h-11 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Focus (Close {app.name})</span>
              </button>

              <button
                onClick={handleSkipOrPass}
                disabled={breathCyclesCompleted < 1}
                className={`w-full py-2.5 text-xs font-semibold transition-colors ${
                  breathCyclesCompleted >= 1 
                    ? 'text-emerald-600 dark:text-emerald-400 hover:underline' 
                    : 'text-slate-400 cursor-not-allowed'
                }`}
              >
                {breathCyclesCompleted >= 1 ? 'Continue to App (Pass)' : 'Complete 1 cycle to Continue'}
              </button>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* INTERVENTION B: MATH CHALLENGE (Section 20.B) */}
        {/* ---------------------------------------------------- */}
        {activeIntervention === 'math' && (
          <div className="flex flex-col items-center py-2 text-left w-full">
            <div className="flex items-center justify-between w-full mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Math Engagement
              </span>
              <div className="flex gap-1.5">
                {(['Easy', 'Medium', 'Hard'] as const).map(diff => (
                  <button
                    key={diff}
                    onClick={() => generateNewMath(diff)}
                    className={`px-2.5 py-0.5 rounded text-xs font-semibold transition-colors ${
                      mathDifficulty === diff 
                        ? 'bg-slate-900 text-white dark:bg-emerald-600' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            <div className="w-full p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-center mb-4">
              <span className="text-[11px] text-slate-400 uppercase tracking-widest block mb-2">
                Solve to activate prefrontal cortex
              </span>
              <div className="text-3xl font-mono font-bold text-slate-900 dark:text-white tabular-nums tracking-wide">
                {mathProblem.question} = ?
              </div>
            </div>

            <form onSubmit={handleCheckMath} className="w-full space-y-3">
              <input
                type="number"
                autoFocus
                value={userMathAnswer}
                onChange={(e) => setUserMathAnswer(e.target.value)}
                placeholder="Enter calculation result..."
                className="w-full h-11 px-4 text-center font-mono font-bold text-lg rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />

              {mathStatus === 'wrong' && (
                <div className="p-2 text-center text-xs font-semibold text-rose-500 bg-rose-50 dark:bg-rose-950/40 rounded-lg">
                  Try Again! Calculation incorrect.
                </div>
              )}

              {mathStatus === 'correct' && (
                <div className="p-2 text-center text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg">
                  Correct! Prefrontal control restored.
                </div>
              )}

              {mathStatus !== 'correct' ? (
                <button
                  type="submit"
                  className="w-full h-11 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 text-white font-semibold text-xs shadow-md"
                >
                  Verify Answer
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSkipOrPass}
                  className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Continue</span>
                </button>
              )}
            </form>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* INTERVENTION C: ROTATE PHONE (Section 20.C) */}
        {/* ---------------------------------------------------- */}
        {activeIntervention === 'rotate_phone' && (
          <div className="flex flex-col items-center py-2 text-center">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mb-3">
              <RotateCw className="w-8 h-8" />
            </div>

            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Tactile Sensor Challenge
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mb-4">
              Physically rotate your phone 3 times to break the motor habit loop.
            </p>

            <div className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 mb-4 border border-slate-200 dark:border-slate-700/80">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">
                Rotations Detected
              </span>
              <span className="text-3xl font-mono font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                {rotationCount} / {targetRotations}
              </span>
            </div>

            {/* Sensor test button for desktop / fallback */}
            <button
              onClick={() => setRotationCount(c => Math.min(targetRotations, c + 1))}
              className="py-2 px-4 rounded-xl border border-dashed border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 text-xs font-semibold mb-6 hover:bg-amber-50 dark:hover:bg-amber-950/40"
            >
              Simulate 1 Rotation Gesture
            </button>

            {!sensorAvailable && (
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-500 mb-4">
                Rotation detection isn’t available on this device. You can simulate gestures above or choose another challenge.
              </div>
            )}

            <div className="space-y-2 w-full">
              <button
                onClick={handleCloseAndFocus}
                className="w-full h-11 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-amber-600 text-white font-semibold text-xs"
              >
                Return to Focus
              </button>

              <button
                onClick={handleSkipOrPass}
                disabled={rotationCount < targetRotations}
                className={`w-full py-2.5 text-xs font-semibold transition-colors ${
                  rotationCount >= targetRotations 
                    ? 'text-emerald-600 dark:text-emerald-400 hover:underline' 
                    : 'text-slate-400 cursor-not-allowed'
                }`}
              >
                {rotationCount >= targetRotations ? 'Continue' : 'Complete 3 rotations to Continue'}
              </button>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* INTERVENTION D: WAIT TIMER (Section 20.D) */}
        {/* ---------------------------------------------------- */}
        {activeIntervention === 'wait_timer' && (
          <div className="flex flex-col items-center py-2 text-center">
            {/* Presets: 30s, 60s, 90s */}
            <div className="flex items-center gap-2 mb-4">
              {[30, 60, 90].map(sec => (
                <button
                  key={sec}
                  onClick={() => { setWaitDuration(sec); setWaitRemaining(sec); setIsWaiting(true); }}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    waitDuration === sec
                      ? 'bg-slate-900 text-white dark:bg-indigo-600'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  {sec}s Delay
                </button>
              ))}
            </div>

            {/* Countdown Ring */}
            <div className="w-36 h-36 rounded-full border-4 border-indigo-500/30 flex flex-col items-center justify-center p-3 mb-6 bg-indigo-500/5">
              <span className="text-[11px] text-slate-400 uppercase tracking-widest block">
                Wait Timer
              </span>
              <span className="text-4xl font-mono font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">
                {waitRemaining}s
              </span>
            </div>

            <div className="flex gap-2 w-full mb-3">
              <button
                onClick={handleCloseAndFocus}
                className="flex-1 h-11 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Cancel
              </button>

              <button
                onClick={() => setIsWaiting(true)}
                className="flex-1 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-xs font-semibold border border-indigo-200 dark:border-indigo-900"
              >
                Keep Waiting
              </button>
            </div>

            <button
              onClick={handleSkipOrPass}
              disabled={waitRemaining > 0}
              className={`w-full h-11 rounded-xl font-semibold text-xs transition-colors ${
                waitRemaining === 0 
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
              }`}
            >
              {waitRemaining === 0 ? 'Continue' : 'Wait for timer to finish...'}
            </button>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* INTERVENTION E: MIRROR PROMPT (Section 20.E) */}
        {/* ---------------------------------------------------- */}
        {activeIntervention === 'mirror' && (
          <div className="flex flex-col items-center py-2 text-center">
            {/* Front Camera Video Preview */}
            <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-slate-800 bg-black flex items-center justify-center mb-4 shadow-xl">
              {cameraStream ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover scale-x-[-1]"
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-4 text-slate-400">
                  <Camera className="w-8 h-8 mb-1" />
                  <span className="text-[10px] text-center font-mono">
                    {cameraError || 'Loading front camera...'}
                  </span>
                </div>
              )}
            </div>

            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Is this worth your time?
            </h3>
            <p className="text-xs text-slate-400 mb-6 font-mono">
              Self-reflection window: {mirrorSecondsLeft}s
            </p>

            <div className="space-y-2 w-full">
              <button
                onClick={handleCloseAndFocus}
                className="w-full h-11 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 text-white font-semibold text-xs"
              >
                Step Away & Return to Focus
              </button>

              <button
                onClick={handleSkipOrPass}
                disabled={mirrorSecondsLeft > 0}
                className={`w-full py-2.5 text-xs font-semibold transition-colors ${
                  mirrorSecondsLeft === 0 
                    ? 'text-emerald-600 dark:text-emerald-400 hover:underline' 
                    : 'text-slate-400 cursor-not-allowed'
                }`}
              >
                {mirrorSecondsLeft === 0 ? 'Continue' : 'Reflect until timer completes...'}
              </button>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* INTERVENTION F: TYPING CHALLENGE (Section 20.F) */}
        {/* ---------------------------------------------------- */}
        {activeIntervention === 'typing' && (
          <div className="flex flex-col items-center py-2 text-left w-full">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Conscious Typing Pledge
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              Type the exact pledge phrase below to confirm conscious usage:
            </p>

            <div className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 mb-3 select-none">
              "{typingPrompt}"
            </div>

            <input
              type="text"
              autoFocus
              value={userTypedText}
              onChange={(e) => setUserTypedText(e.target.value)}
              placeholder="Type exact phrase here..."
              className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 mb-4"
            />

            <div className="space-y-2 w-full">
              <button
                onClick={handleSkipOrPass}
                disabled={userTypedText.trim() !== typingPrompt}
                className={`w-full h-11 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-colors ${
                  userTypedText.trim() === typingPrompt
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>Continue</span>
              </button>

              <button
                onClick={handleCloseAndFocus}
                className="w-full py-2 text-xs text-center text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                Close {app.name} & Maintain Focus
              </button>
            </div>
          </div>
        )}

      </div>

      {/* SECTION 21: SKIP LIMIT EXCEEDED PAYWALL MODAL */}
      {showSkipPaywall && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-800 p-6 text-center shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-3">
              <Crown className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              You have used today’s skips.
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
              You can keep your focus rule active or unlock extended flexibility with FocusLock Premium.
            </p>

            <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-xs font-semibold text-amber-800 dark:text-amber-300 mb-4">
              ₹10 for 3-Week Pass · ₹50 for 6 Months · ₹80 for 1 Year
            </div>

            <div className="space-y-2">
              <button
                onClick={() => { setShowSkipPaywall(false); handleCloseAndFocus(); }}
                className="w-full h-11 rounded-xl bg-slate-900 dark:bg-emerald-600 text-white font-semibold text-xs"
              >
                Keep Focus Active (Recommended)
              </button>
              <button
                onClick={() => { setShowSkipPaywall(false); }}
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
