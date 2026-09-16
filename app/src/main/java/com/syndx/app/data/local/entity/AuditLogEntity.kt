package com.syndx.app.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "audit_logs")
data class AuditLogEntity(
    @PrimaryKey
    val id: String,
    val eventType: String,
    val payloadHash: String,
    val polygonTxHash: String? = null,
    val blockNumber: Long? = null,
    val syncStatus: String = "PENDING",
    val timestamp: Long = System.currentTimeMillis(),
    val zkProofHash: String
)
