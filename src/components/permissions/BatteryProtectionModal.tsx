import React, { useState } from 'react';
import { 
  BatteryCharging, 
  ExternalLink, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  Smartphone, 
  Lock, 
  Zap,
  Info,
  ChevronRight
} from 'lucide-react';
import { MANUFACTURER_GUIDES } from '../../constants/initialData';
import { ManufacturerBrand } from '../../types';
import { useFocus } from '../../context/FocusContext';

export const BatteryProtectionModal: React.FC = () => {
  const { device, updatePermission } = useFocus();
  const [selectedBrand, setSelectedBrand] = useState<ManufacturerBrand>('xiaomi');
  const [showGuideModal, setShowGuideModal] = useState<boolean>(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const guide = MANUFACTURER_GUIDES[selectedBrand];

  const handleOpenBatterySettings = () => {
    setActionFeedback('Simulating intent: android.settings.IGNORE_BATTERY_OPTIMIZATION_SETTINGS');
    setTimeout(() => setActionFeedback(null), 3500);
  };

  const handleOpenAppBatterySettings = () => {
    setActionFeedback(`Simulating intent: android.settings.APPLICATION_DETAILS_SETTINGS (${guide.settingsIntent})`);
    setTimeout(() => setActionFeedback(null), 3500);
  };

  const handleToggleProtected = () => {
    updatePermission('batteryOptimization', !device.permissions.batteryOptimization);
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* Overview Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
              device.permissions.batteryOptimization 
                ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
            }`}>
              <BatteryCharging className="w-6 h-6" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Device-Aware Battery Protection
                </h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  device.permissions.batteryOptimization 
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400' 
                    : 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
                }`}>
                  {device.permissions.batteryOptimization ? 'Protected' : 'At Risk of Kill'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Modern Android OEMs aggressively kill background services without proper exemptions.
              </p>
            </div>
          </div>

          <button
            onClick={handleToggleProtected}
            className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors self-start sm:self-center"
          >
            {device.permissions.batteryOptimization ? 'Recheck System State' : 'Mark as Protected'}
          </button>
        </div>

        {/* Action feedback banner */}
        {actionFeedback && (
          <div className="p-3 mb-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 text-xs text-indigo-800 dark:text-indigo-300 font-mono">
            {actionFeedback}
          </div>
        )}

        {/* 3 Quick Action Buttons as specified in Section 11 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <button
            onClick={handleOpenBatterySettings}
            className="h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-white flex items-center justify-center gap-2 transition-colors shadow-xs"
          >
            <ExternalLink className="w-4 h-4 text-emerald-500" />
            <span>Open Battery Settings</span>
          </button>

          <button
            onClick={handleOpenAppBatterySettings}
            className="h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-white flex items-center justify-center gap-2 transition-colors shadow-xs"
          >
            <Zap className="w-4 h-4 text-amber-500" />
            <span>Open App Battery Settings</span>
          </button>

          <button
            onClick={() => setShowGuideModal(true)}
            className="h-11 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Setup Guide</span>
          </button>
        </div>
      </div>

      {/* Manufacturer Selector */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
          Manufacturer-Specific Background Guidance
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Select your phone brand to see step-by-step instructions to prevent custom task killers from terminating FocusLock.
        </p>

        {/* Brand Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none mb-6">
          {(Object.keys(MANUFACTURER_GUIDES) as ManufacturerBrand[]).map(b => (
            <button
              key={b}
              onClick={() => setSelectedBrand(b)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedBrand === b
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {b.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Selected Brand Instructions */}
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
            <Smartphone className="w-4 h-4 text-emerald-500" />
            <span>{guide.name}</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold flex items-center justify-center shrink-0 mt-0.5">
                1
              </span>
              <div>
                <strong className="text-slate-800 dark:text-slate-200 block mb-0.5">Autostart Permission</strong>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed">{guide.autostartStep}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold flex items-center justify-center shrink-0 mt-0.5">
                2
              </span>
              <div>
                <strong className="text-slate-800 dark:text-slate-200 block mb-0.5">Disable Battery Optimization</strong>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed">{guide.batteryStep}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold flex items-center justify-center shrink-0 mt-0.5">
                3
              </span>
              <div>
                <strong className="text-slate-800 dark:text-slate-200 block mb-0.5">Lock in Recent Tasks</strong>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed">{guide.appPinStep}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Setup Guide Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              FocusLock Background Exemption Guide
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
              Android security policy strictly forbids apps from changing these system settings silently without user consent. Follow these three steps in Android Settings:
            </p>

            <div className="space-y-3 mb-6 text-xs text-slate-600 dark:text-slate-300">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <strong>Step 1:</strong> Allow FocusLock in "Autostart / Auto-launch" management.
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <strong>Step 2:</strong> Set Battery Usage to "Unrestricted / No Restrictions".
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <strong>Step 3:</strong> Pin FocusLock in the App Switcher to prevent memory clears.
              </div>
            </div>

            <button
              onClick={() => setShowGuideModal(false)}
              className="w-full h-11 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 text-white font-semibold text-xs"
            >
              Understood
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
