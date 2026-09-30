package com.focuslock.app.services

import android.app.Service
import android.app.usage.UsageEvents
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.os.IBinder
import com.focuslock.app.data.database.FocusLockDatabase
import com.focuslock.app.data.datastore.FocusLockDataStore
import com.focuslock.app.data.repository.BlockedAppRepositoryImpl
import com.focuslock.app.data.repository.FocusProfileRepositoryImpl
import com.focuslock.app.data.repository.FocusSessionRepositoryImpl
import com.focuslock.app.data.repository.StatsRepositoryImpl
import com.focuslock.app.domain.usecase.BlockDecision
import com.focuslock.app.domain.usecase.CheckAppBlockUseCase
import kotlinx.coroutines.*

class AppBlockMonitorService : Service() {

    private val monitorScope = CoroutineScope(Dispatchers.IO + SupervisorJob())
    private var monitorJob: Job? = null
    private var lastInterceptionPackage: String? = null
    private var lastInterceptionTimeMs: Long = 0L

    private lateinit var checkAppBlockUseCase: CheckAppBlockUseCase
    private lateinit var statsRepository: StatsRepositoryImpl

    override fun onCreate() {
        super.onCreate()
        val db = FocusLockDatabase.getInstance(this)
        val dataStore = FocusLockDataStore(this)
        val sessionRepo = FocusSessionRepositoryImpl(db.focusSessionDao())
        val profileRepo = FocusProfileRepositoryImpl(db.focusProfileDao(), dataStore)
        val appRepo = BlockedAppRepositoryImpl(db.blockedAppDao())
        statsRepository = StatsRepositoryImpl(db.dailyStatsDao())
        checkAppBlockUseCase = CheckAppBlockUseCase(sessionRepo, profileRepo, appRepo)

        startMonitoringLoop()
    }

    private fun startMonitoringLoop() {
        monitorJob?.cancel()
        monitorJob = monitorScope.launch {
            val usageStatsManager = getSystemService(Context.USAGE_STATS_SERVICE) as? UsageStatsManager
                ?: return@launch

            while (isActive) {
                try {
                    val foregroundPackage = getForegroundPackageName(usageStatsManager)
                    if (foregroundPackage != null && foregroundPackage != packageName) {
                        evaluatePackage(foregroundPackage)
                    }
                } catch (_: Exception) {
                    // Usage access permission might not be granted yet
                }
                delay(800) // Efficient non-battery draining polling loop
            }
        }
    }

    private suspend fun evaluatePackage(targetPackage: String) {
        // Debounce repeated triggers for same app within 2 seconds
        val now = System.currentTimeMillis()
        if (targetPackage == lastInterceptionPackage && now - lastInterceptionTimeMs < 2000) {
            return
        }

        when (val decision = checkAppBlockUseCase(targetPackage)) {
            is BlockDecision.Block -> {
                lastInterceptionPackage = targetPackage
                lastInterceptionTimeMs = now

                // Record interception in statistics
                statsRepository.recordBlockedInterception()

                // Launch full-screen intervention overlay
                val overlayIntent = Intent(this@AppBlockMonitorService, AppBlockOverlayActivity::class.java).apply {
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP
                    putExtra(AppBlockOverlayActivity.EXTRA_PACKAGE_NAME, targetPackage)
                    putExtra(AppBlockOverlayActivity.EXTRA_APP_NAME, decision.app.appName)
                    putExtra(AppBlockOverlayActivity.EXTRA_PROFILE_NAME, decision.profileName)
                    putExtra(AppBlockOverlayActivity.EXTRA_INTERVENTION_TYPE, decision.app.interventionType.name)
                }
                startActivity(overlayIntent)
            }
            BlockDecision.Allow -> {
                // App is permitted
            }
        }
    }

    private fun getForegroundPackageName(usageStatsManager: UsageStatsManager): String? {
        val endTime = System.currentTimeMillis()
        val startTime = endTime - 1000 * 5 // Check last 5 seconds

        val usageEvents = usageStatsManager.queryEvents(startTime, endTime)
        val event = UsageEvents.Event()
        var lastForegroundApp: String? = null

        while (usageEvents.hasNextEvent()) {
            usageEvents.getNextEvent(event)
            if (event.eventType == UsageEvents.Event.ACTIVITY_RESUMED) {
                lastForegroundApp = event.packageName
            }
        }
        return lastForegroundApp
    }

    override fun onDestroy() {
        super.onDestroy()
        monitorJob?.cancel()
        monitorScope.cancel()
    }

    override fun onBind(intent: Intent?): IBinder? = null
}
