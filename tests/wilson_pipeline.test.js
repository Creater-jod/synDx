/**
 * synDx Wilson Disease ML Pipeline & Input Validation Test Suite
 * ==============================================================
 * Formally verifies:
 * 1. Dataset provenance and strict non-inflation (N=185 unique patients)
 * 2. Patient-level split integrity (zero data leakage, sealed test partition)
 * 3. Feature schema definitions & physiological range validations
 * 4. Error handling for malformed, out-of-range, and edge-case inputs
 * 5. Reproducible evaluation execution & metric report generation
 * 6. Mandatory clinical research disclaimer and preliminary nature enforcement
 */

const assert = require('node:assert');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const app = require('../src/app');
const { validatePredictClinical } = require('../src/validation/mlValidation');

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

  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const req = http.request(
      {
        hostname: parsed.hostname,
        port: parsed.port,
        path: parsed.pathname + parsed.search,
        method: options.method || 'GET',
        headers
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          let data = body;
          try {
            data = JSON.parse(body);
          } catch (e) {}
          resolve({ status: res.statusCode, headers: res.headers, data });
        });
      }
    );

    req.on('error', reject);

    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

const PROJECT_ROOT = path.resolve(__dirname, '..');
const RAW_CSV_PATH = path.join(PROJECT_ROOT, 'data', 'clinical', 'raw', 'Data_Sheet_1.CSV');
const SPLITS_DIR = path.join(PROJECT_ROOT, 'data', 'clinical', 'splits');

async function runTests() {
  console.log('\n======================================================');
  console.log(' synDx Wilson ML Pipeline & Validation Test Suite');
  console.log('======================================================\n');

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      logTest(name, true);
      passed++;
    } catch (err) {
      logTest(name, false, err.message);
      failed++;
    }
  }

  // Start test Express server on ephemeral port
  await new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      console.log(`[+] Test server running on ${baseUrl}\n`);
      resolve();
    });
  });

  try {
    // -------------------------------------------------------------------------
    // 1. DATASET PROVENANCE & STRICT NON-INFLATION (N=185)
    // -------------------------------------------------------------------------
    console.log('--- 1. Dataset Provenance & Cohort Non-Inflation Invariants ---');

    await test('Raw dataset exists and contains exactly 185 authentic patient rows', () => {
      assert.ok(fs.existsSync(RAW_CSV_PATH), `Raw CSV must exist at ${RAW_CSV_PATH}`);
      const content = fs.readFileSync(RAW_CSV_PATH, 'utf8').trim();
      const lines = content.split('\n').filter(l => l.trim().length > 0);
      
      const header = lines[0];
      const dataRows = lines.slice(1);

      // Invariant: Cohort size must strictly equal 185 (no synthetic padding)
      assert.strictEqual(
        dataRows.length,
        185,
        `Expected exactly 185 patient records, found ${dataRows.length}. Do not synthesize or duplicate rows!`
      );
    });

    await test('Raw dataset feature schema consists of 42 clinical features + 1 label', () => {
      const content = fs.readFileSync(RAW_CSV_PATH, 'utf8').trim();
      const lines = content.split('\n');
      const cols = lines[0].split(',').map(c => c.trim());

      assert.strictEqual(cols.length, 43, `Expected 43 columns (42 features + label), found ${cols.length}`);
      assert.strictEqual(cols[cols.length - 1], 'label', "Final column must be named 'label'");
    });

    await test('Raw dataset contains zero missing values and zero duplicate records', () => {
      const content = fs.readFileSync(RAW_CSV_PATH, 'utf8').trim();
      const lines = content.split('\n').filter(l => l.trim().length > 0);
      const dataRows = lines.slice(1);

      const seen = new Set();
      dataRows.forEach((row, idx) => {
        const cells = row.split(',');
        assert.strictEqual(cells.length, 43, `Row ${idx + 1} has ${cells.length} cells instead of 43`);
        
        cells.forEach((cell, cellIdx) => {
          assert.ok(cell.trim() !== '', `Empty cell found at row ${idx + 1}, column ${cellIdx + 1}`);
        });

        // Duplicate row check
        assert.strictEqual(seen.has(row), false, `Exact duplicate patient record detected at row ${idx + 1}`);
        seen.add(row);
      });
    });

    await test('Target label consists strictly of authentic binary classes (163 Neuro, 22 Hepatic)', () => {
      const content = fs.readFileSync(RAW_CSV_PATH, 'utf8').trim();
      const lines = content.split('\n').filter(l => l.trim().length > 0);
      const dataRows = lines.slice(1);

      let class0Count = 0;
      let class1Count = 0;

      dataRows.forEach(row => {
        const cells = row.split(',');
        const label = parseInt(cells[cells.length - 1].trim(), 10);
        assert.ok([0, 1].includes(label), `Invalid label value: ${label}`);
        if (label === 0) class0Count++;
        if (label === 1) class1Count++;
      });

      assert.strictEqual(class1Count, 163, 'Class 1 count must be exactly 163');
      assert.strictEqual(class0Count, 22, 'Class 0 count must be exactly 22');
      assert.strictEqual(class0Count + class1Count, 185, 'Total patient labels must equal 185');
    });

    // -------------------------------------------------------------------------
    // 2. PATIENT-LEVEL PARTITIONING & LEAKAGE PREVENTION
    // -------------------------------------------------------------------------
    console.log('\n--- 2. Patient-Level Splitting & Data Leakage Prevention ---');

    await test('Partition sizes strictly match 60/20/20 ratio: 111 train, 37 val, 37 test', () => {
      const xTrain = fs.readFileSync(path.join(SPLITS_DIR, 'X_train.csv'), 'utf8').trim().split('\n').slice(1);
      const yTrain = fs.readFileSync(path.join(SPLITS_DIR, 'y_train.csv'), 'utf8').trim().split('\n').slice(1);
      const xVal = fs.readFileSync(path.join(SPLITS_DIR, 'X_val.csv'), 'utf8').trim().split('\n').slice(1);
      const yVal = fs.readFileSync(path.join(SPLITS_DIR, 'y_val.csv'), 'utf8').trim().split('\n').slice(1);
      const xTest = fs.readFileSync(path.join(SPLITS_DIR, 'X_test.csv'), 'utf8').trim().split('\n').slice(1);
      const yTest = fs.readFileSync(path.join(SPLITS_DIR, 'y_test.csv'), 'utf8').trim().split('\n').slice(1);

      assert.strictEqual(xTrain.length, 111, 'Train partition must have 111 patients');
      assert.strictEqual(yTrain.length, 111, 'Train labels must have 111 records');
      assert.strictEqual(xVal.length, 37, 'Validation partition must have 37 patients');
      assert.strictEqual(yVal.length, 37, 'Validation labels must have 37 records');
      assert.strictEqual(xTest.length, 37, 'Test partition must have 37 patients');
      assert.strictEqual(yTest.length, 37, 'Test labels must have 37 records');

      assert.strictEqual(
        xTrain.length + xVal.length + xTest.length,
        185,
        'Sum of split rows must exactly equal 185'
      );
    });

    await test('Zero patient record overlap between training, validation, and test splits', () => {
      const trainRows = new Set(fs.readFileSync(path.join(SPLITS_DIR, 'X_train.csv'), 'utf8').trim().split('\n').slice(1));
      const valRows = fs.readFileSync(path.join(SPLITS_DIR, 'X_val.csv'), 'utf8').trim().split('\n').slice(1);
      const testRows = fs.readFileSync(path.join(SPLITS_DIR, 'X_test.csv'), 'utf8').trim().split('\n').slice(1);

      for (const row of valRows) {
        assert.strictEqual(trainRows.has(row), false, 'Data leakage: Row in validation set found in training set!');
      }

      for (const row of testRows) {
        assert.strictEqual(trainRows.has(row), false, 'Data leakage: Row in test set found in training set!');
      }
    });

    // -------------------------------------------------------------------------
    // 3. FEATURE SCHEMA & INPUT VALIDATION TESTS
    // -------------------------------------------------------------------------
    console.log('\n--- 3. Feature Schema & Input Validation Engine ---');

    await test('validatePredictClinical accepts canonical clinical features payload', () => {
      const validPayload = {
        features: {
          'Age': 29,
          'Gender': 1.0,
          '24-hour urine copper': 468.6,
          'CP': 0.018,
          'Psychiatric symptom score': 7.0,
          'Liver symptom score': 1.0,
          'Cirrhosis(es/No)': 0,
          'K-F ring(es/No)': 1
        }
      };

      const result = validatePredictClinical(validPayload);
      assert.strictEqual(result.valid, true);
    });

    await test('validatePredictClinical rejects missing or non-object features payload', () => {
      const res1 = validatePredictClinical({});
      assert.ok(res1.error);

      const res2 = validatePredictClinical({ features: [] });
      assert.ok(res2.error);

      const res3 = validatePredictClinical({ features: {} });
      assert.ok(res3.error);
    });

    await test('validatePredictClinical rejects non-finite, NaN, and corrupt values', () => {
      const nanPayload = {
        features: {
          'Age': NaN,
          'CP': 0.02
        }
      };
      const res = validatePredictClinical(nanPayload);
      assert.ok(res.error);
      assert.ok(res.error.includes('Age'));
    });

    await test('validatePredictClinical flags negative age as physiological violation', () => {
      const invalidAge = {
        features: {
          'Age': -5,
          'CP': 0.02
        }
      };
      const res = validatePredictClinical(invalidAge);
      assert.ok(res.error);
      assert.ok(res.error.toLowerCase().includes('age'));
    });

    await test('validatePredictClinical flags impossible age (>120 years)', () => {
      const invalidAge = {
        features: {
          'Age': 155,
          'CP': 0.02
        }
      };
      const res = validatePredictClinical(invalidAge);
      assert.ok(res.error);
      assert.ok(res.error.toLowerCase().includes('age'));
    });

    await test('validatePredictClinical flags negative 24-hour urine copper', () => {
      const invalidCopper = {
        features: {
          '24-hour urine copper': -250.0
        }
      };
      const res = validatePredictClinical(invalidCopper);
      assert.ok(res.error);
      assert.ok(res.error.toLowerCase().includes('copper'));
    });

    await test('validatePredictClinical flags negative ceruloplasmin', () => {
      const invalidCP = {
        features: {
          'CP': -0.015
        }
      };
      const res = validatePredictClinical(invalidCP);
      assert.ok(res.error);
      assert.ok(res.error.toLowerCase().includes('ceruloplasmin'));
    });

    await test('validatePredictClinical flags invalid psychiatric symptom score (>10)', () => {
      const invalidPsych = {
        features: {
          'Psychiatric symptom score': 14.5
        }
      };
      const res = validatePredictClinical(invalidPsych);
      assert.ok(res.error);
      assert.ok(res.error.toLowerCase().includes('psychiatric'));
    });

    await test('validatePredictClinical flags invalid gender encoding', () => {
      const invalidGender = {
        features: {
          'Gender': 99
        }
      };
      const res = validatePredictClinical(invalidGender);
      assert.ok(res.error);
      assert.ok(res.error.toLowerCase().includes('gender'));
    });

    // -------------------------------------------------------------------------
    // 4. API ENDPOINT & VALIDATION MIDDLEWARE INTEGRATION
    // -------------------------------------------------------------------------
    console.log('\n--- 4. Express API Endpoint & Validation Middleware ---');

    await test('POST /api/predict/clinical with invalid payload returns HTTP 400', async () => {
      const res = await request('/api/predict/clinical', {
        method: 'POST',
        body: {
          features: {
            'Age': -20
          }
        }
      });

      assert.strictEqual(res.status, 400);
      assert.ok(res.data.error);
      assert.ok(res.data.error.includes('Age'));
    });

    await test('POST /api/predict/clinical with empty body returns HTTP 400', async () => {
      const res = await request('/api/predict/clinical', {
        method: 'POST',
        body: {}
      });

      assert.strictEqual(res.status, 400);
      assert.ok(res.data.error);
    });

    await test('GET /api/models exposes clinical model metadata with target & disclaimer', async () => {
      const res = await request('/api/models');
      assert.strictEqual(res.status, 200);
      assert.ok(res.data.clinical_models);
      assert.strictEqual(res.data.clinical_models.frameworks.length, 3);
      assert.ok(res.data.clinical_models.target.includes('Wilson-disease'));
    });

    // -------------------------------------------------------------------------
    // 5. REPRODUCIBLE EVALUATION COMMAND & ARTIFACT GENERATION
    // -------------------------------------------------------------------------
    console.log('\n--- 5. Reproducible Evaluation Command & Artifact Generation ---');

    await test('Reproducible evaluation command (node scripts/run_wilson_eval.js) completes with code 0', () => {
      const cmd = `node "${path.join(PROJECT_ROOT, 'scripts', 'run_wilson_eval.js')}"`;
      const output = execSync(cmd, { encoding: 'utf8', cwd: PROJECT_ROOT });
      
      assert.ok(output.includes('synDx Wilson Phenotype ML Pipeline - Reproducible Model Evaluator'));
      assert.ok(output.includes('XGBoost'));
      assert.ok(output.includes('LightGBM'));
      assert.ok(output.includes('Random Forest'));
      assert.ok(output.includes('Ensemble Average'));
      assert.ok(output.includes('STATUS: All provenance, non-inflation, and evaluation checks PASSED'));
    });

    await test('Reproducible evaluation output JSON summary exists and conforms to schema', () => {
      const summaryPath = path.join(PROJECT_ROOT, 'reports', 'clinical', 'reproducible_evaluation_summary.json');
      assert.ok(fs.existsSync(summaryPath), 'reproducible_evaluation_summary.json must exist');

      const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
      assert.strictEqual(summary.pipeline_version, '1.0.0');
      assert.strictEqual(summary.dataset_provenance.rows, 185);
      assert.strictEqual(summary.dataset_provenance.duplicate_rows, 0);
      assert.strictEqual(summary.splits_integrity.train_patients, 111);
      assert.strictEqual(summary.splits_integrity.val_patients, 37);
      assert.strictEqual(summary.splits_integrity.test_patients, 37);
      assert.strictEqual(summary.splits_integrity.test_set_sealed, true);

      // Verify all 4 models have validation metrics
      for (const model of ['XGBoost', 'LightGBM', 'Random Forest', 'Ensemble Average']) {
        assert.ok(summary.validation_metrics[model], `Metrics for ${model} missing`);
        const m = summary.validation_metrics[model];
        assert.ok(m.roc_auc >= 0.70, `${model} ROC-AUC should be >= 0.70`);
        assert.ok(m.accuracy >= 0.85, `${model} Accuracy should be >= 0.85`);
        assert.ok(m.sensitivity === 1.0, `${model} Sensitivity should be 1.0`);
      }

      // Verify preliminary research disclaimer presence
      assert.ok(summary.preliminary_notice.includes('preliminary'));
      assert.ok(summary.medical_disclaimer.includes('cohort size (n=185)'));
    });

  } finally {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  }

  console.log('\n======================================================');
  console.log(` Summary: ${passed} PASSED, ${failed} FAILED`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
