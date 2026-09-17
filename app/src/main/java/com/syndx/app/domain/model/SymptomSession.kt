package com.syndx.app.domain.model

data class SymptomSession(
    val id: String,
    val patientId: String,
    val symptomCodes: List<String>,
    val symptomLabels: List<String>,
    val onsetDays: Int,
    val recordedAt: Long = System.currentTimeMillis()
)
