package com.syndx.app.domain.usecase.patient

import com.syndx.app.domain.model.Patient
import com.syndx.app.domain.repository.AuditRepository
import com.syndx.app.domain.repository.PatientRepository
import java.util.UUID

class SavePatientUseCase(
    private val patientRepository: PatientRepository,
    private val auditRepository: AuditRepository
) {
    suspend operator fun invoke(
        clinicianId: String,
        fullName: String,
        ageYears: Int,
        sex: String,
        village: String,
        phcCode: String,
        contactNumber: String
    ): Result<String> {
        return try {
            val patientId = UUID.randomUUID().toString()
            val patient = Patient(
                id = patientId,
                clinicianId = clinicianId,
                fullName = fullName.trim(),
                ageYears = ageYears,
                sex = sex.trim(),
                village = village.trim(),
                phcCode = phcCode.trim(),
                contactNumber = contactNumber.trim(),
                registeredAt = System.currentTimeMillis()
            )

            patientRepository.savePatient(patient)

            // Audit log event
            val auditJson = """{"eventType":"PATIENT_REGISTERED","patientId":"$patientId","phcCode":"$phcCode","timestamp":${System.currentTimeMillis()}}"""
            auditRepository.logEvent("PATIENT_REGISTERED", auditJson, patientId)

            Result.success(patientId)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
