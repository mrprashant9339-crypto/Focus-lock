package com.focuslock.app.data.database.entity

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.focuslock.app.domain.model.AppCategory
import com.focuslock.app.domain.model.BlockedApp
import com.focuslock.app.domain.model.InterventionType

@Entity(tableName = "blocked_apps")
data class BlockedAppEntity(
    @PrimaryKey
    val packageName: String,
    val appName: String,
    val category: String,
    val isBlocked: Boolean,
    val interventionType: String,
    val dailyLimitMinutes: Int,
    val usedTodayMinutes: Int,
    val launchCountToday: Int,
    val isEssential: Boolean
) {
    fun toDomain(): BlockedApp = BlockedApp(
        packageName = packageName,
        appName = appName,
        category = try { AppCategory.valueOf(category) } catch (_: Exception) { AppCategory.OTHER },
        isBlocked = isBlocked,
        interventionType = try { InterventionType.valueOf(interventionType) } catch (_: Exception) { InterventionType.BREATHING },
        dailyLimitMinutes = dailyLimitMinutes,
        usedTodayMinutes = usedTodayMinutes,
        launchCountToday = launchCountToday,
        isEssential = isEssential
    )

    companion object {
        fun fromDomain(domain: BlockedApp): BlockedAppEntity = BlockedAppEntity(
            packageName = domain.packageName,
            appName = domain.appName,
            category = domain.category.name,
            isBlocked = domain.isBlocked,
            interventionType = domain.interventionType.name,
            dailyLimitMinutes = domain.dailyLimitMinutes,
            usedTodayMinutes = domain.usedTodayMinutes,
            launchCountToday = domain.launchCountToday,
            isEssential = domain.isEssential
        )
    }
}
