/**
 * synDx — Future Multimodal Interfaces Specification & LLM Safety Guardrails
 * 
 * Defines data contracts and architectural firewalls for:
 * 1. Kayser-Fleischer (K-F) Ring Optical Image Grading (Planned / Experimental)
 * 2. Local Voice & Clinical Text Structuring via LLM/SLM (Planned / Experimental)
 * 
 * ARCHITECTURAL SAFETY FIREWALL:
 * - Both modules are strictly PLANNED and kept OUT of the active prediction path.
 * - A language model may create ONLY a schema-validated draft.
 * - A language model may NOT diagnose, set risk scores (tiers), calculate confidence,
 *   or override deterministic emergency rules.
 */

const { createDefaultCase, validateCaseSchema, SCHEMA_VERSION } = require('./caseSchema');
const emergencyService = require('../services/emergencyService');

const MULTIMODAL_MODULE_STATUS = Object.freeze({
  KF_IMAGE_GRADING: 'PLANNED',
  VOICE_TEXT_STRUCTURING: 'PLANNED'
});

class ActivePipelineFirewallError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ActivePipelineFirewallError';
    this.statusCode = 501; // Not Implemented / Forbidden in active pipeline
  }
}

/**
 * Interface specification for Kayser-Fleischer Image Grading
 */
const KF_IMAGE_GRADING_SPEC = Object.freeze({
  module_id: 'kayser_fleischer_grading',
  status: MULTIMODAL_MODULE_STATUS.KF_IMAGE_GRADING,
  title: 'Kayser-Fleischer Corneal Copper Ring Optical Grading',
  version: '0.1.0-planned',
  is_active_in_prediction_path: false,
  description: 'Auxiliary anterior-segment/slit-lamp optical analysis to assess corneal copper ring presence and density.',
  input_contract: {
    accepted_formats: ['image/jpeg', 'image/png', 'application/dicom'],
    optical_views: ['slit_beam', 'diffuse_tangential', 'coaxial'],
    minimum_resolution: { width: 1024, height: 1024 },
    required_metadata: ['eye_lateralization (OD/OS)', 'illumination_type', 'device_type']
  },
  output_contract: {
    kf_ring_detected: 'boolean | null',
    detection_confidence: 'number (0.0 to 1.0)',
    copper_density_grade: 'integer (0=absent, 1=faint/partial rim, 2=complete circumferential <2mm, 3=dense band >=2mm)',
    circumference_degrees: 'number (0 to 360)',
    image_quality_score: 'number (0.0 to 1.0)',
    quality_flags: 'string[]',
    requires_ophthalmologist_confirmation: 'boolean (strictly true)',
    is_diagnostic: 'boolean (strictly false)',
    disclaimer: 'string'
  },
  prerequisites_for_activation: [
    'Ethically cleared multi-center dataset of >=500 annotated anterior-segment photographs',
    'Consensus ground truth by >=3 board-certified ophthalmologists (Fleiss Kappa >= 0.85)',
    'Balanced distribution across diverse iris pigmentation profiles (Fitzpatrick skin types I-VI)',
    'Independent external validation test set'
  ]
});

/**
 * Interface specification for Local Voice/Text Structuring
 */
const VOICE_TEXT_STRUCTURING_SPEC = Object.freeze({
  module_id: 'clinical_voice_text_structuring',
  status: MULTIMODAL_MODULE_STATUS.VOICE_TEXT_STRUCTURING,
  title: 'Local Voice & Clinical Text Structuring Engine',
  version: '0.1.0-planned',
  is_active_in_prediction_path: false,
  description: 'On-device clinical note and speech parser converting unstructured intake observations into draft case schema fields.',
  input_contract: {
    accepted_inputs: ['audio/wav', 'audio/flac', 'audio/mp3', 'text/plain'],
    context_fields: ['phc_facility', 'author_role', 'language_code']
  },
  output_contract: {
    draft_case: `Object conforming strictly to caseSchema v${SCHEMA_VERSION}`,
    safety_violations: 'string[]',
    extraction_metadata: {
      model_type: 'string',
      is_on_device: 'boolean',
      execution_timestamp: 'ISO8601 string'
    }
  },
  guardrails: {
    draft_only: true,
    no_diagnosing: true,
    no_risk_tier_setting: true,
    no_confidence_scoring: true,
    no_emergency_override: true,
    human_in_the_loop_mandatory: true
  },
  prerequisites_for_activation: [
    'Fully offline, quantized on-device SLM execution proof (zero patient data exfiltration)',
    'Standardized de-identified clinical extraction benchmark with F1 >= 0.95 across target dialects',
    'Adversarial test suite preventing prompt injection, hallucinated vitals, or diagnostic tampering'
  ]
});

/**
 * Validates output from a Kayser-Fleischer image grading model.
 * Enforces that it cannot claim to be diagnostic and must mandate ophthalmologist confirmation.
 */
function validateKFGradingOutput(payload) {
  if (!payload || typeof payload !== 'object') {
    return { valid: false, errors: ['Payload must be a non-null object.'] };
  }

  const errors = [];

  // Mandatory Safety Check 1: Must require human ophthalmologist confirmation
  if (payload.requires_ophthalmologist_confirmation !== true) {
    errors.push('Safety violation: requires_ophthalmologist_confirmation must be explicitly set to true.');
  }

  // Mandatory Safety Check 2: Cannot claim diagnostic authority
  if (payload.is_diagnostic !== false) {
    errors.push('Safety violation: is_diagnostic must be strictly false. Image grading is an auxiliary sign extractor, not a diagnosis.');
  }

  // Copper Density Grade: 0, 1, 2, 3
  if (![0, 1, 2, 3].includes(payload.copper_density_grade)) {
    errors.push(`Invalid copper_density_grade: ${payload.copper_density_grade}. Expected 0, 1, 2, or 3.`);
  }

  // Circumference degrees: 0 to 360
  if (typeof payload.circumference_degrees !== 'number' || payload.circumference_degrees < 0 || payload.circumference_degrees > 360) {
    errors.push(`Invalid circumference_degrees: ${payload.circumference_degrees}. Expected number in range [0, 360].`);
  }

  // Image quality score: 0.0 to 1.0
  if (typeof payload.image_quality_score !== 'number' || payload.image_quality_score < 0.0 || payload.image_quality_score > 1.0) {
    errors.push(`Invalid image_quality_score: ${payload.image_quality_score}. Expected float in range [0.0, 1.0].`);
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return { valid: true };
}

/**
 * Sanitizes and validates an LLM/SLM extracted clinical note payload.
 * 
 * SAFETY RULES ENFORCED:
 * 1. The output status is FORCED to 'draft' and sync_state.state is FORCED to 'draft'.
 * 2. Any diagnostic claims (e.g. primary_condition, condition, diagnosis) are STRIPPED.
 * 3. Any risk scores or tiers (e.g. tier, risk_score) are STRIPPED and reset to clinical pending review.
 * 4. Any confidence percentages (e.g. confidence) are STRIPPED.
 * 5. Emergency rules CANNOT be overridden by the LLM: extracted vitals are evaluated
 *    by the deterministic emergencyService. If emergency thresholds are met, emergency
 *    is enforced regardless of LLM claims.
 * 6. Validates extracted physiological values against medical plausibility bounds.
 */
function sanitizeLLMDraftPayload(llmPayload, fallbackContext = {}) {
  if (!llmPayload || typeof llmPayload !== 'object') {
    return { valid: false, errors: ['LLM output payload must be a non-null object.'] };
  }

  const errors = [];
  const safety_violations = [];

  // --- RULE 1 & 2: Prohibit LLM Diagnosing ---
  if (
    llmPayload.condition ||
    llmPayload.primary_condition ||
    llmPayload.diagnosis ||
    llmPayload.predicted_phenotype ||
    llmPayload.triage_result?.primary_condition
  ) {
    safety_violations.push(
      'LLM attempted to assert a diagnosis. Language models are strictly prohibited from diagnosing. Diagnostic assertion was stripped.'
    );
  }

  // --- RULE 3: Prohibit LLM Setting Risk Scores or Tiers ---
  if (
    llmPayload.tier ||
    llmPayload.risk_tier ||
    llmPayload.risk_score ||
    llmPayload.triage_result?.tier
  ) {
    safety_violations.push(
      'LLM attempted to assign a risk score/tier. Risk scores must be calculated solely by deterministic emergency rules and validated clinical algorithms. Risk tier was reset.'
    );
  }

  // --- RULE 4: Prohibit LLM Setting Confidence Scores ---
  if (
    llmPayload.confidence !== undefined ||
    llmPayload.confidence_score !== undefined ||
    llmPayload.triage_result?.confidence !== undefined
  ) {
    safety_violations.push(
      'LLM attempted to assign a confidence score. Confidence scores cannot be generated by language models and were stripped.'
    );
  }

  // --- RULE 5: Prohibit LLM Setting Non-Draft Status ---
  if (llmPayload.status && llmPayload.status !== 'draft') {
    safety_violations.push(
      `LLM attempted to assign status '${llmPayload.status}'. A language model may only create a draft. Status forced to 'draft'.`
    );
  }

  // --- Extract & Validate Patient Demographics ---
  const patientContext = llmPayload.patient_context || {};
  let age = patientContext.age !== undefined ? Number(patientContext.age) : (llmPayload.age !== undefined ? Number(llmPayload.age) : fallbackContext.age || 29);
  if (isNaN(age) || age < 0 || age > 120) {
    errors.push(`Physiological violation: Age must be between 0 and 120 years. Received: ${age}`);
  }

  let gender = patientContext.gender || llmPayload.gender || fallbackContext.gender || 'Unspecified';

  // --- Extract & Validate Clinical Vitals ---
  const rawVitals = llmPayload.clinical_vitals || llmPayload.vitals || {};
  const spo2 = rawVitals.spo2 !== undefined ? Number(rawVitals.spo2) : (fallbackContext.spo2 || 98);
  const hr = rawVitals.hr !== undefined ? Number(rawVitals.hr) : (fallbackContext.hr || 75);
  const bp = rawVitals.bp || fallbackContext.bp || '120/80';
  const temp = rawVitals.temp !== undefined ? Number(rawVitals.temp) : (fallbackContext.temp || 36.8);

  if (isNaN(spo2) || spo2 < 50 || spo2 > 100) {
    errors.push(`Physiological violation: SpO2 must be between 50% and 100%. Received: ${spo2}`);
  }
  if (isNaN(hr) || hr < 30 || hr > 250) {
    errors.push(`Physiological violation: Heart rate must be between 30 and 250 bpm. Received: ${hr}`);
  }
  if (isNaN(temp) || temp < 30.0 || temp > 45.0) {
    errors.push(`Physiological violation: Temperature must be between 30.0°C and 45.0°C. Received: ${temp}`);
  }

  // --- RULE 6: Deterministic Emergency Rules Interlock ---
  // The LLM can NEVER override emergency rules. Emergency rules evaluate the extracted vitals.
  const emergencyEvaluation = emergencyService.evaluateVitals({ spo2, hr, bp, temp });
  if (llmPayload.triage_result?.is_emergency === false && emergencyEvaluation.is_emergency) {
    safety_violations.push(
      'LLM attempted to suppress emergency status while vitals meet critical thresholds. Emergency rule override rejected; deterministic emergency protocol enforced.'
    );
  }

  if (errors.length > 0) {
    return { valid: false, errors, safety_violations };
  }

  // --- Extract Biomarkers & Hallmark Signs ---
  const rawBio = llmPayload.biomarkers || {};
  const rawSigns = llmPayload.hallmark_signs || {};

  // Build the sanitized draft case adhering strictly to caseSchema v1.0.0
  const draftCase = createDefaultCase({
    id: llmPayload.id,
    client_mutation_id: llmPayload.client_mutation_id,
    status: 'draft', // Strictly forced
    patient_context: {
      patient_id: patientContext.patient_id || fallbackContext.patient_id || `DRAFT-PT-${Math.floor(1000 + Math.random() * 9000)}`,
      age,
      gender,
      phc_facility: patientContext.phc_facility || fallbackContext.phc_facility || 'Primary Health Centre',
      visit_date: patientContext.visit_date || new Date().toISOString().split('T')[0],
      is_sample: Boolean(patientContext.is_sample)
    },
    clinical_vitals: {
      spo2,
      hr,
      bp: String(bp),
      temp
    },
    biomarkers: {
      ceruloplasmin_g_l: rawBio.ceruloplasmin_g_l !== undefined ? Number(rawBio.ceruloplasmin_g_l) : 0.02,
      urine_copper_ug_24h: rawBio.urine_copper_ug_24h !== undefined ? Number(rawBio.urine_copper_ug_24h) : 150.0,
      platelets_10e9_l: rawBio.platelets_10e9_l !== undefined ? Number(rawBio.platelets_10e9_l) : 200,
      serum_creatinine_umol_l: rawBio.serum_creatinine_umol_l !== undefined ? Number(rawBio.serum_creatinine_umol_l) : 70.0,
      liver_subscores: rawBio.liver_subscores || 'Normal',
      thrombin_time_s: rawBio.thrombin_time_s !== undefined ? Number(rawBio.thrombin_time_s) : 16.5,
      total_bilirubin_umol_l: rawBio.total_bilirubin_umol_l !== undefined ? Number(rawBio.total_bilirubin_umol_l) : 15.0,
      proteinuria: rawBio.proteinuria || 'Negative'
    },
    hallmark_signs: {
      kf_ring: rawSigns.kf_ring !== undefined ? Number(rawSigns.kf_ring) : 0,
      brainstem_damage: rawSigns.brainstem_damage !== undefined ? Number(rawSigns.brainstem_damage) : 0,
      tremor: rawSigns.tremor !== undefined ? Number(rawSigns.tremor) : 0,
      psychiatric_score: rawSigns.psychiatric_score !== undefined ? Number(rawSigns.psychiatric_score) : 1.0
    },
    triage_result: {
      tier: emergencyEvaluation.is_emergency ? 'A' : 'B', // Emergency forces Tier A; otherwise default baseline pending review
      primary_condition: 'Unverified Clinical Intake Draft (Awaiting Clinician Review)',
      confidence: 0, // LLMs cannot set confidence
      is_emergency: emergencyEvaluation.is_emergency,
      emergency_triggers: emergencyEvaluation.triggers,
      needs_review: true,
      needs_review_reasons: [
        'Automated draft extracted from unstructured voice/text; requires human clinician verification of all parameters.'
      ],
      model_version: 'llm-draft-extractor-v1.0-planned'
    },
    sync_state: {
      state: 'draft', // Strictly forced
      attempts: 0,
      last_synced_at: null,
      last_error: null
    }
  });

  const schemaValidation = validateCaseSchema(draftCase);
  if (!schemaValidation.valid) {
    return { valid: false, errors: [schemaValidation.error], safety_violations };
  }

  return {
    valid: true,
    sanitizedDraft: draftCase,
    safety_violations
  };
}

/**
 * Architectural firewall check preventing unpermitted multimodal modules
 * from being connected to the active prediction or triage pipeline.
 */
function assertNotInActivePredictionPath(moduleName, callerContext = {}) {
  if (
    callerContext.is_active_prediction === true ||
    callerContext.route === '/api/predict/clinical' ||
    callerContext.pipeline === 'active' ||
    callerContext.is_active_path === true
  ) {
    throw new ActivePipelineFirewallError(
      `[FIREWALL VIOLATION] Module '${moduleName}' is strictly PLANNED / EXPERIMENTAL and must remain decoupled from the active prediction path until permitted labelled datasets and independent clinical validation tests are available.`
    );
  }
}

module.exports = {
  MULTIMODAL_MODULE_STATUS,
  ActivePipelineFirewallError,
  KF_IMAGE_GRADING_SPEC,
  VOICE_TEXT_STRUCTURING_SPEC,
  validateKFGradingOutput,
  sanitizeLLMDraftPayload,
  assertNotInActivePredictionPath
};
