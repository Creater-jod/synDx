package com.syndx.app.domain.model

data class Diagnosis(
    val id: String,
    val patientId: String,
    val sessionId: String,
    val probableDisease: String,
    val icd10Code: String,
    val confidenceScore: Float,
    val confidenceScoreDP: Float,
    val alternativeDiseases: List<String>,
    val explanationBullets: List<String>,
    val urgencyLevel: String,
    val referralReason: String,
    val adrWarnings: List<String>,
    val modelVersion: String = "gemini-2.0-flash",
    val isOfflineFallback: Boolean = false,
    val auditLogId: String? = null,
    val diagnosedAt: Long = System.currentTimeMillis()
)
