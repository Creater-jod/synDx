package com.syndx.app.domain.usecase.adr

import com.syndx.app.domain.model.ADREvent
import com.syndx.app.domain.repository.AuditRepository
import com.syndx.app.domain.repository.DiagnosisRepository
import java.util.UUID

class LogADREventUseCase(
    private val diagnosisRepository: DiagnosisRepository,
    private val auditRepository: AuditRepository
) {
    suspend operator fun invoke(
        patientId: String,
        drugName: String,
        reactionCode: String,
        severityLevel: String,
        notes: String
    ): Result<ADREvent> {
        return try {
            val eventId = UUID.randomUUID().toString()
            val timestamp = System.currentTimeMillis()

            val auditJson = """{"eventType":"ADR_REPORTED","eventId":"$eventId","patientId":"$patientId","drugName":"$drugName","severity":"$severityLevel","timestamp":$timestamp}"""
            val auditLog = auditRepository.logEvent("ADR_REPORTED", auditJson, patientId)

            val event = ADREvent(
                id = eventId,
                patientId = patientId,
                drugName = drugName,
                reactionCode = reactionCode,
                severityLevel = severityLevel,
                notes = notes,
                reportedAt = timestamp,
                auditLogId = auditLog.id
            )

            diagnosisRepository.logADREvent(event)
            Result.success(event)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
