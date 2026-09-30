package com.focuslock.app.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.focuslock.app.permissions.PermissionItem
import com.focuslock.app.permissions.PermissionManager
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class PermissionsUiState(
    val permissions: List<PermissionItem> = emptyList(),
    val allRequiredGranted: Boolean = false
)

class PermissionsViewModel(
    private val permissionManager: PermissionManager
) : ViewModel() {

    private val _uiState = MutableStateFlow(PermissionsUiState())
    val uiState: StateFlow<PermissionsUiState> = _uiState.asStateFlow()

    init {
        refreshPermissions()
    }

    fun refreshPermissions() {
        viewModelScope.launch {
            val list = permissionManager.getAllPermissions()
            val allRequired = permissionManager.hasAllRequiredPermissions()
            _uiState.value = PermissionsUiState(
                permissions = list,
                allRequiredGranted = allRequired
            )
        }
    }
}
