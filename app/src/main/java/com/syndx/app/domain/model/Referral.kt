package com.syndx.app.domain.model

data class Referral(
    val id: String,
    val patientId: String,
    val diagnosisId: String,
    val referralCode: String,
    val destinationHospital: String,
    val urgencyLevel: String,
    val referralText: String,
    val additionalNotes: String,
    val issuedAt: Long? = null,
    val auditLogId: String? = null
)
