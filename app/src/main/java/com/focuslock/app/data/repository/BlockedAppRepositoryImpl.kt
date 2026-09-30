package com.focuslock.app.data.repository

import com.focuslock.app.data.database.dao.BlockedAppDao
import com.focuslock.app.data.database.entity.BlockedAppEntity
import com.focuslock.app.domain.model.BlockedApp
import com.focuslock.app.domain.model.InterventionType
import com.focuslock.app.domain.repository.BlockedAppRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

class BlockedAppRepositoryImpl(
    private val appDao: BlockedAppDao
) : BlockedAppRepository {

    override fun getAllAppsFlow(): Flow<List<BlockedApp>> {
        return appDao.getAllAppsFlow().map { list -> list.map { it.toDomain() } }
    }

    override fun getBlockedAppsFlow(): Flow<List<BlockedApp>> {
        return appDao.getBlockedAppsFlow().map { list -> list.map { it.toDomain() } }
    }

    override suspend fun getApp(packageName: String): BlockedApp? {
        return appDao.getAppByPackage(packageName)?.toDomain()
    }

    override suspend fun toggleAppBlock(packageName: String, isBlocked: Boolean) {
        appDao.updateBlockStatus(packageName, isBlocked)
    }

    override suspend fun updateIntervention(packageName: String, intervention: InterventionType) {
        appDao.updateIntervention(packageName, intervention.name)
    }

    override suspend fun updateDailyLimit(packageName: String, limitMinutes: Int) {
        appDao.updateDailyLimit(packageName, limitMinutes)
    }

    override suspend fun recordAppLaunch(packageName: String) {
        appDao.incrementLaunchCount(packageName)
    }

    override suspend fun saveApps(apps: List<BlockedApp>) {
        appDao.insertAll(apps.map { BlockedAppEntity.fromDomain(it) })
    }
}
