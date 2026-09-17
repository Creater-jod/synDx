package com.syndx.app.presentation.viewmodel

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.syndx.app.domain.model.ADREvent
import com.syndx.app.domain.model.Diagnosis
import com.syndx.app.domain.repository.DiagnosisRepository
import com.syndx.app.domain.usecase.adr.LogADREventUseCase
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class ADRProfile(
    val drugName: String,
    val commonReactions: List<String>,
    val contraindications: List<String>,
    val severityLevel: String, // MILD / MODERATE / SEVERE / LIFE_THREATENING
    val notes: String
)

object ADRDatabase {
    val drugsList = listOf(
        "Rifampicin", "Isoniazid", "Pyrazinamide", "Ethambutol",
        "Metformin", "Amlodipine", "Atenolol", "Enalapril",
        "Phenytoin", "Carbamazepine", "Sodium Valproate", "Chloroquine",
        "Primaquine", "Co-trimoxazole", "Ciprofloxacin", "Amoxicillin",
        "Aspirin", "Ibuprofen", "Paracetamol", "Digoxin"
    )

    val profiles: Map<String, ADRProfile> = mapOf(
        "Rifampicin" to ADRProfile(
            "Rifampicin",
            listOf("Hepatotoxicity", "Orange discoloration of urine/tears", "Flu-like syndrome", "Thrombocytopenia"),
            listOf("Active hepatic impairment", "Severe jaundice", "Concurrent protease inhibitors"),
            "MODERATE",
            "Monitor Liver Function Tests (LFTs) monthly. Counsel patient regarding harmless body fluid staining."
        ),
        "Isoniazid" to ADRProfile(
            "Isoniazid",
            listOf("Peripheral neuropathy", "Hepatitis", "Psychosis", "Optic neuritis"),
            listOf("Acute liver injury", "Previous isoniazid-associated hepatic injury"),
            "SEVERE",
            "Coadminister Pyridoxine (Vitamin B6) 10-25mg daily to prevent peripheral neuropathy."
        ),
        "Pyrazinamide" to ADRProfile(
            "Pyrazinamide",
            listOf("Hyperuricemia", "Arthralgia", "Hepatotoxicity", "Sideroblastic anemia"),
            listOf("Severe liver damage", "Acute gout"),
            "MODERATE",
            "Monitor serum uric acid. Patient education on joint swelling and pain."
        ),
        "Ethambutol" to ADRProfile(
            "Ethambutol",
            listOf("Retrobulbar optic neuritis", "Red-green color blindness", "Peripheral neuritis"),
            listOf("Pre-existing optic neuritis", "Children unable to report visual acuity"),
            "SEVERE",
            "Conduct baseline visual acuity and Ishihara color testing before initiation."
        ),
        "Metformin" to ADRProfile(
            "Metformin",
            listOf("Gastrointestinal distress", "Diarrhea", "Lactic acidosis", "Vitamin B12 deficiency"),
            listOf("eGFR < 30 mL/min", "Acute metabolic acidosis", "Severe hypoxia"),
            "SEVERE",
            "Withhold before iodinated radiocontrast procedures and in acute dehydrating illness."
        ),
        "Amlodipine" to ADRProfile(
            "Amlodipine",
            listOf("Peripheral pedal edema", "Dizziness", "Palpitations", "Flushing"),
            listOf("Severe aortic stenosis", "Cardiogenic shock", "Unstable angina"),
            "MILD",
            "Reassure patient regarding dependent ankle swelling; adjust dose or add ACE inhibitor if edema persists."
        ),
        "Atenolol" to ADRProfile(
            "Atenolol",
            listOf("Bradycardia", "Cold extremities", "Fatigue", "Bronchospasm"),
            listOf("Sinus bradycardia (<50 bpm)", "2nd/3rd degree AV block", "Asthma"),
            "MODERATE",
            "Taper gradually over 2 weeks to avoid rebound hypertension or ischemic exacerbation."
        ),
        "Enalapril" to ADRProfile(
            "Enalapril",
            listOf("Persistent dry cough", "Angioedema", "Hyperkalemia", "Hypotension"),
            listOf("History of ACEI angioedema", "Bilateral renal artery stenosis", "Pregnancy"),
            "LIFE_THREATENING",
            "Contraindicated in pregnancy (teratogenic). Stop immediately if lip or laryngeal swelling occurs."
        ),
        "Phenytoin" to ADRProfile(
            "Phenytoin",
            listOf("Gingival hyperplasia", "Ataxia", "Nystagmus", "Stevens-Johnson Syndrome (SJS)"),
            listOf("Sinus bradycardia", "Sinoatrial block", "Concurrent delavirdine"),
            "LIFE_THREATENING",
            "Follow zero-order kinetics. Monitor therapeutic levels (10-20 mcg/mL). Inspect oral mucosa regularly."
        ),
        "Carbamazepine" to ADRProfile(
            "Carbamazepine",
            listOf("DRESS syndrome", "Aplastic anemia", "Hyponatremia (SIADH)", "Drowsiness"),
            listOf("Bone marrow depression", "AV heart block", "HLA-B*1502 positive"),
            "LIFE_THREATENING",
            "Screen for HLA-B*1502 allele in high-risk Asian populations before initiation."
        ),
        "Sodium Valproate" to ADRProfile(
            "Sodium Valproate",
            listOf("Hepatotoxicity", "Pancreatitis", "Weight gain", "Teratogenicity (Neural Tube Defects)"),
            listOf("Hepatic disease", "Mitochondrial disorders (POLG)", "Pregnancy"),
            "LIFE_THREATENING",
            "Strict pregnancy prevention program required. Emergency attention for severe epigastric abdominal pain."
        ),
        "Chloroquine" to ADRProfile(
            "Chloroquine",
            listOf("Retinal toxicity (bull's eye maculopathy)", "QT prolongation", "Pruritus"),
            listOf("Retinal/visual field changes", "Myasthenia gravis", "Psoriasis"),
            "SEVERE",
            "Perform baseline ophthalmic examination for cumulative doses exceeding 400g."
        ),
        "Primaquine" to ADRProfile(
            "Primaquine",
            listOf("Acute hemolytic anemia", "Methemoglobinemia", "Abdominal cramps"),
            listOf("G6PD deficiency", "Pregnancy", "Lactation in G6PD-unknown infants"),
            "LIFE_THREATENING",
            "Mandatory G6PD screening prior to administration to prevent massive intravascular hemolysis."
        ),
        "Co-trimoxazole" to ADRProfile(
            "Co-trimoxazole",
            listOf("Stevens-Johnson Syndrome", "Hyperkalemia", "Bone marrow suppression", "Crystalluria"),
            listOf("Severe hepatic failure", "Severe renal insufficiency", "Infants < 6 weeks"),
            "SEVERE",
            "Maintain high fluid intake to prevent crystalluria. Discontinue at first appearance of skin rash."
        ),
        "Ciprofloxacin" to ADRProfile(
            "Ciprofloxacin",
            listOf("Tendon rupture (Achilles)", "QTc prolongation", "CNS toxicity", "Dysglycemia"),
            listOf("Tendonitis history with fluoroquinolones", "Concurrent tizanidine"),
            "SEVERE",
            "Avoid in athletes and elderly; discontinue at first sign of tendon pain or joint inflammation."
        ),
        "Amoxicillin" to ADRProfile(
            "Amoxicillin",
            listOf("Maculopapular rash", "Anaphylaxis", "Diarrhea", "Clostridioides difficile enteritis"),
            listOf("True penicillin anaphylaxis", "Infectious mononucleosis (causes rash)"),
            "LIFE_THREATENING",
            "Differentiate IgE-mediated anaphylaxis from benign ampicillin viral exanthem."
        ),
        "Aspirin" to ADRProfile(
            "Aspirin",
            listOf("Peptic ulcer bleeding", "Reye's syndrome in children", "Aspirin-exacerbated respiratory disease"),
            listOf("Active peptic ulceration", "Hemophilia", "Children under 16 with viral infection"),
            "SEVERE",
            "Never administer to children or febrile adolescents due to fatal risk of Reye's syndrome."
        ),
        "Ibuprofen" to ADRProfile(
            "Ibuprofen",
            listOf("Acute kidney injury", "GI ulceration", "Hypertension exacerbation", "Cardiovascular events"),
            listOf("Severe heart failure", "Active gastrointestinal hemorrhage", "3rd trimester pregnancy"),
            "MODERATE",
            "Use lowest effective dose for shortest duration; co-prescribe PPI in high-risk GI patients."
        ),
        "Paracetamol" to ADRProfile(
            "Paracetamol",
            listOf("Hepatotoxicity with acute overdose", "Elevated AST/ALT", "Rare SJS"),
            listOf("Severe hepatic insufficiency", "Chronic alcohol-induced liver disease"),
            "SEVERE",
            "Maximum daily dose 4g in adults (2g in severe malnutrition/alcoholism). Antidote: N-acetylcysteine."
        ),
        "Digoxin" to ADRProfile(
            "Digoxin",
            listOf("Digitalis arrhythmia", "Yellow-green halos (xanthopsia)", "Nausea/vomiting", "Confusion"),
            listOf("Ventricular fibrillation", "Hypertrophic cardiomyopathy", "Wolf-Parkinson-White"),
            "LIFE_THREATENING",
            "Narrow therapeutic index (0.5-0.9 ng/mL). Hypokalemia potentiates fatal digitalis toxicity."
        )
    )
}

class ADRViewModel(
    savedStateHandle: SavedStateHandle? = null,
    private val diagnosisRepository: DiagnosisRepository,
    private val logADREventUseCase: LogADREventUseCase
) : ViewModel() {

    val diagnosisId: String? = savedStateHandle?.get<String>("diagnosisId")

    val selectedDrug = MutableStateFlow(ADRDatabase.drugsList.first())
    val selectedProfile = MutableStateFlow(ADRDatabase.profiles[ADRDatabase.drugsList.first()])

    val observedReaction = MutableStateFlow("")
    val severityLevel = MutableStateFlow("MODERATE")
    val patientId = MutableStateFlow("UNKNOWN_PATIENT")

    private val _diagnosis = MutableStateFlow<Diagnosis?>(null)
    val diagnosis: StateFlow<Diagnosis?> = _diagnosis.asStateFlow()

    private val _reportState = MutableStateFlow<UiState<ADREvent>>(UiState.Idle)
    val reportState: StateFlow<UiState<ADREvent>> = _reportState.asStateFlow()

    init {
        if (!diagnosisId.isNullOrBlank()) {
            loadDiagnosis(diagnosisId)
        }
    }

    private fun loadDiagnosis(diagId: String) {
        viewModelScope.launch {
            val diag = diagnosisRepository.getDiagnosisById(diagId)
            _diagnosis.value = diag
            if (diag != null) {
                patientId.value = diag.patientId
                // If diagnosis has ADR warnings, select the first matching drug
                val matchingDrug = diag.adrWarnings.firstOrNull { warning ->
                    ADRDatabase.drugsList.any { it.equals(warning, ignoreCase = true) }
                }
                if (matchingDrug != null) {
                    val normalized = ADRDatabase.drugsList.first { it.equals(matchingDrug, ignoreCase = true) }
                    selectDrug(normalized)
                }
            }
        }
    }

    fun selectDrug(drugName: String) {
        selectedDrug.value = drugName
        selectedProfile.value = ADRDatabase.profiles[drugName]
    }

    fun submitReport() {
        val reaction = observedReaction.value.trim()
        if (reaction.isBlank()) {
            _reportState.value = UiState.Error("Please enter observed reaction")
            return
        }

        viewModelScope.launch {
            _reportState.value = UiState.Loading
            val profile = selectedProfile.value
            val result = logADREventUseCase(
                patientId = patientId.value,
                drugName = selectedDrug.value,
                reactionCode = "MEDDRA-AUTO",
                severityLevel = severityLevel.value,
                notes = "$reaction | ${profile?.notes ?: ""}"
            )
            result.fold(
                onSuccess = { event ->
                    _reportState.value = UiState.Success(event)
                    observedReaction.value = ""
                },
                onFailure = {
                    _reportState.value = UiState.Error(it.message ?: "Failed to log ADR")
                }
            )
        }
    }

    fun resetReportState() {
        _reportState.value = UiState.Idle
    }
}
