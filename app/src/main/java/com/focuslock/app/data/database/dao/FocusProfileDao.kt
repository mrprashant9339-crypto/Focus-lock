package com.focuslock.app.data.database.dao

import androidx.room.*
import com.focuslock.app.data.database.entity.FocusProfileEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface FocusProfileDao {
    @Query("SELECT * FROM focus_profiles ORDER BY name ASC")
    fun getAllProfilesFlow(): Flow<List<FocusProfileEntity>>

    @Query("SELECT * FROM focus_profiles WHERE id = :id LIMIT 1")
    suspend fun getProfileById(id: String): FocusProfileEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertProfile(profile: FocusProfileEntity)

    @Insert(onConflict = OnConflictStrategy.IGNORE)
    suspend fun insertAll(profiles: List<FocusProfileEntity>)

    @Query("DELETE FROM focus_profiles WHERE id = :id")
    suspend fun deleteProfile(id: String)
}
