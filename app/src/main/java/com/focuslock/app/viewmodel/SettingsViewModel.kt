package com.focuslock.app.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.focuslock.app.domain.model.ThemeMode
import com.focuslock.app.domain.model.UserSettings
import com.focuslock.app.domain.repository.AuthRepository
import com.focuslock.app.domain.repository.AuthUser
import com.focuslock.app.domain.repository.SettingsRepository
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

data class SettingsUiState(
    val settings: UserSettings = UserSettings(),
    val currentUser: AuthUser? = null,
    val isLoading: Boolean = true,
    val saveSuccessMessage: String? = null
)

class SettingsViewModel(
    private val settingsRepository: SettingsRepository,
    private val authRepository: AuthRepository
) : ViewModel() {

    private val _saveMessage = MutableStateFlow<String?>(null)

    val uiState: StateFlow<SettingsUiState> = combine(
        settingsRepository.getSettingsFlow(),
        authRepository.getCurrentUserFlow(),
        _saveMessage
    ) { settings, user, message ->
        SettingsUiState(
            settings = settings,
            currentUser = user,
            isLoading = false,
            saveSuccessMessage = message
        )
    }.stateIn(
        viewModelScope,
        SharingStarted.WhileSubscribed(5000),
        SettingsUiState()
    )

    fun toggleBiometric(enabled: Boolean) {
        viewModelScope.launch {
            settingsRepository.updateBiometric(enabled)
            showFeedback("Biometric protection ${if (enabled) "enabled" else "disabled"}")
        }
    }

    fun toggleStrictMode(enabled: Boolean) {
        viewModelScope.launch {
            settingsRepository.updateStrictMode(enabled)
            showFeedback("Strict mode ${if (enabled) "activated" else "deactivated"}")
        }
    }

    fun setEmergencyDelay(seconds: Int) {
        viewModelScope.launch {
            settingsRepository.updateEmergencyDelay(seconds)
            showFeedback("Friction delay set to ${seconds}s")
        }
    }

    fun setFocusDuration(minutes: Int) {
        viewModelScope.launch {
            settingsRepository.updateFocusDuration(minutes)
        }
    }

    fun setBreakDurations(shortBreak: Int, longBreak: Int) {
        viewModelScope.launch {
            settingsRepository.updateBreakDurations(shortBreak, longBreak)
        }
    }

    fun setThemeMode(themeMode: ThemeMode) {
        viewModelScope.launch {
            settingsRepository.updateThemeMode(themeMode)
        }
    }

    fun toggleSoundAndVibration(sound: Boolean, vibration: Boolean) {
        viewModelScope.launch {
            settingsRepository.updateSoundAndVibration(sound, vibration)
        }
    }

    fun signOut() {
        viewModelScope.launch {
            authRepository.signOut()
        }
    }

    private fun showFeedback(message: String) {
        _saveMessage.value = message
    }

    fun clearFeedback() {
        _saveMessage.value = null
    }
}
