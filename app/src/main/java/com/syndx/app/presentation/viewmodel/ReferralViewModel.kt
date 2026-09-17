package com.syndx.app.presentation.viewmodel

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.syndx.app.data.datastore.ClinicianDataStore
import com.syndx.app.data.local.dao.ClinicianDao
import com.syndx.app.domain.model.Clinician
import com.syndx.app.domain.model.Diagnosis
import com.syndx.app.domain.model.Patient
import com.syndx.app.domain.model.Referral
import com.syndx.app.domain.repository.AuditRepository
import com.syndx.app.domain.repository.DiagnosisRepository
import com.syndx.app.domain.repository.PatientRepository
import com.syndx.app.domain.usecase.referral.GenerateReferralUseCase
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch

class ReferralViewModel(
    savedStateHandle: SavedStateHandle? = null,
    private val diagnosisRepository: DiagnosisRepository,
    private val patientRepository: PatientRepository,
    private val auditRepository: AuditRepository,
    private val clinicianDao: ClinicianDao,
    private val clinicianDataStore: ClinicianDataStore,
    private val generateReferralUseCase: GenerateReferralUseCase
) : ViewModel() {

    val diagnosisId: String? = savedStateHandle?.get<String>("diagnosisId")

    private val _diagnosis = MutableStateFlow<Diagnosis?>(null)
    val diagnosis: StateFlow<Diagnosis?> = _diagnosis.asStateFlow()

    private val _patient = MutableStateFlow<Patient?>(null)
    val patient: StateFlow<Patient?> = _patient.asStateFlow()

    private val _clinician = MutableStateFlow<Clinician?>(null)
    val clinician: StateFlow<Clinician?> = _clinician.asStateFlow()

    val referralCode = MutableStateFlow(GenerateReferralUseCase.generateReferralCode())
    val destinationHospital = MutableStateFlow("District Hospital")
    val urgencyLevel = MutableStateFlow("ROUTINE")
    val additionalNotes = MutableStateFlow("")
    val referralText = MutableStateFlow("")

    private val _existingReferral = MutableStateFlow<Referral?>(null)
    val existingReferral: StateFlow<Referral?> = _existingReferral.asStateFlow()

    private val _issueState = MutableStateFlow<UiState<Referral>>(UiState.Idle)
    val issueState: StateFlow<UiState<Referral>> = _issueState.asStateFlow()

    init {
        if (!diagnosisId.isNullOrBlank()) {
            loadData(diagnosisId)
        }
    }

    private fun loadData(diagId: String) {
        viewModelScope.launch {
            val diag = diagnosisRepository.getDiagnosisById(diagId)
            _diagnosis.value = diag

            if (diag != null) {
                urgencyLevel.value = diag.urgencyLevel
                val pat = patientRepository.getPatientById(diag.patientId)
                _patient.value = pat

                val prefs = clinicianDataStore.prefs.first()
                val clinId = prefs.clinicianId
                if (!clinId.isNullOrBlank()) {
                    val entity = clinicianDao.getById(clinId)
                    if (entity != null) {
                        _clinician.value = Clinician(
                            id = entity.id,
                            fullName = entity.fullName,
                            clinicianId = entity.clinicianId,
                            designation = entity.designation,
                            phcCode = entity.phcCode,
                            pinHash = entity.pinHash
                        )
                    }
                }

                // Check existing referral
                val existing = diagnosisRepository.getReferralByDiagnosisId(diagId)
                if (existing != null) {
                    _existingReferral.value = existing
                    referralCode.value = existing.referralCode
                    destinationHospital.value = existing.destinationHospital
                    urgencyLevel.value = existing.urgencyLevel
                    additionalNotes.value = existing.additionalNotes
                    referralText.value = existing.referralText
                } else {
                    updateReferralPreview()
                }
            }
        }
    }

    fun updateReferralPreview() {
        val diag = _diagnosis.value ?: return
        val pat = _patient.value ?: return
        val clin = _clinician.value ?: Clinician(
            id = "mock",
            fullName = "Dr. PHC Medical Officer",
            clinicianId = "SYN-DEFAULT",
            designation = "Medical Officer",
            phcCode = "PHC-001",
            pinHash = ""
        )

        referralText.value = generateReferralUseCase.buildReferralText(
            referralCode = referralCode.value,
            clinician = clin,
            patient = pat,
            diagnosis = diag,
            destinationHospital = destinationHospital.value,
            urgency = urgencyLevel.value,
            additionalNotes = additionalNotes.value,
            txHash = null
        )
    }

    fun markAsIssued() {
        val diag = _diagnosis.value ?: return
        val pat = _patient.value ?: return

        viewModelScope.launch {
            _issueState.value = UiState.Loading
            val result = generateReferralUseCase.issueReferral(
                referralId = _existingReferral.value?.id ?: "",
                patientId = pat.id,
                diagnosisId = diag.id,
                referralCode = referralCode.value,
                destinationHospital = destinationHospital.value,
                urgencyLevel = urgencyLevel.value,
                referralText = referralText.value,
                additionalNotes = additionalNotes.value
            )

            result.fold(
                onSuccess = { ref ->
                    _existingReferral.value = ref
                    _issueState.value = UiState.Success(ref)
                },
                onFailure = {
                    _issueState.value = UiState.Error(it.message ?: "Failed to issue referral")
                }
            )
        }
    }
}
