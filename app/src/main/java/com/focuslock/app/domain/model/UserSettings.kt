package com.focuslock.app.domain.model

enum class ThemeMode {
    SYSTEM,
    LIGHT,
    DARK
}

data class UserSettings(
    val biometricEnabled: Boolean = true,
    val strictModeEnabled: Boolean = false,
    val emergencyUnlockDelaySeconds: Int = 60,
    val defaultFocusDurationMinutes: Int = 25,
    val shortBreakMinutes: Int = 5,
    val longBreakMinutes: Int = 15,
    val autoStartBreaks: Boolean = false,
    val autoStartFocusAfterBreak: Boolean = false,
    val soundEnabled: Boolean = true,
    val vibrationEnabled: Boolean = true,
    val themeMode: ThemeMode = ThemeMode.DARK,
    val phoneVerified: Boolean = false,
    val phoneNumber: String? = null,
    val isProUser: Boolean = false
)
