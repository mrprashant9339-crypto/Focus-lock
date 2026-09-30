package com.focuslock.app.data.datastore

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.*
import androidx.datastore.preferences.preferencesDataStore
import com.focuslock.app.domain.model.ThemeMode
import com.focuslock.app.domain.model.UserSettings
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.map
import java.io.IOException

val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "focuslock_preferences")

class FocusLockDataStore(private val context: Context) {

    private object PreferencesKeys {
        val BIOMETRIC_ENABLED = booleanPreferencesKey("biometric_enabled")
        val STRICT_MODE_ENABLED = booleanPreferencesKey("strict_mode_enabled")
        val EMERGENCY_DELAY_SECONDS = intPreferencesKey("emergency_delay_seconds")
        val DEFAULT_DURATION_MINUTES = intPreferencesKey("default_duration_minutes")
        val SHORT_BREAK_MINUTES = intPreferencesKey("short_break_minutes")
        val LONG_BREAK_MINUTES = intPreferencesKey("long_break_minutes")
        val SOUND_ENABLED = booleanPreferencesKey("sound_enabled")
        val VIBRATION_ENABLED = booleanPreferencesKey("vibration_enabled")
        val THEME_MODE = stringPreferencesKey("theme_mode")
        val ACTIVE_PROFILE_ID = stringPreferencesKey("active_profile_id")
        val IS_PRO_USER = booleanPreferencesKey("is_pro_user")
    }

    val userSettingsFlow: Flow<UserSettings> = context.dataStore.data
        .catch { exception ->
            if (exception is IOException) {
                emit(emptyPreferences())
            } else {
                throw exception
            }
        }
        .map { preferences ->
            UserSettings(
                biometricEnabled = preferences[PreferencesKeys.BIOMETRIC_ENABLED] ?: true,
                strictModeEnabled = preferences[PreferencesKeys.STRICT_MODE_ENABLED] ?: false,
                emergencyUnlockDelaySeconds = preferences[PreferencesKeys.EMERGENCY_DELAY_SECONDS] ?: 60,
                defaultFocusDurationMinutes = preferences[PreferencesKeys.DEFAULT_DURATION_MINUTES] ?: 25,
                shortBreakMinutes = preferences[PreferencesKeys.SHORT_BREAK_MINUTES] ?: 5,
                longBreakMinutes = preferences[PreferencesKeys.LONG_BREAK_MINUTES] ?: 15,
                soundEnabled = preferences[PreferencesKeys.SOUND_ENABLED] ?: true,
                vibrationEnabled = preferences[PreferencesKeys.VIBRATION_ENABLED] ?: true,
                themeMode = try {
                    ThemeMode.valueOf(preferences[PreferencesKeys.THEME_MODE] ?: ThemeMode.DARK.name)
                } catch (_: Exception) {
                    ThemeMode.DARK
                },
                isProUser = preferences[PreferencesKeys.IS_PRO_USER] ?: false
            )
        }

    val activeProfileIdFlow: Flow<String> = context.dataStore.data
        .map { preferences ->
            preferences[PreferencesKeys.ACTIVE_PROFILE_ID] ?: "deep_work"
        }

    suspend fun setActiveProfileId(profileId: String) {
        context.dataStore.edit { preferences ->
            preferences[PreferencesKeys.ACTIVE_PROFILE_ID] = profileId
        }
    }

    suspend fun updateBiometric(enabled: Boolean) {
        context.dataStore.edit { it[PreferencesKeys.BIOMETRIC_ENABLED] = enabled }
    }

    suspend fun updateStrictMode(enabled: Boolean) {
        context.dataStore.edit { it[PreferencesKeys.STRICT_MODE_ENABLED] = enabled }
    }

    suspend fun updateEmergencyDelay(seconds: Int) {
        context.dataStore.edit { it[PreferencesKeys.EMERGENCY_DELAY_SECONDS] = seconds }
    }

    suspend fun updateFocusDuration(minutes: Int) {
        context.dataStore.edit { it[PreferencesKeys.DEFAULT_DURATION_MINUTES] = minutes }
    }

    suspend fun updateBreakDurations(shortBreak: Int, longBreak: Int) {
        context.dataStore.edit {
            it[PreferencesKeys.SHORT_BREAK_MINUTES] = shortBreak
            it[PreferencesKeys.LONG_BREAK_MINUTES] = longBreak
        }
    }

    suspend fun updateThemeMode(themeMode: ThemeMode) {
        context.dataStore.edit { it[PreferencesKeys.THEME_MODE] = themeMode.name }
    }

    suspend fun updateSoundAndVibration(sound: Boolean, vibration: Boolean) {
        context.dataStore.edit {
            it[PreferencesKeys.SOUND_ENABLED] = sound
            it[PreferencesKeys.VIBRATION_ENABLED] = vibration
        }
    }

    suspend fun updateProStatus(isPro: Boolean) {
        context.dataStore.edit { it[PreferencesKeys.IS_PRO_USER] = isPro }
    }
}
