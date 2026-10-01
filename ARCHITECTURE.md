# synDx — System Architecture & Technical Specification

**System Classification:** Clinical Decision Support Research Prototype (Non-Diagnostic)  
**Target Environment:** Primary Healthcare Centres (PHCs) & Community Health Posts in Low-Resource Settings  
**Last Updated:** October 2026  

---

## 1. High-Level System Architecture

```
+---------------------------------------------------------------------------------------------------+
|                                          CLIENT LAYER (PWA)                                        |
|   Supported Surfaces: Low-End Android Smartphones (Chrome/WebView), Tablets, Clinic Desktops      |
|   UI Palette: High-Contrast Warm Paper (#F6F3EC) | Sunlight Readable | Large Touch Targets (48px)  |
|                                                                                                   |
|   +-------------------------------------------------------------------------------------------+   |
|   |                          GUIDED 6-STEP CLINICAL INTAKE WORKFLOW                           |   |
|   |  Step 1: Patient/Visit  ──►  Step 2: Vitals & Signs  ──►  Step 3: Entry Verification      |   |
|   |  Step 4: Triage Advice  ──►  Step 5: Facility Match  ──►  Step 6: Review & Audit          |   |
|   +-------------------------------------------------------------------------------------------+   |
|                                                │                                                  |
|                        +-----------------------+-----------------------+                          |
|                        │                                               │                          |
|                 [ ONLINE MODE ]                                 [ OFFLINE MODE ]                  |
|                        │                                               │                          |
|         +--------------v--------------+                 +--------------v--------------+           |
|         |    Express REST API         |                 |    Local Client Runtime     |           |
|         |    Port 3000 (Node.js)      |                 |    (100% Zero-Network)      |           |
|         +--------------+--------------+                 +--------------+--------------+           |
|                        │                                               │                          |
|           +------------+------------+                   +--------------+--------------+           |
|           │                         │                   │                             │           |
|   +-------v-------+         +-------v-------+   +-------v-------+             +-------v-------+   |
|   | Python FastAPI|         | SQLite DB     |   | Deterministic |             | LocalStorage  |   |
|   | ML Service    |         | (Param SQL)   |   | Emergency     |             | Draft & Sync  |   |
|   | Port 8000     |         | syndx_prod.db |   | Rules Engine  |             | Queue Manager |   |
|   +---------------+         +---------------+   +---------------+             +---------------+   |
+---------------------------------------------------------------------------------------------------+
```

---

## 2. Core Architectural Subsystems

### 2.1 Frontline PWA & Offline Resilience Layer
- **App Shell Caching:** Service Worker v2 (`syndx-pwa-v2`) caches HTML, CSS, JavaScript, icons, and clinical presets, enabling instantaneous loading with network disconnected.
- **Local Draft Persistence:** In-progress case intakes are persisted to `localStorage` under `syndx_case_draft_v1`. Refreshing the browser or device restart recovers exact draft state.
- **Idempotent Sync Queue:** Offline submissions enter the local queue (`draft` → `queued` → `syncing` → `synced` / `failed`). Each mutation carries an immutable `client_mutation_id` ensuring exactly-once server processing upon reconnection.

### 2.2 Deterministic Emergency Safety Interlock
- **Mechanism:** Deterministic, non-probabilistic vital sign evaluator.
- **Execution Location:** Runs both client-side in the browser (100% offline) and on the Express server (`/api/emergency/evaluate`).
- **Safety Interlock:** If critical physiological thresholds are breached ($\text{SpO}_2 < 90\%$, $\text{HR} > 140$ or $< 45$, $\text{BP} \ge 180/120$ or $< 80$, $\text{Temp} \ge 39.5^\circ\text{C}$ or $\le 35.0^\circ\text{C}$), the system enforces an immediate **Tier A Emergency Escalation**.
- **Priority Invariant:** Emergency rules execute **before** ML inference and **cannot be overridden** by any machine learning prediction or language model commentary.

### 2.3 Research Clinical ML Ensemble (Server Microservice)
- **Cohort & Target:** Research model trained on $n=185$ clinical Wilson disease cases (differentiating neurological vs hepatic phenotypes per Leipzig criteria).
- **Ensemble Architecture:** Consensus average of XGBoost Classifier, LightGBM Booster, and Random Forest Classifier.
- **Hosting Boundary:** Runs server-side via Python FastAPI (`pipeline/clinical_service.py` on `:8000`). It is **not** packaged on-device.
- **Offline Fallback:** If the ML microservice is unreachable, the Express API gracefully falls back to deterministic emergency evaluation and preloaded clinical presets without crashing.
- **Explainability:** SHAP feature importance proxies compute relative deviations across biomarkers (ceruloplasmin, 24-hour urine copper) and hallmark signs (K-F rings, brainstem lesions).

### 2.4 Data Ingestion & Provenance Architecture
- **Reference Ontologies:** Ingests official Orphadata (4,357 rare disease entities) and Human Phenotype Ontology (HPO: 20,413 terms).
- **Scope Clarification:** Ingested ontologies serve as structured reference knowledge graphs and cross-mapping dictionaries. They do **not** constitute a trained 4,000-disease classifier.
- **Provenance:** Cryptographic SHA-256 manifests (`data/provenance/dataset_manifest.json`) audit upstream source URLs, timestamps, row counts, and file hashes.

### 2.5 Relational Storage & Parameterized SQL
- **Database:** SQLite (`data/syndx_production.db`) utilizing Write-Ahead Logging (WAL) and foreign key constraints.
- **Security:** 100% of database queries use parameterized SQL bindings (`?`), eliminating SQL injection vulnerabilities.
- **Tables:** `cases`, `users`, `audit_trail`, `facilities`, `case_mutations`.

### 2.6 Local Cryptographic Audit Ledger
- **Architecture:** Internal SQLite table (`audit_trail`) operating as a SHA-256 hash-chained block ledger.
- **Integrity:** Each audit record links to the previous block's SHA-256 hash. The endpoint `/api/blockchain/verify` recalculates and verifies chain integrity.
- **Privacy Boundary:** To protect patient privacy, **zero Protected Health Information (PHI)** or raw symptoms are stored in audit blocks. Only normalized clinical input hashes (`case_hash`) and diagnostic decision hashes (`diagnosis_hash`) are recorded.
- **Reality Clarification:** This is an internal cryptographic ledger; no external smart contracts are deployed to public or testnet blockchains.

### 2.7 Federated Learning Research Simulation
- **Architecture:** Standalone Python research script (`pipeline/federated_simulation.py`) executing a 3-clinic FedAvg simulation with differential privacy ($\varepsilon=1.5, \delta=10^{-5}$).
- **Reality Clarification:** Implemented as an offline evaluation simulation to study gradient exchange dynamics; **not** a live multi-clinic distributed production network.

---

## 3. Future Multimodal Interfaces & Safety Firewall

Detailed specifications in `docs/FUTURE_MULTIMODAL_INTERFACES.md`:

```
+----------------------------------------------------------------------------------------------------+
|                                    ACTIVE CLINICAL PREDICTION PATH                                  |
|   Bedside Manual Entry   ──►  Deterministic Emergency Evaluator  ──►  Tabular Ensemble (n=185)     |
+----------------------------------------------------------------------------------------------------+
                                                ▲
                                                │  [ ARCHITECTURAL FIREWALL ]
                                                │  (assertNotInActivePredictionPath)
+----------------------------------------------------------------------------------------------------+
|                          FUTURE MULTIMODAL CAPABILITIES (PLANNED / UNBUILT)                        |
|                                                                                                    |
|   [ Kayser-Fleischer (K-F) Optical Grading ]         [ Local Voice/Text Structuring ]              |
|   - Status: PLANNED (Unbuilt)                        - Status: PLANNED (Unbuilt)                   |
|   - Auxiliary optical observation only               - Language model scope: Field extraction ONLY |
|   - Requires ophthalmologist confirmation            - Enforces: status = 'draft'                  |
|   - Decoupled from active prediction path            - Prohibits: diagnosis, tier, confidence      |
+----------------------------------------------------------------------------------------------------+
```

### Mandatory Language Model Safety Guardrails:
1. **Schema-Validated Draft Only:** A language model output can only populate a case draft with `status = 'draft'` and `sync_state.state = 'draft'`.
2. **Prohibition on Diagnosing:** Language models cannot set or suggest `primary_condition` or diagnostic conclusions.
3. **Prohibition on Risk Tier Assignment:** Language models cannot set `tier` or risk scores.
4. **Prohibition on Confidence Scoring:** Language models cannot output or calibrate confidence scores.
5. **Deterministic Emergency Rule Override Prohibition:** Extracted vitals are independently evaluated by `emergencyService.evaluateVitals()`. Critical vitals immediately trigger Tier A Emergency escalation regardless of any language model claims.
6. **Mandatory Human Clinician Confirmation:** Every extracted draft field requires explicit clinician verification on the Entry Check screen before submission.
