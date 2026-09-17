package com.syndx.app.data.local.entity

import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.Index
import androidx.room.PrimaryKey

@Entity(
    tableName = "patients",
    foreignKeys = [
        ForeignKey(
            entity = ClinicianEntity::class,
            parentColumns = ["id"],
            childColumns = ["clinicianId"],
            onDelete = ForeignKey.CASCADE
        )
    ],
    indices = [Index("clinicianId")]
)
data class PatientEntity(
    @PrimaryKey
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
