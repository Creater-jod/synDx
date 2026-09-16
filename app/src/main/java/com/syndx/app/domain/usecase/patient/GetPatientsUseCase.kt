package com.syndx.app.domain.usecase.patient

import com.syndx.app.domain.model.Patient
import com.syndx.app.domain.repository.PatientRepository
import kotlinx.coroutines.flow.Flow

class GetPatientsUseCase(
    private val patientRepository: PatientRepository
) {
    operator fun invoke(): Flow<List<Patient>> {
        return patientRepository.getAllPatients()
    }
}
