package com.focuslock.app.domain.usecase

import com.focuslock.app.domain.model.FocusSession
import com.focuslock.app.domain.model.SessionState
import com.focuslock.app.domain.repository.FocusSessionRepository

class ResumeFocusSessionUseCase(
    private val sessionRepository: FocusSessionRepository
) {
    suspend operator fun invoke(): Result<FocusSession> {
        val currentSession = sessionRepository.getActiveSession()
            ?: return Result.failure(IllegalStateException("No active focus session found"))

        val updatedSession = currentSession.copy(state = SessionState.RUNNING)
        sessionRepository.updateSession(updatedSession)
        return Result.success(updatedSession)
    }
}
