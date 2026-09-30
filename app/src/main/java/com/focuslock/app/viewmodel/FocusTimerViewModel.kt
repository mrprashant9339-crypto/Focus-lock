package com.focuslock.app.viewmodel

import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.focuslock.app.domain.model.FocusProfile
import com.focuslock.app.domain.model.FocusSession
import com.focuslock.app.domain.repository.FocusProfileRepository
import com.focuslock.app.domain.repository.FocusSessionRepository
import com.focuslock.app.domain.repository.SettingsRepository
import com.focuslock.app.services.FocusForegroundService
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

data class TimerUiState(
    val activeSession: FocusSession? = null,
    val selectedDurationMinutes: Int = 25,
    val goalInput: String = "Complete critical deep work task",
    val activeProfile: FocusProfile? = null,
    val availableProfiles: List<FocusProfile> = emptyList(),
    val errorMessage: String? = null
)

class FocusTimerViewModel(
    private val sessionRepository: FocusSessionRepository,
    private val profileRepository: FocusProfileRepository,
    private val settingsRepository: SettingsRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(TimerUiState())
    val uiState: StateFlow<TimerUiState> = _uiState.asStateFlow()

    init {
        viewModelScope.launch {
            val settings = settingsRepository.getSettings()
            _uiState.update { it.copy(selectedDurationMinutes = settings.defaultFocusDurationMinutes) }

            combine(
                FocusForegroundService.currentSessionState,
                sessionRepository.getActiveSessionFlow(),
                profileRepository.getAllProfilesFlow()
            ) { liveSession, dbSession, profiles ->
                val session = liveSession ?: dbSession
                val profile = profiles.firstOrNull { it.id == session?.profileId }
                    ?: profileRepository.getActiveProfile()

                _uiState.update { current ->
                    current.copy(
                        activeSession = session,
                        activeProfile = profile,
                        availableProfiles = profiles
                    )
                }
            }.collect()
        }
    }

    fun setDuration(minutes: Int) {
        _uiState.update { it.copy(selectedDurationMinutes = minutes) }
    }

    fun setGoal(goal: String) {
        _uiState.update { it.copy(goalInput = goal) }
    }

    fun selectProfile(profileId: String) {
        viewModelScope.launch {
            profileRepository.setActiveProfile(profileId)
            val profile = profileRepository.getProfileById(profileId)
            _uiState.update { it.copy(activeProfile = profile) }
        }
    }

    fun startFocus(context: Context) {
        val state = _uiState.value
        val profileName = state.activeProfile?.name ?: "Deep Work"
        FocusForegroundService.startSession(
            context = context,
            durationMinutes = state.selectedDurationMinutes,
            profileName = profileName,
            goal = state.goalInput
        )
    }

    fun pauseFocus(context: Context) {
        viewModelScope.launch {
            val settings = settingsRepository.getSettings()
            val currentSession = _uiState.value.activeSession
            if (settings.strictModeEnabled || currentSession?.isStrict == true) {
                _uiState.update { it.copy(errorMessage = "Strict Mode active: Pausing is disabled") }
                return@launch
            }
            FocusForegroundService.pauseSession(context)
        }
    }

    fun resumeFocus(context: Context) {
        FocusForegroundService.resumeSession(context)
    }

    fun stopFocus(context: Context) {
        viewModelScope.launch {
            val settings = settingsRepository.getSettings()
            val currentSession = _uiState.value.activeSession
            if (settings.strictModeEnabled || currentSession?.isStrict == true) {
                _uiState.update { it.copy(errorMessage = "Strict Mode active: Cannot abort active focus sprint") }
                return@launch
            }
            FocusForegroundService.stopSession(context)
        }
    }

    fun clearError() {
        _uiState.update { it.copy(errorMessage = null) }
    }
}
