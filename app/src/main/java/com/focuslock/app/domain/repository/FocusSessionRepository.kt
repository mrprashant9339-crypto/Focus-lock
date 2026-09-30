package com.focuslock.app.domain.repository

import com.focuslock.app.domain.model.FocusSession
import kotlinx.coroutines.flow.Flow

interface FocusSessionRepository {
    fun getActiveSessionFlow(): Flow<FocusSession?>
    fun getRecentSessionsFlow(limit: Int = 20): Flow<List<FocusSession>>
    suspend fun getActiveSession(): FocusSession?
    suspend fun saveActiveSession(session: FocusSession): Long
    suspend fun updateSession(session: FocusSession)
    suspend fun clearActiveSession()
    suspend fun completeSession(sessionId: Long, actualDurationSeconds: Int)
}
