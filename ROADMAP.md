# SynDx — Master Engineering Roadmap (Milestones 0 to 28)

```
[M0] Architecture & Setup ──► [M1] Design System ──► [M2] Homepage ──► [M3] Authentication
                                                                               │
[M7] Assessment Workflow ◄── [M6] Offline Storage ◄── [M5] Real DB ◄── [M4] Dashboards
       │
       ▼
[M8] Emergency Engine ──► [M9-M10] Real Data & Edge ML ──► [M11-M12] SHAP & Router
                                                                    │
[M16-M18] Offline LLM/RAG ◄── [M14-M15] Doctor Review & Sync ◄──────┘
       │
       ▼
[M19] Blockchain Audit ──► [M20] Federated Learning ──► [M21-M22] Registry & Auto
                                                                    │
[M28] Production Deploy ◄── [M25-M27] Docker & CI/CD ◄── [M23-M24] Testing & Security
```

---

## Detailed Milestone Tracker

| Milestone | Phase Name | Status | Key Deliverables |
| :--- | :--- | :--- | :--- |
| **M0** | Requirements & Architecture | ✅ Completed | System spec audit, `PROJECT_STATUS.md`, `ARCHITECTURE.md`, `ROADMAP.md`. |
| **M1** | Data Pipeline & Dataset Registry | 🔄 In Progress | Real dataset connectors (Orphadata, HPO), SHA256 provenance manifests, canonical model. |
| **M2** | Homepage & Visual Direction | ⏳ Pending Choice | 3 UI Concepts presentation, responsive homepage with offline-first showcase. |
| **M3** | Real Authentication & RBAC | ⏳ Scheduled | FastAPI JWT auth, role detection (Health Worker, Doctor, Clinic Admin, System Admin). |
| **M4** | Role-Based Dashboards | ⏳ Scheduled | Tailored workspace dashboards for Health Worker, Doctor, Admin. |
| **M5** | Real Database Layer | ⏳ Scheduled | SQLAlchemy models, SQLite (Dev) & PostgreSQL migrations. |
| **M6** | Offline Storage Abstraction | ⏳ Scheduled | IndexedDB / SQLite client-side persistence layer for offline operation. |
| **M7** | Multi-Step Assessment Workflow | ⏳ Scheduled | 12-step guided clinical intake form with vitals, symptoms, autosave, offline resilience. |
| **M8** | Emergency Rules Engine | ⏳ Scheduled | Deterministic vital sign safety evaluator (SpO2, HR, BP, Temp thresholds). |
| **M9** | Edge ML Training Pipeline | ⏳ Scheduled | Train XGBoost model on canonical rare disease dataset, evaluate ROC-AUC/F1/Recall. |
| **M10** | Local ML Inference | ⏳ Scheduled | Export model to ONNX runtime for sub-second offline predictions. |
| **M11** | Explainable AI Engine | ⏳ Scheduled | SHAP feature importances integrated into diagnostic results UI. |
| **M12** | Decision Router | ⏳ Scheduled | Reproducible risk tier assignment (Tier A/B/C/Emergency). |
| **M13** | Referral Intelligence Engine | ⏳ Scheduled | Facility distance & capability matching algorithm. |
| **M14** | Doctor Review Console | ⏳ Scheduled | Clinical verification interface with approval, rejection, and override workflows. |
| **M15** | Offline Synchronization Engine | ⏳ Scheduled | Idempotent queue with automatic reconnect and conflict resolution. |
| **M16** | Offline LLM Runtime | ⏳ Scheduled | Edge GGUF/llama.cpp runtime integration for natural language summaries. |
| **M17** | Local Knowledge & RAG Index | ⏳ Scheduled | Offline vector store index built from official medical guidelines. |
| **M18** | LLM Fine-Tuning Pipeline | ⏳ Scheduled | Version-controlled clinical instruction dataset and model registry. |
| **M19** | Blockchain Audit Ledger | ⏳ Scheduled | Hash-only smart contract verification on Polygon Amoy / local EVM network. |
| **M20** | Federated Learning Pipeline | ⏳ Scheduled | Multi-clinic FedAvg simulation using Flower framework. |
| **M21** | Dataset Automation | ⏳ Scheduled | Continuous source monitoring and dataset version management. |
| **M22** | Model Registry | ⏳ Scheduled | Registry tracking versions, metrics, checksums, and rollback capabilities. |
| **M23** | Automated Testing Suite | ⏳ Scheduled | Pytest unit, integration, and offline E2E test scenarios. |
| **M24** | Security Hardening | ⏳ Scheduled | Secret management, rate limiting, and sensitive data redaction. |
| **M25** | Docker & Containerization | ⏳ Scheduled | Multi-stage Dockerfile and docker-compose orchestration. |
| **M26** | CI/CD Pipeline | ⏳ Scheduled | GitHub Actions workflow for linting, testing, and container build. |
| **M27** | Staging Environment | ⏳ Scheduled | Staging deployment and integration smoke test verification. |
| **M28** | Production Release | ⏳ Scheduled | Final deployment configuration, HTTPS, monitoring, and operational readiness. |
