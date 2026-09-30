package com.focuslock.app.notifications

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import com.focuslock.app.services.FocusForegroundService

class NotificationActionReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        when (intent.action) {
            FocusNotificationManager.ACTION_PAUSE -> {
                FocusForegroundService.pauseSession(context)
            }
            FocusNotificationManager.ACTION_RESUME -> {
                FocusForegroundService.resumeSession(context)
            }
            FocusNotificationManager.ACTION_STOP -> {
                FocusForegroundService.stopSession(context)
            }
        }
    }
}
