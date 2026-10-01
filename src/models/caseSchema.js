const crypto = require('crypto');

const SCHEMA_VERSION = '1.0.0';

function generateMutationId() {
  const ts = Date.now();
  const rand = crypto.randomBytes(4).toString('hex');
  return `mut_${ts}_${rand}`;
}

function calculateCaseHash(caseObj) {
  // Hash strictly normalized clinical inputs, excluding patient identifiers
  const vitals = caseObj.clinical_vitals || caseObj.vitals || {};
  const biomarkers = caseObj.biomarkers || {};
  const signs = caseObj.hallmark_signs || {};

  const normalizedInput = [
    caseObj.id || '',
    vitals.spo2 || '',
    vitals.hr || '',
    vitals.bp || '',
    vitals.temp || '',
    biomarkers.ceruloplasmin_g_l || biomarkers.cp || '',
    biomarkers.urine_copper_ug_24h || biomarkers.urineCopper || '',
    signs.kf_ring !== undefined ? signs.kf_ring : '',
    signs.brainstem_damage !== undefined ? signs.brainstem_damage : ''
  ].join('|');

  return crypto.createHash('sha256').update(normalizedInput).digest('hex').substring(0, 16);
}

function calculateDiagnosisHash(caseObj) {
  const triage = caseObj.triage_result || {};
  const condition = triage.primary_condition || caseObj.condition || '';
  const confidence = triage.confidence !== undefined ? triage.confidence : (caseObj.confidence || '');
  const tier = triage.tier || caseObj.tier || '';

  const diagInput = `${condition}|${confidence}|${tier}`;
  return crypto.createHash('sha256').update(diagInput).digest('hex').substring(0, 16);
}

function createDefaultCase(overrides = {}) {
  const id = overrides.id || `CASE-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
  const now = new Date().toISOString();

  const caseObj = {
    schema_version: SCHEMA_VERSION,
    id,
    client_mutation_id: overrides.client_mutation_id || generateMutationId(),
    created_at: overrides.created_at || now,
    updated_at: overrides.updated_at || now,
    status: overrides.status || 'pending',

    patient_context: {
      patient_id: overrides.patient_context?.patient_id || 'PT-' + Math.floor(1000 + Math.random() * 9000),
      age: overrides.patient_context?.age || 29,
      gender: overrides.patient_context?.gender || 'Unspecified',
      phc_facility: overrides.patient_context?.phc_facility || 'Primary Health Centre',
      visit_date: overrides.patient_context?.visit_date || now.split('T')[0],
      is_sample: Boolean(overrides.patient_context?.is_sample)
    },

    clinical_vitals: {
      spo2: overrides.clinical_vitals?.spo2 || 98,
      hr: overrides.clinical_vitals?.hr || 75,
      bp: overrides.clinical_vitals?.bp || '120/80',
      temp: overrides.clinical_vitals?.temp || 36.8
    },

    biomarkers: {
      ceruloplasmin_g_l: overrides.biomarkers?.ceruloplasmin_g_l || 0.02,
      urine_copper_ug_24h: overrides.biomarkers?.urine_copper_ug_24h || 150.0,
      platelets_10e9_l: overrides.biomarkers?.platelets_10e9_l || 200,
      serum_creatinine_umol_l: overrides.biomarkers?.serum_creatinine_umol_l || 70.0,
      liver_subscores: overrides.biomarkers?.liver_subscores || 'Normal',
      thrombin_time_s: overrides.biomarkers?.thrombin_time_s || 16.5,
      total_bilirubin_umol_l: overrides.biomarkers?.total_bilirubin_umol_l || 15.0,
      proteinuria: overrides.biomarkers?.proteinuria || 'Negative'
    },

    hallmark_signs: {
      kf_ring: overrides.hallmark_signs?.kf_ring ?? 0,
      brainstem_damage: overrides.hallmark_signs?.brainstem_damage ?? 0,
      tremor: overrides.hallmark_signs?.tremor ?? 0,
      psychiatric_score: overrides.hallmark_signs?.psychiatric_score ?? 1.0
    },

    triage_result: {
      tier: overrides.triage_result?.tier || 'B',
      primary_condition: overrides.triage_result?.primary_condition || 'Suspected Inborn Error of Metabolism',
      confidence: overrides.triage_result?.confidence !== undefined ? overrides.triage_result.confidence : 80,
      is_emergency: Boolean(overrides.triage_result?.is_emergency),
      emergency_triggers: overrides.triage_result?.emergency_triggers || [],
      needs_review: Boolean(overrides.triage_result?.needs_review),
      needs_review_reasons: overrides.triage_result?.needs_review_reasons || [],
      model_version: overrides.triage_result?.model_version || 'synDx-edge-nb-v1.0'
    },

    referral_recommendation: overrides.referral_recommendation || {
      facility_id: 'FAC-01',
      facility_name: 'District Referral Hospital',
      distance_km: 3.5,
      drug_stock: 'yes'
    },

    physician_decision: overrides.physician_decision || null,

    sync_state: {
      state: overrides.sync_state?.state || 'draft',
      attempts: overrides.sync_state?.attempts || 0,
      last_synced_at: overrides.sync_state?.last_synced_at || null,
      last_error: overrides.sync_state?.last_error || null
    }
  };

  caseObj.audit_proof = {
    case_hash: calculateCaseHash(caseObj),
    diagnosis_hash: calculateDiagnosisHash(caseObj),
    model_version: caseObj.triage_result.model_version
  };

  return caseObj;
}

function validateCaseSchema(caseObj) {
  if (!caseObj || typeof caseObj !== 'object') {
    return { valid: false, error: 'Case payload must be a non-null object.' };
  }

  if (caseObj.schema_version && caseObj.schema_version !== SCHEMA_VERSION) {
    return { valid: false, error: `Unsupported schema version: ${caseObj.schema_version}. Expected: ${SCHEMA_VERSION}` };
  }

  if (!caseObj.id || typeof caseObj.id !== 'string') {
    return { valid: false, error: 'Case id is required.' };
  }

  const validStatuses = ['pending', 'confirmed', 'more-tests', 'overridden', 'draft'];
  if (caseObj.status && !validStatuses.includes(caseObj.status)) {
    return { valid: false, error: `Invalid status: ${caseObj.status}. Must be one of: ${validStatuses.join(', ')}` };
  }

  if (caseObj.sync_state) {
    const validStates = ['draft', 'queued', 'syncing', 'synced', 'failed'];
    if (!validStates.includes(caseObj.sync_state.state)) {
      return { valid: false, error: `Invalid sync state: ${caseObj.sync_state.state}. Must be one of: ${validStates.join(', ')}` };
    }
  }

  return { valid: true };
}

function normalizeCase(raw) {
  if (!raw) return null;
  if (raw.schema_version === SCHEMA_VERSION && raw.clinical_vitals) {
    return raw;
  }

  // Handle legacy flat structure
  let vitals = {};
  let features = [];
  let referral = {};
  let audit = {};

  if (typeof raw.vitals === 'object' && raw.vitals !== null) vitals = raw.vitals;
  else if (raw.vitals_json) {
    try { vitals = JSON.parse(raw.vitals_json); } catch (e) {}
  }

  if (Array.isArray(raw.features)) features = raw.features;
  else if (raw.features_json) {
    try { features = JSON.parse(raw.features_json); } catch (e) {}
  }

  if (typeof raw.referral === 'object' && raw.referral !== null) referral = raw.referral;
  else if (raw.referral_json) {
    try { referral = JSON.parse(raw.referral_json); } catch (e) {}
  }

  return createDefaultCase({
    id: raw.id,
    status: raw.status || 'pending',
    clinical_vitals: {
      spo2: vitals.spo2 !== undefined ? Number(vitals.spo2) : 98,
      hr: vitals.hr !== undefined ? Number(vitals.hr) : 75,
      bp: vitals.bp || '120/80',
      temp: vitals.temp !== undefined ? Number(vitals.temp) : 36.8
    },
    triage_result: {
      tier: raw.tier || 'B',
      primary_condition: raw.condition || 'Suspected Phenotype',
      confidence: raw.confidence !== undefined ? Number(raw.confidence) : 80,
      is_emergency: Boolean(raw.emergency),
      model_version: raw.model || 'synDx-edge-nb-v1.0'
    },
    referral_recommendation: referral,
    sync_state: {
      state: 'synced',
      attempts: 1,
      last_synced_at: raw.created_at || new Date().toISOString()
    }
  });
}

module.exports = {
  SCHEMA_VERSION,
  generateMutationId,
  calculateCaseHash,
  calculateDiagnosisHash,
  createDefaultCase,
  validateCaseSchema,
  normalizeCase
};
