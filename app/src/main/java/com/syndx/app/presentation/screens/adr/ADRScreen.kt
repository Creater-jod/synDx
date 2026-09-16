package com.syndx.app.presentation.screens.adr

import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.WarningAmber
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.syndx.app.presentation.components.SynDxButton
import com.syndx.app.presentation.components.SynDxTopBar
import com.syndx.app.presentation.components.ThreeDBackground
import com.syndx.app.presentation.components.ThreeDCard
import com.syndx.app.presentation.viewmodel.ADRDatabase
import com.syndx.app.presentation.viewmodel.ADRViewModel
import com.syndx.app.presentation.viewmodel.UiState
import com.syndx.app.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ADRScreen(
    adrViewModel: ADRViewModel,
    onBackClick: () -> Unit
) {
    val context = LocalContext.current

    val selectedDrug by adrViewModel.selectedDrug.collectAsState()
    val selectedProfile by adrViewModel.selectedProfile.collectAsState()
    val observedReaction by adrViewModel.observedReaction.collectAsState()
    val severityLevel by adrViewModel.severityLevel.collectAsState()
    val reportState by adrViewModel.reportState.collectAsState()

    var drugDropdownExpanded by remember { mutableStateOf(false) }
    var severityDropdownExpanded by remember { mutableStateOf(false) }

    val severities = listOf("MILD", "MODERATE", "SEVERE", "LIFE_THREATENING")

    LaunchedEffect(reportState) {
        if (reportState is UiState.Success) {
            Toast.makeText(context, "ADR event recorded & logged to audit ledger", Toast.LENGTH_SHORT).show()
            adrViewModel.resetReportState()
        }
    }

    Scaffold(
        topBar = {
            SynDxTopBar(
                title = "ADR Early Warning",
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
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                item { Spacer(Modifier.height(4.dp)) }

                // Drug Selection Dropdown
                item {
                    ExposedDropdownMenuBox(
                        expanded = drugDropdownExpanded,
                        onExpandedChange = { drugDropdownExpanded = !drugDropdownExpanded }
                    ) {
                        OutlinedTextField(
                            value = selectedDrug,
                            onValueChange = {},
                            readOnly = true,
                            label = { Text("Select Drug for Clinical ADR Check") },
                            trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = drugDropdownExpanded) },
                            shape = RoundedCornerShape(12.dp),
                            modifier = Modifier
                                .menuAnchor()
                                .fillMaxWidth()
                        )
                        ExposedDropdownMenu(
                            expanded = drugDropdownExpanded,
                            onDismissRequest = { drugDropdownExpanded = false }
                        ) {
                            ADRDatabase.drugsList.forEach { drug ->
                                DropdownMenuItem(
                                    text = { Text(drug) },
                                    onClick = {
                                        adrViewModel.selectDrug(drug)
                                        drugDropdownExpanded = false
                                    }
                                )
                            }
                        }
                    }
                }

                // ADR Profile Card
                val profile = selectedProfile
                if (profile != null) {
                    item {
                        ThreeDCard(
                            modifier = Modifier.fillMaxWidth(),
                            elevation = 6.dp
                        ) {
                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(18.dp)
                            ) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(
                                        text = profile.drugName,
                                        style = MaterialTheme.typography.headlineMedium,
                                        fontWeight = FontWeight.Bold,
                                        color = TextPri
                                    )

                                    val sevColor = when (profile.severityLevel) {
                                        "MILD" -> SuccessGrn
                                        "MODERATE" -> WarnAmber
                                        else -> ErrorRed
                                    }

                                    Surface(
                                        color = sevColor.copy(alpha = 0.15f),
                                        shape = RoundedCornerShape(6.dp)
                                    ) {
                                        Text(
                                            text = profile.severityLevel,
                                            color = sevColor,
                                            style = MaterialTheme.typography.labelMedium,
                                            fontWeight = FontWeight.Bold,
                                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                                        )
                                    }
                                }

                                Spacer(Modifier.height(14.dp))

                                // Common Reactions
                                Text(
                                    text = "Common Adverse Reactions:",
                                    style = MaterialTheme.typography.titleMedium,
                                    fontWeight = FontWeight.SemiBold,
                                    color = TextPri
                                )
                                Spacer(Modifier.height(6.dp))
                                profile.commonReactions.forEach { reaction ->
                                    Row(
                                        modifier = Modifier.padding(vertical = 2.dp),
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Box(
                                            modifier = Modifier
                                                .size(6.dp)
                                                .clip(CircleShape)
                                                .background(Teal700)
                                        )
                                        Spacer(Modifier.width(8.dp))
                                        Text(text = reaction, style = MaterialTheme.typography.bodyMedium, color = TextPri)
                                    }
                                }

                                Spacer(Modifier.height(14.dp))

                                // Contraindications
                                Text(
                                    text = "Contraindications:",
                                    style = MaterialTheme.typography.titleMedium,
                                    fontWeight = FontWeight.SemiBold,
                                    color = ErrorRed
                                )
                                Spacer(Modifier.height(6.dp))
                                profile.contraindications.forEach { contra ->
                                    Row(
                                        modifier = Modifier.padding(vertical = 2.dp),
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Box(
                                            modifier = Modifier
                                                .size(6.dp)
                                                .clip(CircleShape)
                                                .background(ErrorRed)
                                        )
                                        Spacer(Modifier.width(8.dp))
                                        Text(text = contra, style = MaterialTheme.typography.bodyMedium, color = TextPri)
                                    }
                                }

                                Spacer(Modifier.height(14.dp))

                                // Clinical Note
                                Text(
                                    text = "Clinical Practice Note:",
                                    style = MaterialTheme.typography.titleMedium,
                                    fontWeight = FontWeight.SemiBold,
                                    color = TextPri
                                )
                                Spacer(Modifier.height(4.dp))
                                Text(
                                    text = profile.notes,
                                    style = MaterialTheme.typography.bodyMedium,
                                    fontStyle = FontStyle.Italic,
                                    color = TextSec
                                )
                            }
                        }
                    }
                }

                // Report Section Header
                item {
                    ThreeDCard(
                        modifier = Modifier.fillMaxWidth(),
                        backgroundColor = Coral100,
                        elevation = 4.dp
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(16.dp)
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(Icons.Outlined.WarningAmber, contentDescription = null, tint = Coral500)
                                Spacer(Modifier.width(8.dp))
                                Text(
                                    text = "Report Adverse Reaction Event",
                                    style = MaterialTheme.typography.titleMedium,
                                    fontWeight = FontWeight.Bold,
                                    color = Coral500
                                )
                            }
                            Spacer(Modifier.height(12.dp))

                            OutlinedTextField(
                                value = observedReaction,
                                onValueChange = { adrViewModel.observedReaction.value = it },
                                label = { Text("Observed Patient Reaction (free text)") },
                                shape = RoundedCornerShape(12.dp),
                                modifier = Modifier.fillMaxWidth()
                            )

                            Spacer(Modifier.height(10.dp))

                            ExposedDropdownMenuBox(
                                expanded = severityDropdownExpanded,
                                onExpandedChange = { severityDropdownExpanded = !severityDropdownExpanded }
                            ) {
                                OutlinedTextField(
                                    value = severityLevel,
                                    onValueChange = {},
                                    readOnly = true,
                                    label = { Text("Severity Assessment") },
                                    trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = severityDropdownExpanded) },
                                    shape = RoundedCornerShape(12.dp),
                                    modifier = Modifier
                                        .menuAnchor()
                                        .fillMaxWidth()
                                )
                                ExposedDropdownMenu(
                                    expanded = severityDropdownExpanded,
                                    onDismissRequest = { severityDropdownExpanded = false }
                                ) {
                                    severities.forEach { sev ->
                                        DropdownMenuItem(
                                            text = { Text(sev) },
                                            onClick = {
                                                adrViewModel.severityLevel.value = sev
                                                severityDropdownExpanded = false
                                            }
                                        )
                                    }
                                }
                            }

                            if (reportState is UiState.Error) {
                                Spacer(Modifier.height(8.dp))
                                Text(
                                    text = (reportState as UiState.Error).message,
                                    color = ErrorRed,
                                    style = MaterialTheme.typography.bodyMedium
                                )
                            }

                            Spacer(Modifier.height(14.dp))

                            SynDxButton(
                                text = "Report ADR",
                                backgroundColor = Coral500,
                                isLoading = reportState is UiState.Loading,
                                onClick = {
                                    adrViewModel.submitReport()
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
