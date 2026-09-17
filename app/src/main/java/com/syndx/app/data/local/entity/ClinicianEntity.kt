package com.syndx.app.data.local.entity

import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey

@Entity(
    tableName = "clinicians",
    indices = [Index(value = ["clinicianId"], unique = true)]
)
data class ClinicianEntity(
    @PrimaryKey
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
