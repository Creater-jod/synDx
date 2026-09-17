package com.syndx.app.data.local.entity

import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.Index
import androidx.room.PrimaryKey

@Entity(
    tableName = "diagnoses",
    foreignKeys = [
        ForeignKey(
            entity = PatientEntity::class,
            parentColumns = ["id"],
            childColumns = ["patientId"],
            onDelete = ForeignKey.CASCADE
        ),
        ForeignKey(
            entity = SymptomSessionEntity::class,
            parentColumns = ["id"],
            childColumns = ["sessionId"],
            onDelete = ForeignKey.CASCADE
        ),
        ForeignKey(
            entity = AuditLogEntity::class,
            parentColumns = ["id"],
            childColumns = ["auditLogId"],
            onDelete = ForeignKey.SET_NULL
        )
    ],
    indices = [
        Index("patientId"),
        Index("sessionId"),
        Index("auditLogId")
    ]
)
data class DiagnosisEntity(
    @PrimaryKey
    val id: String,
    val patientId: String,
    val sessionId: String,
    val probableDisease: String,
    val icd10Code: String,
    val confidenceScore: Float,
    val confidenceScoreDP: Float,
    val alternativeDiseases: String, // JSON array
    val explanationBullets: String, // JSON array, 3 items
    val urgencyLevel: String, // ROUTINE / URGENT / EMERGENCY
    val referralReason: String,
    val adrWarnings: String, // JSON array of drug names to avoid
    val modelVersion: String = "gemini-2.0-flash",
    val isOfflineFallback: Boolean = false,
    val auditLogId: String? = null,
    val diagnosedAt: Long = System.currentTimeMillis()
)
