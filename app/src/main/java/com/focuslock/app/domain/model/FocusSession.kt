package com.focuslock.app.domain.model

enum class SessionState {
    IDLE,
    RUNNING,
    PAUSED,
    ON_BREAK,
    COMPLETED,
    CANCELLED
}

data class FocusSession(
    val id: Long = 0,
    val profileId: String = "deep_work",
    val profileName: String = "Deep Work",
    val startTimestamp: Long = System.currentTimeMillis(),
    val endTimestamp: Long? = null,
    val plannedDurationSeconds: Int = 25 * 60,
    val elapsedSeconds: Int = 0,
    val state: SessionState = SessionState.IDLE,
    val goal: String = "Deep focused work session",
    val isStrict: Boolean = false,
    val completed: Boolean = false,
    val breakMinutesTaken: Int = 0,
    val emergencyUnlockUsed: Boolean = false
) {
    val remainingSeconds: Int
        get() = (plannedDurationSeconds - elapsedSeconds).coerceAtLeast(0)

    val progress: Float
        get() = if (plannedDurationSeconds > 0) {
            (elapsedSeconds.toFloat() / plannedDurationSeconds.toFloat()).coerceIn(0f, 1f)
        } else 0f

    val isRunning: Boolean
        get() = state == SessionState.RUNNING

    val isPaused: Boolean
        get() = state == SessionState.PAUSED
}
