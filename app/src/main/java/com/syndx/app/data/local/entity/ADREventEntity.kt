package com.syndx.app.data.local.entity

import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.Index
import androidx.room.PrimaryKey

@Entity(
    tableName = "adr_events",
    foreignKeys = [
        ForeignKey(
            entity = PatientEntity::class,
            parentColumns = ["id"],
            childColumns = ["patientId"],
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
        Index("auditLogId")
    ]
)
data class ADREventEntity(
    @PrimaryKey
    val id: String,
    val patientId: String,
    val drugName: String,
    val reactionCode: String,
    val severityLevel: String,
    val notes: String,
    val reportedAt: Long = System.currentTimeMillis(),
    val auditLogId: String? = null
)
