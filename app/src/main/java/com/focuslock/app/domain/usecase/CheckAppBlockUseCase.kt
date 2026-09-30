package com.focuslock.app.domain.usecase

import com.focuslock.app.domain.model.BlockedApp
import com.focuslock.app.domain.repository.BlockedAppRepository
import com.focuslock.app.domain.repository.FocusProfileRepository
import com.focuslock.app.domain.repository.FocusSessionRepository

sealed class BlockDecision {
    data object Allow : BlockDecision()
    data class Block(val app: BlockedApp, val profileName: String) : BlockDecision()
}

class CheckAppBlockUseCase(
    private val sessionRepository: FocusSessionRepository,
    private val profileRepository: FocusProfileRepository,
    private val blockedAppRepository: BlockedAppRepository
) {
    suspend operator fun invoke(packageName: String): BlockDecision {
        val app = blockedAppRepository.getApp(packageName) ?: return BlockDecision.Allow
        if (app.isEssential || !app.isBlocked) {
            return BlockDecision.Allow
        }

        val activeSession = sessionRepository.getActiveSession()
        if (activeSession != null && activeSession.isRunning) {
            val activeProfile = profileRepository.getActiveProfile()
            // If profile specifically guards this app or guards all blocked apps
            return BlockDecision.Block(app, activeProfile.name)
        }

        // Daily limit check
        if (app.dailyLimitMinutes > 0 && app.usedTodayMinutes >= app.dailyLimitMinutes) {
            return BlockDecision.Block(app, "Daily Time Limit Reached")
        }

        return BlockDecision.Allow
    }
}
