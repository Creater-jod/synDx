package com.syndx.app

import android.app.Application
import androidx.work.*
import com.syndx.app.data.ai.GeminiDiagnosisService
import com.syndx.app.data.datastore.ClinicianDataStore
import com.syndx.app.data.local.SynDxDatabase
import com.syndx.app.data.repository.AuditRepositoryImpl
import com.syndx.app.data.repository.DiagnosisRepositoryImpl
import com.syndx.app.data.repository.PatientRepositoryImpl
import com.syndx.app.data.worker.SyncAuditWorker
import com.syndx.app.domain.repository.AuditRepository
import com.syndx.app.domain.repository.DiagnosisRepository
import com.syndx.app.domain.repository.PatientRepository
import com.syndx.app.domain.usecase.adr.LogADREventUseCase
import com.syndx.app.domain.usecase.audit.SyncAuditToBlockchainUseCase
import com.syndx.app.domain.usecase.auth.LoginUseCase
import com.syndx.app.domain.usecase.auth.RegisterClinicianUseCase
import com.syndx.app.domain.usecase.diagnosis.DiagnoseSymptomUseCase
import com.syndx.app.domain.usecase.diagnosis.GetDiagnosisUseCase
import com.syndx.app.domain.usecase.patient.GetPatientsUseCase
import com.syndx.app.domain.usecase.patient.SavePatientUseCase
import com.syndx.app.domain.usecase.referral.GenerateReferralUseCase
import com.syndx.app.util.NetworkUtil
import java.util.concurrent.TimeUnit

class SynDxApp : Application() {

    // Database & DataStore
    lateinit var database: SynDxDatabase
        private set
    lateinit var clinicianDataStore: ClinicianDataStore
        private set
    lateinit var networkUtil: NetworkUtil
        private set

    // Repositories
    lateinit var patientRepository: PatientRepository
        private set
    lateinit var diagnosisRepository: DiagnosisRepository
        private set
    lateinit var auditRepository: AuditRepository
        private set

    // Services
    lateinit var geminiService: GeminiDiagnosisService
        private set

    // Use Cases
    lateinit var loginUseCase: LoginUseCase
        private set
    lateinit var registerClinicianUseCase: RegisterClinicianUseCase
        private set
    lateinit var savePatientUseCase: SavePatientUseCase
        private set
    lateinit var getPatientsUseCase: GetPatientsUseCase
        private set
    lateinit var diagnoseSymptomUseCase: DiagnoseSymptomUseCase
        private set
    lateinit var getDiagnosisUseCase: GetDiagnosisUseCase
        private set
    lateinit var generateReferralUseCase: GenerateReferralUseCase
        private set
    lateinit var syncAuditUseCase: SyncAuditToBlockchainUseCase
        private set
    lateinit var logADREventUseCase: LogADREventUseCase
        private set

    override fun onCreate() {
        super.onCreate()
        instance = this

        // 1. Local Persistence
        database = SynDxDatabase.build(this)
        clinicianDataStore = ClinicianDataStore(this)
        networkUtil = NetworkUtil(this)

        // 2. Repositories
        patientRepository = PatientRepositoryImpl(database.patientDao())
        diagnosisRepository = DiagnosisRepositoryImpl(
            database.diagnosisDao(),
            database.symptomSessionDao(),
            database.referralDao(),
            database.adrEventDao()
        )
        auditRepository = AuditRepositoryImpl(database.auditLogDao())

        // 3. AI Service
        geminiService = GeminiDiagnosisService(this)

        // 4. Use Cases
        loginUseCase = LoginUseCase(database.clinicianDao(), clinicianDataStore)
        registerClinicianUseCase = RegisterClinicianUseCase(database.clinicianDao(), clinicianDataStore)
        savePatientUseCase = SavePatientUseCase(patientRepository, auditRepository)
        getPatientsUseCase = GetPatientsUseCase(patientRepository)
        diagnoseSymptomUseCase = DiagnoseSymptomUseCase(
            diagnosisRepository,
            patientRepository,
            auditRepository,
            geminiService
        )
        getDiagnosisUseCase = GetDiagnosisUseCase(diagnosisRepository)
        generateReferralUseCase = GenerateReferralUseCase(diagnosisRepository, auditRepository)
        syncAuditUseCase = SyncAuditToBlockchainUseCase(auditRepository)
        logADREventUseCase = LogADREventUseCase(diagnosisRepository, auditRepository)

        // 5. Schedule Background Periodic Blockchain Sync (6 hours)
        schedulePeriodicAuditSync()
    }

    private fun schedulePeriodicAuditSync() {
        val constraints = Constraints.Builder()
            .setRequiredNetworkType(NetworkType.CONNECTED)
            .build()
        val request = PeriodicWorkRequestBuilder<SyncAuditWorker>(6, TimeUnit.HOURS)
            .setConstraints(constraints)
            .build()
        WorkManager.getInstance(this).enqueueUniquePeriodicWork(
            "audit_sync",
            ExistingPeriodicWorkPolicy.KEEP,
            request
        )
    }

    companion object {
        lateinit var instance: SynDxApp
            private set
    }
}
