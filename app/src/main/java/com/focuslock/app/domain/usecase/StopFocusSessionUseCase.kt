package com.focuslock.app.domain.usecase

import com.focuslock.app.domain.model.FocusSession
import com.focuslock.app.domain.model.SessionState
import com.focuslock.app.domain.repository.FocusSessionRepository
import com.focuslock.app.domain.repository.StatsRepository

class StopFocusSessionUseCase(
    private val sessionRepository: FocusSessionRepository,
    private val statsRepository: StatsRepository
) {
    suspend operator fun invoke(completed: Boolean = false): FocusSession? {
        val current = sessionRepository.getActiveSession() ?: return null
        val finalSession = current.copy(
            endTimestamp = System.currentTimeMillis(),
            state = if (completed) SessionState.COMPLETED else SessionState.CANCELLED,
            completed = completed
        )
        sessionRepository.updateSession(finalSession)
        sessionRepository.clearActiveSession()

        // Record minutes in stats
        val minutes = (finalSession.elapsedSeconds / 60).coerceAtLeast(1)
        statsRepository.recordFocusSessionTime(minutes)

        return finalSession
    }
}
