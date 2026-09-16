package com.syndx.app.presentation.screens.auth

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Refresh
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import com.syndx.app.domain.usecase.auth.RegisterClinicianUseCase
import com.syndx.app.presentation.components.SynDxButton
import com.syndx.app.presentation.components.SynDxTopBar
import com.syndx.app.presentation.components.ThreeDBackground
import com.syndx.app.presentation.viewmodel.AuthViewModel
import com.syndx.app.presentation.viewmodel.UiState
import com.syndx.app.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SignUpScreen(
    authViewModel: AuthViewModel,
    onBackClick: () -> Unit,
    onSignUpSuccess: () -> Unit
) {
    var fullName by remember { mutableStateOf("") }
    var clinicianId by remember { mutableStateOf(RegisterClinicianUseCase.generateClinicianId()) }
    var designation by remember { mutableStateOf("Medical Officer") }
    var phcCode by remember { mutableStateOf("") }
    var pin by remember { mutableStateOf("") }
    var confirmPin by remember { mutableStateOf("") }

    val designations = listOf("Medical Officer", "MBBS", "BHMS", "Nurse", "Health Worker")
    var designationExpanded by remember { mutableStateOf(false) }

    val signupState by authViewModel.signupState.collectAsState()

    LaunchedEffect(signupState) {
        if (signupState is UiState.Success) {
            authViewModel.resetState()
            onSignUpSuccess()
        }
    }

    Scaffold(
        topBar = {
            SynDxTopBar(
                title = "Register Clinician",
                onBackClick = onBackClick
            )
        }
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .background(BgCool)
        ) {
            ThreeDBackground()

            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = 24.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                item { Spacer(Modifier.height(8.dp)) }

                item {
                    OutlinedTextField(
                        value = fullName,
                        onValueChange = { fullName = it },
                        label = { Text("Full Name") },
                        singleLine = true,
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier.fillMaxWidth()
                    )
                }

                item {
                    OutlinedTextField(
                        value = clinicianId,
                        onValueChange = { clinicianId = it.uppercase() },
                        label = { Text("Clinician ID") },
                        trailingIcon = {
                            IconButton(onClick = { clinicianId = RegisterClinicianUseCase.generateClinicianId() }) {
                                Icon(Icons.Outlined.Refresh, contentDescription = "Regenerate ID", tint = Teal700)
                            }
                        },
                        singleLine = true,
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier.fillMaxWidth()
                    )
                }

                item {
                    ExposedDropdownMenuBox(
                        expanded = designationExpanded,
                        onExpandedChange = { designationExpanded = !designationExpanded }
                    ) {
                        OutlinedTextField(
                            value = designation,
                            onValueChange = {},
                            readOnly = true,
                            label = { Text("Designation") },
                            trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = designationExpanded) },
                            shape = RoundedCornerShape(12.dp),
                            modifier = Modifier
                                .menuAnchor()
                                .fillMaxWidth()
                        )
                        ExposedDropdownMenu(
                            expanded = designationExpanded,
                            onDismissRequest = { designationExpanded = false }
                        ) {
                            designations.forEach { option ->
                                DropdownMenuItem(
                                    text = { Text(option) },
                                    onClick = {
                                        designation = option
                                        designationExpanded = false
                                    }
                                )
                            }
                        }
                    }
                }

                item {
                    OutlinedTextField(
                        value = phcCode,
                        onValueChange = { if (it.length <= 6) phcCode = it.uppercase() },
                        label = { Text("PHC Code (e.g. PHC001)") },
                        singleLine = true,
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier.fillMaxWidth()
                    )
                }

                item {
                    OutlinedTextField(
                        value = pin,
                        onValueChange = { if (it.length <= 6 && it.all { ch -> ch.isDigit() }) pin = it },
                        label = { Text("PIN (Choose a 6-digit PIN)") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.NumberPassword),
                        visualTransformation = PasswordVisualTransformation(),
                        singleLine = true,
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier.fillMaxWidth()
                    )
                }

                item {
                    OutlinedTextField(
                        value = confirmPin,
                        onValueChange = { if (it.length <= 6 && it.all { ch -> ch.isDigit() }) confirmPin = it },
                        label = { Text("Confirm PIN") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.NumberPassword),
                        visualTransformation = PasswordVisualTransformation(),
                        singleLine = true,
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier.fillMaxWidth()
                    )
                }

                if (signupState is UiState.Error) {
                    item {
                        Text(
                            text = (signupState as UiState.Error).message,
                            color = ErrorRed,
                            style = MaterialTheme.typography.bodyMedium
                        )
                    }
                }

                item {
                    Spacer(Modifier.height(8.dp))
                    SynDxButton(
                        text = "Create Account",
                        isLoading = signupState is UiState.Loading,
                        onClick = {
                            authViewModel.register(
                                fullName = fullName,
                                designation = designation,
                                phcCode = phcCode,
                                pin = pin,
                                confirmPin = confirmPin,
                                customClinicianId = clinicianId
                            )
                        }
                    )
                }

                item { Spacer(Modifier.height(24.dp)) }
            }
        }
    }
}
