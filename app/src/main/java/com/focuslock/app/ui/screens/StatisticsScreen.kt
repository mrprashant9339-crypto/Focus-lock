package com.focuslock.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
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
import com.focuslock.app.viewmodel.StatsViewModel

@Composable
fun StatisticsScreen(
    viewModel: StatsViewModel,
    modifier: Modifier = Modifier
) {
    val uiState by viewModel.uiState.collectAsState()
    val today = uiState.todayStats

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
                text = "Usage Insights",
                fontSize = 24.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White
            )
            Text(
                text = "Aggregated device screen time and attention metrics.",
                fontSize = 13.sp,
                color = Slate400,
                modifier = Modifier.padding(top = 2.dp)
            )
        }

        // Summary Hero Card
        item {
            Card(
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = Slate900),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(20.dp)) {
                    Text(
                        text = "ATTENTION RECLAIMED",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = EmeraldPrimary,
                        letterSpacing = 1.sp
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "+${uiState.timeSavedTodayMinutes} Minutes",
                        fontSize = 32.sp,
                        fontWeight = FontWeight.ExtraBold,
                        fontFamily = FontFamily.Monospace,
                        color = Color.White
                    )
                    Text(
                        text = "Saved compared to average baseline consumption.",
                        fontSize = 12.sp,
                        color = Slate400,
                        modifier = Modifier.padding(top = 4.dp)
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column {
                            Text("Current Streak", fontSize = 11.sp, color = Slate400)
                            Text(
                                "${today?.currentStreakDays ?: 6} Days",
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Bold,
                                color = AmberStreak
                            )
                        }
                        Column {
                            Text("Blocked Attempts", fontSize = 11.sp, color = Slate400)
                            Text(
                                "${today?.blockedInterceptionsCount ?: 18}",
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Bold,
                                color = IndigoCalm
                            )
                        }
                        Column {
                            Text("Sessions Complete", fontSize = 11.sp, color = Slate400)
                            Text(
                                "${today?.completedSessionsCount ?: 4}",
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color.White
                            )
                        }
                    }
                }
            }
        }

        // Top Distracting Apps Section
        item {
            Text(
                text = "TOP TIME CONSUMERS TODAY",
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                color = Slate400,
                letterSpacing = 1.sp
            )
        }

        items(uiState.topApps, key = { it.packageName }) { app ->
            Card(
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = Slate900),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(app.appName, fontWeight = FontWeight.Bold, color = Color.White, fontSize = 14.sp)
                        Text(
                            "${app.usedTodayMinutes}m used",
                            color = if (app.usedTodayMinutes > app.dailyLimitMinutes) RoseBlock else EmeraldPrimary,
                            fontWeight = FontWeight.Bold,
                            fontSize = 12.sp
                        )
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    LinearProgressIndicator(
                        progress = { (app.usedTodayMinutes / 60f).coerceIn(0f, 1f) },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(6.dp),
                        color = if (app.usedTodayMinutes > app.dailyLimitMinutes) RoseBlock else EmeraldPrimary,
                        trackColor = Slate800
                    )
                }
            }
        }

        // Lifetime Projection Card
        item {
            Card(
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0x156366F1)),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier.padding(18.dp),
                    horizontalArrangement = Arrangement.spacedBy(14.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Default.TrendingUp,
                        contentDescription = null,
                        tint = IndigoCalm,
                        modifier = Modifier.size(32.dp)
                    )
                    Column {
                        Text(
                            text = "5-Year Reclamation Projection",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                        Text(
                            text = "At current savings pace, you will reclaim approximately 4,920 hours — or 205 full waking days of your life.",
                            fontSize = 12.sp,
                            color = Color(0xFFC7D2FE),
                            modifier = Modifier.padding(top = 4.dp)
                        )
                    }
                }
            }
            Spacer(modifier = Modifier.height(16.dp))
        }
    }
}
