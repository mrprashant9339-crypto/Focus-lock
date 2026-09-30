package com.focuslock.app.domain.repository

import com.focuslock.app.domain.model.FocusProfile
import kotlinx.coroutines.flow.Flow

interface FocusProfileRepository {
    fun getAllProfilesFlow(): Flow<List<FocusProfile>>
    suspend fun getProfileById(id: String): FocusProfile?
    suspend fun getActiveProfile(): FocusProfile
    suspend fun setActiveProfile(id: String)
    suspend fun saveProfile(profile: FocusProfile)
    suspend fun deleteProfile(id: String)
}
