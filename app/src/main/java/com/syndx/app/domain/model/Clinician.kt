package com.syndx.app.domain.model

data class Clinician(
    val id: String,
    val fullName: String,
    val clinicianId: String,
    val designation: String,
    val phcCode: String,
    val pinHash: String,
    val language: String = "EN",
    val offlineOnlyMode: Boolean = false,
    val createdAt: Long = System.currentTimeMillis()
)
