package com.syndx.app.domain.repository

import com.syndx.app.domain.model.AuditLog
import kotlinx.coroutines.flow.Flow

interface AuditRepository {
    fun getAllAuditLogs(): Flow<List<AuditLog>>
    fun getPendingAuditLogs(): Flow<List<AuditLog>>
    fun getPendingSyncCount(): Flow<Int>
    fun getSyncedCount(): Flow<Int>
    fun getTotalCount(): Flow<Int>
    suspend fun logEvent(eventType: String, payloadJson: String, patientId: String): AuditLog
    suspend fun syncAllPending(): Result<Int>
}
