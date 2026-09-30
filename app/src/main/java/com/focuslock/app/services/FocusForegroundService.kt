package com.focuslock.app.services

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

        const val EXTRA_DURATION_MINUTES = "EXTRA_DURATION_MINUTES"
        const val EXTRA_PROFILE_NAME = "EXTRA_PROFILE_NAME"
        const val EXTRA_GOAL = "EXTRA_GOAL"

        private val _currentSessionState = MutableStateFlow<FocusSession?>(null)
        val currentSessionState: StateFlow<FocusSession?> = _currentSessionState.asStateFlow()

        fun startSession(context: Context, durationMinutes: Int, profileName: String, goal: String) {
            val intent = Intent(context, FocusForegroundService::class.java).apply {
                action = ACTION_START
                putExtra(EXTRA_DURATION_MINUTES, durationMinutes)
                putExtra(EXTRA_PROFILE_NAME, profileName)
                putExtra(EXTRA_GOAL, goal)
            }
            ContextCompat.startForegroundService(context, intent)
        }

        fun pauseSession(context: Context) {
            val intent = Intent(context, FocusForegroundService::class.java).apply {
                action = ACTION_PAUSE
            }
            context.startService(intent)
        }

        fun resumeSession(context: Context) {
            val intent = Intent(context, FocusForegroundService::class.java).apply {
                action = ACTION_RESUME
            }
            context.startService(intent)
        }

        fun stopSession(context: Context) {
            val intent = Intent(context, FocusForegroundService::class.java).apply {
                action = ACTION_STOP
            }
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

        // Acquire WakeLock to keep clock accurate when screen locks
        val powerManager = getSystemService(Context.POWER_SERVICE) as PowerManager
        wakeLock = powerManager.newWakeLock(
            PowerManager.PARTIAL_WAKE_LOCK,
            "FocusLock:TimerWakeLock"
        ).apply {
            setReferenceCounted(false)
        }

        // Start App Blocking monitor companion
        val monitorIntent = Intent(this, AppBlockMonitorService::class.java)
        startService(monitorIntent)
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_START -> {
                val durationMinutes = intent.getIntExtra(EXTRA_DURATION_MINUTES, 25)
                val profileName = intent.getStringExtra(EXTRA_PROFILE_NAME) ?: "Deep Work"
                val goal = intent.getStringExtra(EXTRA_GOAL) ?: "Conscious discipline sprint"
                initiateNewSession(durationMinutes, profileName, goal)
            }
            ACTION_PAUSE -> handlePause()
            ACTION_RESUME -> handleResume()
            ACTION_STOP -> handleStop(completed = false)
            else -> recoverActiveSessionIfAny()
        }
        return START_STICKY
    }

    private fun initiateNewSession(durationMinutes: Int, profileName: String, goal: String) {
        val plannedSecs = durationMinutes * 60
        val session = FocusSession(
            profileId = profileName.lowercase().replace(" ", "_"),
            profileName = profileName,
            startTimestamp = System.currentTimeMillis(),
            plannedDurationSeconds = plannedSecs,
            elapsedSeconds = 0,
            state = SessionState.RUNNING,
            goal = goal
        )

        sessionStartTimeMs = session.startTimestamp
        baseElapsedSeconds = 0
        lastMonotonicStartMs = SystemClock.elapsedRealtime()

        _currentSessionState.value = session

        // Post foreground notification immediately
        startForeground(
            FocusNotificationManager.NOTIFICATION_TIMER_ID,
            notificationManager.buildTimerNotification(session)
        )

        wakeLock?.acquire(plannedSecs * 1000L + 60000L) // Release safety timeout

        serviceScope.launch {
            val id = sessionRepository.saveActiveSession(session)
            _currentSessionState.value = session.copy(id = id)
        }

        startTimerPulse()
    }

    private fun startTimerPulse() {
        timerJob?.cancel()
        timerJob = serviceScope.launch {
            while (isActive) {
                delay(1000)
                val current = _currentSessionState.value ?: break
                if (current.state != SessionState.RUNNING) continue

                // Compute exact elapsed time using monotonic elapsedRealtime to prevent drift
                val monotonicDeltaSeconds = ((SystemClock.elapsedRealtime() - lastMonotonicStartMs) / 1000).toInt()
                val totalElapsed = (baseElapsedSeconds + monotonicDeltaSeconds).coerceAtMost(current.plannedDurationSeconds)

                val updated = current.copy(elapsedSeconds = totalElapsed)
                _currentSessionState.value = updated

                // Update notification
                notificationManager.buildTimerNotification(updated).let {
                    val nm = getSystemService(Context.NOTIFICATION_SERVICE) as android.app.NotificationManager
                    nm.notify(FocusNotificationManager.NOTIFICATION_TIMER_ID, it)
                }

                // Check completion
                if (totalElapsed >= current.plannedDurationSeconds) {
                    handleSessionComplete(updated)
                    break
                }
            }
        }
    }

    private fun handlePause() {
        val current = _currentSessionState.value ?: return
        if (current.state == SessionState.RUNNING) {
            val monotonicDelta = ((SystemClock.elapsedRealtime() - lastMonotonicStartMs) / 1000).toInt()
            baseElapsedSeconds += monotonicDelta

            val paused = current.copy(
                elapsedSeconds = baseElapsedSeconds,
                state = SessionState.PAUSED
            )
            _currentSessionState.value = paused

            serviceScope.launch {
                sessionRepository.updateSession(paused)
            }

            notificationManager.buildTimerNotification(paused).let {
                val nm = getSystemService(Context.NOTIFICATION_SERVICE) as android.app.NotificationManager
                nm.notify(FocusNotificationManager.NOTIFICATION_TIMER_ID, it)
            }
        }
    }

    private fun handleResume() {
        val current = _currentSessionState.value ?: return
        if (current.state == SessionState.PAUSED) {
            lastMonotonicStartMs = SystemClock.elapsedRealtime()
            val resumed = current.copy(state = SessionState.RUNNING)
            _currentSessionState.value = resumed

            serviceScope.launch {
                sessionRepository.updateSession(resumed)
            }

            notificationManager.buildTimerNotification(resumed).let {
                val nm = getSystemService(Context.NOTIFICATION_SERVICE) as android.app.NotificationManager
                nm.notify(FocusNotificationManager.NOTIFICATION_TIMER_ID, it)
            }
            startTimerPulse()
        }
    }

    private fun handleSessionComplete(session: FocusSession) {
        timerJob?.cancel()
        serviceScope.launch {
            stopUseCase(completed = true)
            notificationManager.showCompletionNotification(session)
            _currentSessionState.value = null
            stopForeground(STOP_FOREGROUND_REMOVE)
            stopSelf()
        }
    }

    private fun handleStop(completed: Boolean) {
        timerJob?.cancel()
        serviceScope.launch {
            stopUseCase(completed = completed)
            _currentSessionState.value = null
            stopForeground(STOP_FOREGROUND_REMOVE)
            stopSelf()
        }
    }

    private fun recoverActiveSessionIfAny() {
        serviceScope.launch {
            val session = sessionRepository.getActiveSession()
            if (session != null && (session.state == SessionState.RUNNING || session.state == SessionState.PAUSED)) {
                _currentSessionState.value = session
                baseElapsedSeconds = session.elapsedSeconds
                lastMonotonicStartMs = SystemClock.elapsedRealtime()

                startForeground(
                    FocusNotificationManager.NOTIFICATION_TIMER_ID,
                    notificationManager.buildTimerNotification(session)
                )

                if (session.state == SessionState.RUNNING) {
                    startTimerPulse()
                }
            } else {
                stopSelf()
            }
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        timerJob?.cancel()
        serviceScope.cancel()
        if (wakeLock?.isHeld == true) {
            wakeLock?.release()
        }
    }

    override fun onBind(intent: Intent?): IBinder? = null
}
