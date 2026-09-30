package com.focuslock.app.permissions

import android.app.AppOpsManager
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.PowerManager
import android.os.Process
import android.provider.Settings
import androidx.biometric.BiometricManager
import androidx.core.app.NotificationManagerCompat

data class PermissionItem(
    val id: String,
    val title: String,
    val description: String,
    val whyNeeded: String,
    val isGranted: Boolean,
    val isRequired: Boolean,
    val openSettingsAction: (Context) -> Unit
)

class PermissionManager(private val context: Context) {

    fun isUsageAccessGranted(): Boolean {
        val appOps = context.getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
        val mode = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            appOps.unsafeCheckOpNoThrow(
                AppOpsManager.OPSTR_GET_USAGE_STATS,
                Process.myUid(),
                context.packageName
            )
        } else {
            @Suppress("DEPRECATION")
            appOps.checkOpNoThrow(
                AppOpsManager.OPSTR_GET_USAGE_STATS,
                Process.myUid(),
                context.packageName
            )
        }
        return mode == AppOpsManager.MODE_ALLOWED
    }

    fun isOverlayGranted(): Boolean {
        return Settings.canDrawOverlays(context)
    }

    fun isNotificationGranted(): Boolean {
        return NotificationManagerCompat.from(context).areNotificationsEnabled()
    }

    fun isBatteryOptimizationIgnored(): Boolean {
        val powerManager = context.getSystemService(Context.POWER_SERVICE) as PowerManager
        return powerManager.isIgnoringBatteryOptimizations(context.packageName)
    }

    fun isBiometricAvailable(): Boolean {
        val biometricManager = BiometricManager.from(context)
        val canAuth = biometricManager.canAuthenticate(
            BiometricManager.Authenticators.BIOMETRIC_STRONG or BiometricManager.Authenticators.DEVICE_CREDENTIAL
        )
        return canAuth == BiometricManager.BIOMETRIC_SUCCESS
    }

    fun getAllPermissions(): List<PermissionItem> {
        return listOf(
            PermissionItem(
                id = "usage_access",
                title = "Usage Access",
                description = "Monitors foreground applications and measures exact screen time.",
                whyNeeded = "Required to detect when a blocked or distracting app is launched so FocusLock can intercept it.",
                isGranted = isUsageAccessGranted(),
                isRequired = true,
                openSettingsAction = { ctx ->
                    val intent = Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS).apply {
                        flags = Intent.FLAG_ACTIVITY_NEW_TASK
                    }
                    ctx.startActivity(intent)
                }
            ),
            PermissionItem(
                id = "overlay",
                title = "Display Over Other Apps",
                description = "Enables drawing mindful intervention screens on top of target apps.",
                whyNeeded = "Draws the breathing pause, wait timer, or lock screen over distracting apps to break scrolling reflex.",
                isGranted = isOverlayGranted(),
                isRequired = true,
                openSettingsAction = { ctx ->
                    val intent = Intent(
                        Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                        Uri.parse("package:${ctx.packageName}")
                    ).apply {
                        flags = Intent.FLAG_ACTIVITY_NEW_TASK
                    }
                    ctx.startActivity(intent)
                }
            ),
            PermissionItem(
                id = "notifications",
                title = "Post Notifications",
                description = "Shows live ongoing countdown timer and completion alerts in notification tray.",
                whyNeeded = "Maintains persistent timer in system tray with quick pause/stop controls while screen is locked.",
                isGranted = isNotificationGranted(),
                isRequired = true,
                openSettingsAction = { ctx ->
                    val intent = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                        Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS).apply {
                            putExtra(Settings.EXTRA_APP_PACKAGE, ctx.packageName)
                            flags = Intent.FLAG_ACTIVITY_NEW_TASK
                        }
                    } else {
                        Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS).apply {
                            data = Uri.parse("package:${ctx.packageName}")
                            flags = Intent.FLAG_ACTIVITY_NEW_TASK
                        }
                    }
                    ctx.startActivity(intent)
                }
            ),
            PermissionItem(
                id = "battery_optimization",
                title = "Ignore Battery Optimization",
                description = "Prevents OEM Android OS from killing the focus guardian service.",
                whyNeeded = "Samsung, Xiaomi, and OnePlus aggressively terminate background services without this exemption.",
                isGranted = isBatteryOptimizationIgnored(),
                isRequired = true,
                openSettingsAction = { ctx ->
                    val intent = Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS).apply {
                        data = Uri.parse("package:${ctx.packageName}")
                        flags = Intent.FLAG_ACTIVITY_NEW_TASK
                    }
                    ctx.startActivity(intent)
                }
            ),
            PermissionItem(
                id = "biometrics",
                title = "Biometric Hardware Security",
                description = "Requires fingerprint or face unlock before disabling focus locks or modifying rules.",
                whyNeeded = "Protects your settings from impulsive changes when willpower is depleted.",
                isGranted = isBiometricAvailable(),
                isRequired = false,
                openSettingsAction = { ctx ->
                    val intent = Intent(Settings.ACTION_SECURITY_SETTINGS).apply {
                        flags = Intent.FLAG_ACTIVITY_NEW_TASK
                    }
                    ctx.startActivity(intent)
                }
            )
        )
    }

    fun hasAllRequiredPermissions(): Boolean {
        return isUsageAccessGranted() && isOverlayGranted() && isNotificationGranted()
    }
}
