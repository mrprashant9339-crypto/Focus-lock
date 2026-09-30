package com.focuslock.app.domain.usecase

import com.focuslock.app.domain.model.FocusSession
import com.focuslock.app.domain.model.SessionState
import com.focuslock.app.domain.repository.FocusSessionRepository
import com.focuslock.app.domain.repository.SettingsRepository

class PauseFocusSessionUseCase(
    private val sessionRepository: FocusSessionRepository,
    private val settingsRepository: SettingsRepository
) {
    suspend operator fun invoke(): Result<FocusSession> {
        val currentSession = sessionRepository.getActiveSession()
            ?: return Result.failure(IllegalStateException("No active focus session found"))

        val settings = settingsRepository.getSettings()
        if (settings.strictModeEnabled || currentSession.isStrict) {
            return Result.failure(IllegalStateException("Strict mode active: Pausing is disabled to protect focus"))
        }

        val updatedSession = currentSession.copy(state = SessionState.PAUSED)
        sessionRepository.updateSession(updatedSession)
        return Result.success(updatedSession)
    }
}
