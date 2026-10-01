# synDx — Future Multimodal Interfaces Specification & Clinical Safety Guardrails

**Document Version:** 1.0.0  
**Status:** 📋 **PLANNED / EXPERIMENTAL (UNBUILT)**  
**Target Systems:** Kayser–Fleischer (K-F) Image Grading & Local Clinical Voice/Text Structuring  
**Last Updated:** October 2026  
**Clinical Decision Support Scope:** Non-diagnostic, strictly decoupled from active inference  

---

## 1. Executive Summary & Architectural Firewall

SynDx is a decision-support prototype engineered for rare-disease clinical review and acute bedside triage in low-resource health settings. As the platform evolves, future multimodal capabilities are planned to support frontline health workers:
1. **Kayser–Fleischer (K-F) Ring Optical Image Grading** (automated slit-lamp / anterior-segment photography analysis for corneal copper deposition).
2. **Local Voice and Clinical Text Structuring** (edge-based speech transcription and unstructured clinical note parsing into structured case records).

### The Safety Firewall Rule
> [!CRITICAL]
> **Strict Architectural Isolation:** Both modules are currently unbuilt and **MUST remain strictly decoupled from the active prediction and triage paths** (`/api/predict/clinical` and `/api/emergency/evaluate`). No unverified multimodal signal may influence active patient triage until permitted, ethically cleared labelled training datasets and independent clinical validation tests are completed.

### Mandatory Language Model (LLM/SLM) Constraints
> [!IMPORTANT]
> **Draft-Only Authority:** A language model may create **ONLY a schema-validated draft**.
> - **It MAY NOT diagnose:** A language model cannot assign, suggest, or assert a primary disease diagnosis (`primary_condition`).
> - **It MAY NOT set risk scores or tiers:** Risk tiers (`Tier A`, `Tier B`, `Tier C`) are strictly determined by deterministic emergency threshold rules and validated clinical models.
> - **It MAY NOT calculate confidence scores:** Invented or uncalibrated LLM confidence percentages are stripped.
> - **It MAY NOT override emergency rules:** If extracted vitals indicate critical instability (e.g. $\text{SpO}_2 < 90\%$), the deterministic emergency engine immediately enforces emergency triage regardless of any language model claims or summaries.

---

## 2. High-Level Architecture & Decoupling Topology

```
+----------------------------------------------------------------------------------------------------+
|                                    ACTIVE CLINICAL PREDICTION PATH                                  |
|                                                                                                    |
|   Bedside Manual Entry   ──►  Deterministic Emergency Evaluator  ──►  Tabular Ensemble (n=185)     |
|   (Vitals & Biomarkers)       (SpO2 < 90%, HR, BP, Temp)             (XGBoost / LightGBM / RF)     |
|                                         │                                      │                   |
|                                         ▼                                      ▼                   |
|                               Emergency Tier A Override               Validated Risk Tier          |
+----------------------------------------------------------------------------------------------------+
                                                ▲
                                                │  [ STRICT ARCHITECTURAL FIREWALL ]
                                                │  (assertNotInActivePredictionPath)
+----------------------------------------------------------------------------------------------------+
|                          FUTURE MULTIMODAL CAPABILITIES (PLANNED / UNBUILT)                        |
|                                                                                                    |
|   [ MODULE 1: K-F Optical Grading ]                  [ MODULE 2: Local Voice/Text Structuring ]    |
|   - Status: PLANNED (Unbuilt)                        - Status: PLANNED (Unbuilt)                   |
|   - Requires: Licensed Slit-Lamp Dataset             - SLM Scope: Field extraction ONLY            |
|   - Requires: Triple-Ophthalmologist Ground Truth    - Enforces: status = 'draft'                  |
|   - Output: Auxiliary observation (Grade 0-3)        - Strips: condition, tier, confidence         |
|   - Mandatory: requires_ophthalmologist_conf = true  - Mandates: Human clinician verification      |
+----------------------------------------------------------------------------------------------------+
```

---

## 3. Module 1: Kayser–Fleischer (K-F) Ring Image Grading Interface

### 3.1 Clinical Background
Kayser–Fleischer rings represent granular golden-brown or greenish-yellow copper deposition in Descemet's membrane of the peripheral cornea, beginning at the superior and inferior limbal poles before completing a 360-degree circumference. Present in approximately 95% of neurological Wilson disease presentations and 50–60% of hepatic presentations, they are a primary Leipzig diagnostic score criterion.

However, clinical detection requires high-magnification slit-lamp biomicroscopy or gonioscopy by an experienced ophthalmologist. Early rings can easily be missed under direct torchlight, especially in dark brown irises, or confounded with arcus senilis, chalcosis, or hyperbilirubinemic scleral icterus.

### 3.2 State & Scope
- **Current State:** `PLANNED / EXPERIMENTAL (UNBUILT)`.
- **Active Code Reference:** `src/models/multimodalInterfaces.js` (`KF_IMAGE_GRADING_SPEC`).
- **Operational Boundary:** Auxiliary observation extractor. Zero diagnostic authority.

### 3.3 Data Contract

#### Input Request Specification
```typescript
interface KFGradingRequest {
  image_bytes: string; // Base64 encoded JPEG, PNG, or DICOM
  image_format: 'image/jpeg' | 'image/png' | 'application/dicom';
  eye_lateralization: 'OD' | 'OS' | 'bilateral'; // Right eye, Left eye, or Both
  illumination_modality: 'slit_beam' | 'diffuse_tangential' | 'coaxial';
  device_metadata: {
    device_type: 'slit_lamp_mounted_camera' | 'smartphone_adapter' | 'handheld_ophthalmoscope';
    optical_magnification: string; // e.g. "10x", "16x", "25x"
    capture_timestamp: string; // ISO 8601
  };
  patient_context_hash: string; // SHA-256 hash of de-identified patient ID
}
```

#### Output Response Specification
```typescript
interface KFGradingResult {
  module_id: 'kayser_fleischer_grading';
  model_version: string; // e.g. 'kf-segment-v0.1.0-planned'
  kf_ring_detected: boolean | null; // null if image is ungradable
  detection_confidence: number; // 0.0 to 1.0 calibrated probability
  copper_density_grade: 0 | 1 | 2 | 3;
  // Grade 0: Absent / No copper deposition observed
  // Grade 1: Faint or partial arc limited to superior or inferior poles
  // Grade 2: Continuous circumferential ring < 2mm in radial width
  // Grade 3: Dense, wide circumferential band >= 2mm with intense pigmentation
  circumference_degrees: number; // 0 to 360 arc degrees
  image_quality_score: number; // 0.0 to 1.0 based on focus, exposure, and illumination
  quality_flags: Array<'acceptable' | 'corneal_glare' | 'motion_blur' | 'underexposed' | 'off_center'>;
  
  // MANDATORY SAFETY ENFORCEMENTS
  requires_ophthalmologist_confirmation: true; // MUST ALWAYS BE TRUE
  is_diagnostic: false; // MUST ALWAYS BE FALSE
  disclaimer: "Auxiliary optical observation only. Kayser-Fleischer ring presence must be verified by a board-certified ophthalmologist via formal slit-lamp biomicroscopy. Does not constitute a medical diagnosis.";
}
```

### 3.4 Labelled Data & Testing Prerequisites Before Activation
Before this module may be implemented or integrated into any stage of clinical review:
1. **Licensed Training Dataset:** A minimum cohort of $N \ge 500$ clinically and genetically verified patient corneal photographs collected under IRB/ethics committee approval with informed consent.
2. **Multi-Reader Consensus Ground Truth:** Annotations generated and independently verified by $\ge 3$ board-certified ophthalmologists with multi-rater Fleiss' Kappa $\kappa \ge 0.85$.
3. **Phenotypic Diversity:** Balanced representation across diverse iris pigmentation profiles (blue, green, hazel, light brown, dark brown) and skin phototypes (Fitzpatrick I through VI) to prevent racial and phenotypic bias.
4. **Adversarial Noise & Glare Testing:** Rigorous validation demonstrating resilience against smartphone optical distortion, specular corneal reflections, and suboptimal rural clinic lighting.

---

## 4. Module 2: Local Voice & Clinical Text Structuring Interface

### 4.1 Clinical Background
Frontline community health workers in rural Primary Health Centres (PHCs) frequently capture patient observations via spoken voice dictation or rapid, unstructured bedside clinical notes. Manually transcribing these notes into multi-tab forms introduces administrative burden and data omission risks.

A local Small Language Model (SLM) can assist by parsing free-form clinical text into candidate fields of the versioned `caseSchema` v1.0.0.

### 4.2 State & Scope
- **Current State:** `PLANNED / EXPERIMENTAL (UNBUILT)`.
- **Active Code Reference:** `src/models/multimodalInterfaces.js` (`VOICE_TEXT_STRUCTURING_SPEC`, `sanitizeLLMDraftPayload`).
- **Operational Boundary:** Administrative data-entry draft assistant. **Zero diagnostic authority.**

### 4.3 Data Contract

#### Input Request Specification
```typescript
interface ClinicalTextStructuringRequest {
  input_modality: 'speech_audio' | 'free_text_note';
  audio_payload?: string; // Base64 audio stream (WAV, FLAC, MP3) if voice
  raw_clinical_note?: string; // Raw unstructured clinical text string
  language_code: string; // ISO 639-1 (e.g. 'en', 'hi', 'te', 'ta')
  phc_facility: string; // Health centre identifier
  author_role: 'health_worker' | 'nurse' | 'medical_officer';
  session_id: string; // Ephemeral intake session UUID
}
```

#### Sanitized Draft Output Specification
```typescript
interface ClinicalDraftStructuringResult {
  valid: boolean;
  sanitizedDraft: CaseSchemaV1; // Strictly adhering to caseSchema v1.0.0
  safety_violations: string[]; // Audit log of stripped diagnostic/tier assertions
}
```

### 4.4 Mandatory Language Model Guardrails & Architectural Interlocks

```
                             [ Raw LLM Extraction Payload ]
                                          │
                                          ▼
                      +---------------------------------------+
                      |      LLM SAFETY SANITIZER FIREWALL    |
                      |   sanitizeLLMDraftPayload(llmPayload) |
                      +---------------------------------------+
                                          │
            ┌─────────────────────────────┼─────────────────────────────┐
            │                             │                             │
    [ RULE 1 & 2: NO DIAGNOSIS ]  [ RULE 3 & 4: NO TIERS/CONF ]  [ RULE 5: EMERGENCY INTERLOCK ]
    Strip: primary_condition      Strip: tier                    Evaluate extracted vitals via
    Strip: diagnosis              Strip: risk_score              deterministic emergencyService.
    Strip: condition              Strip: confidence              If SpO2 < 90% or HR > 140 bpm,
    Set: "Pending Review"         Set: Tier 'B' / Pending        enforce Tier A & Emergency flag.
            │                             │                             │
            └─────────────────────────────┼─────────────────────────────┘
                                          │
                                          ▼
                      +---------------------------------------+
                      |   VALIDATED v1.0.0 CASE DRAFT OBJECT  |
                      |   status: 'draft'                     |
                      |   sync_state: { state: 'draft' }      |
                      |   needs_review: true                  |
                      +---------------------------------------+
                                          │
                                          ▼
                      +---------------------------------------+
                      |      MANDATORY CLINICIAN REVIEW       |
                      |    (Step 3: Entry Check Screen)       |
                      +---------------------------------------+
```

#### The Six Enforced Safety Guardrails

| Rule # | Guardrail Name | Implementation in `multimodalInterfaces.js` | Rationale |
| :--- | :--- | :--- | :--- |
| **Rule 1** | **Draft-Only Status** | `status = 'draft'` and `sync_state.state = 'draft'` are strictly enforced. Any attempt to set `status = 'confirmed'` or `synced` is rejected. | An automated language model output cannot bypass the clinician review queue. |
| **Rule 2** | **Prohibition on Diagnosing** | Any value for `primary_condition`, `diagnosis`, or `condition` is stripped and recorded in `safety_violations`. The draft condition is locked to `'Unverified Clinical Intake Draft (Awaiting Clinician Review)'`. | Language models hallucinate plausible clinical conditions and lack diagnostic certification. |
| **Rule 3** | **Prohibition on Risk Tier Assignment** | Any value for `tier`, `risk_tier`, or `risk_score` is stripped. Default baseline tier is locked to `'B'` (or `'A'` if deterministic emergency rules trigger). | Triage prioritization cannot be dictated by stochastic text generation. |
| **Rule 4** | **Prohibition on Confidence Scoring** | Any value for `confidence` is stripped and set to `0`. | LLMs cannot calibrate statistical epistemic uncertainty for rare disease phenotype classification. |
| **Rule 5** | **Emergency Rule Override Prohibition** | The extracted vitals are fed directly to `emergencyService.evaluateVitals()`. If thresholds are breached ($\text{SpO}_2 < 90\%$, $\text{HR} > 140$, $\text{BP} \ge 180/120$, $\text{Temp} \ge 39.5^\circ\text{C}$), emergency status is strictly enforced. Any LLM assertion that the patient is stable is overridden and flagged. | Patient safety: deterministic medical rules supersede probabilistic natural language parsing. |
| **Rule 6** | **Physiological Bounds Validation** | Extracted numerical vitals and demographics are checked against strict medical plausibility bounds (Age: 0–120, SpO2: 50–100%, HR: 30–250 bpm, Temp: 30.0–45.0°C). | Prevents hallucinated or corrupted clinical measurements from entering the patient chart. |

### 4.5 Prerequisites for Activation
1. **On-Device Quantized SLM:** Engine must execute 100% locally on the device (e.g. via llama.cpp / ONNX runtime) with zero audio or text transmission to external third-party cloud servers.
2. **De-Identified Clinical Benchmark:** Certified evaluation on $\ge 1,000$ standardized clinical transcripts across regional languages/dialects achieving entity extraction precision $\ge 0.95$ and recall $\ge 0.95$.
3. **Adversarial Safety Harness:** Automated tests verifying zero susceptibility to prompt injections that attempt to inject diagnoses or suppress emergency alerts.

---

## 5. Architectural Firewall Enforcement

The decoupling firewall is enforced in application code via `assertNotInActivePredictionPath()`:

```javascript
const { assertNotInActivePredictionPath } = require('./models/multimodalInterfaces');

// Inside active clinical prediction controller
function predictClinical(req, res, next) {
  // Enforces that experimental multimodal extractors cannot be invoked
  assertNotInActivePredictionPath('kayser_fleischer_grading', {
    route: req.originalUrl,
    is_active_prediction: true
  });
  
  // Proceed with validated tabular feature inference...
}
```

If any experimental multimodal module is invoked from within an active prediction workflow, the system immediately throws an `ActivePipelineFirewallError` (HTTP 501 / Forbidden), terminating execution and logging an architectural boundary violation.

---

## 6. Summary Matrix of Model Capabilities

| Subsystem | Current Status | Prediction Path | Clinical Authority | Input Schema |
| :--- | :--- | :--- | :--- | :--- |
| **Deterministic Emergency Engine** | ✅ Operational | **Active** | Priority Tier A Escalation | SpO2, HR, BP, Temp |
| **Wilson Phenotype Tabular Ensemble** | 🔬 Prototype ($n=185$) | **Active** | Auxiliary Decision Support | 42 Tabular Features |
| **K-F Image Grading Module** | 📋 **Planned (Unbuilt)** | **Decoupled (None)** | Zero (Auxiliary Observation) | Anterior-Segment Slit-Lamp Image |
| **Voice/Text Structuring Engine** | 📋 **Planned (Unbuilt)** | **Decoupled (None)** | Zero (Draft Generation Only) | Audio / Free-Text Notes |

---

*synDx Architecture & Safety Documentation — Designed for ethical, explainable, and human-supervised healthcare intelligence.*
