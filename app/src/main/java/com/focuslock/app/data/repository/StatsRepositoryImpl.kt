package com.focuslock.app.data.repository

import com.focuslock.app.data.database.dao.DailyStatsDao
import com.focuslock.app.data.database.entity.DailyStatsEntity
import com.focuslock.app.domain.model.ProductivityStats
import com.focuslock.app.domain.repository.StatsRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import java.time.LocalDate

class StatsRepositoryImpl(
    private val statsDao: DailyStatsDao
) : StatsRepository {

    private fun getTodayString(): String = LocalDate.now().toString()

    override fun getTodayStatsFlow(): Flow<ProductivityStats> {
        val today = getTodayString()
        return statsDao.getStatsForDateFlow(today).map { entity ->
            entity?.toDomain() ?: ProductivityStats(dateString = today)
        }
    }

    override fun getPastDaysStatsFlow(daysCount: Int): Flow<List<ProductivityStats>> {
        return statsDao.getRecentStats(daysCount).map { list ->
            list.map { it.toDomain() }
        }
    }

    override suspend fun recordFocusSessionTime(minutes: Int) {
        val today = getTodayString()
        val existing = statsDao.getStatsForDate(today)
        if (existing == null) {
            statsDao.insertOrUpdate(
                DailyStatsEntity(
                    dateString = today,
                    totalFocusMinutes = minutes,
                    totalScreenTimeMinutes = 180,
                    completedSessionsCount = 1,
                    blockedInterceptionsCount = 0,
                    currentStreakDays = 6,
                    longestStreakDays = 14,
                    timeSavedMinutes = minutes
                )
            )
        } else {
            statsDao.recordFocusSession(today, minutes)
        }
    }

    override suspend fun recordBlockedInterception() {
        val today = getTodayString()
        val existing = statsDao.getStatsForDate(today)
        if (existing == null) {
            statsDao.insertOrUpdate(
                DailyStatsEntity(
                    dateString = today,
                    totalFocusMinutes = 0,
                    totalScreenTimeMinutes = 180,
                    completedSessionsCount = 0,
                    blockedInterceptionsCount = 1,
                    currentStreakDays = 6,
                    longestStreakDays = 14,
                    timeSavedMinutes = 0
                )
            )
        } else {
            statsDao.incrementInterceptionCount(today)
        }
    }

    override suspend fun getStreakDays(): Int {
        val today = getTodayString()
        val current = statsDao.getStatsForDate(today)
        return current?.currentStreakDays ?: 6
    }
}
