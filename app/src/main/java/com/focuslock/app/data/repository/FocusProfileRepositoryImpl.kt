package com.focuslock.app.data.repository

import com.focuslock.app.data.database.dao.FocusProfileDao
import com.focuslock.app.data.database.entity.FocusProfileEntity
import com.focuslock.app.data.datastore.FocusLockDataStore
import com.focuslock.app.domain.model.FocusProfile
import com.focuslock.app.domain.repository.FocusProfileRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map

class FocusProfileRepositoryImpl(
    private val profileDao: FocusProfileDao,
    private val dataStore: FocusLockDataStore
) : FocusProfileRepository {

    override fun getAllProfilesFlow(): Flow<List<FocusProfile>> {
        return profileDao.getAllProfilesFlow().map { list -> list.map { it.toDomain() } }
    }

    override suspend fun getProfileById(id: String): FocusProfile? {
        return profileDao.getProfileById(id)?.toDomain()
    }

    override suspend fun getActiveProfile(): FocusProfile {
        val activeId = dataStore.activeProfileIdFlow.first()
        val found = profileDao.getProfileById(activeId)?.toDomain()
        if (found != null) return found

        // Fallback to first profile or default
        val first = profileDao.getAllProfilesFlow().first().firstOrNull()?.toDomain()
        return first ?: FocusProfile(
            id = "deep_work",
            name = "Deep Work",
            description = "Default high-focus profile",
            iconName = "Briefcase",
            colorHex = "#10B981"
        )
    }

    override suspend fun setActiveProfile(id: String) {
        dataStore.setActiveProfileId(id)
    }

    override suspend fun saveProfile(profile: FocusProfile) {
        profileDao.insertProfile(FocusProfileEntity.fromDomain(profile))
    }

    override suspend fun deleteProfile(id: String) {
        profileDao.deleteProfile(id)
    }
}
