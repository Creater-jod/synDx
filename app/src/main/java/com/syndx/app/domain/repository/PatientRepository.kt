package com.syndx.app.domain.repository

import com.syndx.app.domain.model.Patient
import kotlinx.coroutines.flow.Flow

interface PatientRepository {
    fun getAllPatients(): Flow<List<Patient>>
    suspend fun getPatientById(id: String): Patient?
    suspend fun savePatient(patient: Patient): Result<Unit>
    fun getPatientCount(): Flow<Int>
}
