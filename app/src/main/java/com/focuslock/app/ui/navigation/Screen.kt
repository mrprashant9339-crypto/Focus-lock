package com.focuslock.app.ui.navigation

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.ui.graphics.vector.ImageVector

sealed class Screen(val route: String, val title: String, val icon: ImageVector? = null) {
    data object Home : Screen("home", "Home", Icons.Default.Home)
    data object FocusTimer : Screen("focus_timer", "Focus", Icons.Default.Shield)
    data object BlockedApps : Screen("blocked_apps", "Apps", Icons.Default.Apps)
    data object Profiles : Screen("profiles", "Profiles", Icons.Default.Tune)
    data object Statistics : Screen("statistics", "Stats", Icons.Default.BarChart)
    data object Settings : Screen("settings", "Settings", Icons.Default.Settings)
    data object Permissions : Screen("permissions", "Permissions", Icons.Default.Security)
    data object Auth : Screen("auth", "Account", Icons.Default.Person)

    companion object {
        val bottomNavItems = listOf(Home, FocusTimer, BlockedApps, Statistics, Settings)
    }
}
