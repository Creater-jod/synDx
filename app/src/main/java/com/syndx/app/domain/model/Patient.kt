package com.syndx.app.domain.model

data class Patient(
    val id: String,
    val clinicianId: String,
    val fullName: String,
    val ageYears: Int,
    val sex: String,
    val village: String,
    val phcCode: String,
    val contactNumber: String = "",
    val registeredAt: Long = System.currentTimeMillis()
)
