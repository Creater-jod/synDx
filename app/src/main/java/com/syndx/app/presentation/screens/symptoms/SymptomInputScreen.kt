package com.syndx.app.presentation.screens.symptoms

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Check
import androidx.compose.material.icons.outlined.Search
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import com.syndx.app.domain.model.Patient
import com.syndx.app.domain.repository.PatientRepository
import com.syndx.app.presentation.components.SynDxButton
import com.syndx.app.presentation.components.SynDxTopBar
import com.syndx.app.presentation.components.ThreeDBackground
import com.syndx.app.presentation.components.ThreeDCard
import com.syndx.app.presentation.viewmodel.DiagnosisViewModel
import com.syndx.app.presentation.viewmodel.UiState
import com.syndx.app.ui.theme.*
import kotlinx.coroutines.launch

data class SymptomItem(val code: String, val label: String)

val masterSymptomsList = listOf(
    SymptomItem("HP:0001250", "Seizures"),
    SymptomItem("HP:0000707", "Cognitive Impairment"),
    SymptomItem("HP:0003326", "Myalgia (Muscle Pain)"),
    SymptomItem("HP:0002013", "Vomiting"),
    SymptomItem("HP:0001945", "Fever"),
    SymptomItem("HP:0000365", "Hearing Loss"),
    SymptomItem("HP:0000545", "Myopia (Short-sight)"),
    SymptomItem("HP:0001765", "Hammer Toe"),
    SymptomItem("HP:0002315", "Headache"),
    SymptomItem("HP:0001433", "Hepatosplenomegaly"),
    SymptomItem("HP:0001744", "Splenomegaly"),
    SymptomItem("HP:0002240", "Hepatomegaly"),
    SymptomItem("HP:0000823", "Delayed Puberty"),
    SymptomItem("HP:0001508", "Failure to Thrive"),
    SymptomItem("HP:0001249", "Intellectual Disability"),
    SymptomItem("HP:0001873", "Thrombocytopenia"),
    SymptomItem("HP:0001903", "Anaemia"),
    SymptomItem("HP:0001919", "Acute Kidney Injury"),
    SymptomItem("HP:0002098", "Respiratory Distress"),
    SymptomItem("HP:0001297", "Stroke"),
    SymptomItem("HP:0012378", "Fatigue"),
    SymptomItem("HP:0003560", "Muscular Dystrophy"),
    SymptomItem("HP:0001596", "Alopecia (Hair Loss)"),
    SymptomItem("HP:0000819", "Diabetes Mellitus"),
    SymptomItem("HP:0002719", "Immunodeficiency"),
    SymptomItem("HP:0001631", "Atrial Septal Defect"),
    SymptomItem("HP:0001629", "Ventricular Septal Defect"),
    SymptomItem("HP:0002910", "Elevated Liver Enzymes"),
    SymptomItem("HP:0011968", "Feeding Difficulties"),
    SymptomItem("HP:0000717", "Autism Spectrum Disorder")
)

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun SymptomInputScreen(
    patientId: String,
    patientRepository: PatientRepository,
    diagnosisViewModel: DiagnosisViewModel,
    onBackClick: () -> Unit,
    onNavigateToDiagnosis: (String) -> Unit
) {
    var patient by remember { mutableStateOf<Patient?>(null) }
    var searchQuery by remember { mutableStateOf("") }
    val selectedSymptoms = remember { mutableStateListOf<SymptomItem>() }
    var onsetDays by remember { mutableStateOf("14") }

    val analysisProgress by diagnosisViewModel.analysisProgress.collectAsState()
    val scope = rememberCoroutineScope()

    LaunchedEffect(patientId) {
        patient = patientRepository.getPatientById(patientId)
    }

    val filteredSymptoms = remember(searchQuery) {
        if (searchQuery.isBlank()) masterSymptomsList
        else masterSymptomsList.filter {
            it.label.contains(searchQuery, ignoreCase = true) ||
                    it.code.contains(searchQuery, ignoreCase = true)
        }
    }

    Scaffold(
        topBar = {
            SynDxTopBar(
                title = "Symptom Checker",
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

                // 3-Step Progress Stepper
                item {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 4.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        StepIndicator(step = 1, title = "Patient", isDone = true, isActive = false)
                        HorizontalDivider(
                            modifier = Modifier
                                .weight(1f)
                                .padding(horizontal = 8.dp),
                            color = Teal700
                        )
                        StepIndicator(step = 2, title = "Symptoms", isDone = false, isActive = true)
                        HorizontalDivider(
                            modifier = Modifier
                                .weight(1f)
                                .padding(horizontal = 8.dp),
                            color = DividerCol
                        )
                        StepIndicator(step = 3, title = "Diagnosis", isDone = false, isActive = false)
                    }
                }

                // Patient Summary Chip
                item {
                    val p = patient
                    val summaryText = if (p != null) {
                        "${p.fullName} · ${p.ageYears}yo ${p.sex} · ${p.village}"
                    } else "Patient: #$patientId"

                    ThreeDCard(
                        modifier = Modifier.fillMaxWidth(),
                        backgroundColor = Teal100,
                        elevation = 3.dp
                    ) {
                        Text(
                            text = summaryText,
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.SemiBold,
                            color = TextPri,
                            modifier = Modifier.padding(14.dp)
                        )
                    }
                }

                // Search Bar
                item {
                    OutlinedTextField(
                        value = searchQuery,
                        onValueChange = { searchQuery = it },
                        placeholder = { Text("Search 30 HPO symptoms...") },
                        leadingIcon = { Icon(Icons.Outlined.Search, contentDescription = null, tint = TextSec) },
                        singleLine = true,
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier.fillMaxWidth()
                    )
                }

                // Selected count
                item {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(
                            text = "Selected: ${selectedSymptoms.size} symptoms",
                            style = MaterialTheme.typography.labelLarge,
                            color = Teal700,
                            fontWeight = FontWeight.Bold
                        )
                        if (selectedSymptoms.isNotEmpty()) {
                            TextButton(onClick = { selectedSymptoms.clear() }) {
                                Text("Clear all", color = Coral500, style = MaterialTheme.typography.labelMedium)
                            }
                        }
                    }
                }

                // FlowRow of 30 FilterChips
                item {
                    FlowRow(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        filteredSymptoms.forEach { item ->
                            val isSelected = selectedSymptoms.any { it.code == item.code }
                            FilterChip(
                                selected = isSelected,
                                onClick = {
                                    if (isSelected) {
                                        selectedSymptoms.removeAll { it.code == item.code }
                                    } else {
                                        selectedSymptoms.add(item)
                                    }
                                },
                                label = {
                                    Text(
                                        text = item.label,
                                        style = MaterialTheme.typography.labelMedium,
                                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal
                                    )
                                },
                                leadingIcon = if (isSelected) {
                                    {
                                        Icon(
                                            Icons.Outlined.Check,
                                            contentDescription = null,
                                            modifier = Modifier.size(16.dp),
                                            tint = Color.White
                                        )
                                    }
                                } else null,
                                shape = RoundedCornerShape(8.dp),
                                colors = FilterChipDefaults.filterChipColors(
                                    selectedContainerColor = Teal700,
                                    selectedLabelColor = Color.White,
                                    containerColor = Surface1,
                                    labelColor = TextPri
                                ),
                                border = FilterChipDefaults.filterChipBorder(
                                    enabled = true,
                                    selected = isSelected,
                                    borderColor = DividerCol,
                                    selectedBorderColor = Teal700
                                )
                            )
                        }
                    }
                }

                // Onset Days Input
                item {
                    Spacer(Modifier.height(8.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(
                            text = "Onset of symptoms (days):",
                            style = MaterialTheme.typography.titleMedium,
                            color = TextPri,
                            fontWeight = FontWeight.SemiBold
                        )
                        OutlinedTextField(
                            value = onsetDays,
                            onValueChange = { if (it.length <= 4 && it.all { ch -> ch.isDigit() }) onsetDays = it },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            singleLine = true,
                            shape = RoundedCornerShape(10.dp),
                            modifier = Modifier.width(100.dp)
                        )
                    }
                }

                if (analysisProgress is UiState.Error) {
                    item {
                        Text(
                            text = (analysisProgress as UiState.Error).message,
                            color = ErrorRed,
                            style = MaterialTheme.typography.bodyMedium
                        )
                    }
                }

                // Analyse Symptoms Button
                item {
                    Spacer(Modifier.height(12.dp))
                    val isReady = selectedSymptoms.isNotEmpty() && onsetDays.isNotBlank()
                    SynDxButton(
                        text = "Analyse Symptoms",
                        enabled = isReady,
                        isLoading = analysisProgress is UiState.Loading,
                        onClick = {
                            val days = onsetDays.toIntOrNull() ?: 1
                            diagnosisViewModel.analyzeSymptoms(
                                patientId = patientId,
                                symptomCodes = selectedSymptoms.map { it.code },
                                symptomLabels = selectedSymptoms.map { it.label },
                                onsetDays = days,
                                onSuccess = { newSessionId ->
                                    diagnosisViewModel.resetAnalysisState()
                                    onNavigateToDiagnosis(newSessionId)
                                }
                            )
                        }
                    )
                    Spacer(Modifier.height(28.dp))
                }
            }

            // Fullscreen Loading Overlay
            if (analysisProgress is UiState.Loading) {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(Color.Black.copy(alpha = 0.45f)),
                    contentAlignment = Alignment.Center
                ) {
                    ThreeDCard(
                        modifier = Modifier.padding(32.dp),
                        elevation = 12.dp
                    ) {
                        Column(
                            modifier = Modifier.padding(28.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            CircularProgressIndicator(color = Teal700, strokeWidth = 3.dp)
                            Spacer(Modifier.height(16.dp))
                            Text(
                                text = "Analysing with Gemini AI…",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold,
                                color = TextPri
                            )
                            Spacer(Modifier.height(6.dp))
                            Text(
                                text = "Evaluating ${selectedSymptoms.size} clinical phenotypes",
                                style = MaterialTheme.typography.labelMedium,
                                color = TextSec
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun StepIndicator(step: Int, title: String, isDone: Boolean, isActive: Boolean) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Box(
            modifier = Modifier
                .size(32.dp)
                .clip(CircleShape)
                .background(
                    when {
                        isDone || isActive -> Teal700
                        else -> Color.Transparent
                    }
                )
                .border(
                    width = 2.dp,
                    color = if (isDone || isActive) Teal700 else DividerCol,
                    shape = CircleShape
                ),
            contentAlignment = Alignment.Center
        ) {
            if (isDone) {
                Icon(Icons.Outlined.Check, contentDescription = null, tint = Color.White, modifier = Modifier.size(16.dp))
            } else {
                Text(
                    text = step.toString(),
                    color = if (isActive) Color.White else TextSec,
                    style = MaterialTheme.typography.labelMedium,
                    fontWeight = FontWeight.Bold
                )
            }
        }
        Spacer(Modifier.height(4.dp))
        Text(
            text = title,
            style = MaterialTheme.typography.labelMedium,
            color = if (isActive || isDone) Teal700 else TextSec,
            fontWeight = if (isActive) FontWeight.Bold else FontWeight.Normal
        )
    }
}
