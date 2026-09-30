package com.focuslock.app.notifications

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import com.focuslock.app.MainActivity
import com.focuslock.app.R
import com.focuslock.app.domain.model.FocusSession

class FocusNotificationManager(private val context: Context) {

    private val notificationManager =
        context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

    companion object {
        const val CHANNEL_TIMER_ID = "focuslock_timer_channel"
        const val CHANNEL_ALERTS_ID = "focuslock_alerts_channel"
        const val NOTIFICATION_TIMER_ID = 1001
        const val NOTIFICATION_COMPLETION_ID = 1002

        const val ACTION_PAUSE = "com.focuslock.app.ACTION_PAUSE_TIMER"
        const val ACTION_RESUME = "com.focuslock.app.ACTION_RESUME_TIMER"
        const val ACTION_STOP = "com.focuslock.app.ACTION_STOP_TIMER"
    }

    init {
        createChannels()
    }

    private fun createChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val timerChannel = NotificationChannel(
                CHANNEL_TIMER_ID,
                context.getString(R.string.notification_channel_timer_name),
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = context.getString(R.string.notification_channel_timer_desc)
                setShowBadge(false)
            }

            val alertsChannel = NotificationChannel(
                CHANNEL_ALERTS_ID,
                context.getString(R.string.notification_channel_alerts_name),
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = context.getString(R.string.notification_channel_alerts_desc)
                enableVibration(true)
            }

            notificationManager.createNotificationChannel(timerChannel)
            notificationManager.createNotificationChannel(alertsChannel)
        }
    }

    fun buildTimerNotification(session: FocusSession): Notification {
        val contentIntent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }
        val pendingContentIntent = PendingIntent.getActivity(
            context,
            0,
            contentIntent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

        val remainingMinutes = session.remainingSeconds / 60
        val remainingSecs = session.remainingSeconds % 60
        val formattedTime = String.format("%02d:%02d", remainingMinutes, remainingSecs)

        val builder = NotificationCompat.Builder(context, CHANNEL_TIMER_ID)
            .setSmallIcon(R.drawable.ic_launcher_foreground)
            .setContentTitle("FocusLock • ${session.profileName}")
            .setContentText("$formattedTime remaining • ${session.goal}")
            .setContentIntent(pendingContentIntent)
            .setOngoing(true)
            .setOnlyAlertOnce(true)
            .setProgress(session.plannedDurationSeconds, session.elapsedSeconds, false)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setCategory(NotificationCompat.CATEGORY_STOPWATCH)

        // Actions: Pause / Resume / Stop
        if (session.isRunning) {
            val pauseIntent = Intent(context, NotificationActionReceiver::class.java).apply {
                action = ACTION_PAUSE
            }
            val pausePendingIntent = PendingIntent.getBroadcast(
                context,
                1,
                pauseIntent,
                PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
            )
            builder.addAction(0, context.getString(R.string.action_pause), pausePendingIntent)
        } else if (session.isPaused) {
            val resumeIntent = Intent(context, NotificationActionReceiver::class.java).apply {
                action = ACTION_RESUME
            }
            val resumePendingIntent = PendingIntent.getBroadcast(
                context,
                2,
                resumeIntent,
                PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
            )
            builder.addAction(0, context.getString(R.string.action_resume), resumePendingIntent)
        }

        val stopIntent = Intent(context, NotificationActionReceiver::class.java).apply {
            action = ACTION_STOP
        }
        val stopPendingIntent = PendingIntent.getBroadcast(
            context,
            3,
            stopIntent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )
        builder.addAction(0, context.getString(R.string.action_stop), stopPendingIntent)

        return builder.build()
    }

    fun showCompletionNotification(session: FocusSession) {
        val intent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }
        val pendingIntent = PendingIntent.getActivity(
            context,
            0,
            intent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

        val minutes = session.plannedDurationSeconds / 60
        val notification = NotificationCompat.Builder(context, CHANNEL_ALERTS_ID)
            .setSmallIcon(R.drawable.ic_launcher_foreground)
            .setContentTitle("Focus Session Complete! 🎉")
            .setContentText("You protected $minutes minutes of conscious attention on ${session.profileName}.")
            .setContentIntent(pendingIntent)
            .setAutoCancel(true)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .build()

        notificationManager.notify(NOTIFICATION_COMPLETION_ID, notification)
    }

    fun cancelTimerNotification() {
        notificationManager.cancel(NOTIFICATION_TIMER_ID)
    }
}
