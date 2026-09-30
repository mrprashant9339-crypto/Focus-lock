package com.focuslock.app.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.focuslock.app.domain.model.FocusProfile
import com.focuslock.app.domain.model.FocusSession
import com.focuslock.app.domain.model.ProductivityStats
import com.focuslock.app.domain.repository.FocusProfileRepository
import com.focuslock.app.domain.repository.FocusSessionRepository
import com.focuslock.app.domain.repository.StatsRepository
import com.focuslock.app.services.FocusForegroundService
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

data class HomeUiState(
    val activeSession: FocusSession? = null,
    val activeProfile: FocusProfile? = null,
    val todayStats: ProductivityStats? = null,
    val isLoading: Boolean = true
)

class HomeViewModel(
    private val sessionRepository: FocusSessionRepository,
    private val profileRepository: FocusProfileRepository,
    private val statsRepository: StatsRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(HomeUiState())
    val uiState: StateFlow<HomeUiState> = _uiState.asStateFlow()

    init {
        loadDashboardData()
    }

    private fun loadDashboardData() {
        viewModelScope.launch {
            combine(
                FocusForegroundService.currentSessionState,
                sessionRepository.getActiveSessionFlow(),
                profileRepository.getAllProfilesFlow(),
                statsRepository.getTodayStatsFlow()
            ) { liveSession, dbSession, profiles, stats ->
                val session = liveSession ?: dbSession
                val activeProfile = profiles.firstOrNull { it.id == session?.profileId }
                    ?: profileRepository.getActiveProfile()

                HomeUiState(
                    activeSession = session,
                    activeProfile = activeProfile,
                    todayStats = stats,
                    isLoading = false
                )
            }.collect { state ->
                _uiState.value = state
            }
        }
    }
}
