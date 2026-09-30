package com.focuslock.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.focuslock.app.domain.model.AppCategory
import com.focuslock.app.domain.model.BlockedApp
import com.focuslock.app.domain.model.InterventionType
import com.focuslock.app.ui.theme.*
import com.focuslock.app.viewmodel.BlockedAppsViewModel

@Composable
fun BlockedAppsScreen(
    viewModel: BlockedAppsViewModel,
    modifier: Modifier = Modifier
) {
    val uiState by viewModel.uiState.collectAsState()
    var selectedAppForIntervention by remember { mutableStateOf<BlockedApp?>(null) }

    val categories = listOf("All") + AppCategory.entries.map { it.name }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(Slate950)
            .padding(horizontal = 20.dp)
    ) {
        Spacer(modifier = Modifier.height(8.dp))

        // Search bar
        OutlinedTextField(
            value = uiState.searchQuery,
            onValueChange = { viewModel.onSearchQueryChanged(it) },
            placeholder = { Text("Search installed applications...") },
            leadingIcon = { Icon(Icons.Default.Search, contentDescription = null, tint = Slate400) },
            colors = OutlinedTextFieldDefaults.colors(
                focusedTextColor = Color.White,
                unfocusedTextColor = Color.White,
                focusedBorderColor = EmeraldPrimary,
                unfocusedBorderColor = Slate800,
                focusedContainerColor = Slate900,
                unfocusedContainerColor = Slate900
            ),
            shape = RoundedCornerShape(16.dp),
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(modifier = Modifier.height(12.dp))

        // Category Filter Chips
        LazyRow(
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            items(categories) { cat ->
                val isSelected = uiState.selectedCategory.equals(cat, ignoreCase = true)
                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = if (isSelected) EmeraldPrimary else Slate900,
                    modifier = Modifier.clickable { viewModel.onCategorySelected(cat) }
                ) {
                    Text(
                        text = if (cat == "All") "All Apps" else cat.lowercase().replaceFirstChar { it.uppercase() },
                        fontSize = 12.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = if (isSelected) Slate950 else Color.White,
                        modifier = Modifier.padding(horizontal = 14.dp, vertical = 8.dp)
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // Apps List
        LazyColumn(
            verticalArrangement = Arrangement.spacedBy(10.dp),
            modifier = Modifier.fillMaxSize()
        ) {
            items(uiState.apps, key = { it.packageName }) { app ->
                AppRowCard(
                    app = app,
                    onToggleBlock = { viewModel.toggleAppBlocked(app) },
                    onConfigureRule = { selectedAppForIntervention = app }
                )
            }
        }
    }

    // Intervention Rule Picker Dialog
    selectedAppForIntervention?.let { app ->
        AlertDialog(
            onDismissRequest = { selectedAppForIntervention = null },
            containerColor = Slate900,
            title = {
                Text(
                    text = "Configure Rule: ${app.appName}",
                    color = Color.White,
                    fontWeight = FontWeight.Bold,
                    fontSize = 17.sp
                )
            },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text("Select Intervention when opened:", color = Slate400, fontSize = 12.sp)
                    InterventionType.entries.forEach { type ->
                        val isSelected = app.interventionType == type
                        Surface(
                            shape = RoundedCornerShape(10.dp),
                            color = if (isSelected) Color(0x2010B981) else Color(0x10FFFFFF),
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable {
                                    viewModel.updateIntervention(app, type)
                                    selectedAppForIntervention = null
                                }
                        ) {
                            Row(
                                modifier = Modifier.padding(12.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                RadioButton(
                                    selected = isSelected,
                                    onClick = null,
                                    colors = RadioButtonDefaults.colors(selectedColor = EmeraldPrimary)
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                Column {
                                    Text(type.displayName, color = Color.White, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                                    Text(type.description, color = Slate400, fontSize = 10.sp)
                                }
                            }
                        }
                    }
                }
            },
            confirmButton = {
                TextButton(onClick = { selectedAppForIntervention = null }) {
                    Text("Close", color = EmeraldPrimary)
                }
            }
        )
    }
}

@Composable
fun AppRowCard(
    app: BlockedApp,
    onToggleBlock: () -> Unit,
    onConfigureRule: () -> Unit
) {
    Card(
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Slate900),
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(12.dp),
                modifier = Modifier.weight(1f)
            ) {
                Box(
                    modifier = Modifier
                        .size(42.dp)
                        .background(
                            if (app.isEssential) Color(0x156366F1) else if (app.isBlocked) Color(0x2010B981) else Color(0x10FFFFFF),
                            CircleShape
                        ),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = if (app.isEssential) Icons.Default.Shield else if (app.isBlocked) Icons.Default.Lock else Icons.Default.Smartphone,
                        contentDescription = null,
                        tint = if (app.isEssential) IndigoCalm else if (app.isBlocked) EmeraldPrimary else Slate400,
                        modifier = Modifier.size(20.dp)
                    )
                }

                Column {
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        Text(
                            text = app.appName,
                            color = Color.White,
                            fontWeight = FontWeight.Bold,
                            fontSize = 14.sp
                        )
                        if (app.isEssential) {
                            Surface(
                                shape = RoundedCornerShape(6.dp),
                                color = Color(0x206366F1)
                            ) {
                                Text(
                                    text = "WHITELIST",
                                    fontSize = 9.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = IndigoCalm,
                                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                )
                            }
                        }
                    }

                    Text(
                        text = "Used today: ${app.usedTodayMinutes}m • ${app.launchCountToday} opens",
                        color = Slate400,
                        fontSize = 11.sp
                    )

                    if (!app.isEssential && app.isBlocked) {
                        Surface(
                            shape = RoundedCornerShape(6.dp),
                            color = Color(0x1510B981),
                            modifier = Modifier
                                .padding(top = 4.dp)
                                .clickable { onConfigureRule() }
                        ) {
                            Text(
                                text = "Rule: ${app.interventionType.displayName}",
                                color = EmeraldPrimary,
                                fontSize = 10.sp,
                                fontWeight = FontWeight.SemiBold,
                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                            )
                        }
                    }
                }
            }

            if (!app.isEssential) {
                Switch(
                    checked = app.isBlocked,
                    onCheckedChange = { onToggleBlock() },
                    colors = SwitchDefaults.colors(
                        checkedThumbColor = Slate950,
                        checkedTrackColor = EmeraldPrimary,
                        uncheckedThumbColor = Slate400,
                        uncheckedTrackColor = Slate800
                    )
                )
            }
        }
    }
}
