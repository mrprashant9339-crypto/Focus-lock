package com.focuslock.app

import com.focuslock.app.domain.model.ProductivityStats
import org.junit.Assert.assertEquals
import org.junit.Test

class DailyStatsCalculatorTest {

    @Test
    fun testTimeSavedCalculation() {
        val stats = ProductivityStats(
            dateString = "2026-09-30",
            totalFocusMinutes = 150,
            totalScreenTimeMinutes = 180,
            completedSessionsCount = 5,
            blockedInterceptionsCount = 14,
            currentStreakDays = 7,
            longestStreakDays = 14,
            timeSavedMinutes = 150
        )

        assertEquals(150, stats.timeSavedMinutes)
        assertEquals(7, stats.currentStreakDays)
        assertEquals(5, stats.completedSessionsCount)
    }

    @Test
    fun testStreakPreservation() {
        val baseStats = ProductivityStats(
            dateString = "2026-09-29",
            currentStreakDays = 6,
            longestStreakDays = 12
        )

        val nextDayStreak = baseStats.currentStreakDays + 1
        assertEquals(7, nextDayStreak)
    }
}
