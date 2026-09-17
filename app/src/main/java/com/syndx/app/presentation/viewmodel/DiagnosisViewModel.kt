package com.syndx.app.presentation.viewmodel

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.syndx.app.domain.model.Diagnosis
import com.syndx.app.domain.model.Patient
import com.syndx.app.domain.repository.AuditRepository
import com.syndx.app.domain.repository.DiagnosisRepository
import com.syndx.app.domain.repository.PatientRepository
import com.syndx.app.domain.usecase.diagnosis.DiagnoseSymptomUseCase
import com.syndx.app.domain.usecase.diagnosis.GetDiagnosisUseCase
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class DiagnosisViewModel(
    savedStateHandle: SavedStateHandle? = null,
    private val diagnoseSymptomUseCase: DiagnoseSymptomUseCase,
    private val getDiagnosisUseCase: GetDiagnosisUseCase,
    private val patientRepository: PatientRepository,
    private val diagnosisRepository: DiagnosisRepository,
    private val auditRepository: AuditRepository
) : ViewModel() {

    val sessionId: String? = savedStateHandle?.get<String>("sessionId")

    private val _diagnosisState = MutableStateFlow<UiState<Diagnosis>>(UiState.Idle)
    val diagnosisState: StateFlow<UiState<Diagnosis>> = _diagnosisState.asStateFlow()

    private val _currentPatient = MutableStateFlow<Patient?>(null)
    val currentPatient: StateFlow<Patient?> = _currentPatient.asStateFlow()

    private val _auditTxHash = MutableStateFlow<String?>(null)
    val auditTxHash: StateFlow<String?> = _auditTxHash.asStateFlow()

    private val _analysisProgress = MutableStateFlow<UiState<String>>(UiState.Idle)
    val analysisProgress: StateFlow<UiState<String>> = _analysisProgress.asStateFlow()

    init {
        if (!sessionId.isNullOrBlank()) {
            loadDiagnosisBySession(sessionId)
        }
    }

    fun loadDiagnosisBySession(sessionId: String) {
        viewModelScope.launch {
            _diagnosisState.value = UiState.Loading
            val diag = getDiagnosisUseCase.bySessionId(sessionId)
            if (diag != null) {
                _diagnosisState.value = UiState.Success(diag)
                loadPatient(diag.patientId)
                loadAuditLog(diag.auditLogId)
            } else {
                _diagnosisState.value = UiState.Error("Diagnosis not found for session $sessionId")
            }
        }
    }

    fun loadDiagnosisById(id: String) {
        viewModelScope.launch {
            _diagnosisState.value = UiState.Loading
            val diag = getDiagnosisUseCase.byId(id)
            if (diag != null) {
                _diagnosisState.value = UiState.Success(diag)
                loadPatient(diag.patientId)
                loadAuditLog(diag.auditLogId)
            } else {
                _diagnosisState.value = UiState.Error("Diagnosis not found")
            }
        }
    }

    private fun loadPatient(patientId: String) {
        viewModelScope.launch {
            _currentPatient.value = patientRepository.getPatientById(patientId)
        }
    }

    private fun loadAuditLog(auditLogId: String?) {
        if (auditLogId == null) return
        viewModelScope.launch {
            // Check audit logs for polygon hash
            auditRepository.getAllAuditLogs().collect { logs ->
                val match = logs.firstOrNull { it.id == auditLogId }
                _auditTxHash.value = match?.polygonTxHash
            }
        }
    }

    fun analyzeSymptoms(
        patientId: String,
        symptomCodes: List<String>,
        symptomLabels: List<String>,
        onsetDays: Int,
        onSuccess: (String) -> Unit
    ) {
        if (symptomCodes.isEmpty()) {
            _analysisProgress.value = UiState.Error("Please select at least one symptom")
            return
        }
        viewModelScope.launch {
            _analysisProgress.value = UiState.Loading
            val result = diagnoseSymptomUseCase(
                patientId = patientId,
                symptomCodes = symptomCodes,
                symptomLabels = symptomLabels,
                onsetDays = onsetDays
            )
            result.fold(
                onSuccess = { newSessionId ->
                    _analysisProgress.value = UiState.Success(newSessionId)
                    onSuccess(newSessionId)
                },
                onFailure = {
                    _analysisProgress.value = UiState.Error(it.message ?: "Diagnosis failed")
                }
            )
        }
    }

    fun resetAnalysisState() {
        _analysisProgress.value = UiState.Idle
    }
}
