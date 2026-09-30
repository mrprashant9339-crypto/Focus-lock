package com.focuslock.app.data.database.entity

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.focuslock.app.domain.model.ProductivityStats

@Entity(tableName = "daily_stats")
data class DailyStatsEntity(
    @PrimaryKey
    val dateString: String,
    val totalFocusMinutes: Int,
    val totalScreenTimeMinutes: Int,
    val completedSessionsCount: Int,
    val blockedInterceptionsCount: Int,
    val currentStreakDays: Int,
    val longestStreakDays: Int,
    val timeSavedMinutes: Int
) {
    fun toDomain(): ProductivityStats = ProductivityStats(
        dateString = dateString,
        totalFocusMinutes = totalFocusMinutes,
        totalScreenTimeMinutes = totalScreenTimeMinutes,
        completedSessionsCount = completedSessionsCount,
        blockedInterceptionsCount = blockedInterceptionsCount,
        currentStreakDays = currentStreakDays,
        longestStreakDays = longestStreakDays,
        timeSavedMinutes = timeSavedMinutes
    )

    companion object {
        fun fromDomain(domain: ProductivityStats): DailyStatsEntity = DailyStatsEntity(
            dateString = domain.dateString,
            totalFocusMinutes = domain.totalFocusMinutes,
            totalScreenTimeMinutes = domain.totalScreenTimeMinutes,
            completedSessionsCount = domain.completedSessionsCount,
            blockedInterceptionsCount = domain.blockedInterceptionsCount,
            currentStreakDays = domain.currentStreakDays,
            longestStreakDays = domain.longestStreakDays,
            timeSavedMinutes = domain.timeSavedMinutes
        )
    }
}
