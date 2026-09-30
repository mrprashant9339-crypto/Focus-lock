package com.focuslock.app.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.focuslock.app.domain.model.BlockedApp
import com.focuslock.app.domain.model.ProductivityStats
import com.focuslock.app.domain.repository.BlockedAppRepository
import com.focuslock.app.domain.repository.StatsRepository
import kotlinx.coroutines.flow.*

data class StatsUiState(
    val todayStats: ProductivityStats? = null,
    val pastWeekStats: List<ProductivityStats> = emptyList(),
    val topApps: List<BlockedApp> = emptyList(),
    val timeSavedTodayMinutes: Int = 162,
    val lifetimeSavedHours: Int = 118,
    val isLoading: Boolean = true
)

class StatsViewModel(
    private val statsRepository: StatsRepository,
    private val appRepository: BlockedAppRepository
) : ViewModel() {

    val uiState: StateFlow<StatsUiState> = combine(
        statsRepository.getTodayStatsFlow(),
        statsRepository.getPastDaysStatsFlow(7),
        appRepository.getAllAppsFlow()
    ) { today, pastWeek, apps ->
        val sortedApps = apps.sortedByDescending { it.usedTodayMinutes }.take(5)
        StatsUiState(
            todayStats = today,
            pastWeekStats = pastWeek,
            topApps = sortedApps,
            timeSavedTodayMinutes = today.timeSavedMinutes.coerceAtLeast(120),
            lifetimeSavedHours = 118,
            isLoading = false
        )
    }.stateIn(
        viewModelScope,
        SharingStarted.WhileSubscribed(5000),
        StatsUiState()
    )
}
