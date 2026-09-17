package com.syndx.app.presentation.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.syndx.app.data.datastore.ClinicianDataStore
import com.syndx.app.data.local.dao.ClinicianDao
import com.syndx.app.domain.model.Clinician
import com.syndx.app.domain.model.Diagnosis
import com.syndx.app.domain.model.Patient
import com.syndx.app.domain.repository.AuditRepository
import com.syndx.app.domain.repository.DiagnosisRepository
import com.syndx.app.domain.repository.PatientRepository
import com.syndx.app.util.NetworkUtil
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

data class DashboardState(
    val clinician: Clinician? = null,
    val totalPatients: Int = 0,
    val diagnosesToday: Int = 0,
    val pendingSyncCount: Int = 0,
    val recentDiagnoses: List<Pair<Diagnosis, Patient?>> = emptyList(),
    val isOnline: Boolean = true
)

class DashboardViewModel(
    private val patientRepository: PatientRepository,
    private val diagnosisRepository: DiagnosisRepository,
    private val auditRepository: AuditRepository,
    private val clinicianDao: ClinicianDao,
    private val clinicianDataStore: ClinicianDataStore,
    private val networkUtil: NetworkUtil
) : ViewModel() {

    private val _isOnline = MutableStateFlow(networkUtil.isOnline())
    val isOnline: StateFlow<Boolean> = _isOnline.asStateFlow()

    private val _currentClinician = MutableStateFlow<Clinician?>(null)
    val currentClinician: StateFlow<Clinician?> = _currentClinician.asStateFlow()

    val totalPatients: StateFlow<Int> = patientRepository.getPatientCount()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0)

    val diagnosesToday: StateFlow<Int> = diagnosisRepository.countDiagnosesToday()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0)

    val pendingSyncCount: StateFlow<Int> = auditRepository.getPendingSyncCount()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0)

    val recentDiagnoses: StateFlow<List<Diagnosis>> = diagnosisRepository.getRecentDiagnoses(5)
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    private val _patientsMap = MutableStateFlow<Map<String, Patient>>(emptyMap())
    val patientsMap: StateFlow<Map<String, Patient>> = _patientsMap.asStateFlow()

    init {
        loadClinician()
        observePatients()
        refreshNetwork()
    }

    fun refreshNetwork() {
        _isOnline.value = networkUtil.isOnline()
    }

    private fun loadClinician() {
        viewModelScope.launch {
            clinicianDataStore.prefs.collect { prefs ->
                val id = prefs.clinicianId
                if (!id.isNullOrBlank()) {
                    val entity = clinicianDao.getById(id)
                    if (entity != null) {
                        _currentClinician.value = Clinician(
                            id = entity.id,
                            fullName = entity.fullName,
                            clinicianId = entity.clinicianId,
                            designation = entity.designation,
                            phcCode = entity.phcCode,
                            pinHash = entity.pinHash,
                            language = entity.language,
                            offlineOnlyMode = entity.offlineOnlyMode,
                            createdAt = entity.createdAt
                        )
                    }
                }
            }
        }
    }

    private fun observePatients() {
        viewModelScope.launch {
            patientRepository.getAllPatients().collect { list ->
                _patientsMap.value = list.associateBy { it.id }
            }
        }
    }
}
