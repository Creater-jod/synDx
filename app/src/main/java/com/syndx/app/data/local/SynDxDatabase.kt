package com.syndx.app.data.local

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.room.TypeConverters
import com.syndx.app.data.local.dao.*
import com.syndx.app.data.local.entity.*

@Database(
    entities = [
        ClinicianEntity::class,
        PatientEntity::class,
        SymptomSessionEntity::class,
        DiagnosisEntity::class,
        ReferralEntity::class,
        AuditLogEntity::class,
        ADREventEntity::class,
    ],
    version = 1,
    exportSchema = false,
)
@TypeConverters(Converters::class)
abstract class SynDxDatabase : RoomDatabase() {
    abstract fun clinicianDao(): ClinicianDao
    abstract fun patientDao(): PatientDao
    abstract fun symptomSessionDao(): SymptomSessionDao
    abstract fun diagnosisDao(): DiagnosisDao
    abstract fun referralDao(): ReferralDao
    abstract fun auditLogDao(): AuditLogDao
    abstract fun adrEventDao(): ADREventDao

    companion object {
        @Volatile
        private var INSTANCE: SynDxDatabase? = null

        fun build(context: Context): SynDxDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    SynDxDatabase::class.java,
                    "syndx_database"
                ).fallbackToDestructiveMigration().build()
                INSTANCE = instance
                instance
            }
        }
    }
}
