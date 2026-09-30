package com.focuslock.app.domain.usecase

import com.focuslock.app.domain.model.FocusSession
import com.focuslock.app.domain.model.SessionState
import com.focuslock.app.domain.repository.FocusProfileRepository
import com.focuslock.app.domain.repository.FocusSessionRepository

class StartFocusSessionUseCase(
    private val sessionRepository: FocusSessionRepository,
    private val profileRepository: FocusProfileRepository
) {
    suspend operator fun invoke(durationMinutes: Int, goal: String? = null): FocusSession {
        val activeProfile = profileRepository.getActiveProfile()
        val newSession = FocusSession(
            profileId = activeProfile.id,
            profileName = activeProfile.name,
            startTimestamp = System.currentTimeMillis(),
            plannedDurationSeconds = durationMinutes * 60,
            elapsedSeconds = 0,
            state = SessionState.RUNNING,
            goal = goal?.takeIf { it.isNotBlank() } ?: "Deep focus on ${activeProfile.name}",
            isStrict = activeProfile.isStrict
        )
        val id = sessionRepository.saveActiveSession(newSession)
        return newSession.copy(id = id)
    }
}
