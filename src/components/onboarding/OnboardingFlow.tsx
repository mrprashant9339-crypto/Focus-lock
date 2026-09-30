import React, { useState } from 'react';
import { 
  Shield, 
  Smartphone, 
  Eye, 
  Layers, 
  Zap, 
  BatteryCharging, 
  Camera, 
  Compass, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { useFocus } from '../../context/FocusContext';

interface OnboardingFlowProps {
  onComplete: () => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const [currentScreen, setCurrentScreen] = useState<number>(1);
  const { device, updatePermission } = useFocus();

  // Simulated denial / verification states for realistic feedback
  const [usageDenied, setUsageDenied] = useState<boolean>(false);
  const [overlayDenied, setOverlayDenied] = useState<boolean>(false);
  const [batteryDenied, setBatteryDenied] = useState<boolean>(false);

  const [verifying, setVerifying] = useState<boolean>(false);

  const handleGrantUsageAccess = () => {
    setVerifying(true);
    setTimeout(() => {
      updatePermission('usageAccess', true);
      setUsageDenied(false);
      setVerifying(false);
      setCurrentScreen(4);
    }, 900);
  };

  const handleSimulateUsageDenial = () => {
    setUsageDenied(true);
  };

  const handleGrantOverlay = () => {
    setVerifying(true);
    setTimeout(() => {
      updatePermission('overlay', true);
      setOverlayDenied(false);
      setVerifying(false);
      setCurrentScreen(5);
    }, 900);
  };

  const handleSimulateOverlayDenial = () => {
    setOverlayDenied(true);
  };

  const handleProtectBattery = () => {
    setVerifying(true);
    setTimeout(() => {
      updatePermission('batteryOptimization', true);
      setBatteryDenied(false);
      setVerifying(false);
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 overflow-hidden">
        
        {/* Step indicator */}
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100 dark:border-slate-800 text-xs font-medium text-slate-500">
          <span>Step {currentScreen} of 5</span>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map(step => (
              <div 
                key={step} 
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  step === currentScreen 
                    ? 'w-6 bg-emerald-500' 
                    : step < currentScreen 
                      ? 'w-2 bg-emerald-300 dark:bg-emerald-800' 
                      : 'w-2 bg-slate-200 dark:bg-slate-800'
                }`}
              />
            ))}
          </div>
        </div>

        {/* SCREEN 1: Hero Intro */}
        {currentScreen === 1 && (
          <div className="flex flex-col items-center text-center py-4">
            {/* Clean Animated Phone Illustration */}
            <div className="relative w-36 h-60 rounded-[32px] border-4 border-slate-800 dark:border-slate-700 bg-slate-950 p-2 shadow-xl mb-6 flex flex-col items-center justify-between overflow-hidden">
              {/* Phone speaker notch */}
              <div className="w-12 h-1 bg-slate-700 rounded-full mt-1 shrink-0" />
              
              {/* Screen Content: Peaceful focus ripple */}
              <div className="flex flex-col items-center justify-center flex-1 w-full relative">
                <div className="absolute w-24 h-24 rounded-full border border-emerald-500/30 animate-ping opacity-30" />
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/50 flex items-center justify-center text-emerald-400 mb-2">
                  <Shield className="w-8 h-8" />
                </div>
                <span className="text-[10px] text-emerald-400 font-mono">FOCUS ACTIVE</span>
                <span className="text-[9px] text-slate-400">0 apps distracted</span>
              </div>

              {/* Bottom bar */}
              <div className="w-14 h-1 bg-slate-700 rounded-full mb-1 shrink-0" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-3">
              Take back your time.
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-sm leading-relaxed mb-8">
              Break the scrolling loop. Protect your focus. Build a better day.
            </p>

            <button
              onClick={() => setCurrentScreen(2)}
              className="w-full py-3.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-medium text-sm flex items-center justify-center gap-2 transition-transform active:scale-[0.99] shadow-lg shadow-emerald-500/10"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* SCREEN 2: Permission Explanation */}
        {currentScreen === 2 && (
          <div className="flex flex-col py-2">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
              FocusLock needs a few permissions to protect your focus.
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              We operate under Zero-Knowledge privacy. Your usage never leaves your private Firebase account.
            </p>

            <div className="space-y-3.5 mb-6 text-left">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <Eye className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100">Usage Access</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    We use this to understand which apps are being used and for how long.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <Layers className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100">Overlay</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    We use this to show a blocking/intervention screen when a protected app is opened.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <Zap className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100">Foreground Service</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Android uses this active service to keep your focus rules running reliably.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <BatteryCharging className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100">Battery Optimization</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Some phones aggressively stop background apps. This setting helps FocusLock continue enforcing your rules.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <Camera className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100">Camera</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Only required if you enable the Mirror intervention. We do not save your camera image.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <Compass className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100">Sensors</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Only required for Rotate Your Phone intervention.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setCurrentScreen(3)}
              className="w-full py-3.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-medium text-sm flex items-center justify-center gap-2"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* SCREEN 3: Usage Access Permission */}
        {currentScreen === 3 && (
          <div className="flex flex-col py-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-4">
              <Eye className="w-6 h-6" />
            </div>

            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
              Usage Access
            </h2>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 mb-4 text-left">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Why it is required:
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Usage Access allows FocusLock to detect when distracting apps are opened and record accurate daily screen time statistics.
              </p>
            </div>

            {/* Current status display */}
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 mb-6">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Current Status:</span>
              <div className="flex items-center gap-1.5">
                <div className={`w-2.5 h-2.5 rounded-full ${device.permissions.usageAccess ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                <span className={`text-xs font-semibold ${device.permissions.usageAccess ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}`}>
                  {device.permissions.usageAccess ? 'Granted' : 'Not Granted'}
                </span>
              </div>
            </div>

            {usageDenied && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 mb-6 text-left">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800 dark:text-amber-300">
                    Usage Access wasn’t granted. FocusLock can’t accurately measure app usage until you enable it.
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <button
                onClick={handleGrantUsageAccess}
                disabled={verifying}
                className="w-full py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
              >
                {verifying ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying Android Settings...</span>
                  </>
                ) : (
                  <>
                    <span>Grant Usage Access</span>
                    <ExternalLink className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="flex gap-2">
                <button
                  onClick={handleSimulateUsageDenial}
                  className="flex-1 py-2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  Test Denied Fallback
                </button>
                <button
                  onClick={() => setCurrentScreen(4)}
                  className="flex-1 py-2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 underline"
                >
                  Skip for Now
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SCREEN 4: Overlay Permission */}
        {currentScreen === 4 && (
          <div className="flex flex-col py-2">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-4">
              <Layers className="w-6 h-6" />
            </div>

            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
              Display Over Other Apps
            </h2>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 mb-4 text-left">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Why it is required:
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                FocusLock needs permission to place the intervention/blocking screen above a protected app.
              </p>
            </div>

            {/* Current status */}
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 mb-6">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Current Status:</span>
              <div className="flex items-center gap-1.5">
                <div className={`w-2.5 h-2.5 rounded-full ${device.permissions.overlay ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                <span className={`text-xs font-semibold ${device.permissions.overlay ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}`}>
                  {device.permissions.overlay ? 'Granted' : 'Not Granted'}
                </span>
              </div>
            </div>

            {overlayDenied && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 mb-6 text-left">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800 dark:text-amber-300">
                    Overlay permission is required for on-screen blocking. Without it, FocusLock can track usage but cannot reliably show the blocking screen.
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <button
                onClick={handleGrantOverlay}
                disabled={verifying}
                className="w-full py-3.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
              >
                {verifying ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Opening Overlay Settings...</span>
                  </>
                ) : (
                  <>
                    <span>Enable Overlay</span>
                    <ExternalLink className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="flex gap-2">
                <button
                  onClick={handleSimulateOverlayDenial}
                  className="flex-1 py-2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  Test Denied Message
                </button>
                <button
                  onClick={() => setCurrentScreen(5)}
                  className="flex-1 py-2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 underline"
                >
                  Skip for Now
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SCREEN 5: Battery Optimization */}
        {currentScreen === 5 && (
          <div className="flex flex-col py-2">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-4">
              <BatteryCharging className="w-6 h-6" />
            </div>

            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
              Battery Optimization
            </h2>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 mb-4 text-left">
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Some Android phones stop background activity to save battery.
              </p>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 mb-6">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Protection Status:</span>
              <div className="flex items-center gap-1.5">
                <div className={`w-2.5 h-2.5 rounded-full ${device.permissions.batteryOptimization ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                <span className={`text-xs font-semibold ${device.permissions.batteryOptimization ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}`}>
                  {device.permissions.batteryOptimization ? 'Protected' : 'Optimized (Risky)'}
                </span>
              </div>
            </div>

            {batteryDenied && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 mb-6 text-left">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800 dark:text-amber-300">
                    Battery optimization is still active. Your phone may stop FocusLock in the background, especially during long focus sessions.
                  </p>
                </div>
              </div>
            )}

            {!device.permissions.batteryOptimization ? (
              <div className="space-y-2">
                <button
                  onClick={handleProtectBattery}
                  disabled={verifying}
                  className="w-full py-3.5 px-6 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-600/20"
                >
                  {verifying ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Requesting Battery Exemption...</span>
                    </>
                  ) : (
                    <span>Protect FocusLock</span>
                  )}
                </button>
                <button
                  onClick={() => setBatteryDenied(true)}
                  className="w-full py-2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  Show Denied State
                </button>
              </div>
            ) : (
              <div className="text-center py-4 border-t border-slate-100 dark:border-slate-800 mt-2">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                  Setup Complete
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                  FocusLock is now fortified with Android permissions to protect your attention.
                </p>

                <button
                  onClick={onComplete}
                  className="w-full py-3.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                >
                  <span>Choose Apps</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
