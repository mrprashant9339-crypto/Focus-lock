package com.focuslock.app.data.database.entity

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.focuslock.app.domain.model.FocusProfile
import com.focuslock.app.domain.model.InterventionType

@Entity(tableName = "focus_profiles")
data class FocusProfileEntity(
    @PrimaryKey
    val id: String,
    val name: String,
    val description: String,
    val iconName: String,
    val colorHex: String,
    val isEnabled: Boolean,
    val startTime: String,
    val endTime: String,
    val activeDaysCommaSeparated: String,
    val defaultDurationMinutes: Int,
    val dailyLimitMinutes: Int,
    val isStrict: Boolean,
    val defaultIntervention: String,
    val blockedPackagesCommaSeparated: String
) {
    fun toDomain(): FocusProfile = FocusProfile(
        id = id,
        name = name,
        description = description,
        iconName = iconName,
        colorHex = colorHex,
        isEnabled = isEnabled,
        startTime = startTime,
        endTime = endTime,
        activeDays = activeDaysCommaSeparated.split(",").mapNotNull { it.trim().toIntOrNull() },
        defaultDurationMinutes = defaultDurationMinutes,
        dailyLimitMinutes = dailyLimitMinutes,
        isStrict = isStrict,
        defaultIntervention = try { InterventionType.valueOf(defaultIntervention) } catch (_: Exception) { InterventionType.BREATHING },
        blockedPackages = blockedPackagesCommaSeparated.split(",").map { it.trim() }.filter { it.isNotEmpty() }
    )

    companion object {
        fun fromDomain(domain: FocusProfile): FocusProfileEntity = FocusProfileEntity(
            id = domain.id,
            name = domain.name,
            description = domain.description,
            iconName = domain.iconName,
            colorHex = domain.colorHex,
            isEnabled = domain.isEnabled,
            startTime = domain.startTime,
            endTime = domain.endTime,
            activeDaysCommaSeparated = domain.activeDays.joinToString(","),
            defaultDurationMinutes = domain.defaultDurationMinutes,
            dailyLimitMinutes = domain.dailyLimitMinutes,
            isStrict = domain.isStrict,
            defaultIntervention = domain.defaultIntervention.name,
            blockedPackagesCommaSeparated = domain.blockedPackages.joinToString(",")
        )
    }
}
