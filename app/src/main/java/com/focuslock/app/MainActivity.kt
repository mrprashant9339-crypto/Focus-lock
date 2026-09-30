package com.focuslock.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.navigation.compose.rememberNavController
import com.focuslock.app.domain.model.ThemeMode
import com.focuslock.app.ui.navigation.FocusLockNavGraph
import com.focuslock.app.ui.theme.FocusLockTheme

class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val settingsRepo = FocusLockApp.instance.settingsRepository

        setContent {
            val settings by settingsRepo.getSettingsFlow().collectAsState(initial = com.focuslock.app.domain.model.UserSettings())
            val systemDark = isSystemInDarkTheme()
            val isDark = when (settings.themeMode) {
                ThemeMode.SYSTEM -> systemDark
                ThemeMode.LIGHT -> false
                ThemeMode.DARK -> true
            }

            FocusLockTheme(darkTheme = isDark) {
                val navController = rememberNavController()
                FocusLockNavGraph(navController = navController)
            }
        }
    }
}
