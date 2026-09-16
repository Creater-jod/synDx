package com.syndx.app.domain.usecase.diagnosis

import com.syndx.app.domain.model.Diagnosis
import com.syndx.app.domain.repository.DiagnosisRepository

class GetDiagnosisUseCase(
    private val diagnosisRepository: DiagnosisRepository
) {
    suspend fun byId(id: String): Diagnosis? {
        return diagnosisRepository.getDiagnosisById(id)
    }

    suspend fun bySessionId(sessionId: String): Diagnosis? {
        return diagnosisRepository.getDiagnosisBySessionId(sessionId)
    }
}
