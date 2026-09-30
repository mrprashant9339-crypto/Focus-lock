package com.focuslock.app.services

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.focuslock.app.domain.model.InterventionType
import com.focuslock.app.ui.theme.FocusLockTheme
import kotlinx.coroutines.delay

class AppBlockOverlayActivity : ComponentActivity() {

    companion object {
        const val EXTRA_PACKAGE_NAME = "EXTRA_PACKAGE_NAME"
        const val EXTRA_APP_NAME = "EXTRA_APP_NAME"
        const val EXTRA_PROFILE_NAME = "EXTRA_PROFILE_NAME"
        const val EXTRA_INTERVENTION_TYPE = "EXTRA_INTERVENTION_TYPE"
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val appName = intent.getStringExtra(EXTRA_APP_NAME) ?: "Distracting App"
        val profileName = intent.getStringExtra(EXTRA_PROFILE_NAME) ?: "Focus Mode"
        val interventionName = intent.getStringExtra(EXTRA_INTERVENTION_TYPE) ?: InterventionType.BREATHING.name
        val intervention = try {
            InterventionType.valueOf(interventionName)
        } catch (_: Exception) {
            InterventionType.BREATHING
        }

        setContent {
            FocusLockTheme(darkTheme = true) {
                // Intercept back button to return to home screen, never to the blocked app
                BackHandler {
                    returnToHomeScreen()
                }

                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = Color(0xFF0F172A)
                ) {
                    when (intervention) {
                        InterventionType.BREATHING -> BreathingInterventionScreen(
                            appName = appName,
                            profileName = profileName,
                            onExit = { returnToHomeScreen() },
                            onUnlock = { finish() }
                        )
                        InterventionType.WAIT_TIMER -> WaitTimerInterventionScreen(
                            appName = appName,
                            profileName = profileName,
                            onExit = { returnToHomeScreen() },
                            onUnlock = { finish() }
                        )
                        InterventionType.INTENTION_CHECK -> IntentionCheckScreen(
                            appName = appName,
                            profileName = profileName,
                            onExit = { returnToHomeScreen() },
                            onUnlock = { finish() }
                        )
                        InterventionType.ROTATE_PHONE -> RotatePhoneScreen(
                            appName = appName,
                            profileName = profileName,
                            onExit = { returnToHomeScreen() },
                            onUnlock = { finish() }
                        )
                        InterventionType.STRICT_LOCK -> StrictLockScreen(
                            appName = appName,
                            profileName = profileName,
                            onExit = { returnToHomeScreen() }
                        )
                    }
                }
            }
        }
    }

    private fun returnToHomeScreen() {
        val homeIntent = Intent(Intent.ACTION_MAIN).apply {
            addCategory(Intent.CATEGORY_HOME)
            flags = Intent.FLAG_ACTIVITY_NEW_TASK
        }
        startActivity(homeIntent)
        finish()
    }
}

@Composable
fun BreathingInterventionScreen(
    appName: String,
    profileName: String,
    onExit: () -> Unit,
    onUnlock: () -> Unit
) {
    var breathPhase by remember { mutableStateOf("Inhale...") }
    var cycleCount by remember { mutableIntStateOf(0) }
    val maxCycles = 3

    val infiniteTransition = rememberInfiniteTransition(label = "breath")
    val scale by infiniteTransition.animateFloat(
        initialValue = 0.85f,
        targetValue = 1.35f,
        animationSpec = infiniteRepeatable(
            animation = tween(4000, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "scale"
    )

    LaunchedEffect(scale) {
        breathPhase = if (scale > 1.1f) "Exhale slowly..." else "Inhale deeply..."
    }

    LaunchedEffect(Unit) {
        repeat(maxCycles) {
            delay(8000)
            cycleCount++
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.SpaceBetween
    ) {
        // Top Header
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Spacer(modifier = Modifier.height(32.dp))
            Surface(
                color = Color(0x2010B981),
                shape = RoundedCornerShape(12.dp)
            ) {
                Text(
                    text = "GUARDED BY $profileName",
                    color = Color(0xFF10B981),
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
                )
            }
            Spacer(modifier = Modifier.height(12.dp))
            Text(
                text = "Take a Mindful Breath",
                color = Color.White,
                fontSize = 24.sp,
                fontWeight = FontWeight.Bold
            )
            Text(
                text = "Before stepping into $appName, check in with yourself.",
                color = Color(0xFF94A3B8),
                fontSize = 13.sp,
                textAlign = TextAlign.Center,
                modifier = Modifier.padding(horizontal = 24.dp, vertical = 6.dp)
            )
        }

        // Center Breathing Circle
        Box(
            modifier = Modifier.size(240.dp),
            contentAlignment = Alignment.Center
        ) {
            Box(
                modifier = Modifier
                    .size(200.dp)
                    .scale(scale)
                    .background(Color(0x2010B981), CircleShape)
            )
            Box(
                modifier = Modifier
                    .size(130.dp)
                    .background(Color(0xFF10B981), CircleShape),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = breathPhase,
                    color = Color.White,
                    fontWeight = FontWeight.Bold,
                    fontSize = 14.sp,
                    textAlign = TextAlign.Center
                )
            }
        }

        // Bottom Actions
        Column(
            modifier = Modifier.fillMaxWidth(),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = "Cycle ${cycleCount.coerceAtMost(maxCycles)} of $maxCycles",
                color = Color(0xFF64748B),
                fontSize = 12.sp,
                modifier = Modifier.padding(bottom = 16.dp)
            )

            Button(
                onClick = onExit,
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF10B981)),
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(52.dp)
            ) {
                Icon(Icons.Default.Shield, contentDescription = null, tint = Color(0xFF0F172A))
                Spacer(modifier = Modifier.width(8.dp))
                Text("Return to Safety & Focus", color = Color(0xFF0F172A), fontWeight = FontWeight.Bold)
            }

            Spacer(modifier = Modifier.height(10.dp))

            if (cycleCount >= maxCycles) {
                TextButton(
                    onClick = onUnlock,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(
                        "I am conscious of my intent • Open $appName",
                        color = Color(0xFF94A3B8),
                        fontSize = 12.sp
                    )
                }
            } else {
                Text(
                    "Finish 3 breaths to evaluate unlock option",
                    color = Color(0xFF475569),
                    fontSize = 11.sp,
                    modifier = Modifier.padding(vertical = 12.dp)
                )
            }
            Spacer(modifier = Modifier.height(16.dp))
        }
    }
}

@Composable
fun WaitTimerInterventionScreen(
    appName: String,
    profileName: String,
    onExit: () -> Unit,
    onUnlock: () -> Unit
) {
    var remainingSeconds by remember { mutableIntStateOf(30) }

    LaunchedEffect(Unit) {
        while (remainingSeconds > 0) {
            delay(1000)
            remainingSeconds--
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.SpaceBetween
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Spacer(modifier = Modifier.height(32.dp))
            Surface(
                color = Color(0x20F59E0B),
                shape = RoundedCornerShape(12.dp)
            ) {
                Text(
                    text = "30-SECOND PATIENCE PAUSE",
                    color = Color(0xFFF59E0B),
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
                )
            }
            Spacer(modifier = Modifier.height(12.dp))
            Text(
                text = "Is this what you planned to do?",
                color = Color.White,
                fontSize = 22.sp,
                fontWeight = FontWeight.Bold,
                textAlign = TextAlign.Center
            )
            Text(
                text = "$profileName is active. Breaking the automatic dopamine loop.",
                color = Color(0xFF94A3B8),
                fontSize = 13.sp,
                textAlign = TextAlign.Center,
                modifier = Modifier.padding(horizontal = 16.dp, vertical = 6.dp)
            )
        }

        // Circular Timer
        Box(
            modifier = Modifier.size(180.dp),
            contentAlignment = Alignment.Center
        ) {
            CircularProgressIndicator(
                progress = { (30 - remainingSeconds) / 30f },
                modifier = Modifier.fillMaxSize(),
                color = Color(0xFFF59E0B),
                strokeWidth = 8.dp,
                trackColor = Color(0xFF1E293B)
            )
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text(
                    text = "$remainingSeconds",
                    color = Color.White,
                    fontSize = 48.sp,
                    fontWeight = FontWeight.ExtraBold
                )
                Text(
                    text = "SECONDS",
                    color = Color(0xFF94A3B8),
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold
                )
            }
        }

        Column(modifier = Modifier.fillMaxWidth()) {
            Button(
                onClick = onExit,
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF10B981)),
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(52.dp)
            ) {
                Text("Put Phone Down", color = Color(0xFF0F172A), fontWeight = FontWeight.Bold)
            }
            Spacer(modifier = Modifier.height(8.dp))
            if (remainingSeconds == 0) {
                OutlinedButton(
                    onClick = onUnlock,
                    shape = RoundedCornerShape(16.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text("Proceed to $appName", color = Color(0xFFF59E0B))
                }
            }
        }
    }
}

@Composable
fun IntentionCheckScreen(
    appName: String,
    profileName: String,
    onExit: () -> Unit,
    onUnlock: () -> Unit
) {
    var intentionText by remember { mutableStateOf("") }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.SpaceBetween
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Spacer(modifier = Modifier.height(32.dp))
            Text(
                text = "State Your Intention",
                color = Color.White,
                fontSize = 24.sp,
                fontWeight = FontWeight.Bold
            )
            Text(
                text = "Why do you need to open $appName right now?",
                color = Color(0xFF94A3B8),
                fontSize = 13.sp,
                textAlign = TextAlign.Center,
                modifier = Modifier.padding(vertical = 6.dp)
            )
        }

        OutlinedTextField(
            value = intentionText,
            onValueChange = { intentionText = it },
            placeholder = { Text("e.g. Reply to work message from colleague") },
            colors = OutlinedTextFieldDefaults.colors(
                focusedTextColor = Color.White,
                unfocusedTextColor = Color.White,
                focusedBorderColor = Color(0xFF10B981),
                unfocusedBorderColor = Color(0xFF334155)
            ),
            shape = RoundedCornerShape(16.dp),
            modifier = Modifier
                .fillMaxWidth()
                .height(120.dp)
        )

        Column(modifier = Modifier.fillMaxWidth()) {
            Button(
                onClick = onExit,
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF10B981)),
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(52.dp)
            ) {
                Text("Cancel & Stay Focused", color = Color(0xFF0F172A), fontWeight = FontWeight.Bold)
            }

            Spacer(modifier = Modifier.height(8.dp))

            Button(
                onClick = onUnlock,
                enabled = intentionText.trim().length >= 8,
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF1E293B)),
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("Open with Intention", color = Color.White)
            }
        }
    }
}

@Composable
fun RotatePhoneScreen(
    appName: String,
    profileName: String,
    onExit: () -> Unit,
    onUnlock: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.SpaceBetween
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Spacer(modifier = Modifier.height(32.dp))
            Text(
                text = "Tactile Reset",
                color = Color.White,
                fontSize = 24.sp,
                fontWeight = FontWeight.Bold
            )
            Text(
                text = "Physically turn your device upside-down to break muscle memory.",
                color = Color(0xFF94A3B8),
                fontSize = 13.sp,
                textAlign = TextAlign.Center
            )
        }

        Icon(
            imageVector = Icons.Default.Refresh,
            contentDescription = null,
            tint = Color(0xFF10B981),
            modifier = Modifier.size(96.dp)
        )

        Button(
            onClick = onExit,
            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF10B981)),
            shape = RoundedCornerShape(16.dp),
            modifier = Modifier
                .fillMaxWidth()
                .height(52.dp)
        ) {
            Text("Done, Returning to Safety", color = Color(0xFF0F172A), fontWeight = FontWeight.Bold)
        }
    }
}

@Composable
fun StrictLockScreen(
    appName: String,
    profileName: String,
    onExit: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.SpaceBetween
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Spacer(modifier = Modifier.height(32.dp))
            Surface(
                color = Color(0x20F43F5E),
                shape = RoundedCornerShape(12.dp)
            ) {
                Text(
                    text = "STRICT LOCK ACTIVE",
                    color = Color(0xFFF43F5E),
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
                )
            }
            Spacer(modifier = Modifier.height(16.dp))
            Text(
                text = "$appName is Locked",
                color = Color.White,
                fontSize = 26.sp,
                fontWeight = FontWeight.Bold
            )
            Text(
                text = "$profileName does not permit opening $appName during this scheduled focus window.",
                color = Color(0xFF94A3B8),
                fontSize = 13.sp,
                textAlign = TextAlign.Center,
                modifier = Modifier.padding(horizontal = 24.dp, vertical = 8.dp)
            )
        }

        Box(
            modifier = Modifier
                .size(120.dp)
                .background(Color(0x15F43F5E), CircleShape),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = Icons.Default.Lock,
                contentDescription = null,
                tint = Color(0xFFF43F5E),
                modifier = Modifier.size(56.dp)
            )
        }

        Button(
            onClick = onExit,
            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFF43F5E)),
            shape = RoundedCornerShape(16.dp),
            modifier = Modifier
                .fillMaxWidth()
                .height(52.dp)
        ) {
            Text("Back to Safety", color = Color.White, fontWeight = FontWeight.Bold)
        }
    }
}
