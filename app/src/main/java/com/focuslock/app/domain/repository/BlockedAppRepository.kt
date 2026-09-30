package com.focuslock.app.domain.repository

import com.focuslock.app.domain.model.BlockedApp
import com.focuslock.app.domain.model.InterventionType
import kotlinx.coroutines.flow.Flow

interface BlockedAppRepository {
    fun getAllAppsFlow(): Flow<List<BlockedApp>>
    fun getBlockedAppsFlow(): Flow<List<BlockedApp>>
    suspend fun getApp(packageName: String): BlockedApp?
    suspend fun toggleAppBlock(packageName: String, isBlocked: Boolean)
    suspend fun updateIntervention(packageName: String, intervention: InterventionType)
    suspend fun updateDailyLimit(packageName: String, limitMinutes: Int)
    suspend fun recordAppLaunch(packageName: String)
    suspend fun saveApps(apps: List<BlockedApp>)
}
