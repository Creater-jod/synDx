package com.syndx.app.domain.usecase.auth

import com.syndx.app.data.datastore.ClinicianDataStore
import com.syndx.app.data.local.dao.ClinicianDao
import com.syndx.app.util.HashUtil

sealed class AuthError : Exception() {
    object InvalidCredentials : AuthError()
    object ClinicianNotFound : AuthError()
    data class Unknown(val e: Throwable) : AuthError()
}

class LoginUseCase(
    private val clinicianDao: ClinicianDao,
    private val dataStore: ClinicianDataStore
) {
    suspend operator fun invoke(clinicianId: String, pin: String): Result<Unit> {
        return try {
            val entity = clinicianDao.getByClinicianId(clinicianId.trim().uppercase())
                ?: return Result.failure(AuthError.ClinicianNotFound)

            val inputHash = HashUtil.sha256(pin.trim())
            if (inputHash == entity.pinHash) {
                dataStore.saveLogin(entity.id)
                Result.success(Unit)
            } else {
                Result.failure(AuthError.InvalidCredentials)
            }
        } catch (e: Exception) {
            Result.failure(AuthError.Unknown(e))
        }
    }
}
