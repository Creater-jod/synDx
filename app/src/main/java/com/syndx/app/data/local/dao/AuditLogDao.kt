package com.syndx.app.data.local.dao

import androidx.room.*
import com.syndx.app.data.local.entity.AuditLogEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface AuditLogDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(auditLog: AuditLogEntity)

    @Update
    suspend fun update(auditLog: AuditLogEntity)

    @Delete
    suspend fun delete(auditLog: AuditLogEntity)

    @Query("SELECT * FROM audit_logs ORDER BY timestamp DESC")
    fun getAll(): Flow<List<AuditLogEntity>>

    @Query("SELECT * FROM audit_logs WHERE id = :id")
    suspend fun getById(id: String): AuditLogEntity?

    @Query("SELECT * FROM audit_logs WHERE syncStatus = 'PENDING' ORDER BY timestamp ASC")
    fun getPendingSync(): Flow<List<AuditLogEntity>>

    @Query("SELECT COUNT(*) FROM audit_logs WHERE syncStatus = 'PENDING'")
    fun getPendingSyncCount(): Flow<Int>

    @Query("SELECT COUNT(*) FROM audit_logs WHERE syncStatus = 'SYNCED'")
    fun getSyncedCount(): Flow<Int>

    @Query("SELECT COUNT(*) FROM audit_logs")
    fun getTotalCount(): Flow<Int>
}
