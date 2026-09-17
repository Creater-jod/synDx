package com.syndx.app.presentation.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.syndx.app.data.datastore.ClinicianDataStore
import com.syndx.app.domain.model.Diagnosis
import com.syndx.app.domain.model.Patient
import com.syndx.app.domain.repository.DiagnosisRepository
import com.syndx.app.domain.repository.PatientRepository
import com.syndx.app.domain.usecase.patient.SavePatientUseCase
import com.syndx.app.util.DateUtil
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

enum class PatientFilter {
    ALL, TODAY, URGENT, PENDING_REFERRAL
}

class PatientViewModel(
    private val patientRepository: PatientRepository,
    private val diagnosisRepository: DiagnosisRepository,
    private val savePatientUseCase: SavePatientUseCase,
    private val clinicianDataStore: ClinicianDataStore
) : ViewModel() {

    private val _searchQuery = MutableStateFlow("")
    val searchQuery: StateFlow<String> = _searchQuery.asStateFlow()

    private val _selectedFilter = MutableStateFlow(PatientFilter.ALL)
    val selectedFilter: StateFlow<PatientFilter> = _selectedFilter.asStateFlow()

    private val _allPatients = patientRepository.getAllPatients()
    private val _allDiagnoses = diagnosisRepository.getRecentDiagnoses(100)

    val filteredPatients: StateFlow<List<Pair<Patient, Diagnosis?>>> = combine(
        _allPatients,
        _allDiagnoses,
        _searchQuery,
        _selectedFilter
    ) { patients, diagnoses, query, filter ->
        val latestDiagMap = diagnoses.groupBy { it.patientId }
            .mapValues { (_, list) -> list.maxByOrNull { it.diagnosedAt } }

        val startOfDay = DateUtil.getStartOfDay()

        patients
            .filter { p ->
                val matchesQuery = query.isBlank() ||
                        p.fullName.contains(query, ignoreCase = true) ||
                        p.village.contains(query, ignoreCase = true) ||
                        p.contactNumber.contains(query)

                val diag = latestDiagMap[p.id]
                val matchesFilter = when (filter) {
                    PatientFilter.ALL -> true
                    PatientFilter.TODAY -> p.registeredAt >= startOfDay
                    PatientFilter.URGENT -> diag?.urgencyLevel?.uppercase() in listOf("URGENT", "EMERGENCY")
                    PatientFilter.PENDING_REFERRAL -> diag != null // Has diagnosis, checking referral
                }

                matchesQuery && matchesFilter
            }
            .map { p -> Pair(p, latestDiagMap[p.id]) }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    private val _registrationState = MutableStateFlow<UiState<String>>(UiState.Idle)
    val registrationState: StateFlow<UiState<String>> = _registrationState.asStateFlow()

    fun onSearchQueryChanged(newQuery: String) {
        _searchQuery.value = newQuery
    }

    fun onFilterSelected(filter: PatientFilter) {
        _selectedFilter.value = filter
    }

    fun registerPatient(
        fullName: String,
        age: String,
        sex: String,
        village: String,
        phcCode: String,
        contactNumber: String
    ) {
        val ageInt = age.toIntOrNull()
        if (fullName.isBlank() || ageInt == null || village.isBlank()) {
            _registrationState.value = UiState.Error("Full Name, Age, and Village are required")
            return
        }

        viewModelScope.launch {
            _registrationState.value = UiState.Loading
            val prefs = clinicianDataStore.prefs.first()
            val clinicianId = prefs.clinicianId ?: "DEFAULT_CLINICIAN"

            val result = savePatientUseCase(
                clinicianId = clinicianId,
                fullName = fullName,
                ageYears = ageInt,
                sex = sex,
                village = village,
                phcCode = phcCode.ifBlank { "PHC-DEFAULT" },
                contactNumber = contactNumber
            )

            result.fold(
                onSuccess = { patientId -> _registrationState.value = UiState.Success(patientId) },
                onFailure = { _registrationState.value = UiState.Error(it.message ?: "Failed to save patient") }
            )
        }
    }

    fun resetRegistrationState() {
        _registrationState.value = UiState.Idle
    }
}
