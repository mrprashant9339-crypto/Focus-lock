package com.focuslock.app.data.database.dao

import androidx.room.*
import com.focuslock.app.data.database.entity.DailyStatsEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface DailyStatsDao {
    @Query("SELECT * FROM daily_stats WHERE dateString = :dateString LIMIT 1")
    fun getStatsForDateFlow(dateString: String): Flow<DailyStatsEntity?>

    @Query("SELECT * FROM daily_stats WHERE dateString = :dateString LIMIT 1")
    suspend fun getStatsForDate(dateString: String): DailyStatsEntity?

    @Query("SELECT * FROM daily_stats ORDER BY dateString DESC LIMIT :limit")
    fun getRecentStats(limit: Int): Flow<List<DailyStatsEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrUpdate(stats: DailyStatsEntity)

    @Query("UPDATE daily_stats SET totalFocusMinutes = totalFocusMinutes + :minutes, completedSessionsCount = completedSessionsCount + 1, timeSavedMinutes = timeSavedMinutes + :minutes WHERE dateString = :dateString")
    suspend fun recordFocusSession(dateString: String, minutes: Int)

    @Query("UPDATE daily_stats SET blockedInterceptionsCount = blockedInterceptionsCount + 1 WHERE dateString = :dateString")
    suspend fun incrementInterceptionCount(dateString: String)
}
