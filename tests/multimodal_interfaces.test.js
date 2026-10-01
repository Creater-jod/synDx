const assert = require('node:assert');
const http = require('http');
const app = require('../src/app');
const {
  MULTIMODAL_MODULE_STATUS,
  ActivePipelineFirewallError,
  KF_IMAGE_GRADING_SPEC,
  VOICE_TEXT_STRUCTURING_SPEC,
  validateKFGradingOutput,
  sanitizeLLMDraftPayload,
  assertNotInActivePredictionPath
} = require('../src/models/multimodalInterfaces');
const { validateCaseSchema } = require('../src/models/caseSchema');

let server;
let baseUrl;

function logTest(name, passed, detail = '') {
  if (passed) {
    console.log(`  ✓ [PASS] ${name}${detail ? ` (${detail})` : ''}`);
  } else {
    console.error(`  ✗ [FAIL] ${name}: ${detail}`);
  }
}

async function request(path, options = {}) {
  const url = `${baseUrl}${path}`;
  const headers = { ...(options.headers || {}) };
  if (options.body && typeof options.body === 'object') {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  let data;
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    data = await res.json();
  } else {
    data = await res.text();
  }

  return { status: res.status, headers: res.headers, data };
}

async function runMultimodalTests() {
  console.log('\n======================================================');
  console.log(' synDx Future Multimodal Interfaces & Safety Tests');
  console.log('======================================================\n');

  let passedCount = 0;
  let failedCount = 0;

  async function test(name, fn) {
    try {
      await fn();
      logTest(name, true);
      passedCount++;
    } catch (err) {
      logTest(name, false, err.message);
      failedCount++;
    }
  }

  // Start ephemeral server
  await new Promise((resolve) => {
    server = app.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      console.log(`[+] Test server running on ${baseUrl}\n`);
      resolve();
    });
  });

  try {
    // -------------------------------------------------------------------------
    // 1. MODULE STATUS & PREDICTION PATH FIREWALL
    // -------------------------------------------------------------------------
    console.log('--- 1. Multimodal Module Status & Active Path Decoupling ---');

    await test('Kayser-Fleischer image grading is marked as PLANNED and inactive in prediction path', () => {
      assert.strictEqual(MULTIMODAL_MODULE_STATUS.KF_IMAGE_GRADING, 'PLANNED');
      assert.strictEqual(KF_IMAGE_GRADING_SPEC.status, 'PLANNED');
      assert.strictEqual(KF_IMAGE_GRADING_SPEC.is_active_in_prediction_path, false);
      assert.ok(KF_IMAGE_GRADING_SPEC.prerequisites_for_activation.length >= 3);
    });

    await test('Voice/text structuring is marked as PLANNED and inactive in prediction path', () => {
      assert.strictEqual(MULTIMODAL_MODULE_STATUS.VOICE_TEXT_STRUCTURING, 'PLANNED');
      assert.strictEqual(VOICE_TEXT_STRUCTURING_SPEC.status, 'PLANNED');
      assert.strictEqual(VOICE_TEXT_STRUCTURING_SPEC.is_active_in_prediction_path, false);
      assert.strictEqual(VOICE_TEXT_STRUCTURING_SPEC.guardrails.draft_only, true);
      assert.strictEqual(VOICE_TEXT_STRUCTURING_SPEC.guardrails.no_diagnosing, true);
      assert.strictEqual(VOICE_TEXT_STRUCTURING_SPEC.guardrails.no_risk_tier_setting, true);
      assert.strictEqual(VOICE_TEXT_STRUCTURING_SPEC.guardrails.no_emergency_override, true);
    });

    await test('assertNotInActivePredictionPath blocks execution in active clinical prediction route', () => {
      assert.throws(
        () => {
          assertNotInActivePredictionPath('kayser_fleischer_grading', {
            route: '/api/predict/clinical',
            is_active_prediction: true
          });
        },
        (err) => {
          return err instanceof ActivePipelineFirewallError && err.statusCode === 501;
        }
      );
    });

    await test('assertNotInActivePredictionPath allows execution in documentation / non-active context', () => {
      assert.doesNotThrow(() => {
        assertNotInActivePredictionPath('kayser_fleischer_grading', {
          route: '/api/docs',
          is_active_prediction: false
        });
      });
    });

    await test('POST /api/predict/clinical rejects raw image binary or text payloads', async () => {
      const res = await request('/api/predict/clinical', {
        method: 'POST',
        body: {
          image_bytes: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
          unstructured_note: 'Patient with tremors and suspected KF ring'
        }
      });
      assert.strictEqual(res.status, 400);
      assert.ok(res.data.error.includes('features'));
    });

    // -------------------------------------------------------------------------
    // 2. KAYSER-FLEISCHER IMAGE GRADING INTERFACE CONTRACT
    // -------------------------------------------------------------------------
    console.log('\n--- 2. Kayser-Fleischer (K-F) Optical Grading Contract ---');

    await test('validateKFGradingOutput accepts valid clinical grading result', () => {
      const validPayload = {
        module_id: 'kayser_fleischer_grading',
        kf_ring_detected: true,
        detection_confidence: 0.94,
        copper_density_grade: 2,
        circumference_degrees: 270,
        image_quality_score: 0.88,
        quality_flags: ['acceptable'],
        requires_ophthalmologist_confirmation: true,
        is_diagnostic: false,
        disclaimer: 'Auxiliary optical observation only.'
      };
      const res = validateKFGradingOutput(validPayload);
      assert.strictEqual(res.valid, true);
    });

    await test('validateKFGradingOutput rejects payload if requires_ophthalmologist_confirmation is false or omitted', () => {
      const invalidPayload = {
        kf_ring_detected: true,
        copper_density_grade: 2,
        circumference_degrees: 180,
        image_quality_score: 0.9,
        requires_ophthalmologist_confirmation: false, // VIOLATION
        is_diagnostic: false
      };
      const res = validateKFGradingOutput(invalidPayload);
      assert.strictEqual(res.valid, false);
      assert.ok(res.errors.some((e) => e.includes('requires_ophthalmologist_confirmation')));
    });

    await test('validateKFGradingOutput rejects payload claiming diagnostic authority', () => {
      const diagnosticClaimPayload = {
        kf_ring_detected: true,
        copper_density_grade: 3,
        circumference_degrees: 360,
        image_quality_score: 0.95,
        requires_ophthalmologist_confirmation: true,
        is_diagnostic: true // VIOLATION
      };
      const res = validateKFGradingOutput(diagnosticClaimPayload);
      assert.strictEqual(res.valid, false);
      assert.ok(res.errors.some((e) => e.includes('is_diagnostic must be strictly false')));
    });

    await test('validateKFGradingOutput validates density grade bounds (0-3)', () => {
      const invalidGrade = {
        kf_ring_detected: true,
        copper_density_grade: 5, // Out of bounds
        circumference_degrees: 180,
        image_quality_score: 0.85,
        requires_ophthalmologist_confirmation: true,
        is_diagnostic: false
      };
      const res = validateKFGradingOutput(invalidGrade);
      assert.strictEqual(res.valid, false);
      assert.ok(res.errors.some((e) => e.includes('copper_density_grade')));
    });

    await test('validateKFGradingOutput validates circumference degree bounds (0-360)', () => {
      const invalidDegrees = {
        kf_ring_detected: true,
        copper_density_grade: 1,
        circumference_degrees: 420, // Out of bounds
        image_quality_score: 0.85,
        requires_ophthalmologist_confirmation: true,
        is_diagnostic: false
      };
      const res = validateKFGradingOutput(invalidDegrees);
      assert.strictEqual(res.valid, false);
      assert.ok(res.errors.some((e) => e.includes('circumference_degrees')));
    });

    // -------------------------------------------------------------------------
    // 3. LANGUAGE MODEL (LLM) DRAFT STRUCTURING & SAFETY GUARDRAILS
    // -------------------------------------------------------------------------
    console.log('\n--- 3. Language Model Draft Structuring & Safety Firewall ---');

    await test('sanitizeLLMDraftPayload converts extracted notes to a valid caseSchema draft', () => {
      const llmOutput = {
        patient_context: {
          patient_id: 'PT-9041',
          age: 32,
          gender: 'Female',
          phc_facility: 'Rural Subcentre A'
        },
        clinical_vitals: {
          spo2: 97,
          hr: 76,
          bp: '124/82',
          temp: 36.9
        },
        biomarkers: {
          ceruloplasmin_g_l: 0.015,
          urine_copper_ug_24h: 380.0
        },
        hallmark_signs: {
          kf_ring: 1,
          tremor: 1
        }
      };

      const result = sanitizeLLMDraftPayload(llmOutput);
      assert.strictEqual(result.valid, true);
      assert.strictEqual(result.sanitizedDraft.status, 'draft');
      assert.strictEqual(result.sanitizedDraft.sync_state.state, 'draft');
      assert.strictEqual(result.sanitizedDraft.clinical_vitals.spo2, 97);
      assert.strictEqual(result.sanitizedDraft.triage_result.needs_review, true);

      // Validate against canonical caseSchema v1.0.0
      const schemaCheck = validateCaseSchema(result.sanitizedDraft);
      assert.strictEqual(schemaCheck.valid, true);
    });

    await test('sanitizeLLMDraftPayload strips diagnostic assertions (prohibition on diagnosing)', () => {
      const llmWithDiagnosis = {
        patient_context: { age: 28 },
        clinical_vitals: { spo2: 98, hr: 72, bp: '120/80', temp: 36.7 },
        primary_condition: 'Definite Wilson Disease with Hepatosplenomegaly', // Prohibited
        diagnosis: 'Hepatic Wilson Phenotype', // Prohibited
        condition: 'Wilson Disease' // Prohibited
      };

      const result = sanitizeLLMDraftPayload(llmWithDiagnosis);
      assert.strictEqual(result.valid, true);
      assert.ok(result.safety_violations.some((v) => v.includes('prohibited from diagnosing')));
      assert.strictEqual(
        result.sanitizedDraft.triage_result.primary_condition,
        'Unverified Clinical Intake Draft (Awaiting Clinician Review)'
      );
    });

    await test('sanitizeLLMDraftPayload strips risk scores and triage tiers (prohibition on setting risk tiers)', () => {
      const llmWithTier = {
        patient_context: { age: 34 },
        clinical_vitals: { spo2: 98, hr: 72, bp: '120/80', temp: 36.7 },
        tier: 'Tier A', // Prohibited
        risk_score: 98, // Prohibited
        triage_result: { tier: 'A' } // Prohibited
      };

      const result = sanitizeLLMDraftPayload(llmWithTier);
      assert.strictEqual(result.valid, true);
      assert.ok(result.safety_violations.some((v) => v.includes('assign a risk score/tier')));
      assert.strictEqual(result.sanitizedDraft.triage_result.tier, 'B'); // Reset to default pending tier
    });

    await test('sanitizeLLMDraftPayload strips confidence calculations (prohibition on confidence scoring)', () => {
      const llmWithConfidence = {
        patient_context: { age: 41 },
        clinical_vitals: { spo2: 98, hr: 72, bp: '120/80', temp: 36.7 },
        confidence: 99.8, // Prohibited
        confidence_score: 99.8 // Prohibited
      };

      const result = sanitizeLLMDraftPayload(llmWithConfidence);
      assert.strictEqual(result.valid, true);
      assert.ok(result.safety_violations.some((v) => v.includes('assign a confidence score')));
      assert.strictEqual(result.sanitizedDraft.triage_result.confidence, 0);
    });

    await test('sanitizeLLMDraftPayload enforces draft status when LLM attempts to assign confirmed/synced', () => {
      const llmWithStatus = {
        patient_context: { age: 25 },
        clinical_vitals: { spo2: 98, hr: 72, bp: '120/80', temp: 36.7 },
        status: 'confirmed' // Prohibited
      };

      const result = sanitizeLLMDraftPayload(llmWithStatus);
      assert.strictEqual(result.valid, true);
      assert.strictEqual(result.sanitizedDraft.status, 'draft');
      assert.strictEqual(result.sanitizedDraft.sync_state.state, 'draft');
      assert.ok(result.safety_violations.some((v) => v.includes('assign status')));
    });

    await test('sanitizeLLMDraftPayload prevents LLM from overriding deterministic emergency rules', () => {
      // Patient has critical hypoxia (SpO2 = 82% < 90%)
      const hypoxicCaseWithLLMOverride = {
        patient_context: { age: 45 },
        clinical_vitals: {
          spo2: 82, // CRITICAL HYPOXIA
          hr: 110,
          bp: '120/80',
          temp: 37.0
        },
        triage_result: {
          is_emergency: false // LLM claims patient is stable (ILLEGAL OVERRIDE)
        }
      };

      const result = sanitizeLLMDraftPayload(hypoxicCaseWithLLMOverride);
      assert.strictEqual(result.valid, true);

      // Deterministic rules MUST override LLM assertion
      assert.strictEqual(result.sanitizedDraft.triage_result.is_emergency, true);
      assert.strictEqual(result.sanitizedDraft.triage_result.tier, 'A');
      assert.ok(result.sanitizedDraft.triage_result.emergency_triggers.some((t) => t.includes('Critical Hypoxia')));
      assert.ok(result.safety_violations.some((v) => v.includes('suppress emergency status')));
    });

    await test('sanitizeLLMDraftPayload rejects physiologically impossible demographic and vital inputs', () => {
      const impossiblePayload = {
        patient_context: { age: -10 }, // Impossible negative age
        clinical_vitals: {
          spo2: 125, // Impossible >100% SpO2
          hr: 500, // Impossible >250 bpm HR
          temp: 52.0 // Impossible core temp
        }
      };

      const result = sanitizeLLMDraftPayload(impossiblePayload);
      assert.strictEqual(result.valid, false);
      assert.ok(result.errors.some((e) => e.includes('Age must be between 0 and 120')));
      assert.ok(result.errors.some((e) => e.includes('SpO2 must be between 50% and 100%')));
      assert.ok(result.errors.some((e) => e.includes('Heart rate must be between 30 and 250')));
      assert.ok(result.errors.some((e) => e.includes('Temperature must be between 30.0°C and 45.0°C')));
    });

  } finally {
    if (server) {
      server.close();
    }
  }

  console.log('\n======================================================');
  console.log(` Summary: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log('======================================================\n');

  if (failedCount > 0) {
    process.exit(1);
  }
}

if (require.main === module) {
  runMultimodalTests().catch((err) => {
    console.error('Fatal test error:', err);
    process.exit(1);
  });
}

module.exports = { runMultimodalTests };
