package com.syndx.app.data.local.entity

import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.Index
import androidx.room.PrimaryKey

@Entity(
    tableName = "symptom_sessions",
    foreignKeys = [
        ForeignKey(
            entity = PatientEntity::class,
            parentColumns = ["id"],
            childColumns = ["patientId"],
            onDelete = ForeignKey.CASCADE
        )
    ],
    indices = [Index("patientId")]
)
data class SymptomSessionEntity(
    @PrimaryKey
    val id: String,
    val patientId: String,
    val symptomCodes: String, // JSON array: ["HP:0001250", ...]
    val symptomLabels: String, // JSON array of display names
    val onsetDays: Int,
    val recordedAt: Long = System.currentTimeMillis()
)
