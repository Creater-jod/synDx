# synDx — Project Status & Health Audit

**Last Updated:** October 2026  
**System Status:** Development & Testing Operational (98 Automated Tests Passing)  
**Classification:** Clinical Decision Support Research Prototype (Non-Diagnostic)  

---

## 1. Executive Summary

synDx is an offline-first clinical decision support research prototype engineered for healthcare workers and clinical reviewers in low-resource settings. The system prioritizes patient safety through deterministic vital sign evaluation, transparent SHAP feature attributions, tamper-evident audit trails, and strict decoupling of unbuilt experimental models.

---

## 2. Component Reality Matrix & Audit

| Component | Status | Reality Checklist & Architecture | Notes |
| :--- | :--- | :--- | :--- |
| **Frontline Clinical UI** | ✅ **Operational** | Warm-paper palette (`#F6F3EC`) designed for cheap Android phones in bright sunlight (zero glassmorphism/neon glow). 6-step guided intake. | Verified in `index.html`, `js/app.js`, `css/styles.css` |
| **PWA & Offline App Shell** | ✅ **Operational** | Service Worker v2 (`syndx-pwa-v2`) pre-caches full app shell; Web App Manifest enables standalone installation. | Verified in `sw.js`, `manifest.json`, `tests/offline_and_pwa.test.js` |
| **Authentication & RBAC** | ✅ **Operational** | JWT + bcrypt authorization with role enforcement (Health Worker, Doctor, Admin). Parameterized SQL throughout. | Verified in `src/routes/authRoutes.js`, `tests/backend.test.js` |
| **Backend API** | ✅ **Operational** | Modular Node.js Express server (`:3000`) with separate Python FastAPI microservice (`:8000`). | Verified in `src/app.js`, `server.js`, `pipeline/clinical_service.py` |
| **Relational Database** | ✅ **Operational** | SQLite (`data/syndx_production.db`) with parameterized queries, WAL journaling, and strict schema versioning. | Verified in `src/config/database.js` |
| **Deterministic Emergency Engine**| ✅ **Operational** | Rule-based vital sign evaluator ($\text{SpO}_2$, HR, BP, Temp). Evaluates **before** ML and runs 100% offline. | Verified in `src/services/emergencyService.js`, `tests/backend.test.js` |
| **Offline Draft Persistence** | ✅ **Operational** | LocalStorage draft storage recovers in-progress patient intakes across network disconnects and app reloads. | Verified in `js/app.js`, `tests/sync_and_draft.test.js` |
| **Idempotent Sync Manager** | ✅ **Operational** | Client queue tracks mutations (`draft` → `queued` → `syncing` → `synced` / `failed`) with deduplication. | Verified in `src/services/syncService.js`, `tests/sync_and_draft.test.js` |
| **Doctor Review Console** | ✅ **Operational** | Two-way SQLite synced review console with Confirm / Override actions and clinical notes. | Verified in `index.html`, `src/controllers/caseController.js` |
| **Cryptographic Audit Ledger** | ✅ **Operational** | Local SQLite SHA-256 hash-chained block ledger with integrity verification. Zero PII stored in blocks. | Verified in `src/services/auditService.js`, `tests/backend.test.js` |
| **Wilson ML Phenotype Model** | 🔬 **Prototype** | XGBoost + LightGBM + Random Forest trained on $n=185$ cohort. Server-hosted via FastAPI (`:8000`). | Verified in `pipeline/clinical_service.py`, `tests/wilson_pipeline.test.js` |
| **Explainable AI (SHAP)** | ✅ **Operational** | Dynamic proxy feature ranking displaying relative biomarker and sign deviations. | Verified in `pipeline/clinical_service.py`, `js/app.js` |
| **Ontology Reference Data** | ✅ **Operational** | Orphadata (4,357 records) and HPO (20,413 terms) ingested with SHA-256 provenance manifests. | Reference knowledge graphs only; **no** multi-disease classifier trained. |
| **Federated Learning** | 🧪 **Simulated** | 3-clinic FedAvg simulation script with differential privacy ($\varepsilon=1.5$). Standalone research script. | Executed via `pipeline/federated_simulation.py`; **not** a live network. |
| **K-F Image Grading** | 📋 **Planned (Unbuilt)** | Interface contract specified; strictly decoupled from active prediction path until licensed dataset available. | Documented in `docs/FUTURE_MULTIMODAL_INTERFACES.md` |
| **Voice / Text Structuring (LLM)**| 📋 **Planned (Unbuilt)** | Interface specified with strict safety guardrails: schema-validated draft only, no diagnostic or triage authority. | Documented in `docs/FUTURE_MULTIMODAL_INTERFACES.md` |

---

## 3. Implemented vs. Simulated vs. Planned Inventory

```
+--------------------------------------------------------------------------------------------------+
|                                    FEATURE REALITY INVENTORY                                     |
+------------------------------------+----------------------------------+--------------------------+
|       IMPLEMENTED & TESTED         |            SIMULATED             |     PLANNED (UNBUILT)    |
+------------------------------------+----------------------------------+--------------------------+
| - 6-step guided PWA intake         | - 3-node FedAvg federated        | - On-device edge ONNX    |
| - Service Worker v2 offline cache  |   learning simulation            |   inference packaging    |
| - Deterministic emergency rules    | - Synthetic patient case presets | - Slit-lamp K-F optical  |
| - Versioned Case Schema v1.0.0     |   (Alex Mercer, PT-9041)         |   image grading model    |
| - Offline draft persistence        | - Simulated tele-referral        | - Local voice/audio      |
| - Idempotent sync queue            |   booking drawer                 |   transcription SLM      |
| - Wilson ML ensemble (server)      | - SHAP feature proxy weights     | - Broad rare-disease     |
| - Doctor review & override         |   in offline fallback mode       |   classifier (4,000+)    |
| - Local SQLite SHA-256 audit chain |                                  | - On-chain public smart  |
| - Parameterized SQL backend API    |                                  |   contracts (Amoy/ETH)   |
| - Orphadata / HPO provenance ETL   |                                  | - Native Android APK     |
+------------------------------------+----------------------------------+--------------------------+
```

---

## 4. Unsupported Claims Removed

1. **"Diagnostic Device / Diagnostic AI":** Removed. synDx is documented strictly as a clinical decision-support research prototype.
2. **"Trained Model on 4,357 Diseases":** Removed. The machine learning pipeline is trained strictly on a single-center cohort of 185 Wilson disease cases. Orphadata and HPO are reference knowledge graphs.
3. **"Runs 100% On-Device Edge ML":** Removed. The ML ensemble runs server-side on the FastAPI microservice (`:8000`). Only the deterministic emergency vitals evaluator and PWA shell run on-device.
4. **"Polygon Amoy / Ethereum Blockchain":** Removed. The audit ledger is an internal SQLite table with SHA-256 block hash-chaining; no smart contracts are deployed to public or testnet blockchains.
5. **"Live Multi-Clinic Federated Network":** Removed. Federated learning is implemented as a local simulation script (`pipeline/federated_simulation.py`).
6. **"Automated Kayser-Fleischer Eye Scanning / Voice AI":** Removed from active capabilities. Marked explicitly as Planned / Unbuilt with strict safety guardrails.

---

## 5. Remaining Gaps & Action Items

1. **Clinical Validation Cohort:** Expand beyond the single-center $n=185$ Wilson disease cohort with multi-center prospectively validated patient records.
2. **On-Device Quantization:** Package the tabular ensemble into an ONNX runtime artifact to enable true zero-network client-side machine learning inference.
3. **Multimodal Data Acquisition:** Acquire ethically approved, multi-center anterior-segment slit-lamp photograph datasets with ophthalmologist ground truth annotations before activating K-F grading.
4. **Native Mobile Packaging:** Complete native packaging and testing on target low-end Android hardware.
