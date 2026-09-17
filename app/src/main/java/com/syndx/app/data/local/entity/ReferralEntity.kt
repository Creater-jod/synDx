package com.syndx.app.data.local.entity

import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.Index
import androidx.room.PrimaryKey

@Entity(
    tableName = "referrals",
    foreignKeys = [
        ForeignKey(
            entity = PatientEntity::class,
            parentColumns = ["id"],
            childColumns = ["patientId"],
            onDelete = ForeignKey.CASCADE
        ),
        ForeignKey(
            entity = DiagnosisEntity::class,
            parentColumns = ["id"],
            childColumns = ["diagnosisId"],
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
        Index("diagnosisId"),
        Index("auditLogId")
    ]
)
data class ReferralEntity(
    @PrimaryKey
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
