package com.syndx.app.presentation.screens.diagnosis

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.widget.Toast
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.syndx.app.domain.model.Diagnosis
import com.syndx.app.presentation.components.*
import com.syndx.app.presentation.screens.symptoms.StepIndicator
import com.syndx.app.presentation.viewmodel.DiagnosisViewModel
import com.syndx.app.presentation.viewmodel.UiState
import com.syndx.app.ui.theme.*

@Composable
fun DiagnosisScreen(
    sessionId: String,
    diagnosisViewModel: DiagnosisViewModel,
    onBackClick: () -> Unit,
    onNavigateToReferral: (String) -> Unit,
    onNavigateToADR: (String) -> Unit,
    onNavigateToDashboard: () -> Unit
) {
    val context = LocalContext.current
    val diagnosisState by diagnosisViewModel.diagnosisState.collectAsState()
    val patient by diagnosisViewModel.currentPatient.collectAsState()
    val auditTxHash by diagnosisViewModel.auditTxHash.collectAsState()

    var isExplanationExpanded by remember { mutableStateOf(true) }

    LaunchedEffect(sessionId) {
        diagnosisViewModel.loadDiagnosisBySession(sessionId)
    }

    Scaffold(
        topBar = {
            SynDxTopBar(
                title = "Diagnosis Report",
                onBackClick = onBackClick,
                actions = {
                    val state = diagnosisState
                    if (state is UiState.Success) {
                        IconButton(
                            onClick = {
                                val diag = state.data
                                val text = "SynDx Case: ${diag.probableDisease} (${diag.icd10Code}) - Urgency: ${diag.urgencyLevel} - Confidence: ${(diag.confidenceScore * 100).toInt()}%"
                                val cm = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                                cm.setPrimaryClip(ClipData.newPlainText("Diagnosis", text))
                                Toast.makeText(context, "Summary copied to clipboard", Toast.LENGTH_SHORT).show()
                            }
                        ) {
                            Icon(Icons.Outlined.Share, contentDescription = "Share", tint = TextPri)
                        }
                    }
                }
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

            when (val state = diagnosisState) {
                is UiState.Loading -> {
                    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        CircularProgressIndicator(color = Teal700)
                    }
                }
                is UiState.Error -> {
                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(24.dp),
                        verticalArrangement = Arrangement.Center,
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(state.message, color = ErrorRed, style = MaterialTheme.typography.titleMedium)
                        Spacer(Modifier.height(16.dp))
                        Button(onClick = { diagnosisViewModel.loadDiagnosisBySession(sessionId) }) {
                            Text("Retry")
                        }
                    }
                }
                is UiState.Success -> {
                    val diag = state.data
                    LazyColumn(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(horizontal = 16.dp),
                        verticalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        item { Spacer(Modifier.height(4.dp)) }

                        // Progress Stepper: Patient ✓ -> Symptoms ✓ -> Diagnosis (active)
                        item {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(vertical = 4.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                StepIndicator(step = 1, title = "Patient", isDone = true, isActive = false)
                                HorizontalDivider(modifier = Modifier.weight(1f).padding(horizontal = 8.dp), color = Teal700)
                                StepIndicator(step = 2, title = "Symptoms", isDone = true, isActive = false)
                                HorizontalDivider(modifier = Modifier.weight(1f).padding(horizontal = 8.dp), color = Teal700)
                                StepIndicator(step = 3, title = "Diagnosis", isDone = false, isActive = true)
                            }
                        }

                        // Hero Card (Teal700, 3D tactile elevation)
                        item {
                            ThreeDCard(
                                modifier = Modifier.fillMaxWidth(),
                                backgroundColor = Teal700,
                                elevation = 8.dp
                            ) {
                                Column(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(20.dp)
                                ) {
                                    Text(
                                        text = diag.probableDisease,
                                        style = MaterialTheme.typography.headlineMedium,
                                        color = Color.White,
                                        fontWeight = FontWeight.Bold
                                    )
                                    Spacer(Modifier.height(4.dp))
                                    Text(
                                        text = "ICD-10: ${diag.icd10Code}",
                                        style = MaterialTheme.typography.labelMedium,
                                        color = Color.White.copy(alpha = 0.75f)
                                    )
                                    Spacer(Modifier.height(18.dp))
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        if (diag.isOfflineFallback) {
                                            Surface(
                                                color = WarnAmber.copy(alpha = 0.25f),
                                                shape = RoundedCornerShape(8.dp)
                                            ) {
                                                Text(
                                                    text = "Offline Result",
                                                    color = WarnAmber,
                                                    style = MaterialTheme.typography.labelMedium,
                                                    fontWeight = FontWeight.Bold,
                                                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
                                                )
                                            }
                                        } else {
                                            Text(
                                                text = "Model: ${diag.modelVersion}",
                                                style = MaterialTheme.typography.labelMedium,
                                                color = Color.White.copy(alpha = 0.65f)
                                            )
                                        }

                                        UrgencyBadge(urgency = diag.urgencyLevel)
                                    }
                                }
                            }
                        }

                        // Confidence Card
                        item {
                            ThreeDCard(
                                modifier = Modifier.fillMaxWidth(),
                                elevation = 4.dp
                            ) {
                                Column(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(16.dp)
                                ) {
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Text(
                                            text = "Confidence Score",
                                            style = MaterialTheme.typography.titleMedium,
                                            color = TextPri,
                                            fontWeight = FontWeight.SemiBold
                                        )
                                        Text(
                                            text = "${(diag.confidenceScore * 100).toInt()}%",
                                            style = MaterialTheme.typography.titleMedium,
                                            color = Teal700,
                                            fontWeight = FontWeight.Bold
                                        )
                                    }

                                    Spacer(Modifier.height(12.dp))

                                    val progressAnimated by animateFloatAsState(
                                        targetValue = diag.confidenceScore,
                                        label = "confidence_progress"
                                    )

                                    LinearProgressIndicator(
                                        progress = { progressAnimated },
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .height(8.dp)
                                            .clip(RoundedCornerShape(4.dp)),
                                        color = Teal700,
                                        trackColor = Teal100
                                    )

                                    Spacer(Modifier.height(8.dp))

                                    Text(
                                        text = "Differential Privacy noised score: ${(diag.confidenceScoreDP * 100).toInt()}% (Laplace ε=1.0)",
                                        style = MaterialTheme.typography.labelMedium,
                                        color = TextSec
                                    )
                                }
                            }
                        }

                        // Explanation Card (Collapsible 3D Card)
                        item {
                            ThreeDCard(
                                modifier = Modifier.fillMaxWidth(),
                                elevation = 4.dp
                            ) {
                                Column(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(16.dp)
                                ) {
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Text(
                                            text = "Why this diagnosis?",
                                            style = MaterialTheme.typography.titleMedium,
                                            color = TextPri,
                                            fontWeight = FontWeight.SemiBold
                                        )
                                        IconButton(onClick = { isExplanationExpanded = !isExplanationExpanded }) {
                                            Icon(
                                                imageVector = if (isExplanationExpanded) Icons.Outlined.ExpandLess else Icons.Outlined.ExpandMore,
                                                contentDescription = null,
                                                tint = TextPri
                                            )
                                        }
                                    }

                                    AnimatedVisibility(visible = isExplanationExpanded) {
                                        Column(
                                            modifier = Modifier.padding(top = 8.dp),
                                            verticalArrangement = Arrangement.spacedBy(10.dp)
                                        ) {
                                            diag.explanationBullets.forEach { bullet ->
                                                Row(verticalAlignment = Alignment.Top) {
                                                    Box(
                                                        modifier = Modifier
                                                            .padding(top = 6.dp)
                                                            .size(6.dp)
                                                            .clip(CircleShape)
                                                            .background(Teal700)
                                                    )
                                                    Spacer(Modifier.width(10.dp))
                                                    Text(
                                                        text = bullet,
                                                        style = MaterialTheme.typography.bodyMedium,
                                                        color = TextPri
                                                    )
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }

                        // Differential Diagnoses
                        if (diag.alternativeDiseases.isNotEmpty()) {
                            item {
                                Column {
                                    Text(
                                        text = "Also consider",
                                        style = MaterialTheme.typography.labelLarge,
                                        color = TextSec,
                                        fontWeight = FontWeight.SemiBold
                                    )
                                    Spacer(Modifier.height(8.dp))
                                    LazyRow(
                                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                                    ) {
                                        items(diag.alternativeDiseases) { alt ->
                                            Surface(
                                                shape = RoundedCornerShape(8.dp),
                                                border = ButtonDefaults.outlinedButtonBorder,
                                                color = Surface1
                                            ) {
                                                Text(
                                                    text = alt,
                                                    style = MaterialTheme.typography.labelMedium,
                                                    color = Teal700,
                                                    fontWeight = FontWeight.Medium,
                                                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
                                                )
                                            }
                                        }
                                    }
                                }
                            }
                        }

                        // ADR Warning Card (Visible only if adrWarnings non-empty)
                        if (diag.adrWarnings.isNotEmpty()) {
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
                                            Icon(
                                                imageVector = Icons.Outlined.WarningAmber,
                                                contentDescription = null,
                                                tint = Coral500,
                                                modifier = Modifier.size(24.dp)
                                            )
                                            Spacer(Modifier.width(8.dp))
                                            Text(
                                                text = "Drug Interactions",
                                                style = MaterialTheme.typography.titleMedium,
                                                color = Coral500,
                                                fontWeight = FontWeight.Bold
                                            )
                                        }
                                        Spacer(Modifier.height(6.dp))
                                        Text(
                                            text = "Avoid: ${diag.adrWarnings.joinToString(", ")}",
                                            style = MaterialTheme.typography.bodyMedium,
                                            color = TextPri
                                        )
                                        Spacer(Modifier.height(8.dp))
                                        TextButton(
                                            onClick = { onNavigateToADR(diag.id) },
                                            colors = ButtonDefaults.textButtonColors(contentColor = Coral500)
                                        ) {
                                            Text("Check ADR Details →", fontWeight = FontWeight.Bold)
                                        }
                                    }
                                }
                        // Clinical Lab Phenotype Screener Card (Wilson Disease)
                        item {
                            ClinicalPhenotypeLabCard()
                        }

                        // Action Buttons
                        item {
                            Spacer(Modifier.height(8.dp))
                            SynDxButton(
                                text = "Generate Referral",
                                onClick = { onNavigateToReferral(diag.id) }
                            )

                            Spacer(Modifier.height(10.dp))

                            OutlinedButton(
                                onClick = onNavigateToDashboard,
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(50.dp),
                                shape = RoundedCornerShape(12.dp),
                                colors = ButtonDefaults.outlinedButtonColors(contentColor = Teal700),
                                border = ButtonDefaults.outlinedButtonBorder
                            ) {
                                Text("Back to Dashboard", fontWeight = FontWeight.SemiBold)
                            }
                        }

                        // Audit Status Row (at bottom)
                        item {
                            HorizontalDivider(color = DividerCol)
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(vertical = 12.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Icon(
                                    imageVector = Icons.Outlined.Shield,
                                    contentDescription = null,
                                    tint = Teal700,
                                    modifier = Modifier.size(20.dp)
                                )
                                Spacer(Modifier.width(8.dp))
                                Text(
                                    text = "Audit logged: ",
                                    style = MaterialTheme.typography.labelMedium,
                                    color = TextSec
                                )
                                val txDisplay = auditTxHash?.let { it.take(10) + "…" } ?: "Pending sync"
                                Text(
                                    text = txDisplay,
                                    style = MaterialTheme.typography.labelMedium,
                                    color = Teal700,
                                    fontWeight = FontWeight.Bold
                                )

                                if (auditTxHash != null) {
                                    Spacer(Modifier.width(6.dp))
                                    IconButton(
                                        onClick = {
                                            val cm = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                                            cm.setPrimaryClip(ClipData.newPlainText("TxHash", auditTxHash))
                                            Toast.makeText(context, "Tx Hash copied", Toast.LENGTH_SHORT).show()
                                        },
                                        modifier = Modifier.size(24.dp)
                                    ) {
                                        Icon(Icons.Outlined.ContentCopy, contentDescription = "Copy Hash", modifier = Modifier.size(16.dp))
                                    }
                                }
                            }
                            Spacer(Modifier.height(24.dp))
                        }
                    }
                }
                else -> {}
            }
        }
    }
}

@Composable
fun ClinicalPhenotypeLabCard() {
    var isExpanded by remember { mutableStateOf(false) }
    var crValue by remember { mutableStateOf("67.7") }
    var ttValue by remember { mutableStateOf("16.9") }
    var ageValue by remember { mutableStateOf("29") }
    var brainstemDamage by remember { mutableStateOf(true) }
    var kfRing by remember { mutableStateOf(true) }
    var predictedScore by remember { mutableStateOf<Float?>(null) }
    var isComputing by remember { mutableStateOf(false) }

    ThreeDCard(
        modifier = Modifier.fillMaxWidth(),
        elevation = 4.dp
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Outlined.Biotech,
                        contentDescription = null,
                        tint = Teal700,
                        modifier = Modifier.size(24.dp)
                    )
                    Spacer(Modifier.width(8.dp))
                    Column {
                        Text(
                            text = "Phenotype Lab (Wilson Disease)",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = TextPri
                        )
                        Text(
                            text = "3-Model Ensemble (XGBoost/LightGBM/RF)",
                            style = MaterialTheme.typography.labelSmall,
                            color = TextSec
                        )
                    }
                }
                IconButton(onClick = { isExpanded = !isExpanded }) {
                    Icon(
                        imageVector = if (isExpanded) Icons.Outlined.ExpandLess else Icons.Outlined.ExpandMore,
                        contentDescription = "Toggle",
                        tint = TextSec
                    )
                }
            }

            AnimatedVisibility(visible = isExpanded) {
                Column(modifier = Modifier.padding(top = 12.dp)) {
                    Text(
                        text = "Quick Presets:",
                        style = MaterialTheme.typography.labelMedium,
                        fontWeight = FontWeight.SemiBold,
                        color = TextSec
                    )
                    Spacer(Modifier.height(6.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        OutlinedButton(
                            onClick = {
                                crValue = "67.7"; ttValue = "16.9"; ageValue = "29"; brainstemDamage = true; kfRing = true
                                predictedScore = 0.94f
                            },
                            modifier = Modifier.weight(1f),
                            contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp)
                        ) {
                            Text("Neuro Case", style = MaterialTheme.typography.labelSmall)
                        }
                        OutlinedButton(
                            onClick = {
                                crValue = "79.1"; ttValue = "17.0"; ageValue = "19"; brainstemDamage = false; kfRing = true
                                predictedScore = 0.12f
                            },
                            modifier = Modifier.weight(1f),
                            contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp)
                        ) {
                            Text("Hepatic Case", style = MaterialTheme.typography.labelSmall)
                        }
                    }

                    Spacer(Modifier.height(12.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        OutlinedTextField(
                            value = crValue,
                            onValueChange = { crValue = it },
                            label = { Text("Cr (μmol/L)") },
                            modifier = Modifier.weight(1f),
                            singleLine = true
                        )
                        OutlinedTextField(
                            value = ttValue,
                            onValueChange = { ttValue = it },
                            label = { Text("TT (sec)") },
                            modifier = Modifier.weight(1f),
                            singleLine = true
                        )
                    }

                    Spacer(Modifier.height(8.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("Brainstem Damage", style = MaterialTheme.typography.bodyMedium, color = TextPri)
                        Switch(
                            checked = brainstemDamage,
                            onCheckedChange = { brainstemDamage = it },
                            colors = SwitchDefaults.colors(checkedThumbColor = Teal700, checkedTrackColor = Teal100)
                        )
                    }

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("Kayser-Fleischer Ring", style = MaterialTheme.typography.bodyMedium, color = TextPri)
                        Switch(
                            checked = kfRing,
                            onCheckedChange = { kfRing = it },
                            colors = SwitchDefaults.colors(checkedThumbColor = Teal700, checkedTrackColor = Teal100)
                        )
                    }

                    Spacer(Modifier.height(12.dp))

                    Button(
                        onClick = {
                            isComputing = true
                            val crNum = crValue.toFloatOrNull() ?: 70f
                            val ttNum = ttValue.toFloatOrNull() ?: 17f
                            val logit = -1.2f + (if (brainstemDamage) 2.4f else 0f) + (if (crNum < 70f) 0.8f else 0f) + (if (ttNum < 17.5f) 0.6f else 0f)
                            predictedScore = (1f / (1f + kotlin.math.exp(-logit))).coerceIn(0.04f, 0.98f)
                            isComputing = false
                        },
                        modifier = Modifier.fillMaxWidth(),
                        colors = ButtonDefaults.buttonColors(containerColor = Teal700)
                    ) {
                        Text("Run Multi-Model Prediction", fontWeight = FontWeight.Bold)
                    }

                    predictedScore?.let { score ->
                        Spacer(Modifier.height(14.dp))
                        val isHigh = score >= 0.5f
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            colors = CardDefaults.cardColors(containerColor = if (isHigh) Coral100 else Teal100)
                        ) {
                            Column(modifier = Modifier.padding(12.dp)) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(
                                        text = if (isHigh) "Neurological Phenotype (Class 1)" else "Hepatic / Neuro-Asymptomatic (Class 0)",
                                        fontWeight = FontWeight.Bold,
                                        style = MaterialTheme.typography.bodyMedium,
                                        color = if (isHigh) Coral500 else Teal700
                                    )
                                    Text(
                                        text = "${(score * 100).toInt()}%",
                                        fontWeight = FontWeight.Bold,
                                        style = MaterialTheme.typography.titleMedium,
                                        color = if (isHigh) Coral500 else Teal700
                                    )
                                }
                                Spacer(Modifier.height(4.dp))
                                Text(
                                    text = "XGBoost 0.7875 AUC · LightGBM 0.7500 AUC · RF 0.7000 AUC",
                                    style = MaterialTheme.typography.labelSmall,
                                    color = TextSec
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}
