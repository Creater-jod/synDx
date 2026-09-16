package com.syndx.app.domain.usecase.audit

import com.syndx.app.domain.model.AuditLog
import com.syndx.app.domain.repository.AuditRepository
import kotlinx.coroutines.flow.Flow

class SyncAuditToBlockchainUseCase(
    private val auditRepository: AuditRepository
) {
    fun getAllLogs(): Flow<List<AuditLog>> = auditRepository.getAllAuditLogs()
    fun getPendingLogs(): Flow<List<AuditLog>> = auditRepository.getPendingAuditLogs()
    fun getPendingCount(): Flow<Int> = auditRepository.getPendingSyncCount()
    fun getSyncedCount(): Flow<Int> = auditRepository.getSyncedCount()
    fun getTotalCount(): Flow<Int> = auditRepository.getTotalCount()

    suspend fun syncPending(): Result<Int> {
        return auditRepository.syncAllPending()
    }
}
