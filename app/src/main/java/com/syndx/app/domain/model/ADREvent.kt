package com.syndx.app.domain.model

data class ADREvent(
    val id: String,
    val patientId: String,
    val drugName: String,
    val reactionCode: String,
    val severityLevel: String,
    val notes: String,
    val reportedAt: Long = System.currentTimeMillis(),
    val auditLogId: String? = null
)
