package com.focuslock.app.domain.repository

import com.focuslock.app.domain.model.ThemeMode
import com.focuslock.app.domain.model.UserSettings
import kotlinx.coroutines.flow.Flow

interface SettingsRepository {
    fun getSettingsFlow(): Flow<UserSettings>
    suspend fun getSettings(): UserSettings
    suspend fun updateBiometric(enabled: Boolean)
    suspend fun updateStrictMode(enabled: Boolean)
    suspend fun updateEmergencyDelay(seconds: Int)
    suspend fun updateFocusDuration(minutes: Int)
    suspend fun updateBreakDurations(shortBreak: Int, longBreak: Int)
    suspend fun updateThemeMode(themeMode: ThemeMode)
    suspend fun updateSoundAndVibration(sound: Boolean, vibration: Boolean)
    suspend fun updateProStatus(isPro: Boolean)
}
