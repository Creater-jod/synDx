package com.syndx.app.domain.usecase.diagnosis

import com.syndx.app.data.ai.GeminiDiagnosisService
import com.syndx.app.domain.model.Diagnosis
import com.syndx.app.domain.model.SymptomSession
import com.syndx.app.domain.repository.AuditRepository
import com.syndx.app.domain.repository.DiagnosisRepository
import com.syndx.app.domain.repository.PatientRepository
import com.syndx.app.util.DifferentialPrivacy
import java.util.UUID

class DiagnoseSymptomUseCase(
    private val diagnosisRepository: DiagnosisRepository,
    private val patientRepository: PatientRepository,
    private val auditRepository: AuditRepository,
    private val geminiService: GeminiDiagnosisService
) {
    suspend operator fun invoke(
        patientId: String,
        symptomCodes: List<String>,
        symptomLabels: List<String>,
        onsetDays: Int
    ): Result<String> {
        return try {
            val patient = patientRepository.getPatientById(patientId)
                ?: return Result.failure(IllegalArgumentException("Patient not found"))

            // 1. Create SymptomSession
            val sessionId = UUID.randomUUID().toString()
            val session = SymptomSession(
                id = sessionId,
                patientId = patientId,
                symptomCodes = symptomCodes,
                symptomLabels = symptomLabels,
                onsetDays = onsetDays,
                recordedAt = System.currentTimeMillis()
            )
            diagnosisRepository.saveSymptomSession(session)

            // 2. Call Gemini AI (with fallback)
            val result = geminiService.diagnose(
                symptomCodes = symptomCodes,
                symptomLabels = symptomLabels,
                onsetDays = onsetDays,
                patientAge = patient.ageYears,
                patientSex = patient.sex
            )

            // 3. Differential Privacy noise calculation
            val confidenceDP = DifferentialPrivacy.addLaplaceNoise(result.confidence)

            // 4. Create Audit Log
            val diagnosisId = UUID.randomUUID().toString()
            val auditJson = """{"eventType":"DIAGNOSIS_COMPLETED","diagnosisId":"$diagnosisId","probableDisease":"${result.probableDisease}","icd10Code":"${result.icd10Code}","confidenceDP":$confidenceDP,"timestamp":${System.currentTimeMillis()}}"""
            val auditLog = auditRepository.logEvent("DIAGNOSIS_COMPLETED", auditJson, patientId)

            // 5. Store Diagnosis Entity
            val diagnosis = Diagnosis(
                id = diagnosisId,
                patientId = patientId,
                sessionId = sessionId,
                probableDisease = result.probableDisease,
                icd10Code = result.icd10Code,
                confidenceScore = result.confidence,
                confidenceScoreDP = confidenceDP,
                alternativeDiseases = result.alternativeDiseases,
                explanationBullets = result.explanationBullets,
                urgencyLevel = result.urgencyLevel,
                referralReason = result.referralReason,
                adrWarnings = result.adrWarnings,
                modelVersion = "gemini-2.0-flash",
                isOfflineFallback = result.isOfflineFallback,
                auditLogId = auditLog.id,
                diagnosedAt = System.currentTimeMillis()
            )
            diagnosisRepository.saveDiagnosis(diagnosis)

            Result.success(sessionId)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
