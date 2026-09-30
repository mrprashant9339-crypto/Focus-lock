package com.focuslock.app.domain.repository

import com.focuslock.app.domain.model.ProductivityStats
import kotlinx.coroutines.flow.Flow

interface StatsRepository {
    fun getTodayStatsFlow(): Flow<ProductivityStats>
    fun getPastDaysStatsFlow(daysCount: Int = 7): Flow<List<ProductivityStats>>
    suspend fun recordFocusSessionTime(minutes: Int)
    suspend fun recordBlockedInterception()
    suspend fun getStreakDays(): Int
}
