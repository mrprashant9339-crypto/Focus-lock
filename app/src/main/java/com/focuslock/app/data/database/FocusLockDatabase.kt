package com.focuslock.app.data.database

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.sqlite.db.SupportSQLiteDatabase
import com.focuslock.app.data.database.dao.BlockedAppDao
import com.focuslock.app.data.database.dao.DailyStatsDao
import com.focuslock.app.data.database.dao.FocusProfileDao
import com.focuslock.app.data.database.dao.FocusSessionDao
import com.focuslock.app.data.database.entity.BlockedAppEntity
import com.focuslock.app.data.database.entity.DailyStatsEntity
import com.focuslock.app.data.database.entity.FocusProfileEntity
import com.focuslock.app.data.database.entity.FocusSessionEntity
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.time.LocalDate

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
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    FocusLockDatabase::class.java,
                    "focuslock_database"
                )
                    .addCallback(DatabaseCallback(context))
                    .fallbackToDestructiveMigration()
                    .build()
                INSTANCE = instance
                instance
            }
        }

        private class DatabaseCallback(private val context: Context) : RoomDatabase.Callback() {
            override fun onCreate(db: SupportSQLiteDatabase) {
                super.onCreate(db)
                CoroutineScope(Dispatchers.IO).launch {
                    val database = getInstance(context)
                    seedInitialData(database)
                }
            }

            private suspend fun seedInitialData(db: FocusLockDatabase) {
                // Seed default apps with realistic usage stats
                val defaultApps = listOf(
                    BlockedAppEntity(
                        packageName = "com.instagram.android",
                        appName = "Instagram",
                        category = "SOCIAL",
                        isBlocked = true,
                        interventionType = "BREATHING",
                        dailyLimitMinutes = 20,
                        usedTodayMinutes = 48,
                        launchCountToday = 26,
                        isEssential = false
                    ),
                    BlockedAppEntity(
                        packageName = "com.zhiliaoapp.musically",
                        appName = "TikTok",
                        category = "VIDEO",
                        isBlocked = true,
                        interventionType = "STRICT_LOCK",
                        dailyLimitMinutes = 15,
                        usedTodayMinutes = 62,
                        launchCountToday = 34,
                        isEssential = false
                    ),
                    BlockedAppEntity(
                        packageName = "com.google.android.youtube",
                        appName = "YouTube",
                        category = "VIDEO",
                        isBlocked = true,
                        interventionType = "WAIT_TIMER",
                        dailyLimitMinutes = 45,
                        usedTodayMinutes = 35,
                        launchCountToday = 14,
                        isEssential = false
                    ),
                    BlockedAppEntity(
                        packageName = "com.twitter.android",
                        appName = "X (Twitter)",
                        category = "SOCIAL",
                        isBlocked = true,
                        interventionType = "ROTATE_PHONE",
                        dailyLimitMinutes = 25,
                        usedTodayMinutes = 28,
                        launchCountToday = 18,
                        isEssential = false
                    ),
                    BlockedAppEntity(
                        packageName = "com.reddit.frontpage",
                        appName = "Reddit",
                        category = "SOCIAL",
                        isBlocked = true,
                        interventionType = "INTENTION_CHECK",
                        dailyLimitMinutes = 30,
                        usedTodayMinutes = 22,
                        launchCountToday = 9,
                        isEssential = false
                    ),
                    BlockedAppEntity(
                        packageName = "com.netflix.mediaclient",
                        appName = "Netflix",
                        category = "ENTERTAINMENT",
                        isBlocked = false,
                        interventionType = "WAIT_TIMER",
                        dailyLimitMinutes = 60,
                        usedTodayMinutes = 0,
                        launchCountToday = 1,
                        isEssential = false
                    ),
                    // Essential Whitelist Apps (Exempt from blocking)
                    BlockedAppEntity(
                        packageName = "com.google.android.dialer",
                        appName = "Phone",
                        category = "COMMUNICATION",
                        isBlocked = false,
                        interventionType = "BREATHING",
                        dailyLimitMinutes = 0,
                        usedTodayMinutes = 12,
                        launchCountToday = 5,
                        isEssential = true
                    ),
                    BlockedAppEntity(
                        packageName = "com.google.android.apps.messaging",
                        appName = "Messages",
                        category = "COMMUNICATION",
                        isBlocked = false,
                        interventionType = "BREATHING",
                        dailyLimitMinutes = 0,
                        usedTodayMinutes = 8,
                        launchCountToday = 7,
                        isEssential = true
                    ),
                    BlockedAppEntity(
                        packageName = "com.google.android.apps.maps",
                        appName = "Google Maps",
                        category = "PRODUCTIVITY",
                        isBlocked = false,
                        interventionType = "BREATHING",
                        dailyLimitMinutes = 0,
                        usedTodayMinutes = 15,
                        launchCountToday = 2,
                        isEssential = true
                    )
                )
                db.blockedAppDao().insertAll(defaultApps)

                // Seed default focus profiles
                val defaultProfiles = listOf(
                    FocusProfileEntity(
                        id = "deep_work",
                        name = "Deep Work",
                        description = "Strict protection for high-value cognitive output",
                        iconName = "Briefcase",
                        colorHex = "#10B981",
                        isEnabled = true,
                        startTime = "09:00",
                        endTime = "17:00",
                        activeDaysCommaSeparated = "1,2,3,4,5",
                        defaultDurationMinutes = 25,
                        dailyLimitMinutes = 120,
                        isStrict = false,
                        defaultIntervention = "BREATHING",
                        blockedPackagesCommaSeparated = "com.instagram.android,com.zhiliaoapp.musically,com.twitter.android,com.reddit.frontpage"
                    ),
                    FocusProfileEntity(
                        id = "sleep_sanctuary",
                        name = "Sleep Sanctuary",
                        description = "Cuts blue light dopamine loops 1 hour before bed",
                        iconName = "Moon",
                        colorHex = "#6366F1",
                        isEnabled = true,
                        startTime = "22:00",
                        endTime = "07:00",
                        activeDaysCommaSeparated = "1,2,3,4,5,6,7",
                        defaultDurationMinutes = 60,
                        dailyLimitMinutes = 30,
                        isStrict = true,
                        defaultIntervention = "STRICT_LOCK",
                        blockedPackagesCommaSeparated = "com.instagram.android,com.zhiliaoapp.musically,com.google.android.youtube,com.twitter.android"
                    ),
                    FocusProfileEntity(
                        id = "workout_focus",
                        name = "Workout Focus",
                        description = "Keeps gym sessions energetic without infinite scrolling",
                        iconName = "Dumbbell",
                        colorHex = "#F59E0B",
                        isEnabled = true,
                        startTime = "07:00",
                        endTime = "08:30",
                        activeDaysCommaSeparated = "1,3,5",
                        defaultDurationMinutes = 45,
                        dailyLimitMinutes = 60,
                        isStrict = false,
                        defaultIntervention = "ROTATE_PHONE",
                        blockedPackagesCommaSeparated = "com.instagram.android,com.zhiliaoapp.musically,com.twitter.android"
                    ),
                    FocusProfileEntity(
                        id = "social_diet",
                        name = "Social Media Diet",
                        description = "Gentle friction pause whenever opening endless feeds",
                        iconName = "Sliders",
                        colorHex = "#EC4899",
                        isEnabled = true,
                        startTime = "08:00",
                        endTime = "21:00",
                        activeDaysCommaSeparated = "1,2,3,4,5,6,7",
                        defaultDurationMinutes = 20,
                        dailyLimitMinutes = 45,
                        isStrict = false,
                        defaultIntervention = "WAIT_TIMER",
                        blockedPackagesCommaSeparated = "com.instagram.android,com.zhiliaoapp.musically,com.reddit.frontpage"
                    )
                )
                db.focusProfileDao().insertAll(defaultProfiles)

                // Seed initial daily stats
                val todayString = LocalDate.now().toString()
                db.dailyStatsDao().insertOrUpdate(
                    DailyStatsEntity(
                        dateString = todayString,
                        totalFocusMinutes = 138,
                        totalScreenTimeMinutes = 195,
                        completedSessionsCount = 4,
                        blockedInterceptionsCount = 18,
                        currentStreakDays = 6,
                        longestStreakDays = 14,
                        timeSavedMinutes = 162
                    )
                )
            }
        }
    }
}
