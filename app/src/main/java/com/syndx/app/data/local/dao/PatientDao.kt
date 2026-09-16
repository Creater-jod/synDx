package com.syndx.app.data.local.dao

import androidx.room.*
import com.syndx.app.data.local.entity.PatientEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface PatientDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(patient: PatientEntity)

    @Update
    suspend fun update(patient: PatientEntity)

    @Delete
    suspend fun delete(patient: PatientEntity)

    @Query("SELECT * FROM patients ORDER BY registeredAt DESC")
    fun getAll(): Flow<List<PatientEntity>>

    @Query("SELECT * FROM patients WHERE id = :id")
    suspend fun getById(id: String): PatientEntity?

    @Query("SELECT * FROM patients WHERE clinicianId = :clinicianId ORDER BY registeredAt DESC")
    fun getByClinicianId(clinicianId: String): Flow<List<PatientEntity>>

    @Query("SELECT COUNT(*) FROM patients")
    fun getPatientCount(): Flow<Int>
}
