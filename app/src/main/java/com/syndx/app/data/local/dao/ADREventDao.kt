package com.syndx.app.data.local.dao

import androidx.room.*
import com.syndx.app.data.local.entity.ADREventEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface ADREventDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(event: ADREventEntity)

    @Update
    suspend fun update(event: ADREventEntity)

    @Delete
    suspend fun delete(event: ADREventEntity)

    @Query("SELECT * FROM adr_events ORDER BY reportedAt DESC")
    fun getAll(): Flow<List<ADREventEntity>>

    @Query("SELECT * FROM adr_events WHERE id = :id")
    suspend fun getById(id: String): ADREventEntity?

    @Query("SELECT * FROM adr_events WHERE patientId = :patientId ORDER BY reportedAt DESC")
    fun getByPatientId(patientId: String): Flow<List<ADREventEntity>>
}
