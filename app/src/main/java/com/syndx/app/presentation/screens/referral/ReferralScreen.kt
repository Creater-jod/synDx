package com.syndx.app.presentation.screens.referral

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.syndx.app.presentation.components.SynDxButton
import com.syndx.app.presentation.components.SynDxTopBar
import com.syndx.app.presentation.components.ThreeDBackground
import com.syndx.app.presentation.components.ThreeDCard
import com.syndx.app.presentation.components.UrgencyBadge
import com.syndx.app.presentation.viewmodel.ReferralViewModel
import com.syndx.app.presentation.viewmodel.UiState
import com.syndx.app.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ReferralScreen(
    diagnosisId: String,
    referralViewModel: ReferralViewModel,
    onBackClick: () -> Unit
) {
    val context = LocalContext.current

    val diagnosis by referralViewModel.diagnosis.collectAsState()
    val patient by referralViewModel.patient.collectAsState()
    val referralCode by referralViewModel.referralCode.collectAsState()
    val destinationHospital by referralViewModel.destinationHospital.collectAsState()
    val urgencyLevel by referralViewModel.urgencyLevel.collectAsState()
    val additionalNotes by referralViewModel.additionalNotes.collectAsState()
    val referralText by referralViewModel.referralText.collectAsState()
    val existingReferral by referralViewModel.existingReferral.collectAsState()
    val issueState by referralViewModel.issueState.collectAsState()

    var hospitalExpanded by remember { mutableStateOf(false) }
    val hospitalSuggestions = listOf(
        "District Hospital",
        "Medical College Hospital",
        "AIIMS",
        "Apollo Hospital",
        "Community Health Centre (CHC)"
    )

    var urgencyExpanded by remember { mutableStateOf(false) }
    val urgencyOptions = listOf("ROUTINE", "URGENT", "EMERGENCY")

    LaunchedEffect(destinationHospital, urgencyLevel, additionalNotes) {
        referralViewModel.updateReferralPreview()
    }

    LaunchedEffect(issueState) {
        if (issueState is UiState.Success) {
            Toast.makeText(context, "Referral issued & logged to blockchain", Toast.LENGTH_SHORT).show()
        }
    }

    Scaffold(
        topBar = {
            SynDxTopBar(
                title = "Referral Letter",
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
                    .padding(horizontal = 16.dp),
                verticalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                item { Spacer(Modifier.height(4.dp)) }

                // Referral Code Chip
                item {
                    ThreeDCard(
                        modifier = Modifier.fillMaxWidth(),
                        backgroundColor = Teal100,
                        elevation = 4.dp
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(horizontal = 16.dp, vertical = 12.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text("REF CODE:", style = MaterialTheme.typography.labelMedium, color = TextSec)
                            Text(
                                text = referralCode,
                                style = MaterialTheme.typography.titleMedium,
                                color = Teal700,
                                fontFamily = FontFamily.Monospace,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }

                // Destination Hospital Dropdown
                item {
                    ExposedDropdownMenuBox(
                        expanded = hospitalExpanded,
                        onExpandedChange = { hospitalExpanded = !hospitalExpanded }
                    ) {
                        OutlinedTextField(
                            value = destinationHospital,
                            onValueChange = { referralViewModel.destinationHospital.value = it },
                            label = { Text("Destination Hospital") },
                            trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = hospitalExpanded) },
                            shape = RoundedCornerShape(12.dp),
                            modifier = Modifier
                                .menuAnchor()
                                .fillMaxWidth()
                        )
                        ExposedDropdownMenu(
                            expanded = hospitalExpanded,
                            onDismissRequest = { hospitalExpanded = false }
                        ) {
                            hospitalSuggestions.forEach { hospital ->
                                DropdownMenuItem(
                                    text = { Text(hospital) },
                                    onClick = {
                                        referralViewModel.destinationHospital.value = hospital
                                        hospitalExpanded = false
                                    }
                                )
                            }
                        }
                    }
                }

                // Urgency Selector
                item {
                    ExposedDropdownMenuBox(
                        expanded = urgencyExpanded,
                        onExpandedChange = { urgencyExpanded = !urgencyExpanded }
                    ) {
                        OutlinedTextField(
                            value = urgencyLevel,
                            onValueChange = {},
                            readOnly = true,
                            label = { Text("Urgency Level") },
                            trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = urgencyExpanded) },
                            leadingIcon = { UrgencyBadge(urgency = urgencyLevel) },
                            shape = RoundedCornerShape(12.dp),
                            modifier = Modifier
                                .menuAnchor()
                                .fillMaxWidth()
                        )
                        ExposedDropdownMenu(
                            expanded = urgencyExpanded,
                            onDismissRequest = { urgencyExpanded = false }
                        ) {
                            urgencyOptions.forEach { opt ->
                                DropdownMenuItem(
                                    text = { Text(opt) },
                                    onClick = {
                                        referralViewModel.urgencyLevel.value = opt
                                        urgencyExpanded = false
                                    }
                                )
                            }
                        }
                    }
                }

                // Additional Notes
                item {
                    OutlinedTextField(
                        value = additionalNotes,
                        onValueChange = { referralViewModel.additionalNotes.value = it },
                        label = { Text("Additional Clinical Notes") },
                        maxLines = 4,
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier.fillMaxWidth()
                    )
                }

                // Referral Letter Live Preview
                item {
                    ThreeDCard(
                        modifier = Modifier.fillMaxWidth(),
                        backgroundColor = Teal100,
                        elevation = 4.dp
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(16.dp)
                        ) {
                            Text(
                                text = "Referral Letter Preview",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold,
                                color = TextPri
                            )
                            Spacer(Modifier.height(10.dp))
                            Text(
                                text = referralText,
                                style = MaterialTheme.typography.bodyMedium,
                                color = TextPri,
                                fontFamily = FontFamily.Monospace,
                                lineHeight = MaterialTheme.typography.bodyMedium.lineHeight
                            )
                        }
                    }
                }

                // Action Buttons: Copy Letter + Mark as Issued
                item {
                    val isIssued = existingReferral?.issuedAt != null || issueState is UiState.Success

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        OutlinedButton(
                            onClick = {
                                val cm = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                                cm.setPrimaryClip(ClipData.newPlainText("Referral", referralText))
                                Toast.makeText(context, "Copied to clipboard", Toast.LENGTH_SHORT).show()
                            },
                            shape = RoundedCornerShape(12.dp),
                            modifier = Modifier
                                .weight(1f)
                                .height(52.dp)
                        ) {
                            Text("Copy Letter", color = Teal700, fontWeight = FontWeight.SemiBold)
                        }

                        if (isIssued) {
                            Button(
                                onClick = {},
                                enabled = false,
                                colors = ButtonDefaults.buttonColors(disabledContainerColor = SuccessGrn),
                                shape = RoundedCornerShape(12.dp),
                                modifier = Modifier
                                    .weight(1f)
                                    .height(52.dp)
                            ) {
                                Text("Issued ✓", color = Color.White, fontWeight = FontWeight.Bold)
                            }
                        } else {
                            SynDxButton(
                                text = "Mark as Issued",
                                isLoading = issueState is UiState.Loading,
                                modifier = Modifier.weight(1f),
                                onClick = {
                                    referralViewModel.markAsIssued()
                                }
                            )
                        }
                    }
                    Spacer(Modifier.height(24.dp))
                }
            }
        }
    }
}
