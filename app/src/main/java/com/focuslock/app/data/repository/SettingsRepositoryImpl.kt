package com.focuslock.app.data.repository

import com.focuslock.app.data.datastore.FocusLockDataStore
import com.focuslock.app.domain.model.ThemeMode
import com.focuslock.app.domain.model.UserSettings
import com.focuslock.app.domain.repository.SettingsRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first

class SettingsRepositoryImpl(
    private val dataStore: FocusLockDataStore
) : SettingsRepository {

    override fun getSettingsFlow(): Flow<UserSettings> = dataStore.userSettingsFlow

    override suspend fun getSettings(): UserSettings = dataStore.userSettingsFlow.first()

    override suspend fun updateBiometric(enabled: Boolean) = dataStore.updateBiometric(enabled)

    override suspend fun updateStrictMode(enabled: Boolean) = dataStore.updateStrictMode(enabled)

    override suspend fun updateEmergencyDelay(seconds: Int) = dataStore.updateEmergencyDelay(seconds)

    override suspend fun updateFocusDuration(minutes: Int) = dataStore.updateFocusDuration(minutes)

    override suspend fun updateBreakDurations(shortBreak: Int, longBreak: Int) =
        dataStore.updateBreakDurations(shortBreak, longBreak)

    override suspend fun updateThemeMode(themeMode: ThemeMode) = dataStore.updateThemeMode(themeMode)

    override suspend fun updateSoundAndVibration(sound: Boolean, vibration: Boolean) =
        dataStore.updateSoundAndVibration(sound, vibration)

    override suspend fun updateProStatus(isPro: Boolean) = dataStore.updateProStatus(isPro)
}
