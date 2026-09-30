package com.focuslock.app

import com.focuslock.app.domain.model.FocusSession
import com.focuslock.app.domain.model.SessionState
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class FocusTimerTest {

    @Test
    fun testRemainingSecondsCalculation() {
        val session = FocusSession(
            plannedDurationSeconds = 25 * 60,
            elapsedSeconds = 5 * 60,
            state = SessionState.RUNNING
        )

        assertEquals(20 * 60, session.remainingSeconds)
        assertEquals(0.2f, session.progress, 0.001f)
        assertTrue(session.isRunning)
    }

    @Test
    fun testSessionCompletionBoundary() {
        val session = FocusSession(
            plannedDurationSeconds = 25 * 60,
            elapsedSeconds = 25 * 60,
            state = SessionState.COMPLETED,
            completed = true
        )

        assertEquals(0, session.remainingSeconds)
        assertEquals(1.0f, session.progress, 0.001f)
        assertTrue(session.completed)
    }

    @Test
    fun testPauseStatePreservesElapsed() {
        val session = FocusSession(
            plannedDurationSeconds = 1500,
            elapsedSeconds = 600,
            state = SessionState.PAUSED
        )

        assertTrue(session.isPaused)
        assertEquals(900, session.remainingSeconds)
    }
}
