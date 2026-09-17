package com.syndx.app.data.repository

import com.syndx.app.data.local.dao.PatientDao
import com.syndx.app.data.local.entity.PatientEntity
import com.syndx.app.domain.model.Patient
import com.syndx.app.domain.repository.PatientRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

class PatientRepositoryImpl(
    private val patientDao: PatientDao
) : PatientRepository {

    override fun getAllPatients(): Flow<List<Patient>> {
        return patientDao.getAll().map { list ->
            list.map { it.toDomain() }
        }
    }

    override suspend fun getPatientById(id: String): Patient? {
        return patientDao.getById(id)?.toDomain()
    }

    override suspend fun savePatient(patient: Patient): Result<Unit> {
        return try {
            patientDao.insert(patient.toEntity())
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override fun getPatientCount(): Flow<Int> {
        return patientDao.getPatientCount()
    }

    private fun PatientEntity.toDomain() = Patient(
        id = id,
        clinicianId = clinicianId,
        fullName = fullName,
        ageYears = ageYears,
        sex = sex,
        village = village,
        phcCode = phcCode,
        contactNumber = contactNumber,
        registeredAt = registeredAt
    )

    private fun Patient.toEntity() = PatientEntity(
        id = id,
        clinicianId = clinicianId,
        fullName = fullName,
        ageYears = ageYears,
        sex = sex,
        village = village,
        phcCode = phcCode,
        contactNumber = contactNumber,
        registeredAt = registeredAt
    )
}
