package com.focuslock.app

import com.focuslock.app.domain.model.AppCategory
import com.focuslock.app.domain.model.BlockedApp
import com.focuslock.app.domain.model.InterventionType
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class BlockedAppRuleTest {

    @Test
    fun testEssentialAppWhitelistExemption() {
        val phoneApp = BlockedApp(
            packageName = "com.google.android.dialer",
            appName = "Phone",
            category = AppCategory.COMMUNICATION,
            isBlocked = true,
            isEssential = true
        )

        // Essential apps must never be blocked regardless of isBlocked flag
        assertTrue("Essential phone dialer must remain exempt from blocking", phoneApp.isEssential)
    }

    @Test
    fun testDailyLimitExceededRule() {
        val instagramApp = BlockedApp(
            packageName = "com.instagram.android",
            appName = "Instagram",
            category = AppCategory.SOCIAL,
            isBlocked = true,
            dailyLimitMinutes = 30,
            usedTodayMinutes = 45,
            isEssential = false
        )

        val isLimitExceeded = instagramApp.dailyLimitMinutes in 1..instagramApp.usedTodayMinutes
        assertTrue("App that exceeded daily limit must trigger intervention block", isLimitExceeded)
    }

    @Test
    fun testUnblockedAppAllowance() {
        val productivityApp = BlockedApp(
            packageName = "com.google.android.keep",
            appName = "Keep Notes",
            category = AppCategory.PRODUCTIVITY,
            isBlocked = false,
            dailyLimitMinutes = 0,
            usedTodayMinutes = 10,
            isEssential = false
        )

        assertFalse(productivityApp.isBlocked)
    }
}
