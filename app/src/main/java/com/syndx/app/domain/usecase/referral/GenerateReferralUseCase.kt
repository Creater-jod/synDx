package com.syndx.app.domain.usecase.referral

import com.syndx.app.domain.model.Clinician
import com.syndx.app.domain.model.Diagnosis
import com.syndx.app.domain.model.Patient
import com.syndx.app.domain.model.Referral
import com.syndx.app.domain.repository.AuditRepository
import com.syndx.app.domain.repository.DiagnosisRepository
import com.syndx.app.util.DateUtil
import java.util.UUID

class GenerateReferralUseCase(
    private val diagnosisRepository: DiagnosisRepository,
    private val auditRepository: AuditRepository
) {
    fun buildReferralText(
        referralCode: String,
        clinician: Clinician,
        patient: Patient,
        diagnosis: Diagnosis,
        destinationHospital: String,
        urgency: String,
        additionalNotes: String,
        txHash: String?
    ): String {
        val dateStr = DateUtil.formatFull(System.currentTimeMillis())
        val bulletsFormatted = diagnosis.explanationBullets.mapIndexed { idx, b ->
            "${idx + 1}. $b"
        }.joinToString("\n")

        val adrJoined = if (diagnosis.adrWarnings.isEmpty()) "None documented" else diagnosis.adrWarnings.joinToString(", ")
        val auditRef = txHash ?: "Pending sync"

        return """
REFERRAL LETTER
Date: $dateStr
Referral Code: $referralCode

From: ${clinician.fullName}, ${clinician.designation}
PHC Code: ${clinician.phcCode}

To: $destinationHospital

Patient: ${patient.fullName}, ${patient.ageYears}yo ${patient.sex}, ${patient.village}

Diagnosis: ${diagnosis.probableDisease} (${diagnosis.icd10Code})
Confidence: ${(diagnosis.confidenceScore * 100).toInt()}%
Urgency: $urgency

Clinical Reasoning:
$bulletsFormatted

Referral Reason: ${diagnosis.referralReason}
Drug Interactions to Note: $adrJoined

Additional Notes: ${additionalNotes.ifBlank { "N/A" }}

Blockchain Audit Reference: $auditRef

Clinician Signature: ___________________
${clinician.fullName}, ${clinician.designation}
        """.trimIndent()
    }

    suspend fun issueReferral(
        referralId: String,
        patientId: String,
        diagnosisId: String,
        referralCode: String,
        destinationHospital: String,
        urgencyLevel: String,
        referralText: String,
        additionalNotes: String
    ): Result<Referral> {
        return try {
            val issuedAt = System.currentTimeMillis()
            val auditJson = """{"eventType":"REFERRAL_ISSUED","referralCode":"$referralCode","destinationHospital":"$destinationHospital","patientId":"$patientId","timestamp":$issuedAt}"""
            val auditLog = auditRepository.logEvent("REFERRAL_ISSUED", auditJson, patientId)

            val referral = Referral(
                id = referralId.ifBlank { UUID.randomUUID().toString() },
                patientId = patientId,
                diagnosisId = diagnosisId,
                referralCode = referralCode,
                destinationHospital = destinationHospital,
                urgencyLevel = urgencyLevel,
                referralText = referralText,
                additionalNotes = additionalNotes,
                issuedAt = issuedAt,
                auditLogId = auditLog.id
            )

            diagnosisRepository.saveReferral(referral)
            Result.success(referral)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    companion object {
        fun generateReferralCode(): String {
            val chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
            val randomPart = (1..8).map { chars.random() }.joinToString("")
            return "SYN-$randomPart"
        }
    }
}
