package com.focuslock.app.domain.model

enum class AppCategory(val title: String) {
    SOCIAL("Social Media"),
    GAMES("Games"),
    VIDEO("Video & Streaming"),
    SHOPPING("Shopping"),
    ENTERTAINMENT("Entertainment"),
    COMMUNICATION("Communication"),
    PRODUCTIVITY("Productivity"),
    BROWSERS("Web Browsers"),
    OTHER("Other")
}

data class BlockedApp(
    val packageName: String,
    val appName: String,
    val category: AppCategory = AppCategory.OTHER,
    val isBlocked: Boolean = true,
    val interventionType: InterventionType = InterventionType.BREATHING,
    val dailyLimitMinutes: Int = 30,
    val usedTodayMinutes: Int = 0,
    val launchCountToday: Int = 0,
    val isEssential: Boolean = false // System whitelist e.g. Phone/Emergency
)
