package com.syndx.app.data.local.dao

import androidx.room.*
import com.syndx.app.data.local.entity.DiagnosisEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface DiagnosisDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(diagnosis: DiagnosisEntity)

    @Update
    suspend fun update(diagnosis: DiagnosisEntity)

    @Delete
    suspend fun delete(diagnosis: DiagnosisEntity)

    @Query("SELECT * FROM diagnoses ORDER BY diagnosedAt DESC")
    fun getAll(): Flow<List<DiagnosisEntity>>

    @Query("SELECT * FROM diagnoses WHERE id = :id")
    suspend fun getById(id: String): DiagnosisEntity?

    @Query("SELECT * FROM diagnoses WHERE patientId = :patientId ORDER BY diagnosedAt DESC")
    fun getByPatientId(patientId: String): Flow<List<DiagnosisEntity>>

    @Query("SELECT * FROM diagnoses WHERE sessionId = :sessionId LIMIT 1")
    suspend fun getBySessionId(sessionId: String): DiagnosisEntity?

    @Query("SELECT * FROM diagnoses ORDER BY diagnosedAt DESC LIMIT :limit")
    fun getRecentDiagnoses(limit: Int): Flow<List<DiagnosisEntity>>

    @Query("SELECT COUNT(*) FROM diagnoses WHERE diagnosedAt >= :startOfDay")
    fun countDiagnosesToday(startOfDay: Long): Flow<Int>
}
