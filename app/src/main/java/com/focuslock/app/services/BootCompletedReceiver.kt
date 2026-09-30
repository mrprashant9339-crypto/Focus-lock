package com.focuslock.app.services

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import androidx.core.content.ContextCompat

class BootCompletedReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Intent.ACTION_BOOT_COMPLETED || intent.action == Intent.ACTION_MY_PACKAGE_REPLACED) {
            // Start background app monitor service
            val monitorIntent = Intent(context, AppBlockMonitorService::class.java)
            context.startService(monitorIntent)

            // Start FocusForegroundService to recover any active persistent session
            val fgsIntent = Intent(context, FocusForegroundService::class.java)
            ContextCompat.startForegroundService(context, fgsIntent)
        }
    }
}
