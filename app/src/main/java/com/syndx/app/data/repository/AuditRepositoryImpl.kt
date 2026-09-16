package com.syndx.app.data.repository

import com.syndx.app.data.blockchain.PolygonAuditLogger
import com.syndx.app.data.local.dao.AuditLogDao
import com.syndx.app.data.local.entity.AuditLogEntity
import com.syndx.app.domain.model.AuditLog
import com.syndx.app.domain.repository.AuditRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map

class AuditRepositoryImpl(
    private val auditLogDao: AuditLogDao
) : AuditRepository {

    override fun getAllAuditLogs(): Flow<List<AuditLog>> {
        return auditLogDao.getAll().map { list ->
            list.map { it.toDomain() }
        }
    }

    override fun getPendingAuditLogs(): Flow<List<AuditLog>> {
        return auditLogDao.getPendingSync().map { list ->
            list.map { it.toDomain() }
        }
    }

    override fun getPendingSyncCount(): Flow<Int> {
        return auditLogDao.getPendingSyncCount()
    }

    override fun getSyncedCount(): Flow<Int> {
        return auditLogDao.getSyncedCount()
    }

    override fun getTotalCount(): Flow<Int> {
        return auditLogDao.getTotalCount()
    }

    override suspend fun logEvent(
        eventType: String,
        payloadJson: String,
        patientId: String
    ): AuditLog {
        val entity = PolygonAuditLogger.generateAuditEntry(eventType, payloadJson, patientId)
        auditLogDao.insert(entity)
        return entity.toDomain()
    }

    override suspend fun syncAllPending(): Result<Int> {
        return try {
            val pendingList = auditLogDao.getPendingSync().first()
            var count = 0
            pendingList.forEach { entry ->
                val synced = PolygonAuditLogger.attemptPolygonSync(entry)
                auditLogDao.update(synced)
                if (synced.syncStatus == "SYNCED") {
                    count++
                }
            }
            Result.success(count)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    private fun AuditLogEntity.toDomain() = AuditLog(
        id = id,
        eventType = eventType,
        payloadHash = payloadHash,
        polygonTxHash = polygonTxHash,
        blockNumber = blockNumber,
        syncStatus = syncStatus,
        timestamp = timestamp,
        zkProofHash = zkProofHash
    )
}
