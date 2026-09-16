package com.syndx.app.data.local.dao

import androidx.room.*
import com.syndx.app.data.local.entity.ClinicianEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface ClinicianDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(clinician: ClinicianEntity)

    @Update
    suspend fun update(clinician: ClinicianEntity)

    @Delete
    suspend fun delete(clinician: ClinicianEntity)

    @Query("SELECT * FROM clinicians")
    fun getAll(): Flow<List<ClinicianEntity>>

    @Query("SELECT * FROM clinicians WHERE id = :id")
    suspend fun getById(id: String): ClinicianEntity?

    @Query("SELECT * FROM clinicians WHERE clinicianId = :clinicianId LIMIT 1")
    suspend fun getByClinicianId(clinicianId: String): ClinicianEntity?
}
