package com.syndx.app.data.repository

import com.syndx.app.data.local.dao.ADREventDao
import com.syndx.app.data.local.dao.DiagnosisDao
import com.syndx.app.data.local.dao.ReferralDao
import com.syndx.app.data.local.dao.SymptomSessionDao
import com.syndx.app.data.local.entity.ADREventEntity
import com.syndx.app.data.local.entity.DiagnosisEntity
import com.syndx.app.data.local.entity.ReferralEntity
import com.syndx.app.data.local.entity.SymptomSessionEntity
import com.syndx.app.domain.model.ADREvent
import com.syndx.app.domain.model.Diagnosis
import com.syndx.app.domain.model.Referral
import com.syndx.app.domain.model.SymptomSession
import com.syndx.app.domain.repository.DiagnosisRepository
import com.syndx.app.util.DateUtil
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import org.json.JSONArray

class DiagnosisRepositoryImpl(
    private val diagnosisDao: DiagnosisDao,
    private val symptomSessionDao: SymptomSessionDao,
    private val referralDao: ReferralDao,
    private val adrEventDao: ADREventDao
) : DiagnosisRepository {

    override suspend fun saveSymptomSession(session: SymptomSession): Result<String> {
        return try {
            symptomSessionDao.insert(session.toEntity())
            Result.success(session.id)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override suspend fun getSymptomSession(id: String): SymptomSession? {
        return symptomSessionDao.getById(id)?.toDomain()
    }

    override suspend fun saveDiagnosis(diagnosis: Diagnosis): Result<Unit> {
        return try {
            diagnosisDao.insert(diagnosis.toEntity())
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override suspend fun getDiagnosisById(id: String): Diagnosis? {
        return diagnosisDao.getById(id)?.toDomain()
    }

    override suspend fun getDiagnosisBySessionId(sessionId: String): Diagnosis? {
        return diagnosisDao.getBySessionId(sessionId)?.toDomain()
    }

    override fun getRecentDiagnoses(limit: Int): Flow<List<Diagnosis>> {
        return diagnosisDao.getRecentDiagnoses(limit).map { list ->
            list.map { it.toDomain() }
        }
    }

    override fun countDiagnosesToday(): Flow<Int> {
        return diagnosisDao.countDiagnosesToday(DateUtil.getStartOfDay())
    }

    override suspend fun saveReferral(referral: Referral): Result<Unit> {
        return try {
            referralDao.insert(referral.toEntity())
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override suspend fun getReferralByDiagnosisId(diagnosisId: String): Referral? {
        return referralDao.getByDiagnosisId(diagnosisId)?.toDomain()
    }

    override suspend fun logADREvent(event: ADREvent): Result<Unit> {
        return try {
            adrEventDao.insert(event.toEntity())
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override fun getADREventsForPatient(patientId: String): Flow<List<ADREvent>> {
        return adrEventDao.getByPatientId(patientId).map { list ->
            list.map { it.toDomain() }
        }
    }

    // Converters
    private fun List<String>.toJsonString(): String {
        val array = JSONArray()
        this.forEach { array.put(it) }
        return array.toString()
    }

    private fun String.toStringList(): List<String> {
        if (this.isBlank()) return emptyList()
        return try {
            val array = JSONArray(this)
            val list = mutableListOf<String>()
            for (i in 0 until array.length()) {
                list.add(array.getString(i))
            }
            list
        } catch (e: Exception) {
            emptyList()
        }
    }

    private fun SymptomSessionEntity.toDomain() = SymptomSession(
        id = id,
        patientId = patientId,
        symptomCodes = symptomCodes.toStringList(),
        symptomLabels = symptomLabels.toStringList(),
        onsetDays = onsetDays,
        recordedAt = recordedAt
    )

    private fun SymptomSession.toEntity() = SymptomSessionEntity(
        id = id,
        patientId = patientId,
        symptomCodes = symptomCodes.toJsonString(),
        symptomLabels = symptomLabels.toJsonString(),
        onsetDays = onsetDays,
        recordedAt = recordedAt
    )

    private fun DiagnosisEntity.toDomain() = Diagnosis(
        id = id,
        patientId = patientId,
        sessionId = sessionId,
        probableDisease = probableDisease,
        icd10Code = icd10Code,
        confidenceScore = confidenceScore,
        confidenceScoreDP = confidenceScoreDP,
        alternativeDiseases = alternativeDiseases.toStringList(),
        explanationBullets = explanationBullets.toStringList(),
        urgencyLevel = urgencyLevel,
        referralReason = referralReason,
        adrWarnings = adrWarnings.toStringList(),
        modelVersion = modelVersion,
        isOfflineFallback = isOfflineFallback,
        auditLogId = auditLogId,
        diagnosedAt = diagnosedAt
    )

    private fun Diagnosis.toEntity() = DiagnosisEntity(
        id = id,
        patientId = patientId,
        sessionId = sessionId,
        probableDisease = probableDisease,
        icd10Code = icd10Code,
        confidenceScore = confidenceScore,
        confidenceScoreDP = confidenceScoreDP,
        alternativeDiseases = alternativeDiseases.toJsonString(),
        explanationBullets = explanationBullets.toJsonString(),
        urgencyLevel = urgencyLevel,
        referralReason = referralReason,
        adrWarnings = adrWarnings.toJsonString(),
        modelVersion = modelVersion,
        isOfflineFallback = isOfflineFallback,
        auditLogId = auditLogId,
        diagnosedAt = diagnosedAt
    )

    private fun ReferralEntity.toDomain() = Referral(
        id = id,
        patientId = patientId,
        diagnosisId = diagnosisId,
        referralCode = referralCode,
        destinationHospital = destinationHospital,
        urgencyLevel = urgencyLevel,
        referralText = referralText,
        additionalNotes = additionalNotes,
        issuedAt = issuedAt,
        auditLogId = auditLogId
    )

    private fun Referral.toEntity() = ReferralEntity(
        id = id,
        patientId = patientId,
        diagnosisId = diagnosisId,
        referralCode = referralCode,
        destinationHospital = destinationHospital,
        urgencyLevel = urgencyLevel,
        referralText = referralText,
        additionalNotes = additionalNotes,
        issuedAt = issuedAt,
        auditLogId = auditLogId
    )

    private fun ADREventEntity.toDomain() = ADREvent(
        id = id,
        patientId = patientId,
        drugName = drugName,
        reactionCode = reactionCode,
        severityLevel = severityLevel,
        notes = notes,
        reportedAt = reportedAt,
        auditLogId = auditLogId
    )

    private fun ADREvent.toEntity() = ADREventEntity(
        id = id,
        patientId = patientId,
        drugName = drugName,
        reactionCode = reactionCode,
        severityLevel = severityLevel,
        notes = notes,
        reportedAt = reportedAt,
        auditLogId = auditLogId
    )
}
