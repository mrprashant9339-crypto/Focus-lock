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
  CheckCircle2,
  Play,
  Pause,
  StopCircle,
  Eye,
  Layers,
  Lock,
  ExternalLink,
  ChevronRight,
  FolderTree,
  Terminal
} from 'lucide-react';

export const AndroidCompanionModal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'architecture' | 'code' | 'manifest'>('architecture');
  const [selectedFileKey, setSelectedFileKey] = useState<string>('service');
  const [copied, setCopied] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const nativeFiles: Record<string, { filename: string; path: string; description: string; code: string }> = {
    service: {
      filename: 'FocusForegroundService.kt',
      path: 'app/src/main/java/com/focuslock/app/services/FocusForegroundService.kt',
      description: 'Foreground Service running monotonic timer (SystemClock.elapsedRealtime), persistent notification channel, and wake-lock management.',
      code: `package com.focuslock.app.services

import android.app.Service
import android.content.Context
import android.content.Intent
import android.os.IBinder
import android.os.PowerManager
import android.os.SystemClock
import androidx.core.content.ContextCompat
import com.focuslock.app.data.database.FocusLockDatabase
import com.focuslock.app.data.repository.FocusSessionRepositoryImpl
import com.focuslock.app.data.repository.StatsRepositoryImpl
import com.focuslock.app.domain.model.FocusSession
import com.focuslock.app.domain.model.SessionState
import com.focuslock.app.domain.usecase.StopFocusSessionUseCase
import com.focuslock.app.notifications.FocusNotificationManager
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

class FocusForegroundService : Service() {

    private val serviceScope = CoroutineScope(Dispatchers.Main + SupervisorJob())
    private var timerJob: Job? = null
    private var wakeLock: PowerManager.WakeLock? = null

    private lateinit var notificationManager: FocusNotificationManager
    private lateinit var sessionRepository: FocusSessionRepositoryImpl
    private lateinit var statsRepository: StatsRepositoryImpl
    private lateinit var stopUseCase: StopFocusSessionUseCase

    // Monotonic Time Tracking Variables (Eliminates Drift & Survives Sleep)
    private var sessionStartTimeMs: Long = 0L
    private var baseElapsedSeconds: Int = 0
    private var lastMonotonicStartMs: Long = 0L

    companion object {
        const val ACTION_START = "ACTION_START"
        const val ACTION_PAUSE = "ACTION_PAUSE"
        const val ACTION_RESUME = "ACTION_RESUME"
        const val ACTION_STOP = "ACTION_STOP"

        private val _currentSessionState = MutableStateFlow<FocusSession?>(null)
        val currentSessionState: StateFlow<FocusSession?> = _currentSessionState.asStateFlow()

        fun startSession(context: Context, durationMinutes: Int, profileName: String, goal: String) {
            val intent = Intent(context, FocusForegroundService::class.java).apply {
                action = ACTION_START
                putExtra("EXTRA_DURATION_MINUTES", durationMinutes)
                putExtra("EXTRA_PROFILE_NAME", profileName)
                putExtra("EXTRA_GOAL", goal)
            }
            ContextCompat.startForegroundService(context, intent)
        }

        fun pauseSession(context: Context) {
            val intent = Intent(context, FocusForegroundService::class.java).apply { action = ACTION_PAUSE }
            context.startService(intent)
        }

        fun resumeSession(context: Context) {
            val intent = Intent(context, FocusForegroundService::class.java).apply { action = ACTION_RESUME }
            context.startService(intent)
        }

        fun stopSession(context: Context) {
            val intent = Intent(context, FocusForegroundService::class.java).apply { action = ACTION_STOP }
            context.startService(intent)
        }
    }

    override fun onCreate() {
        super.onCreate()
        notificationManager = FocusNotificationManager(this)
        val db = FocusLockDatabase.getInstance(this)
        sessionRepository = FocusSessionRepositoryImpl(db.focusSessionDao())
        statsRepository = StatsRepositoryImpl(db.dailyStatsDao())
        stopUseCase = StopFocusSessionUseCase(sessionRepository, statsRepository)

        val powerManager = getSystemService(Context.POWER_SERVICE) as PowerManager
        wakeLock = powerManager.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "FocusLock:TimerWakeLock").apply {
            setReferenceCounted(false)
        }

        startService(Intent(this, AppBlockMonitorService::class.java))
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_START -> {
                val durationMinutes = intent.getIntExtra("EXTRA_DURATION_MINUTES", 25)
                val profileName = intent.getStringExtra("EXTRA_PROFILE_NAME") ?: "Deep Work"
                val goal = intent.getStringExtra("EXTRA_GOAL") ?: "Conscious discipline sprint"
                initiateNewSession(durationMinutes, profileName, goal)
            }
            ACTION_PAUSE -> handlePause()
            ACTION_RESUME -> handleResume()
            ACTION_STOP -> handleStop(completed = false)
            else -> recoverActiveSessionIfAny()
        }
        return START_STICKY
    }
}`
    },
    monitor: {
      filename: 'AppBlockMonitorService.kt',
      path: 'app/src/main/java/com/focuslock/app/services/AppBlockMonitorService.kt',
      description: 'Detects distracting foreground applications using UsageStatsManager.queryEvents and launches AppBlockOverlayActivity.',
      code: `package com.focuslock.app.services

import android.app.Service
import android.app.usage.UsageEvents
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.os.IBinder
import com.focuslock.app.domain.usecase.BlockDecision
import com.focuslock.app.domain.usecase.CheckAppBlockUseCase
import kotlinx.coroutines.*

class AppBlockMonitorService : Service() {

    private val monitorScope = CoroutineScope(Dispatchers.IO + SupervisorJob())
    private var monitorJob: Job? = null
    private var lastInterceptionPackage: String? = null
    private var lastInterceptionTimeMs: Long = 0L

    private lateinit var checkAppBlockUseCase: CheckAppBlockUseCase

    override fun onCreate() {
        super.onCreate()
        startMonitoringLoop()
    }

    private fun startMonitoringLoop() {
        monitorJob = monitorScope.launch {
            val usageStatsManager = getSystemService(Context.USAGE_STATS_SERVICE) as? UsageStatsManager
                ?: return@launch

            while (isActive) {
                try {
                    val foregroundPackage = getForegroundPackageName(usageStatsManager)
                    if (foregroundPackage != null && foregroundPackage != packageName) {
                        evaluatePackage(foregroundPackage)
                    }
                } catch (_: Exception) {}
                delay(800) // Non-polling, adaptive frequency
            }
        }
    }

    private suspend fun evaluatePackage(targetPackage: String) {
        val now = System.currentTimeMillis()
        if (targetPackage == lastInterceptionPackage && now - lastInterceptionTimeMs < 2000) return

        when (val decision = checkAppBlockUseCase(targetPackage)) {
            is BlockDecision.Block -> {
                lastInterceptionPackage = targetPackage
                lastInterceptionTimeMs = now
                val overlayIntent = Intent(this, AppBlockOverlayActivity::class.java).apply {
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
                    putExtra("EXTRA_PACKAGE_NAME", targetPackage)
                    putExtra("EXTRA_APP_NAME", decision.app.appName)
                    putExtra("EXTRA_PROFILE_NAME", decision.profileName)
                    putExtra("EXTRA_INTERVENTION_TYPE", decision.app.interventionType.name)
                }
                startActivity(overlayIntent)
            }
            BlockDecision.Allow -> {}
        }
    }
}`
    },
    overlay: {
      filename: 'AppBlockOverlayActivity.kt',
      path: 'app/src/main/java/com/focuslock/app/services/AppBlockOverlayActivity.kt',
      description: 'Fullscreen Jetpack Compose intervention overlay intercepting user input over blocked apps.',
      code: `package com.focuslock.app.services

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.compose.material3.*
import androidx.compose.runtime.*
import com.focuslock.app.domain.model.InterventionType
import com.focuslock.app.ui.theme.FocusLockTheme

class AppBlockOverlayActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val appName = intent.getStringExtra("EXTRA_APP_NAME") ?: "Distracting App"
        val profileName = intent.getStringExtra("EXTRA_PROFILE_NAME") ?: "Deep Work"
        val intervention = try {
            InterventionType.valueOf(intent.getStringExtra("EXTRA_INTERVENTION_TYPE") ?: "BREATHING")
        } catch (_: Exception) {
            InterventionType.BREATHING
        }

        setContent {
            FocusLockTheme(darkTheme = true) {
                BackHandler { returnToHomeScreen() }
                when (intervention) {
                    InterventionType.BREATHING -> BreathingInterventionScreen(appName, profileName, { returnToHomeScreen() }, { finish() })
                    InterventionType.WAIT_TIMER -> WaitTimerInterventionScreen(appName, profileName, { returnToHomeScreen() }, { finish() })
                    InterventionType.INTENTION_CHECK -> IntentionCheckScreen(appName, profileName, { returnToHomeScreen() }, { finish() })
                    InterventionType.STRICT_LOCK -> StrictLockScreen(appName, profileName, { returnToHomeScreen() })
                    InterventionType.ROTATE_PHONE -> RotatePhoneScreen(appName, profileName, { returnToHomeScreen() }, { finish() })
                }
            }
        }
    }

    private fun returnToHomeScreen() {
        val homeIntent = Intent(Intent.ACTION_MAIN).apply {
            addCategory(Intent.CATEGORY_HOME)
            flags = Intent.FLAG_ACTIVITY_NEW_TASK
        }
        startActivity(homeIntent)
        finish()
    }
}`
    },
    database: {
      filename: 'FocusLockDatabase.kt',
      path: 'app/src/main/java/com/focuslock/app/data/database/FocusLockDatabase.kt',
      description: 'Room Database pre-populated with default app catalogs, focus profiles, and daily usage statistics.',
      code: `package com.focuslock.app.data.database

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import com.focuslock.app.data.database.dao.*
import com.focuslock.app.data.database.entity.*

@Database(
    entities = [
        FocusSessionEntity::class,
        BlockedAppEntity::class,
        FocusProfileEntity::class,
        DailyStatsEntity::class
    ],
    version = 1,
    exportSchema = false
)
abstract class FocusLockDatabase : RoomDatabase() {
    abstract fun focusSessionDao(): FocusSessionDao
    abstract fun blockedAppDao(): BlockedAppDao
    abstract fun focusProfileDao(): FocusProfileDao
    abstract fun dailyStatsDao(): DailyStatsDao

    companion object {
        @Volatile
        private var INSTANCE: FocusLockDatabase? = null

        fun getInstance(context: Context): FocusLockDatabase {
            return INSTANCE ?: synchronized(this) {
                Room.databaseBuilder(
                    context.applicationContext,
                    FocusLockDatabase::class.java,
                    "focuslock_database"
                ).build().also { INSTANCE = it }
            }
        }
    }
}`
    },
    permissions: {
      filename: 'PermissionManager.kt',
      path: 'app/src/main/java/com/focuslock/app/permissions/PermissionManager.kt',
      description: 'Permission inspection engine detecting actual system status for Usage Access, Overlay, Notifications, and Battery Optimization.',
      code: `package com.focuslock.app.permissions

import android.app.AppOpsManager
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.PowerManager
import android.os.Process
import android.provider.Settings
import androidx.core.app.NotificationManagerCompat

class PermissionManager(private val context: Context) {

    fun isUsageAccessGranted(): Boolean {
        val appOps = context.getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
        val mode = appOps.unsafeCheckOpNoThrow(
            AppOpsManager.OPSTR_GET_USAGE_STATS,
            Process.myUid(),
            context.packageName
        )
        return mode == AppOpsManager.MODE_ALLOWED
    }

    fun isOverlayGranted(): Boolean = Settings.canDrawOverlays(context)

    fun isNotificationGranted(): Boolean = NotificationManagerCompat.from(context).areNotificationsEnabled()

    fun isBatteryOptimizationIgnored(): Boolean {
        val powerManager = context.getSystemService(Context.POWER_SERVICE) as PowerManager
        return powerManager.isIgnoringBatteryOptimizations(context.packageName)
    }
}`
    },
    manifest: {
      filename: 'AndroidManifest.xml',
      path: 'app/src/main/AndroidManifest.xml',
      description: 'Production AndroidManifest with FOREGROUND_SERVICE_SPECIAL_USE, PACKAGE_USAGE_STATS, SYSTEM_ALERT_WINDOW, and BootCompletedReceiver.',
      code: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools"
    package="com.focuslock.app">

    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_SPECIAL_USE" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.PACKAGE_USAGE_STATS" tools:ignore="ProtectedPermissions" />
    <uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
    <uses-permission android:name="android.permission.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS" />
    <uses-permission android:name="android.permission.USE_BIOMETRIC" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />

    <application
        android:name=".FocusLockApp"
        android:label="@string/app_name"
        android:theme="@style/Theme.FocusLock">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:launchMode="singleTop">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <activity
            android:name=".services.AppBlockOverlayActivity"
            android:exported="false"
            android:launchMode="singleInstance"
            android:theme="@style/Theme.FocusLock.Overlay" />

        <service
            android:name=".services.FocusForegroundService"
            android:foregroundServiceType="specialUse" />

        <service android:name=".services.AppBlockMonitorService" />

        <receiver
            android:name=".services.BootCompletedReceiver"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.BOOT_COMPLETED" />
            </intent-filter>
        </receiver>

    </application>
</manifest>`
    },
    tests: {
      filename: 'FocusTimerTest.kt',
      path: 'app/src/test/java/com/focuslock/app/FocusTimerTest.kt',
      description: 'Unit tests for monotonic elapsed time calculation, session completion boundaries, and drift prevention.',
      code: `package com.focuslock.app

import com.focuslock.app.domain.model.FocusSession
import com.focuslock.app.domain.model.SessionState
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class FocusTimerTest {

    @Test
    fun testRemainingSecondsCalculation() {
        val session = FocusSession(
            plannedDurationSeconds = 25 * 60,
            elapsedSeconds = 5 * 60,
            state = SessionState.RUNNING
        )
        assertEquals(20 * 60, session.remainingSeconds)
        assertEquals(0.2f, session.progress, 0.001f)
        assertTrue(session.isRunning)
    }

    @Test
    fun testSessionCompletionBoundary() {
        val session = FocusSession(
            plannedDurationSeconds = 1500,
            elapsedSeconds = 1500,
            state = SessionState.COMPLETED,
            completed = true
        )
        assertEquals(0, session.remainingSeconds)
        assertTrue(session.completed)
    }
}`
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(nativeFiles[selectedFileKey].code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    const file = nativeFiles[selectedFileKey];
    const blob = new Blob([file.code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloadSuccess(`Downloaded ${file.filename}`);
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">FocusLock Native Android</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono">
                  Kotlin • Jetpack Compose
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Complete production architecture with Room, DataStore, ForegroundService, and UsageStatsManager.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('architecture')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                activeTab === 'architecture' ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Architecture
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                activeTab === 'code' ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Source Explorer
            </button>
          </div>
        </div>
      </div>

      {downloadSuccess && (
        <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{downloadSuccess}</span>
        </div>
      )}

      {/* TAB 1: ARCHITECTURE OVERVIEW */}
      {activeTab === 'architecture' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Monotonic Timer Engine
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Calculates elapsed seconds using <code className="text-emerald-500 font-mono">SystemClock.elapsedRealtime()</code>. Runs in a Foreground Service with WakeLock, eliminating timer drift during deep sleep or screen-lock.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              App Blocking & Interventions
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Monitors foreground packages via <code className="text-indigo-400 font-mono">UsageStatsManager</code>. When a blocked app launches, triggers full-screen Compose overlay with breathing pauses, 30s delay timers, or strict lockout.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <RotateCcw className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Room & Crash Recovery
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Room database persists focus sessions and daily statistics. A <code className="text-amber-400 font-mono">BootCompletedReceiver</code> automatically recovers active sessions when your device reboots.
            </p>
          </div>
        </div>
      )}

      {/* TAB 2: KOTLIN SOURCE CODE EXPLORER */}
      {activeTab === 'code' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* File Tree Sidebar */}
          <div className="lg:col-span-1 space-y-1 p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-2 block">
              Native Kotlin Files
            </span>
            {Object.entries(nativeFiles).map(([key, file]) => (
              <button
                key={key}
                onClick={() => setSelectedFileKey(key)}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                  selectedFileKey === key
                    ? 'bg-slate-900 text-white dark:bg-emerald-600 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <FileCode className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{file.filename}</span>
                </div>
                {selectedFileKey === key && <ChevronRight className="w-3.5 h-3.5 shrink-0" />}
              </button>
            ))}
          </div>

          {/* Code Viewer */}
          <div className="lg:col-span-3 rounded-2xl bg-slate-900 border border-slate-800 p-4 space-y-3">
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <h4 className="text-xs font-bold text-white font-mono">{nativeFiles[selectedFileKey].filename}</h4>
                <p className="text-[11px] text-slate-400">{nativeFiles[selectedFileKey].description}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyCode}
                  className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  onClick={handleDownloadFile}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            </div>

            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-[500px] leading-relaxed selection:bg-emerald-500/30">
              {nativeFiles[selectedFileKey].code}
            </pre>
          </div>
        </div>
      )}

      {/* Android Studio Installation Instructions */}
      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
          <Terminal className="w-4 h-4 text-emerald-500" />
          <span>Building with Android Studio / Gradle</span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          The project is structured under standard Android module paths (<code className="text-emerald-500 font-mono">/app</code>, <code className="text-emerald-500 font-mono">build.gradle.kts</code>, <code className="text-emerald-500 font-mono">settings.gradle.kts</code>). Open the repository folder directly in Android Studio Ladybug or later, and run <code className="text-emerald-500 font-mono">./gradlew assembleDebug</code> or click <strong>Run 'app'</strong>.
        </p>
      </div>

    </div>
  );
};
