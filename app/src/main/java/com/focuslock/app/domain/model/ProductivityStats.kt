package com.focuslock.app.domain.model

data class ProductivityStats(
    val dateString: String, // YYYY-MM-DD
    val totalFocusMinutes: Int = 0,
    val totalScreenTimeMinutes: Int = 0,
    val completedSessionsCount: Int = 0,
    val blockedInterceptionsCount: Int = 0,
    val currentStreakDays: Int = 1,
    val longestStreakDays: Int = 1,
    val timeSavedMinutes: Int = 0
)
