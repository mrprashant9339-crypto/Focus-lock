package com.focuslock.app.ui.screens

import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
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
import com.focuslock.app.ui.components.TimerProgressRing
import com.focuslock.app.ui.theme.*
import com.focuslock.app.viewmodel.FocusTimerViewModel

@Composable
fun FocusTimerScreen(
    viewModel: FocusTimerViewModel,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val uiState by viewModel.uiState.collectAsState()

    val session = uiState.activeSession
    val isRunning = session?.isRunning == true
    val isPaused = session?.isPaused == true
    val hasActiveSession = isRunning || isPaused

    val durationPresets = listOf(15, 25, 45, 60)

    LaunchedEffect(uiState.errorMessage) {
        uiState.errorMessage?.let { msg ->
            Toast.makeText(context, msg, Toast.LENGTH_LONG).show()
            viewModel.clearError()
        }
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(Slate950)
            .verticalScroll(rememberScrollState())
            .padding(20.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(20.dp)
    ) {
        // Profile Selector Pills
        LazyRow(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            items(uiState.availableProfiles) { profile ->
                val isSelected = profile.id == (session?.profileId ?: uiState.activeProfile?.id)
                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = if (isSelected) EmeraldPrimary else Slate900,
                    modifier = Modifier.defaultMinSize(minHeight = 36.dp)
                ) {
                    TextButton(
                        onClick = { if (!hasActiveSession) viewModel.selectProfile(profile.id) },
                        contentPadding = PaddingValues(horizontal = 14.dp, vertical = 6.dp)
                    ) {
                        Text(
                            text = profile.name,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = if (isSelected) Slate950 else Color.White
                        )
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(10.dp))

        // Center Precision Timer Ring
        val remainingSecs = session?.remainingSeconds ?: (uiState.selectedDurationMinutes * 60)
        val progress = session?.progress ?: 0f

        TimerProgressRing(
            remainingSeconds = remainingSecs,
            progress = progress,
            isPaused = isPaused
        )

        // Session Goal Input / Display
        if (hasActiveSession) {
            Surface(
                shape = RoundedCornerShape(14.dp),
                color = Slate900,
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier.padding(14.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Target,
                        contentDescription = null,
                        tint = EmeraldPrimary,
                        modifier = Modifier.size(20.dp)
                    )
                    Column {
                        Text(
                            text = "CURRENT INTENTION",
                            fontSize = 10.sp,
                            color = Slate400,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = session?.goal ?: "Conscious Deep Work",
                            fontSize = 13.sp,
                            color = Color.White,
                            fontWeight = FontWeight.Medium
                        )
                    }
                }
            }
        } else {
            // Duration Presets
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                durationPresets.forEach { mins ->
                    val isSelected = uiState.selectedDurationMinutes == mins
                    Button(
                        onClick = { viewModel.setDuration(mins) },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = if (isSelected) Color(0x2510B981) else Slate900
                        ),
                        shape = RoundedCornerShape(14.dp),
                        modifier = Modifier
                            .weight(1f)
                            .height(44.dp)
                    ) {
                        Text(
                            text = "${mins}m",
                            color = if (isSelected) EmeraldPrimary else Color.White,
                            fontWeight = FontWeight.Bold,
                            fontSize = 13.sp
                        )
                    }
                }
            }

            // Custom Goal Input
            OutlinedTextField(
                value = uiState.goalInput,
                onValueChange = { viewModel.setGoal(it) },
                label = { Text("Session Goal / Intention") },
                placeholder = { Text("What will you accomplish?") },
                colors = OutlinedTextFieldDefaults.colors(
                    focusedTextColor = Color.White,
                    unfocusedTextColor = Color.White,
                    focusedBorderColor = EmeraldPrimary,
                    unfocusedBorderColor = Slate800,
                    focusedLabelColor = EmeraldPrimary,
                    unfocusedLabelColor = Slate400
                ),
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier.fillMaxWidth()
            )
        }

        Spacer(modifier = Modifier.height(10.dp))

        // Timer Control Buttons
        if (!hasActiveSession) {
            Button(
                onClick = { viewModel.startFocus(context) },
                colors = ButtonDefaults.buttonColors(containerColor = EmeraldPrimary),
                shape = RoundedCornerShape(18.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(54.dp)
            ) {
                Icon(Icons.Default.PlayArrow, contentDescription = null, tint = Slate950)
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "Begin Focus (${uiState.selectedDurationMinutes} Min)",
                    color = Slate950,
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Bold
                )
            }
        } else {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                if (isRunning) {
                    Button(
                        onClick = { viewModel.pauseFocus(context) },
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFF59E0B)),
                        shape = RoundedCornerShape(16.dp),
                        modifier = Modifier
                            .weight(1f)
                            .height(52.dp)
                    ) {
                        Icon(Icons.Default.Pause, contentDescription = null, tint = Slate950)
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Pause", color = Slate950, fontWeight = FontWeight.Bold)
                    }
                } else {
                    Button(
                        onClick = { viewModel.resumeFocus(context) },
                        colors = ButtonDefaults.buttonColors(containerColor = EmeraldPrimary),
                        shape = RoundedCornerShape(16.dp),
                        modifier = Modifier
                            .weight(1f)
                            .height(52.dp)
                    ) {
                        Icon(Icons.Default.PlayArrow, contentDescription = null, tint = Slate950)
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Resume", color = Slate950, fontWeight = FontWeight.Bold)
                    }
                }

                Button(
                    onClick = { viewModel.stopFocus(context) },
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF1E293B)),
                    shape = RoundedCornerShape(16.dp),
                    modifier = Modifier
                        .weight(1f)
                        .height(52.dp)
                ) {
                    Icon(Icons.Default.Stop, contentDescription = null, tint = RoseBlock)
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("Stop", color = Color.White, fontWeight = FontWeight.Bold)
                }
            }
        }

        // Strict Mode Info Note
        if (uiState.activeProfile?.isStrict == true) {
            Surface(
                color = Color(0x15F43F5E),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier.padding(12.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Icon(Icons.Default.Lock, contentDescription = null, tint = RoseBlock, modifier = Modifier.size(16.dp))
                    Text(
                        text = "Strict Mode Active: Emergency unlock requires biometrics and friction pause.",
                        color = Color(0xFFFECDD3),
                        fontSize = 11.sp
                    )
                }
            }
        }
    }
}
