package com.syndx.app.domain.model

data class AuditLog(
    val id: String,
    val eventType: String,
    val payloadHash: String,
    val polygonTxHash: String? = null,
    val blockNumber: Long? = null,
    val syncStatus: String = "PENDING",
    val timestamp: Long = System.currentTimeMillis(),
    val zkProofHash: String
)
