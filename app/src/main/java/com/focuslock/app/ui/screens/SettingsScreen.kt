package com.focuslock.app.ui.screens

import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.focuslock.app.domain.model.ThemeMode
import com.focuslock.app.ui.theme.*
import com.focuslock.app.viewmodel.SettingsViewModel

@Composable
fun SettingsScreen(
    viewModel: SettingsViewModel,
    onNavigateToPermissions: () -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val uiState by viewModel.uiState.collectAsState()
    val settings = uiState.settings

    LaunchedEffect(uiState.saveSuccessMessage) {
        uiState.saveSuccessMessage?.let { msg ->
            Toast.makeText(context, msg, Toast.LENGTH_SHORT).show()
            viewModel.clearFeedback()
        }
    }

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .background(Slate950)
            .padding(horizontal = 20.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = "Settings",
                fontSize = 24.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White
            )
            Text(
                text = "Hardware security, strict mode, and session preferences.",
                fontSize = 13.sp,
                color = Slate400,
                modifier = Modifier.padding(top = 2.dp)
            )
        }

        // Section: Security & Biometrics
        item {
            Text(
                text = "PROTECTION & SECURITY",
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                color = Slate400,
                letterSpacing = 1.sp
            )
            Spacer(modifier = Modifier.height(8.dp))
            Card(
                shape = RoundedCornerShape(18.dp),
                colors = CardDefaults.cardColors(containerColor = Slate900),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
                    // Biometric Setting
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text("Biometric Settings Lock", fontWeight = FontWeight.Bold, color = Color.White, fontSize = 14.sp)
                            Text("Requires fingerprint or device PIN before disabling protection or modifying rules.", color = Slate400, fontSize = 11.sp)
                        }
                        Switch(
                            checked = settings.biometricEnabled,
                            onCheckedChange = { viewModel.toggleBiometric(it) },
                            colors = SwitchDefaults.colors(
                                checkedThumbColor = Slate950,
                                checkedTrackColor = EmeraldPrimary
                            )
                        )
                    }

                    HorizontalDivider(color = Slate800)

                    // Strict Mode Setting
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text("Strict Mode Enforcement", fontWeight = FontWeight.Bold, color = Color.White, fontSize = 14.sp)
                            Text("Prevents stopping or pausing focus sessions once initiated.", color = Slate400, fontSize = 11.sp)
                        }
                        Switch(
                            checked = settings.strictModeEnabled,
                            onCheckedChange = { viewModel.toggleStrictMode(it) },
                            colors = SwitchDefaults.colors(
                                checkedThumbColor = Slate950,
                                checkedTrackColor = RoseBlock
                            )
                        )
                    }

                    HorizontalDivider(color = Slate800)

                    // Emergency Unlock Delay
                    Column {
                        Text("Emergency Unlock Friction Delay", fontWeight = FontWeight.Bold, color = Color.White, fontSize = 14.sp)
                        Text("Forces a mindful waiting pause before emergency bypass.", color = Slate400, fontSize = 11.sp)
                        Spacer(modifier = Modifier.height(10.dp))
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            listOf(30, 60, 120).forEach { secs ->
                                val isSelected = settings.emergencyUnlockDelaySeconds == secs
                                Surface(
                                    shape = RoundedCornerShape(10.dp),
                                    color = if (isSelected) EmeraldPrimary else Slate800,
                                    modifier = Modifier.clickable { viewModel.setEmergencyDelay(secs) }
                                ) {
                                    Text(
                                        text = "${secs}s Delay",
                                        color = if (isSelected) Slate950 else Color.White,
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 12.sp,
                                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }

        // Section: Session & Timing Defaults
        item {
            Text(
                text = "DEFAULT TIMING",
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                color = Slate400,
                letterSpacing = 1.sp
            )
            Spacer(modifier = Modifier.height(8.dp))
            Card(
                shape = RoundedCornerShape(18.dp),
                colors = CardDefaults.cardColors(containerColor = Slate900),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
                    Text("Default Focus Duration", fontWeight = FontWeight.Bold, color = Color.White, fontSize = 14.sp)
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        listOf(15, 25, 45, 60).forEach { mins ->
                            val isSelected = settings.defaultFocusDurationMinutes == mins
                            Surface(
                                shape = RoundedCornerShape(10.dp),
                                color = if (isSelected) EmeraldPrimary else Slate800,
                                modifier = Modifier.clickable { viewModel.setFocusDuration(mins) }
                            ) {
                                Text(
                                    text = "${mins}m",
                                    color = if (isSelected) Slate950 else Color.White,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 12.sp,
                                    modifier = Modifier.padding(horizontal = 14.dp, vertical = 6.dp)
                                )
                            }
                        }
                    }

                    HorizontalDivider(color = Slate800)

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("Sound & Chimes", color = Color.White, fontSize = 13.sp)
                        Switch(
                            checked = settings.soundEnabled,
                            onCheckedChange = { viewModel.toggleSoundAndVibration(it, settings.vibrationEnabled) },
                            colors = SwitchDefaults.colors(checkedThumbColor = Slate950, checkedTrackColor = EmeraldPrimary)
                        )
                    }

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("Vibration Haptics", color = Color.White, fontSize = 13.sp)
                        Switch(
                            checked = settings.vibrationEnabled,
                            onCheckedChange = { viewModel.toggleSoundAndVibration(settings.soundEnabled, it) },
                            colors = SwitchDefaults.colors(checkedThumbColor = Slate950, checkedTrackColor = EmeraldPrimary)
                        )
                    }
                }
            }
        }

        // Section: System & Permissions
        item {
            Card(
                shape = RoundedCornerShape(18.dp),
                colors = CardDefaults.cardColors(containerColor = Slate900),
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { onNavigateToPermissions() }
            ) {
                Row(
                    modifier = Modifier.padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Icon(Icons.Default.Security, contentDescription = null, tint = EmeraldPrimary)
                        Column {
                            Text("Permission & OEM Setup", fontWeight = FontWeight.Bold, color = Color.White, fontSize = 14.sp)
                            Text("Manage Usage Access, Overlay, and Battery Exemption", color = Slate400, fontSize = 11.sp)
                        }
                    }
                    Icon(Icons.Default.ChevronRight, contentDescription = null, tint = Slate400)
                }
            }
        }

        // Section: Appearance Theme
        item {
            Text(
                text = "APPEARANCE",
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                color = Slate400,
                letterSpacing = 1.sp
            )
            Spacer(modifier = Modifier.height(8.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                ThemeMode.entries.forEach { mode ->
                    val isSelected = settings.themeMode == mode
                    Card(
                        modifier = Modifier
                            .weight(1f)
                            .clickable { viewModel.setThemeMode(mode) },
                        shape = RoundedCornerShape(14.dp),
                        colors = CardDefaults.cardColors(
                            containerColor = if (isSelected) Color(0x2010B981) else Slate900
                        )
                    ) {
                        Column(
                            modifier = Modifier.padding(12.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Icon(
                                imageVector = when (mode) {
                                    ThemeMode.SYSTEM -> Icons.Default.BrightnessAuto
                                    ThemeMode.LIGHT -> Icons.Default.LightMode
                                    ThemeMode.DARK -> Icons.Default.DarkMode
                                },
                                contentDescription = null,
                                tint = if (isSelected) EmeraldPrimary else Slate400
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = mode.name.lowercase().replaceFirstChar { it.uppercase() },
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (isSelected) EmeraldPrimary else Color.White
                            )
                        }
                    }
                }
            }
        }

        // Section: Account & Sign Out
        item {
            Spacer(modifier = Modifier.height(4.dp))
            Button(
                onClick = { viewModel.signOut() },
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF1E293B)),
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(48.dp)
            ) {
                Icon(Icons.Default.ExitToApp, contentDescription = null, tint = Slate400)
                Spacer(modifier = Modifier.width(8.dp))
                Text("Sign Out", color = Color.White, fontWeight = FontWeight.Bold)
            }
            Spacer(modifier = Modifier.height(24.dp))
        }
    }
}
