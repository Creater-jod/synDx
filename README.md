# synDx — Offline-First Rare-Disease Decision Support & Review Console

> **Clinical Decision Support Research Prototype**  
> *Designed for primary healthcare workers and clinical reviewers in low-resource settings.*

---

## ⚠️ Important Notices & Clinical Disclaimers

### 1. Decision-Support Research Prototype (Not a Diagnostic Device)
- **synDx is a decision-support research prototype**, not a certified Software as a Medical Device (SaMD).
- It has **not** been cleared or certified by the US FDA, European CE, or Indian CDSCO.
- It **must not** be used as a standalone diagnostic system, an autonomous triage tool, or an automatic prescription generator.
- All diagnostic predictions, risk tiers, and referral suggestions require independent verification by a qualified medical officer.

### 2. Sample Data Notice
- All pre-loaded patient profiles (e.g., Alex Mercer, `PT-9041`), sample cases, and clinical presets are **synthetic, educational test data**.
- They are provided solely for user-interface walkthroughs, workflow simulation, and integration testing.
- They **do not** contain Protected Health Information (PHI) or real patient records.

### 3. Model Scope & Scientific Limitations
- The active clinical ML model is trained exclusively on a single-center research cohort of **$n=185$ confirmed Wilson disease cases** (differentiating neurological vs hepatic phenotypes per Leipzig criteria).
- Due to cohort size and class imbalance (163 neurological vs 22 hepatic), results are **preliminary**. The model achieves high sensitivity (~1.00) on the minority class but modest specificity (~0.00–0.40) on validation splits.
- The platform does **not** host a trained classifier for 4,000+ rare diseases. Orphadata and HPO datasets are ingested as **reference ontology knowledge graphs**, not trained diagnostic classifiers.
- The ML model runs **server-side** via the Python FastAPI microservice (`:8000`) and is **not claimed to run on-device**.

---

## 🌟 Key Capabilities (Tested & Operational)

1. **Guided, Low-End-Android-Friendly PWA Workflow:**
   - 6-step guided clinical intake: *Patient and Visit* → *Signs and Measurements* → *Entry Check* → *Triage Result* → *Next Action* → *Review and Audit*.
   - High-contrast, warm-paper palette (`#F6F3EC`) engineered for visibility on low-cost devices in bright sunlight (zero glassmorphism or neon glow).
   - Installable PWA with Service Worker v2 (`syndx-pwa-v2`) caching the complete offline app shell.

2. **Deterministic Emergency Vitals Interlock:**
   - Evaluates physiological vital signs ($\text{SpO}_2 < 90\%$, $\text{HR} > 140$ or $< 45$, $\text{BP} \ge 180/120$ or $< 80$, $\text{Temp} \ge 39.5^\circ\text{C}$ or $\le 35.0^\circ\text{C}$).
   - **Runs 100% on-device / offline.** Bypasses ML inference to trigger immediate Tier A Emergency escalation upon detection of acute instability.

3. **Offline Case Drafts & Idempotent Sync:**
   - LocalStorage draft persistence survives network disconnection and app restarts.
   - Client-side idempotency queue (`draft` → `queued` → `syncing` → `synced` / `failed`) with automatic deduplication using cryptographic `client_mutation_id`.

4. **Doctor Review & Audit Trail:**
   - Dedicated Doctor Review Console supporting clinical confirmation, test ordering, or override with justification.
   - Local SQLite SHA-256 hash-chained audit ledger ensuring tamper-evident tracking with zero PI/symptoms exposed in shared audit blocks.

5. **Multimodal Safety Firewalls (Planned Modules):**
   - Future Kayser–Fleischer image grading and voice/text structuring interfaces are defined in `docs/FUTURE_MULTIMODAL_INTERFACES.md` and strictly decoupled from the active prediction path.
   - Language models are constrained to schema-validated drafts only: strictly prohibited from diagnosing, setting risk tiers, generating confidence scores, or overriding emergency rules.

---

## 📁 Repository Structure

```
syndx1/
├── src/                          # Express Node.js Backend Layer (Port 3000)
│   ├── config/                   # SQLite database & environment configuration
│   ├── controllers/              # REST API controllers (cases, auth, ml, emergency)
│   ├── middleware/               # Auth, validation, and error middleware
│   ├── models/                   # Versioned schemas (caseSchema v1.0.0, multimodal)
│   ├── repositories/             # Parameterized SQL database queries
│   ├── routes/                   # Modular route declarations
│   ├── services/                 # Business logic, sync queue, emergency evaluator
│   └── validation/               # Input validation (mlValidation, caseValidation)
├── pipeline/                     # Python Clinical ML Microservice (Port 8000)
│   ├── clinical_service.py       # FastAPI microservice (XGBoost, LightGBM, RF)
│   ├── evaluate_wilson.py        # Python reproducible evaluation script
│   └── federated_simulation.py   # 3-node FedAvg simulation script
├── data/                         # Data Storage & Provenance
│   ├── clinical/                 # Wilson dataset (raw Data_Sheet_1.CSV, splits)
│   ├── processed/                # Ingested Orphadata & HPO ontologies
│   ├── provenance/               # Cryptographic SHA-256 dataset manifests
│   └── syndx_production.db      # SQLite production database
├── docs/                         # Architecture & Specification Documents
│   ├── CASE_SCHEMA.md            # Versioned Case Schema v1.0.0 specification
│   ├── WILSON_PIPELINE.md        # Wilson cohort provenance & ML audit
│   └── FUTURE_MULTIMODAL_INTERFACES.md # K-F grading & LLM draft safety firewalls
├── js/                           # PWA Client Application Logic
│   ├── app.js                    # 6-step guided intake, sync manager, UI router
│   ├── data.js                   # API client, presets, and mock store
│   └── patient_portal.js         # Educational intake demonstration module
├── css/                          # Clinical warm-paper design system
├── tests/                        # Automated Test Suites (98 tests total)
│   ├── backend.test.js           # Express API, auth, parameterized SQL tests (30)
│   ├── sync_and_draft.test.js    # Case schema, drafts, idempotency tests (13)
│   ├── wilson_pipeline.test.js   # Cohort provenance & validation tests (20)
│   ├── offline_and_pwa.test.js   # Service worker, manifest, offline tests (11)
│   ├── multimodal_interfaces.test.js # K-F & LLM draft safety firewall tests (17)
│   └── test_wilson_pipeline.py   # Python model loading & split tests (7)
├── index.html                    # Single-page guided clinical PWA application
├── manifest.json                 # Web App Manifest (standalone PWA)
├── sw.js                         # Service Worker v2 (app shell offline cache)
├── server.js                     # Main application entry point
├── package.json                  # Dependencies & test runners
└── README.md                     # Master documentation
```

---

## 🚀 Setup & Local Installation

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Python**: v3.10 or v3.11 (with `pip` or `uv`)

### Step 1: Clone & Install Node.js Dependencies
```bash
git clone https://github.com/Creater-jod/synDx.git
cd synDx
npm install
```

### Step 2: Set Up Python Environment & ML Dependencies
Create and activate a Python virtual environment:
```bash
# Windows (PowerShell)
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# Linux / macOS
python3 -m venv .venv
source .venv/bin/activate
```

Install the required ML microservice packages:
```bash
pip install fastapi uvicorn pydantic joblib xgboost lightgbm pandas scikit-learn
```

### Step 3: Configure Environment Variables
Copy the example environment file:
```bash
# Windows
copy .env.example .env

# Linux / macOS
cp .env.example .env
```
Default ports configured:
- `PORT=3000` (Node.js Express Server)
- `ML_SERVICE_URL=http://127.0.0.1:8000` (FastAPI Microservice)
- `JWT_SECRET=syndx_clinical_secure_session_token_key_prod_2026`

### Step 4: Start the Servers
You can run the Express server independently (emergency rules, intake flow, drafts, and sync work 100% without the Python service):

**Terminal 1 — Node.js Express Server:**
```bash
npm start
# Server listening on http://localhost:3000
```

**Terminal 2 (Optional) — FastAPI Clinical ML Microservice:**
```bash
python -m uvicorn pipeline.clinical_service:app --host 127.0.0.1 --port 8000
# FastAPI running on http://127.0.0.1:8000
```
*(Note: If the ML microservice is offline, synDx automatically falls back to deterministic emergency evaluation and preloaded clinical presets.)*

### Step 5: Access the Web App
Open your web browser and navigate to:
```
http://localhost:3000
```

---

## 🧪 Verification & Running Tests

synDx includes comprehensive automated test suites covering all architectural layers:

```bash
# Run all JavaScript integration and unit test suites (91 tests)
npm test

# Run the Wilson ML pipeline reproducible evaluation benchmark
npm run eval:wilson

# Run Python model loading and split non-leakage tests (7 tests)
python tests/test_wilson_pipeline.py
```

### Test Suite Summary
| Test Suite | File | Tests | Coverage |
| :--- | :--- | :---: | :--- |
| **Backend Core** | `tests/backend.test.js` | 30 | Auth, JWT, SQL injection safety, emergency engine, audit trail |
| **Sync & Drafts** | `tests/sync_and_draft.test.js` | 13 | `caseSchema` v1.0.0, offline draft recovery, idempotent sync |
| **Wilson Pipeline (JS)** | `tests/wilson_pipeline.test.js` | 20 | Non-inflation, 185-row audit, zero leakage, input bounds |
| **PWA & Offline** | `tests/offline_and_pwa.test.js` | 11 | Service worker v2, manifest, offline storage, device matrix |
| **Multimodal Safety** | `tests/multimodal_interfaces.test.js` | 17 | K-F contracts, LLM draft guardrails, active path firewall |
| **Wilson Pipeline (Py)**| `tests/test_wilson_pipeline.py` | 7 | Model loading, feature alignment, prediction validation |
| **Total** | | **98** | **100% Passing** |

---

## 📋 Short Demo Walkthrough Checklist

Follow this checklist to demonstrate the full clinical workflow in under 5 minutes:

1. **Authentication:**
   - Log in using either test account:
     - Health Worker: `hw1` / `password123`
     - Doctor: `doc1` / `password123`
2. **Deterministic Emergency Vitals Interlock:**
   - In Step 2 (*Signs & Measurements*), set **$\text{SpO}_2 = 85\%$** (or $\text{HR} = 150\text{ bpm}$).
   - Click *Check Vitals & Next*.
   - **Observe:** The deterministic emergency engine triggers an immediate **Tier A Emergency Escalation** banner before any ML inference.
3. **Decision-Support Triage:**
   - Click *"Load Preset Case: Severe Neurological Manifestation"*.
   - Review entered biomarkers (Ceruloplasmin $0.018\text{ g/L}$, Urine Copper $468.6\ \mu\text{g/24h}$, K-F ring confirmed).
   - Advance to Step 4 (*Triage Result*).
   - **Observe:** Ensemble confidence score, suspected phenotype, and SHAP feature importance proxies ranking top deviations.
4. **Doctor Review & Audit:**
   - Switch to the *Doctor Review Console*.
   - Select the case, inspect clinical parameters, and click **Confirm Decision** or **Override**.
   - Enter a clinical note (e.g., *"Confirmed. Slit-lamp exam verified bilateral K-F rings."*).
   - Submit and verify the case transitions to `confirmed`.
5. **Offline Operation & Draft Saving:**
   - Disconnect your network or toggle the in-app **Offline Simulation Mode**.
   - Fill out an intake form and click **Save Draft**.
   - Refresh the browser: verify the draft is cleanly restored from local storage.
   - Submit the case: verify it enters the **Sync Manager** in `queued` state.
   - Re-enable the network: verify the sync manager automatically processes the item to `synced` idempotently.
6. **Audit Hash Integrity:**
   - Navigate to the *Audit & Blockchain Ledger* view.
   - Click **Verify Ledger Integrity**.
   - **Observe:** System verifies SHA-256 state hashes across the chain with zero PII exposed.

---

## 🔬 Reality Checklist: Implemented vs. Simulated vs. Planned

| Capability | Status | Reality & Architecture |
| :--- | :--- | :--- |
| **Deterministic Emergency Engine** | ✅ **Implemented** | Deterministic SpO2/HR/BP/Temp rule engine; runs 100% offline on client and server. |
| **PWA App Shell & Offline Storage** | ✅ **Implemented** | Service Worker v2, Web App Manifest, LocalStorage draft recovery, offline matrix modal. |
| **Idempotent Sync Queue** | ✅ **Implemented** | Client-side queue with `client_mutation_id` deduplication and retry transitions. |
| **Wilson ML Phenotype Ensemble** | 🔬 **Prototype** | XGBoost + LightGBM + RF trained on $n=185$ cohort; hosted on server FastAPI (`:8000`). |
| **Doctor Review Console** | ✅ **Implemented** | SQLite two-way synced verification console with Confirm/Override actions. |
| **Cryptographic Audit Ledger** | ✅ **Implemented** | SQLite SHA-256 hash-chained block audit trail; local ledger, **not** an on-chain smart contract. |
| **Federated Learning** | 🧪 **Simulated** | 3-clinic FedAvg simulation script (`pipeline/federated_simulation.py`); not a live production network. |
| **K-F Image Grading** | 📋 **Planned (Unbuilt)**| Interface defined in `docs/FUTURE_MULTIMODAL_INTERFACES.md`; decoupled from active inference. |
| **Voice / Text Structuring (LLM)** | 📋 **Planned (Unbuilt)**| Schema-validated draft only; strictly prohibited from diagnosing or overriding emergency rules. |
| **Broad Rare Disease Classifier** | 📋 **Planned / Future** | Ingested Orphadata/HPO reference ontologies; no multi-disease clinical model is trained. |

---

## ⚖️ License & Research Ethics

Developed as an academic and open-source clinical research prototype. Designed in accordance with Helsinki Declaration research ethics principles, ensuring zero transmission of identifiable patient data without explicit consent.
