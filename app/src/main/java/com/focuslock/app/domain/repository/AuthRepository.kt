package com.focuslock.app.domain.repository

import kotlinx.coroutines.flow.Flow

data class AuthUser(
    val uid: String,
    val email: String?,
    val displayName: String?,
    val photoUrl: String?,
    val isAnonymous: Boolean = false
)

interface AuthRepository {
    fun getCurrentUserFlow(): Flow<AuthUser?>
    suspend fun getCurrentUser(): AuthUser?
    suspend fun signInWithGoogle(idToken: String): Result<AuthUser>
    suspend fun signInWithEmail(email: String, pass: String): Result<AuthUser>
    suspend fun signUpWithEmail(email: String, pass: String): Result<AuthUser>
    suspend fun signOut()
}
