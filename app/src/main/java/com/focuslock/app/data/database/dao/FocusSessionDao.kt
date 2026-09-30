package com.focuslock.app.data.database.dao

import androidx.room.*
import com.focuslock.app.data.database.entity.FocusSessionEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface FocusSessionDao {
    @Query("SELECT * FROM focus_sessions WHERE state IN ('RUNNING', 'PAUSED', 'ON_BREAK') ORDER BY id DESC LIMIT 1")
    fun getActiveSessionFlow(): Flow<FocusSessionEntity?>

    @Query("SELECT * FROM focus_sessions WHERE state IN ('RUNNING', 'PAUSED', 'ON_BREAK') ORDER BY id DESC LIMIT 1")
    suspend fun getActiveSession(): FocusSessionEntity?

    @Query("SELECT * FROM focus_sessions ORDER BY startTimestamp DESC LIMIT :limit")
    fun getRecentSessions(limit: Int): Flow<List<FocusSessionEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSession(session: FocusSessionEntity): Long

    @Update
    suspend fun updateSession(session: FocusSessionEntity)

    @Query("UPDATE focus_sessions SET state = 'CANCELLED' WHERE state IN ('RUNNING', 'PAUSED', 'ON_BREAK')")
    suspend fun cancelAllActiveSessions()

    @Query("DELETE FROM focus_sessions")
    suspend fun clearAll()
}
