package com.syndx.app.presentation.screens.patients

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.ArrowForwardIos
import androidx.compose.material.icons.outlined.Add
import androidx.compose.material.icons.outlined.People
import androidx.compose.material.icons.outlined.Search
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.syndx.app.presentation.components.ThreeDBackground
import com.syndx.app.presentation.components.ThreeDCard
import com.syndx.app.presentation.components.UrgencyBadge
import com.syndx.app.presentation.viewmodel.PatientFilter
import com.syndx.app.presentation.viewmodel.PatientViewModel
import com.syndx.app.ui.theme.*

@Composable
fun PatientListScreen(
    patientViewModel: PatientViewModel,
    onNavigateToNewPatient: () -> Unit,
    onNavigateToDiagnosis: (String) -> Unit,
    onNavigateToSymptoms: (String) -> Unit
) {
    val searchQuery by patientViewModel.searchQuery.collectAsState()
    val selectedFilter by patientViewModel.selectedFilter.collectAsState()
    val patientsWithDiag by patientViewModel.filteredPatients.collectAsState()

    Scaffold(
        floatingActionButton = {
            FloatingActionButton(
                onClick = onNavigateToNewPatient,
                containerColor = Teal700,
                contentColor = Color.White,
                shape = RoundedCornerShape(16.dp)
            ) {
                Icon(Icons.Outlined.Add, contentDescription = "Add Patient")
            }
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
                    .padding(horizontal = 16.dp)
            ) {
                Spacer(Modifier.height(16.dp))

                // Search Bar
                OutlinedTextField(
                    value = searchQuery,
                    onValueChange = { patientViewModel.onSearchQueryChanged(it) },
                    placeholder = { Text("Search by name, village, contact...") },
                    leadingIcon = { Icon(Icons.Outlined.Search, contentDescription = null, tint = TextSec) },
                    singleLine = true,
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(Modifier.height(10.dp))

                // Filter Chips Row
                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    items(PatientFilter.values()) { filter ->
                        val isSelected = selectedFilter == filter
                        val label = when (filter) {
                            PatientFilter.ALL -> "All"
                            PatientFilter.TODAY -> "Today"
                            PatientFilter.URGENT -> "Urgent"
                            PatientFilter.PENDING_REFERRAL -> "Pending Referral"
                        }
                        FilterChip(
                            selected = isSelected,
                            onClick = { patientViewModel.onFilterSelected(filter) },
                            label = { Text(label) },
                            shape = RoundedCornerShape(8.dp),
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = Teal700,
                                selectedLabelColor = Color.White
                            )
                        )
                    }
                }

                Spacer(Modifier.height(12.dp))

                // Patient Cards List
                if (patientsWithDiag.isEmpty()) {
                    Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Icon(
                                imageVector = Icons.Outlined.People,
                                contentDescription = null,
                                tint = TextSec.copy(alpha = 0.5f),
                                modifier = Modifier.size(64.dp)
                            )
                            Spacer(Modifier.height(12.dp))
                            Text(
                                text = "No patients registered yet",
                                style = MaterialTheme.typography.titleMedium,
                                color = TextSec
                            )
                            Spacer(Modifier.height(16.dp))
                            Button(
                                onClick = onNavigateToNewPatient,
                                colors = ButtonDefaults.buttonColors(containerColor = Teal700),
                                shape = RoundedCornerShape(12.dp)
                            ) {
                                Text("Add Patient")
                            }
                        }
                    }
                } else {
                    LazyColumn(
                        modifier = Modifier.fillMaxSize(),
                        verticalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        items(patientsWithDiag) { (patient, diag) ->
                            val initials = patient.fullName.split(" ")
                                .filter { it.isNotBlank() }
                                .take(2)
                                .map { it.first().uppercase() }
                                .joinToString("")
                                .ifEmpty { "P" }

                            ThreeDCard(
                                modifier = Modifier.fillMaxWidth(),
                                elevation = 4.dp,
                                onClick = {
                                    if (diag != null) {
                                        onNavigateToDiagnosis(diag.sessionId)
                                    } else {
                                        onNavigateToSymptoms(patient.id)
                                    }
                                }
                            ) {
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(14.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    // Initials Avatar
                                    Box(
                                        modifier = Modifier
                                            .size(44.dp)
                                            .clip(CircleShape)
                                            .background(Teal700),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Text(
                                            text = initials,
                                            color = Color.White,
                                            style = MaterialTheme.typography.titleMedium,
                                            fontWeight = FontWeight.Bold
                                        )
                                    }

                                    Spacer(Modifier.width(14.dp))

                                    Column(modifier = Modifier.weight(1f)) {
                                        Text(
                                            text = patient.fullName,
                                            style = MaterialTheme.typography.titleMedium,
                                            color = TextPri,
                                            fontWeight = FontWeight.SemiBold
                                        )
                                        Spacer(Modifier.height(2.dp))
                                        Text(
                                            text = "${patient.village} · ${patient.ageYears}yo ${patient.sex}",
                                            style = MaterialTheme.typography.labelMedium,
                                            color = TextSec
                                        )
                                        if (diag != null) {
                                            Spacer(Modifier.height(2.dp))
                                            Text(
                                                text = diag.probableDisease,
                                                style = MaterialTheme.typography.labelMedium,
                                                color = Teal700,
                                                fontWeight = FontWeight.Medium
                                            )
                                        }
                                    }

                                    if (diag != null) {
                                        UrgencyBadge(urgency = diag.urgencyLevel)
                                        Spacer(Modifier.width(8.dp))
                                    }

                                    Icon(
                                        imageVector = Icons.AutoMirrored.Outlined.ArrowForwardIos,
                                        contentDescription = null,
                                        tint = TextSec.copy(alpha = 0.5f),
                                        modifier = Modifier.size(16.dp)
                                    )
                                }
                            }
                        }
                        item { Spacer(Modifier.height(80.dp)) }
                    }
                }
            }
        }
    }
}
