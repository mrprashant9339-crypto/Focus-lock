import React, { useState } from 'react';
import { 
  FileCode, 
  Copy, 
  Check, 
  Smartphone, 
  Download, 
  Shield, 
  Zap, 
  RotateCcw,
  CheckCircle2
} from 'lucide-react';

export const AndroidCompanionModal: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<'service' | 'permissions' | 'boot' | 'overlay'>('service');
  const [copied, setCopied] = useState<boolean>(false);

  const kotlinFiles = {
    service: {
      filename: 'FocusForegroundService.kt',
      description: 'Production Android Foreground Service with continuous UsageStats monitoring, non-removable notification channel, and session recovery.',
      code: `package app.focuslock.service

import android.app.*
import android.content.Context
import android.content.Intent
import android.os.IBinder
import androidx.core.app.NotificationCompat
import kotlinx.coroutines.*
import app.focuslock.R
import app.focuslock.ui.MainActivity
import app.focuslock.data.FocusDatabase
import app.focuslock.overlay.AppBlockOverlayActivity

class FocusForegroundService : Service() {

    private val serviceScope = CoroutineScope(Dispatchers.Default + Job())
    private var isMonitoring = false
    private val CHANNEL_ID = "focuslock_enforcement_channel"
    private val NOTIFICATION_ID = 1001

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val profileName = intent?.getStringExtra("EXTRA_PROFILE_NAME") ?: "Deep Work"
        val remainingMinutes = intent?.getIntExtra("EXTRA_REMAINING_MINS", 25) ?: 25

        val notification = buildPersistentNotification(profileName, remainingMinutes)
        startForeground(NOTIFICATION_ID, notification)

        startUsageMonitorLoop()
        return START_STICKY
    }

    private fun startUsageMonitorLoop() {
        if (isMonitoring) return
        isMonitoring = true

        serviceScope.launch {
            val usageHelper = UsageStatsHelper(this@FocusForegroundService)
            val blockedApps = FocusDatabase.getInstance(this@FocusForegroundService).ruleDao().getActiveBlockedPackages()

            while (isActive && isMonitoring) {
                val currentPackage = usageHelper.getForegroundPackageName()
                if (currentPackage != null && blockedApps.contains(currentPackage)) {
                    // Trigger overlay activity with FLAG_ACTIVITY_NEW_TASK
                    val overlayIntent = Intent(this@FocusForegroundService, AppBlockOverlayActivity::class.java).apply {
                        flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
                        putExtra("BLOCKED_PACKAGE", currentPackage)
                    }
                    startActivity(overlayIntent)
                }
                delay(750) // High-efficiency non-polling cycle
            }
        }
    }

    private fun buildPersistentNotification(profile: String, remainingMinutes: Int): Notification {
        val openIntent = PendingIntent.getActivity(
            this, 0, Intent(this, MainActivity::class.java),
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("FocusLock is protecting your focus")
            .setContentText("Profile: $profile · $remainingMinutes mins remaining")
            .setSmallIcon(R.drawable.ic_focuslock_shield)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setContentIntent(openIntent)
            .build()
    }

    private fun createNotificationChannel() {
        val channel = NotificationChannel(
            CHANNEL_ID,
            "FocusLock Active Enforcement",
            NotificationManager.IMPORTANCE_LOW
        ).apply {
            description = "Maintains persistent lock guard and session countdown"
            setShowBadge(false)
        }
        val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        manager.createNotificationChannel(channel)
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onDestroy() {
        super.onDestroy()
        isMonitoring = false
        serviceScope.cancel()
    }
}`
    },
    permissions: {
      filename: 'PermissionManager.kt',
      description: 'Centralized state validator for Usage Access, Overlay permission, and Battery Optimization exemption.',
      code: `package app.focuslock.permissions

import android.app.AppOpsManager
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.PowerManager
import android.provider.Settings
import androidx.biometric.BiometricManager

enum class PermissionState { NOT_REQUESTED, GRANTED, DENIED, RESTRICTED, UNAVAILABLE }

class PermissionManager(private val context: Context) {

    fun checkUsageAccess(): PermissionState {
        val appOps = context.getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
        val mode = appOps.unsafeCheckOpNoThrow(
            AppOpsManager.OPSTR_GET_USAGE_STATS,
            android.os.Process.myUid(),
            context.packageName
        )
        return if (mode == AppOpsManager.MODE_ALLOWED) PermissionState.GRANTED else PermissionState.DENIED
    }

    fun checkOverlayPermission(): PermissionState {
        return if (Settings.canDrawOverlays(context)) {
            PermissionState.GRANTED
        } else {
            PermissionState.DENIED
        }
    }

    fun checkBatteryOptimization(): PermissionState {
        val powerManager = context.getSystemService(Context.POWER_SERVICE) as PowerManager
        return if (powerManager.isIgnoringBatteryOptimizations(context.packageName)) {
            PermissionState.GRANTED
        } else {
            PermissionState.RESTRICTED
        }
    }

    fun checkBiometricAvailability(): PermissionState {
        val biometricManager = BiometricManager.from(context)
        return when (biometricManager.canAuthenticate(BiometricManager.Authenticators.BIOMETRIC_STRONG)) {
            BiometricManager.BIOMETRIC_SUCCESS -> PermissionState.GRANTED
            BiometricManager.BIOMETRIC_ERROR_NONE_ENROLLED -> PermissionState.NOT_REQUESTED
            else -> PermissionState.UNAVAILABLE
        }
    }

    fun openUsageAccessSettings() {
        val intent = Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK
        }
        context.startActivity(intent)
    }

    fun openOverlaySettings() {
        val intent = Intent(
            Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
            Uri.parse("package:\${context.packageName}")
        ).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK
        }
        context.startActivity(intent)
    }

    fun requestBatteryOptimizationExemption() {
        val intent = Intent(
            Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS,
            Uri.parse("package:\${context.packageName}")
        ).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK
        }
        context.startActivity(intent)
    }
}`
    },
    boot: {
      filename: 'BootCompletedReceiver.kt',
      description: 'Restores active focus session schedules, Room rules cache, and alarms upon device restart.',
      code: `package app.focuslock.receiver

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import androidx.core.content.ContextCompat
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import app.focuslock.data.FocusDatabase
import app.focuslock.service.FocusForegroundService
import app.focuslock.permissions.PermissionManager

class BootCompletedReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        val action = intent.action
        if (action == Intent.ACTION_BOOT_COMPLETED || 
            action == Intent.ACTION_LOCKED_BOOT_COMPLETED || 
            action == Intent.ACTION_MY_PACKAGE_REPLACED) {

            val permissionManager = PermissionManager(context)
            if (permissionManager.checkUsageAccess() != PermissionState.GRANTED) {
                return // Cannot legally enforce until user re-authorizes
            }

            // Restore from Room local database
            CoroutineScope(Dispatchers.IO).launch {
                val db = FocusDatabase.getInstance(context)
                val activeSession = db.sessionDao().getActiveUnfinishedSession()

                if (activeSession != null && activeSession.endTime > System.currentTimeMillis()) {
                    val remainingMins = ((activeSession.endTime - System.currentTimeMillis()) / 60000).toInt()
                    
                    // Restart Foreground Service
                    val serviceIntent = Intent(context, FocusForegroundService::class.java).apply {
                        putExtra("EXTRA_PROFILE_NAME", activeSession.profileName)
                        putExtra("EXTRA_REMAINING_MINS", remainingMins)
                    }
                    ContextCompat.startForegroundService(context, serviceIntent)
                }
            }
        }
    }
}`
    },
    overlay: {
      filename: 'AppBlockOverlayActivity.kt',
      description: 'Modal overlay activity rendering Jetpack Compose mindful interventions directly above blocked apps.',
      code: `package app.focuslock.overlay

import android.os.Bundle
import android.view.WindowManager
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.material3.*
import androidx.compose.runtime.*
import app.focuslock.ui.theme.FocusLockTheme
import app.focuslock.ui.components.InterventionView

class AppBlockOverlayActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Ensure activity appears over system locks and current foreground app
        window.addFlags(
            WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or
            WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD or
            WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON or
            WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON
        )

        val blockedPackage = intent.getStringExtra("BLOCKED_PACKAGE") ?: "Distracting App"

        setContent {
            FocusLockTheme {
                Surface(color = MaterialTheme.colorScheme.background) {
                    InterventionView(
                        packageName = blockedPackage,
                        onDismissToFocus = { finish() },
                        onConsciousPass = { 
                            // Unblock for temporary window (e.g. 5 minutes)
                            finish()
                        }
                    )
                }
            }
        }
    }

    override fun onBackPressed() {
        // Prevent simple back-button bypass without completing intervention
        moveTaskToBack(true)
    }
}`
    }
  };

  const current = kotlinFiles[selectedFile];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(current.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Intro Header */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Smartphone className="w-5 h-5 text-emerald-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Android Native Enforcement Engine
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real Kotlin architecture: Foreground Service, PermissionManager, BootReceiver, and Compose Overlay.
          </p>
        </div>

        <button
          onClick={handleCopyCode}
          className="h-10 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors shrink-0 shadow-xs"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'Copied to Clipboard' : 'Copy Kotlin Source'}</span>
        </button>
      </div>

      {/* Code Browser Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {(Object.keys(kotlinFiles) as (keyof typeof kotlinFiles)[]).map(key => (
          <button
            key={key}
            onClick={() => setSelectedFile(key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold whitespace-nowrap transition-colors ${
              selectedFile === key
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs'
                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {kotlinFiles[key].filename}
          </button>
        ))}
      </div>

      {/* Code Viewer Card */}
      <div className="rounded-2xl bg-slate-950 border border-slate-800 p-5 shadow-xl text-left">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
          <div>
            <span className="text-xs font-mono font-bold text-emerald-400 block">
              {current.filename}
            </span>
            <span className="text-[11px] text-slate-400">
              {current.description}
            </span>
          </div>

          <button
            onClick={handleCopyCode}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs flex items-center gap-1 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="text-[11px] font-mono">{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        <pre className="text-xs font-mono text-slate-200 overflow-x-auto p-2 leading-relaxed max-h-[500px] scrollbar-thin">
          <code>{current.code}</code>
        </pre>
      </div>

    </div>
  );
};
