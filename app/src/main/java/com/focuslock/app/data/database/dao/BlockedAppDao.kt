package com.focuslock.app.data.database.dao

import androidx.room.*
import com.focuslock.app.data.database.entity.BlockedAppEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface BlockedAppDao {
    @Query("SELECT * FROM blocked_apps ORDER BY usedTodayMinutes DESC, appName ASC")
    fun getAllAppsFlow(): Flow<List<BlockedAppEntity>>

    @Query("SELECT * FROM blocked_apps WHERE isBlocked = 1 AND isEssential = 0 ORDER BY usedTodayMinutes DESC")
    fun getBlockedAppsFlow(): Flow<List<BlockedAppEntity>>

    @Query("SELECT * FROM blocked_apps WHERE packageName = :packageName LIMIT 1")
    suspend fun getAppByPackage(packageName: String): BlockedAppEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrUpdateApp(app: BlockedAppEntity)

    @Insert(onConflict = OnConflictStrategy.IGNORE)
    suspend fun insertAll(apps: List<BlockedAppEntity>)

    @Query("UPDATE blocked_apps SET isBlocked = :isBlocked WHERE packageName = :packageName")
    suspend fun updateBlockStatus(packageName: String, isBlocked: Boolean)

    @Query("UPDATE blocked_apps SET interventionType = :intervention WHERE packageName = :packageName")
    suspend fun updateIntervention(packageName: String, intervention: String)

    @Query("UPDATE blocked_apps SET dailyLimitMinutes = :limitMinutes WHERE packageName = :packageName")
    suspend fun updateDailyLimit(packageName: String, limitMinutes: Int)

    @Query("UPDATE blocked_apps SET launchCountToday = launchCountToday + 1 WHERE packageName = :packageName")
    suspend fun incrementLaunchCount(packageName: String)
}
