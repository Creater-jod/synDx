package com.syndx.app.data.local.dao

import androidx.room.*
import com.syndx.app.data.local.entity.SymptomSessionEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface SymptomSessionDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(session: SymptomSessionEntity)

    @Update
    suspend fun update(session: SymptomSessionEntity)

    @Delete
    suspend fun delete(session: SymptomSessionEntity)

    @Query("SELECT * FROM symptom_sessions")
    fun getAll(): Flow<List<SymptomSessionEntity>>

    @Query("SELECT * FROM symptom_sessions WHERE id = :id")
    suspend fun getById(id: String): SymptomSessionEntity?

    @Query("SELECT * FROM symptom_sessions WHERE patientId = :patientId ORDER BY recordedAt DESC")
    fun getByPatientId(patientId: String): Flow<List<SymptomSessionEntity>>
}
