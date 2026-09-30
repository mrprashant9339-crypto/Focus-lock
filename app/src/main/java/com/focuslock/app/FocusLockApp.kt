package com.focuslock.app

import android.app.Application
import com.focuslock.app.data.database.FocusLockDatabase
import com.focuslock.app.data.datastore.FocusLockDataStore
import com.focuslock.app.data.repository.*
import com.focuslock.app.domain.repository.*
import com.focuslock.app.notifications.FocusNotificationManager
import com.focuslock.app.permissions.PermissionManager

class FocusLockApp : Application() {

    lateinit var database: FocusLockDatabase
        private set
    lateinit var dataStore: FocusLockDataStore
        private set
    lateinit var notificationManager: FocusNotificationManager
        private set
    lateinit var permissionManager: PermissionManager
        private set

    // Repositories
    lateinit var sessionRepository: FocusSessionRepository
        private set
    lateinit var blockedAppRepository: BlockedAppRepository
        private set
    lateinit var profileRepository: FocusProfileRepository
        private set
    lateinit var statsRepository: StatsRepository
        private set
    lateinit var settingsRepository: SettingsRepository
        private set
    lateinit var authRepository: AuthRepository
        private set

    companion object {
        lateinit var instance: FocusLockApp
            private set
    }

    override fun onCreate() {
        super.onCreate()
        instance = this

        database = FocusLockDatabase.getInstance(this)
        dataStore = FocusLockDataStore(this)
        notificationManager = FocusNotificationManager(this)
        permissionManager = PermissionManager(this)

        sessionRepository = FocusSessionRepositoryImpl(database.focusSessionDao())
        blockedAppRepository = BlockedAppRepositoryImpl(database.blockedAppDao())
        profileRepository = FocusProfileRepositoryImpl(database.focusProfileDao(), dataStore)
        statsRepository = StatsRepositoryImpl(database.dailyStatsDao())
        settingsRepository = SettingsRepositoryImpl(dataStore)
        authRepository = AuthRepositoryImpl()
    }
}
