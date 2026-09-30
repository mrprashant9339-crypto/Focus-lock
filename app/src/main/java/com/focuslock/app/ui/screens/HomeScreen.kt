package com.focuslock.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.focuslock.app.ui.theme.*
import com.focuslock.app.viewmodel.HomeViewModel

@Composable
fun HomeScreen(
    viewModel: HomeViewModel,
    onNavigateToTimer: () -> Unit,
    onNavigateToProfiles: () -> Unit,
    onNavigateToApps: () -> Unit,
    modifier: Modifier = Modifier
) {
    val uiState by viewModel.uiState.collectAsState()

    val hour = java.util.Calendar.getInstance().get(java.util.Calendar.HOUR_OF_DAY)
    val greeting = when {
        hour < 12 -> "Good morning"
        hour < 18 -> "Good afternoon"
        else -> "Good evening"
    }

    val activeSession = uiState.activeSession
    val stats = uiState.todayStats

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .background(Slate950)
            .padding(horizontal = 20.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Spacer(modifier = Modifier.height(8.dp))
            // Greeting & Header
            Text(
                text = "$greeting, Friend",
                fontSize = 24.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White
            )
            Text(
                text = "Conscious control over your digital attention.",
                fontSize = 13.sp,
                color = Slate400,
                modifier = Modifier.padding(top = 2.dp)
            )
        }

        // Hero Card
        item {
            Card(
                shape = RoundedCornerShape(24.dp),
                colors = CardDefaults.cardColors(containerColor = Slate900),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(20.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "TODAY'S FOCUS",
                            color = EmeraldPrimary,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            letterSpacing = 1.sp
                        )

                        Surface(
                            shape = CircleShape,
                            color = Color(0x2010B981)
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
                            ) {
                                Box(
                                    modifier = Modifier
                                        .size(6.dp)
                                        .background(EmeraldPrimary, CircleShape)
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(
                                    text = if (activeSession?.isRunning == true) "Session Active" else "Guardian Active",
                                    fontSize = 11.sp,
                                    color = EmeraldPrimary,
                                    fontWeight = FontWeight.SemiBold
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    val focusMinutes = stats?.totalFocusMinutes ?: 138
                    val hrs = focusMinutes / 60
                    val mins = focusMinutes % 60
                    val formatted = if (hrs > 0) "${hrs}h ${mins}m" else "${mins}m"

                    Text(
                        text = "$formatted protected",
                        fontSize = 32.sp,
                        fontWeight = FontWeight.ExtraBold,
                        fontFamily = FontFamily.Monospace,
                        color = Color.White
                    )

                    Spacer(modifier = Modifier.height(18.dp))

                    // 3 Metric Counters
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(Color(0x15FFFFFF), RoundedCornerShape(16.dp))
                            .padding(vertical = 12.dp, horizontal = 8.dp),
                        horizontalArrangement = Arrangement.SpaceEvenly
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text("Screen Time", fontSize = 10.sp, color = Slate400)
                            Text(
                                "${stats?.totalScreenTimeMinutes ?: 195}m",
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color.White
                            )
                        }
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text("Focus Time", fontSize = 10.sp, color = Slate400)
                            Text(
                                "$formatted",
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold,
                                color = EmeraldPrimary
                            )
                        }
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text("Streak", fontSize = 10.sp, color = Slate400)
                            Text(
                                "${stats?.currentStreakDays ?: 6} days",
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold,
                                color = AmberStreak
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(18.dp))

                    Button(
                        onClick = onNavigateToTimer,
                        colors = ButtonDefaults.buttonColors(containerColor = EmeraldPrimary),
                        shape = RoundedCornerShape(16.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(50.dp)
                    ) {
                        Icon(
                            imageVector = if (activeSession?.isRunning == true) Icons.Default.Visibility else Icons.Default.PlayArrow,
                            contentDescription = null,
                            tint = Slate950
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = if (activeSession?.isRunning == true) "View Active Focus Session" else "Start Focus Session",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold,
                            color = Slate950
                        )
                    }
                }
            }
        }

        // Active Profile Card
        item {
            Card(
                shape = RoundedCornerShape(18.dp),
                colors = CardDefaults.cardColors(containerColor = Slate900),
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { onNavigateToProfiles() }
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(40.dp)
                                .background(Color(0x2010B981), RoundedCornerShape(12.dp)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.Tune,
                                contentDescription = null,
                                tint = EmeraldPrimary,
                                modifier = Modifier.size(20.dp)
                            )
                        }
                        Column {
                            Text(
                                text = "CURRENT PROFILE",
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold,
                                color = Slate400
                            )
                            Text(
                                text = uiState.activeProfile?.name ?: "Deep Work",
                                fontSize = 15.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color.White
                            )
                        }
                    }

                    Icon(
                        imageVector = Icons.Default.ChevronRight,
                        contentDescription = "Open Profiles",
                        tint = Slate400
                    )
                }
            }
        }

        // Today At A Glance (3 Stats Cards)
        item {
            Text(
                text = "TODAY AT A GLANCE",
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                color = Slate400,
                letterSpacing = 1.sp
            )
            Spacer(modifier = Modifier.height(6.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Card(
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = Slate900)
                ) {
                    Column(
                        modifier = Modifier.padding(14.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text("Time Saved", fontSize = 10.sp, color = Slate400)
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            "+2h 42m",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            color = EmeraldPrimary,
                            fontFamily = FontFamily.Monospace
                        )
                    }
                }

                Card(
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = Slate900)
                ) {
                    Column(
                        modifier = Modifier.padding(14.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text("Blocked Loops", fontSize = 10.sp, color = Slate400)
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            "${stats?.blockedInterceptionsCount ?: 18}",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            color = IndigoCalm,
                            fontFamily = FontFamily.Monospace
                        )
                    }
                }

                Card(
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = Slate900)
                ) {
                    Column(
                        modifier = Modifier.padding(14.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text("Sessions", fontSize = 10.sp, color = Slate400)
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            "${stats?.completedSessionsCount ?: 4}",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            color = AmberStreak,
                            fontFamily = FontFamily.Monospace
                        )
                    }
                }
            }
        }

        // Motivational Quote Card
        item {
            Card(
                shape = RoundedCornerShape(18.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0x1010B981)),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier.padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.AutoAwesome,
                        contentDescription = null,
                        tint = EmeraldPrimary,
                        modifier = Modifier.size(24.dp)
                    )
                    Column {
                        Text(
                            text = "“Attention is the currency of your life. Guard where you spend it.”",
                            fontSize = 12.sp,
                            color = Color(0xFFD1FAE5),
                            fontWeight = FontWeight.Medium
                        )
                        Text(
                            text = "Discipline milestone: 6 consecutive days",
                            fontSize = 10.sp,
                            color = EmeraldPrimary,
                            modifier = Modifier.padding(top = 2.dp)
                        )
                    }
                }
            }
            Spacer(modifier = Modifier.height(16.dp))
        }
    }
}
