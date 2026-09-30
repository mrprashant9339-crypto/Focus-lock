package com.focuslock.app.domain.model

data class FocusProfile(
    val id: String,
    val name: String,
    val description: String,
    val iconName: String,
    val colorHex: String,
    val isEnabled: Boolean = true,
    val startTime: String = "09:00",
    val endTime: String = "17:00",
    val activeDays: List<Int> = listOf(1, 2, 3, 4, 5), // 1=Mon, ..., 7=Sun
    val defaultDurationMinutes: Int = 25,
    val dailyLimitMinutes: Int = 120,
    val isStrict: Boolean = false,
    val defaultIntervention: InterventionType = InterventionType.BREATHING,
    val blockedPackages: List<String> = emptyList()
)
