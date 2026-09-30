package com.focuslock.app.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.focuslock.app.domain.model.AppCategory
import com.focuslock.app.domain.model.BlockedApp
import com.focuslock.app.domain.model.InterventionType
import com.focuslock.app.domain.repository.BlockedAppRepository
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

data class BlockedAppsUiState(
    val apps: List<BlockedApp> = emptyList(),
    val searchQuery: String = "",
    val selectedCategory: String = "All",
    val isLoading: Boolean = true
)

class BlockedAppsViewModel(
    private val blockedAppRepository: BlockedAppRepository
) : ViewModel() {

    private val _searchQuery = MutableStateFlow("")
    private val _selectedCategory = MutableStateFlow("All")

    val uiState: StateFlow<BlockedAppsUiState> = combine(
        blockedAppRepository.getAllAppsFlow(),
        _searchQuery,
        _selectedCategory
    ) { allApps, query, category ->
        val filtered = allApps.filter { app ->
            val matchesCategory = (category == "All") || (app.category.name.equals(category, ignoreCase = true))
            val matchesSearch = query.isBlank() ||
                    app.appName.contains(query, ignoreCase = true) ||
                    app.packageName.contains(query, ignoreCase = true)
            matchesCategory && matchesSearch
        }
        BlockedAppsUiState(
            apps = filtered,
            searchQuery = query,
            selectedCategory = category,
            isLoading = false
        )
    }.stateIn(
        viewModelScope,
        SharingStarted.WhileSubscribed(5000),
        BlockedAppsUiState()
    )

    fun onSearchQueryChanged(query: String) {
        _searchQuery.value = query
    }

    fun onCategorySelected(category: String) {
        _selectedCategory.value = category
    }

    fun toggleAppBlocked(app: BlockedApp) {
        viewModelScope.launch {
            if (!app.isEssential) {
                blockedAppRepository.toggleAppBlock(app.packageName, !app.isBlocked)
            }
        }
    }

    fun updateIntervention(app: BlockedApp, intervention: InterventionType) {
        viewModelScope.launch {
            blockedAppRepository.updateIntervention(app.packageName, intervention)
        }
    }

    fun updateDailyLimit(app: BlockedApp, minutes: Int) {
        viewModelScope.launch {
            blockedAppRepository.updateDailyLimit(app.packageName, minutes)
        }
    }
}
