package com.focuslock.app.data.repository

import com.focuslock.app.data.database.dao.FocusSessionDao
import com.focuslock.app.data.database.entity.FocusSessionEntity
import com.focuslock.app.domain.model.FocusSession
import com.focuslock.app.domain.model.SessionState
import com.focuslock.app.domain.repository.FocusSessionRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

class FocusSessionRepositoryImpl(
    private val sessionDao: FocusSessionDao
) : FocusSessionRepository {

    override fun getActiveSessionFlow(): Flow<FocusSession?> {
        return sessionDao.getActiveSessionFlow().map { it?.toDomain() }
    }

    override fun getRecentSessionsFlow(limit: Int): Flow<List<FocusSession>> {
        return sessionDao.getRecentSessions(limit).map { list ->
            list.map { it.toDomain() }
        }
    }

    override suspend fun getActiveSession(): FocusSession? {
        return sessionDao.getActiveSession()?.toDomain()
    }

    override suspend fun saveActiveSession(session: FocusSession): Long {
        return sessionDao.insertSession(FocusSessionEntity.fromDomain(session))
    }

    override suspend fun updateSession(session: FocusSession) {
        sessionDao.updateSession(FocusSessionEntity.fromDomain(session))
    }

    override suspend fun clearActiveSession() {
        sessionDao.cancelAllActiveSessions()
    }

    override suspend fun completeSession(sessionId: Long, actualDurationSeconds: Int) {
        val session = sessionDao.getActiveSession() ?: return
        if (session.id == sessionId) {
            val completed = session.copy(
                elapsedSeconds = actualDurationSeconds,
                endTimestamp = System.currentTimeMillis(),
                state = SessionState.COMPLETED.name,
                completed = true
            )
            sessionDao.updateSession(completed)
        }
    }
}
