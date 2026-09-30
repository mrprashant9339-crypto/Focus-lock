import React, { useState } from 'react';
import { 
  Eye, 
  Layers, 
  Zap, 
  BatteryCharging, 
  Fingerprint, 
  Camera, 
  Compass, 
  Bell, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  Shield,
  RefreshCw
} from 'lucide-react';
import { useFocus } from '../../context/FocusContext';

export const PermissionCenter: React.FC = () => {
  const { device, updatePermission, verifyBiometric } = useFocus();
  const [testingKey, setTestingKey] = useState<string | null>(null);

  const permissionsList = [
    {
      key: 'usageAccess' as const,
      name: 'Usage Access',
      description: 'Reads foreground package activity and tracks exact screen time.',
      icon: Eye,
      status: device.permissions.usageAccess ? 'GRANTED' : 'DENIED',
      systemAction: 'Settings.ACTION_USAGE_ACCESS_SETTINGS',
      critical: true
    },
    {
      key: 'overlay' as const,
      name: 'Overlay Window',
      description: 'Draws intervention and blocking screen on top of opened apps.',
      icon: Layers,
      status: device.permissions.overlay ? 'GRANTED' : 'DENIED',
      systemAction: 'Settings.ACTION_MANAGE_OVERLAY_PERMISSION',
      critical: true
    },
    {
      key: 'batteryOptimization' as const,
      name: 'Battery Optimization Exemption',
      description: 'Prevents OEM Android battery killers from killing background blocking rules.',
      icon: BatteryCharging,
      status: device.permissions.batteryOptimization ? 'GRANTED' : 'RESTRICTED',
      systemAction: 'Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS',
      critical: true
    },
    {
      key: 'foregroundService' as const,
      name: 'Foreground Service',
      description: 'Maintains persistent focus coordinator and lock state notification.',
      icon: Zap,
      status: device.permissions.foregroundService ? 'GRANTED' : 'DENIED',
      systemAction: 'Manifest.permission.FOREGROUND_SERVICE_SPECIAL_USE',
      critical: true
    },
    {
      key: 'biometric' as const,
      name: 'Biometric & Hardware Key',
      description: 'Secures settings modifications from impulsive tampering.',
      icon: Fingerprint,
      status: device.permissions.biometric ? 'GRANTED' : 'NOT_REQUESTED',
      systemAction: 'BiometricManager.canAuthenticate()',
      critical: false
    },
    {
      key: 'notifications' as const,
      name: 'Notifications',
      description: 'Displays active session timer in system tray and alerts on goal completion.',
      icon: Bell,
      status: device.permissions.notifications ? 'GRANTED' : 'DENIED',
      systemAction: 'Manifest.permission.POST_NOTIFICATIONS',
      critical: false
    },
    {
      key: 'camera' as const,
      name: 'Camera (Self-Mirror)',
      description: 'Only required for Mirror Intervention. Camera feed is never stored.',
      icon: Camera,
      status: device.permissions.camera ? 'GRANTED' : 'NOT_REQUESTED',
      systemAction: 'Manifest.permission.CAMERA',
      critical: false
    },
    {
      key: 'sensors' as const,
      name: 'Hardware Sensors & Gyroscope',
      description: 'Detects phone rotation gesture for physical tactile interventions.',
      icon: Compass,
      status: device.permissions.sensors ? 'GRANTED' : 'NOT_REQUESTED',
      systemAction: 'SensorManager.getDefaultSensor(TYPE_ROTATION_VECTOR)',
      critical: false
    }
  ];

  const handleToggle = (key: keyof typeof device.permissions, currentVal: boolean) => {
    setTestingKey(key);
    setTimeout(() => {
      updatePermission(key, !currentVal);
      setTestingKey(null);
    }, 500);
  };

  const handleTestBiometric = async () => {
    setTestingKey('biometric');
    await verifyBiometric('Settings Protection Verification');
    setTestingKey(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Overview Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-5 h-5 text-emerald-500" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Android Permission Engine
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Centralized PermissionManager monitoring actual system capabilities on {device.deviceName}.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              Device: {device.deviceName}
            </span>
          </div>
        </div>
      </div>

      {/* Permission Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {permissionsList.map(perm => {
          const Icon = perm.icon;
          const isGranted = perm.status === 'GRANTED';
          const isTesting = testingKey === perm.key;

          return (
            <div
              key={perm.key}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      isGranted 
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>{perm.name}</span>
                        {perm.critical && (
                          <span className="text-[9px] font-semibold text-rose-500 bg-rose-50 dark:bg-rose-950/60 px-1.5 py-0.2 rounded">
                            Required
                          </span>
                        )}
                      </h4>
                      <span className="text-[10px] font-mono text-slate-400">
                        {perm.systemAction}
                      </span>
                    </div>
                  </div>

                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                    isGranted
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                      : perm.status === 'RESTRICTED'
                        ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}>
                    {perm.status}
                  </span>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 mb-4 leading-relaxed">
                  {perm.description}
                </p>
              </div>

              {/* Action Button */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Status: <strong className={isGranted ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}>{isGranted ? 'Enabled' : 'Disabled'}</strong>
                </span>

                <div className="flex gap-2">
                  {perm.key === 'biometric' && isGranted && (
                    <button
                      onClick={handleTestBiometric}
                      disabled={isTesting}
                      className="px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                    >
                      {isTesting ? 'Authenticating...' : 'Test BiometricPrompt'}
                    </button>
                  )}

                  <button
                    onClick={() => handleToggle(perm.key, isGranted)}
                    disabled={isTesting}
                    className="px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    {isTesting ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <span>{isGranted ? 'Revoke / Recheck' : 'Grant Permission'}</span>
                    )}
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
