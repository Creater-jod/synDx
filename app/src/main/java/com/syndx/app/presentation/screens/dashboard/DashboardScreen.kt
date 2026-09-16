package com.syndx.app.presentation.screens.dashboard

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.syndx.app.presentation.components.*
import com.syndx.app.presentation.viewmodel.DashboardViewModel
import com.syndx.app.ui.theme.*
import com.syndx.app.util.DateUtil

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardScreen(
    dashboardViewModel: DashboardViewModel,
    onNavigateToNewPatient: () -> Unit,
    onNavigateToPatientList: () -> Unit,
    onNavigateToADR: () -> Unit,
    onNavigateToAuditTrail: () -> Unit,
    onNavigateToDiagnosis: (String) -> Unit
) {
    val clinician by dashboardViewModel.currentClinician.collectAsState()
    val totalPatients by dashboardViewModel.totalPatients.collectAsState()
    val diagnosesToday by dashboardViewModel.diagnosesToday.collectAsState()
    val pendingSync by dashboardViewModel.pendingSyncCount.collectAsState()
    val recentDiagnoses by dashboardViewModel.recentDiagnoses.collectAsState()
    val patientsMap by dashboardViewModel.patientsMap.collectAsState()
    val isOnline by dashboardViewModel.isOnline.collectAsState()

    val firstName = clinician?.fullName?.split(" ")?.firstOrNull() ?: "Doctor"
    val dateString = DateUtil.formatShort(System.currentTimeMillis())

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = "Good morning, $firstName",
                            style = MaterialTheme.typography.titleLarge,
                            fontWeight = FontWeight.Bold,
                            color = TextPri
                        )
                        Text(
                            text = dateString,
                            style = MaterialTheme.typography.labelMedium,
                            color = TextSec
                        )
                    }
                },
                actions = {
                    OfflineBadge(isOffline = !isOnline)
                    Spacer(Modifier.width(16.dp))
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Surface1)
            )
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = onNavigateToNewPatient,
                containerColor = Teal700,
                contentColor = Color.White,
                shape = RoundedCornerShape(16.dp),
                elevation = FloatingActionButtonDefaults.elevation(defaultElevation = 6.dp)
            ) {
                Icon(Icons.Outlined.Add, contentDescription = "New Patient")
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

            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = 16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                item { Spacer(Modifier.height(4.dp)) }

                // Section 1: Stats Row (3 cards side by side)
                item {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        StatCard(
                            label = "Patients",
                            count = totalPatients,
                            icon = Icons.Outlined.People,
                            color = Teal700,
                            modifier = Modifier.weight(1f),
                            onClick = onNavigateToPatientList
                        )
                        StatCard(
                            label = "Today",
                            count = diagnosesToday,
                            icon = Icons.Outlined.MedicalServices,
                            color = SuccessGrn,
                            modifier = Modifier.weight(1f)
                        )
                        StatCard(
                            label = "Pending Sync",
                            count = pendingSync,
                            icon = Icons.Outlined.CloudQueue,
                            color = if (pendingSync > 0) Coral500 else TextSec,
                            modifier = Modifier.weight(1f),
                            onClick = onNavigateToAuditTrail
                        )
                    }
                }

                // Section 2: Quick Actions
                item {
                    Column {
                        Text(
                            text = "Quick Actions",
                            style = MaterialTheme.typography.labelLarge,
                            color = TextSec,
                            fontWeight = FontWeight.SemiBold
                        )
                        Spacer(Modifier.height(8.dp))
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            // Action 1: New Diagnosis
                            ThreeDCard(
                                modifier = Modifier
                                    .weight(1f)
                                    .height(130.dp),
                                backgroundColor = Teal700,
                                elevation = 6.dp,
                                onClick = onNavigateToNewPatient
                            ) {
                                Column(
                                    modifier = Modifier
                                        .fillMaxSize()
                                        .padding(16.dp),
                                    verticalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Icon(
                                        imageVector = Icons.Outlined.LocalHospital,
                                        contentDescription = null,
                                        tint = Color.White,
                                        modifier = Modifier.size(32.dp)
                                    )
                                    Text(
                                        text = "New Diagnosis",
                                        style = MaterialTheme.typography.titleMedium,
                                        color = Color.White,
                                        fontWeight = FontWeight.Bold
                                    )
                                }
                            }

                            // Action 2: ADR Check
                            ThreeDCard(
                                modifier = Modifier
                                    .weight(1f)
                                    .height(130.dp),
                                backgroundColor = Coral100,
                                elevation = 6.dp,
                                onClick = onNavigateToADR
                            ) {
                                Column(
                                    modifier = Modifier
                                        .fillMaxSize()
                                        .padding(16.dp),
                                    verticalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Icon(
                                        imageVector = Icons.Outlined.WarningAmber,
                                        contentDescription = null,
                                        tint = Coral500,
                                        modifier = Modifier.size(32.dp)
                                    )
                                    Text(
                                        text = "ADR Check",
                                        style = MaterialTheme.typography.titleMedium,
                                        color = Coral500,
                                        fontWeight = FontWeight.Bold
                                    )
                                }
                            }
                        }
                    }
                }

                // Section 3: Recent Diagnoses
                item {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Recent Cases",
                            style = MaterialTheme.typography.labelLarge,
                            color = TextSec,
                            fontWeight = FontWeight.SemiBold
                        )
                        TextButton(onClick = onNavigateToPatientList) {
                            Text("See all", color = Teal700, style = MaterialTheme.typography.labelMedium)
                        }
                    }
                }

                if (recentDiagnoses.isEmpty()) {
                    item {
                        ThreeDCard(
                            modifier = Modifier.fillMaxWidth(),
                            elevation = 2.dp
                        ) {
                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(32.dp),
                                horizontalAlignment = Alignment.CenterHorizontally
                            ) {
                                Icon(
                                    imageVector = Icons.Outlined.CloudOff,
                                    contentDescription = null,
                                    tint = TextSec.copy(alpha = 0.5f),
                                    modifier = Modifier.size(48.dp)
                                )
                                Spacer(Modifier.height(12.dp))
                                Text(
                                    text = "No diagnoses yet. Tap + to start.",
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = TextSec
                                )
                            }
                        }
                    }
                } else {
                    items(recentDiagnoses) { diag ->
                        val patient = patientsMap[diag.patientId]
                        val patientName = patient?.fullName ?: "Patient #${diag.patientId.take(6)}"
                        DiagnosisCard(
                            patientName = patientName,
                            disease = diag.probableDisease,
                            timeText = DateUtil.formatTime(diag.diagnosedAt),
                            urgency = diag.urgencyLevel,
                            confidenceScore = diag.confidenceScore,
                            onClick = { onNavigateToDiagnosis(diag.sessionId) }
                        )
                    }
                }

                // Section 4: Blockchain Sync Status Card
                item {
                    ThreeDCard(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(bottom = 24.dp),
                        backgroundColor = Teal100,
                        elevation = 4.dp,
                        onClick = onNavigateToAuditTrail
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(16.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                imageVector = Icons.Outlined.Shield,
                                contentDescription = null,
                                tint = Teal700,
                                modifier = Modifier.size(24.dp)
                            )
                            Spacer(Modifier.width(12.dp))
                            Text(
                                text = "Blockchain Audit",
                                style = MaterialTheme.typography.titleMedium,
                                color = TextPri,
                                fontWeight = FontWeight.SemiBold
                            )
                            Spacer(Modifier.weight(1f))

                            val statusColor = when {
                                pendingSync == 0 -> SuccessGrn
                                pendingSync > 0 -> WarnAmber
                                else -> ErrorRed
                            }
                            val statusLabel = when {
                                pendingSync == 0 -> "All synced"
                                else -> "$pendingSync pending"
                            }

                            Surface(
                                color = statusColor.copy(alpha = 0.2f),
                                shape = RoundedCornerShape(8.dp)
                            ) {
                                Text(
                                    text = statusLabel,
                                    color = statusColor,
                                    style = MaterialTheme.typography.labelMedium,
                                    fontWeight = FontWeight.Bold,
                                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}
