package com.focuslock.app.data.database.entity

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.focuslock.app.domain.model.FocusSession
import com.focuslock.app.domain.model.SessionState

@Entity(tableName = "focus_sessions")
data class FocusSessionEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val profileId: String,
    val profileName: String,
    val startTimestamp: Long,
    val endTimestamp: Long?,
    val plannedDurationSeconds: Int,
    val elapsedSeconds: Int,
    val state: String,
    val goal: String,
    val isStrict: Boolean,
    val completed: Boolean,
    val breakMinutesTaken: Int,
    val emergencyUnlockUsed: Boolean
) {
    fun toDomain(): FocusSession = FocusSession(
        id = id,
        profileId = profileId,
        profileName = profileName,
        startTimestamp = startTimestamp,
        endTimestamp = endTimestamp,
        plannedDurationSeconds = plannedDurationSeconds,
        elapsedSeconds = elapsedSeconds,
        state = try { SessionState.valueOf(state) } catch (_: Exception) { SessionState.IDLE },
        goal = goal,
        isStrict = isStrict,
        completed = completed,
        breakMinutesTaken = breakMinutesTaken,
        emergencyUnlockUsed = emergencyUnlockUsed
    )

    companion object {
        fun fromDomain(domain: FocusSession): FocusSessionEntity = FocusSessionEntity(
            id = domain.id,
            profileId = domain.profileId,
            profileName = domain.profileName,
            startTimestamp = domain.startTimestamp,
            endTimestamp = domain.endTimestamp,
            plannedDurationSeconds = domain.plannedDurationSeconds,
            elapsedSeconds = domain.elapsedSeconds,
            state = domain.state.name,
            goal = domain.goal,
            isStrict = domain.isStrict,
            completed = domain.completed,
            breakMinutesTaken = domain.breakMinutesTaken,
            emergencyUnlockUsed = domain.emergencyUnlockUsed
        )
    }
}
