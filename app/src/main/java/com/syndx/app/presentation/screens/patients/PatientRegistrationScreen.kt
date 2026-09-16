package com.syndx.app.presentation.screens.patients

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import com.syndx.app.presentation.components.SynDxButton
import com.syndx.app.presentation.components.SynDxTopBar
import com.syndx.app.presentation.components.ThreeDBackground
import com.syndx.app.presentation.components.ThreeDCard
import com.syndx.app.presentation.viewmodel.PatientViewModel
import com.syndx.app.presentation.viewmodel.UiState
import com.syndx.app.ui.theme.*

@Composable
fun PatientRegistrationScreen(
    patientViewModel: PatientViewModel,
    defaultPhcCode: String = "PHC-001",
    onBackClick: () -> Unit,
    onNavigateToSymptoms: (String) -> Unit
) {
    var fullName by remember { mutableStateOf("") }
    var age by remember { mutableStateOf("") }
    var sex by remember { mutableStateOf("MALE") }
    var village by remember { mutableStateOf("") }
    var phcCode by remember { mutableStateOf(defaultPhcCode) }
    var contactNumber by remember { mutableStateOf("") }

    val registrationState by patientViewModel.registrationState.collectAsState()

    LaunchedEffect(registrationState) {
        if (registrationState is UiState.Success) {
            val patientId = (registrationState as UiState.Success<String>).data
            patientViewModel.resetRegistrationState()
            onNavigateToSymptoms(patientId)
        }
    }

    Scaffold(
        topBar = {
            SynDxTopBar(
                title = "New Patient",
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

            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .verticalScroll(rememberScrollState())
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                // Header Surface
                ThreeDCard(
                    modifier = Modifier.fillMaxWidth(),
                    backgroundColor = Teal100,
                    elevation = 4.dp
                ) {
                    Text(
                        text = "Patient Demographics",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = TextPri,
                        modifier = Modifier.padding(16.dp)
                    )
                }

                OutlinedTextField(
                    value = fullName,
                    onValueChange = { fullName = it },
                    label = { Text("Full Name *") },
                    singleLine = true,
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.fillMaxWidth()
                )

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    OutlinedTextField(
                        value = age,
                        onValueChange = { if (it.length <= 3 && it.all { ch -> ch.isDigit() }) age = it },
                        label = { Text("Age (yrs) *") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        singleLine = true,
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier.weight(0.4f)
                    )

                    // Sex selector
                    Row(
                        modifier = Modifier.weight(0.6f),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceEvenly
                    ) {
                        listOf("MALE" to "M", "FEMALE" to "F", "OTHER" to "O").forEach { (value, label) ->
                            FilterChip(
                                selected = sex == value,
                                onClick = { sex = value },
                                label = { Text(label, fontWeight = FontWeight.SemiBold) },
                                colors = FilterChipDefaults.filterChipColors(
                                    selectedContainerColor = Teal700,
                                    selectedLabelColor = androidx.compose.ui.graphics.Color.White
                                )
                            )
                        }
                    }
                }

                OutlinedTextField(
                    value = village,
                    onValueChange = { village = it },
                    label = { Text("Village / Locality *") },
                    singleLine = true,
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.fillMaxWidth()
                )

                OutlinedTextField(
                    value = phcCode,
                    onValueChange = { phcCode = it.uppercase() },
                    label = { Text("PHC Code") },
                    singleLine = true,
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.fillMaxWidth()
                )

                OutlinedTextField(
                    value = contactNumber,
                    onValueChange = { if (it.length <= 10 && it.all { ch -> ch.isDigit() }) contactNumber = it },
                    label = { Text("Contact Number (Optional)") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
                    singleLine = true,
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.fillMaxWidth()
                )

                if (registrationState is UiState.Error) {
                    Text(
                        text = (registrationState as UiState.Error).message,
                        color = ErrorRed,
                        style = MaterialTheme.typography.bodyMedium
                    )
                }

                Spacer(Modifier.height(16.dp))

                val isFormValid = fullName.isNotBlank() && age.isNotBlank() && village.isNotBlank()

                SynDxButton(
                    text = "Register & Add Symptoms",
                    enabled = isFormValid,
                    isLoading = registrationState is UiState.Loading,
                    onClick = {
                        patientViewModel.registerPatient(
                            fullName = fullName,
                            age = age,
                            sex = sex,
                            village = village,
                            phcCode = phcCode,
                            contactNumber = contactNumber
                        )
                    }
                )

                Spacer(Modifier.height(24.dp))
            }
        }
    }
}
