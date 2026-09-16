package com.syndx.app.presentation.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.syndx.app.data.datastore.ClinicianDataStore
import com.syndx.app.data.datastore.ClinicianPrefs
import com.syndx.app.domain.usecase.auth.LoginUseCase
import com.syndx.app.domain.usecase.auth.RegisterClinicianUseCase
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

class AuthViewModel(
    private val loginUseCase: LoginUseCase,
    private val registerClinicianUseCase: RegisterClinicianUseCase,
    private val clinicianDataStore: ClinicianDataStore
) : ViewModel() {

    val prefs: StateFlow<ClinicianPrefs?> = clinicianDataStore.prefs
        .stateIn(viewModelScope, SharingStarted.Eagerly, null)

    private val _loginState = MutableStateFlow<UiState<Unit>>(UiState.Idle)
    val loginState: StateFlow<UiState<Unit>> = _loginState.asStateFlow()

    private val _signupState = MutableStateFlow<UiState<String>>(UiState.Idle)
    val signupState: StateFlow<UiState<String>> = _signupState.asStateFlow()

    fun login(clinicianId: String, pin: String) {
        if (clinicianId.isBlank() || pin.isBlank()) {
            _loginState.value = UiState.Error("Please enter Clinician ID and PIN")
            return
        }
        viewModelScope.launch {
            _loginState.value = UiState.Loading
            val result = loginUseCase(clinicianId, pin)
            result.fold(
                onSuccess = { _loginState.value = UiState.Success(Unit) },
                onFailure = { _loginState.value = UiState.Error(it.message ?: "Invalid Clinician ID or PIN") }
            )
        }
    }

    fun register(
        fullName: String,
        designation: String,
        phcCode: String,
        pin: String,
        confirmPin: String,
        customClinicianId: String
    ) {
        if (fullName.isBlank() || designation.isBlank() || phcCode.isBlank() || pin.isBlank()) {
            _signupState.value = UiState.Error("All fields are required")
            return
        }
        if (pin != confirmPin) {
            _signupState.value = UiState.Error("PINs do not match")
            return
        }
        if (pin.length != 6) {
            _signupState.value = UiState.Error("PIN must be exactly 6 digits")
            return
        }

        viewModelScope.launch {
            _signupState.value = UiState.Loading
            val result = registerClinicianUseCase(
                fullName = fullName,
                designation = designation,
                phcCode = phcCode,
                pin = pin,
                customClinicianId = customClinicianId
            )
            result.fold(
                onSuccess = { generatedId -> _signupState.value = UiState.Success(generatedId) },
                onFailure = { _signupState.value = UiState.Error(it.message ?: "Registration failed") }
            )
        }
    }

    fun completeOnboarding() {
        viewModelScope.launch {
            clinicianDataStore.setOnboardingDone(true)
        }
    }

    fun resetState() {
        _loginState.value = UiState.Idle
        _signupState.value = UiState.Idle
    }
}
