package com.focuslock.app.ui.navigation

import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import com.focuslock.app.FocusLockApp
import com.focuslock.app.ui.components.FocusLockBottomBar
import com.focuslock.app.ui.components.FocusLockTopBar
import com.focuslock.app.ui.screens.*
import com.focuslock.app.ui.theme.Slate950
import com.focuslock.app.viewmodel.*

@Composable
fun FocusLockNavGraph(
    navController: NavHostController,
    modifier: Modifier = Modifier
) {
    val app = FocusLockApp.instance
    val homeViewModel = HomeViewModel(app.sessionRepository, app.profileRepository, app.statsRepository)
    val timerViewModel = FocusTimerViewModel(app.sessionRepository, app.profileRepository, app.settingsRepository)
    val blockedAppsViewModel = BlockedAppsViewModel(app.blockedAppRepository)
    val statsViewModel = StatsViewModel(app.statsRepository, app.blockedAppRepository)
    val settingsViewModel = SettingsViewModel(app.settingsRepository, app.authRepository)
    val permissionsViewModel = PermissionsViewModel(app.permissionManager)

    Scaffold(
        containerColor = Slate950,
        topBar = {
            FocusLockTopBar(
                title = "FocusLock",
                onOpenPermissions = { navController.navigate(Screen.Permissions.route) }
            )
        },
        bottomBar = {
            FocusLockBottomBar(navController = navController)
        },
        modifier = modifier
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = Screen.Home.route,
            modifier = Modifier.padding(innerPadding)
        ) {
            composable(Screen.Home.route) {
                HomeScreen(
                    viewModel = homeViewModel,
                    onNavigateToTimer = { navController.navigate(Screen.FocusTimer.route) },
                    onNavigateToProfiles = { navController.navigate(Screen.Profiles.route) },
                    onNavigateToApps = { navController.navigate(Screen.BlockedApps.route) }
                )
            }
            composable(Screen.FocusTimer.route) {
                FocusTimerScreen(viewModel = timerViewModel)
            }
            composable(Screen.BlockedApps.route) {
                BlockedAppsScreen(viewModel = blockedAppsViewModel)
            }
            composable(Screen.Profiles.route) {
                ProfilesScreen(viewModel = timerViewModel)
            }
            composable(Screen.Statistics.route) {
                StatisticsScreen(viewModel = statsViewModel)
            }
            composable(Screen.Settings.route) {
                SettingsScreen(
                    viewModel = settingsViewModel,
                    onNavigateToPermissions = { navController.navigate(Screen.Permissions.route) }
                )
            }
            composable(Screen.Permissions.route) {
                PermissionsScreen(viewModel = permissionsViewModel)
            }
            composable(Screen.Auth.route) {
                AuthScreen(onAuthSuccess = { navController.popBackStack() })
            }
        }
    }
}
