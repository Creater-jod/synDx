package com.syndx.app.domain.usecase.auth

import com.syndx.app.data.datastore.ClinicianDataStore
import com.syndx.app.data.local.dao.ClinicianDao
import com.syndx.app.data.local.entity.ClinicianEntity
import com.syndx.app.util.HashUtil
import java.util.UUID

class RegisterClinicianUseCase(
    private val clinicianDao: ClinicianDao,
    private val dataStore: ClinicianDataStore
) {
    suspend operator fun invoke(
        fullName: String,
        designation: String,
        phcCode: String,
        pin: String,
        customClinicianId: String? = null
    ): Result<String> {
        return try {
            val cleanPin = pin.trim()
            if (cleanPin.length != 6 || !cleanPin.all { it.isDigit() }) {
                return Result.failure(IllegalArgumentException("PIN must be exactly 6 digits"))
            }

            val clinicianId = if (!customClinicianId.isNullOrBlank() && customClinicianId.startsWith("SYN-")) {
                customClinicianId.trim().uppercase()
            } else {
                generateClinicianId()
            }

            val uuid = UUID.randomUUID().toString()
            val pinHash = HashUtil.sha256(cleanPin)

            val entity = ClinicianEntity(
                id = uuid,
                fullName = fullName.trim(),
                clinicianId = clinicianId,
                designation = designation.trim(),
                phcCode = phcCode.trim().uppercase(),
                pinHash = pinHash,
                createdAt = System.currentTimeMillis()
            )

            clinicianDao.insert(entity)
            dataStore.saveLogin(uuid)

            Result.success(clinicianId)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    companion object {
        fun generateClinicianId(): String {
            val chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
            val randomPart = (1..6)
                .map { chars.random() }
                .joinToString("")
            return "SYN-$randomPart"
        }
    }
}
