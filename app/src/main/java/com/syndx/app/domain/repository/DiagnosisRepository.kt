package com.syndx.app.domain.repository

import com.syndx.app.domain.model.ADREvent
import com.syndx.app.domain.model.Diagnosis
import com.syndx.app.domain.model.Referral
import com.syndx.app.domain.model.SymptomSession
import kotlinx.coroutines.flow.Flow

interface DiagnosisRepository {
    suspend fun saveSymptomSession(session: SymptomSession): Result<String>
    suspend fun getSymptomSession(id: String): SymptomSession?
    suspend fun saveDiagnosis(diagnosis: Diagnosis): Result<Unit>
    suspend fun getDiagnosisById(id: String): Diagnosis?
    suspend fun getDiagnosisBySessionId(sessionId: String): Diagnosis?
    fun getRecentDiagnoses(limit: Int = 5): Flow<List<Diagnosis>>
    fun countDiagnosesToday(): Flow<Int>
    suspend fun saveReferral(referral: Referral): Result<Unit>
    suspend fun getReferralByDiagnosisId(diagnosisId: String): Referral?
    suspend fun logADREvent(event: ADREvent): Result<Unit>
    fun getADREventsForPatient(patientId: String): Flow<List<ADREvent>>
}
