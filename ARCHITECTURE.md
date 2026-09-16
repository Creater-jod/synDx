# SynDx — Master System Architecture Document

## Overview

SynDx is an offline-first, edge-AI clinical decision support and referral intelligence system designed to empower health workers, triage rare diseases, and maintain strict data privacy, safety, and auditability.

---

## High-Level System Architecture

```
                                 +-------------------------------------------------+
                                 |                  USER INTERFACE                 |
                                 |      Health Worker / Doctor / Admin Consoles     |
                                 +------------------------+------------------------+
                                                          |
                                      +-------------------+-------------------+
                                      |                                       |
                              [ ONLINE MODE ]                         [ OFFLINE MODE ]
                                      |                                       |
                         +------------v------------+             +------------v------------+
                         |    Backend FastAPI      |             |    Local Edge Runtime   |
                         |   REST & Sync Server    |             |   (Offline First App)   |
                         +------------+------------+             +------------+------------+
                                      |                                       |
               +----------------------+----------------------+                |
               |                      |                      |                |
     +---------v---------+  +---------v---------+  +---------v---------+      |
     | PostgreSQL / SQL  |  | Blockchain Ledger |  | Federated Server  |      |
     | Central Database  |  |  (Hash Audit Log) |  | (Model Updates)   |      |
     +-------------------+  +-------------------+  +-------------------+      |
                                                                              |
       +----------------------------------------------------------------------+
       |
+------v-----------------------------------------------------------------------------------+
| LOCAL EDGE RUNTIME (Works 100% Without Internet)                                         |
|                                                                                          |
|  +--------------------+   +---------------------+   +-------------------+                |
|  |  Emergency Rules   |   |   Edge ML Engine    |   | Local Knowledge   |                |
|  |  (Vitals Evaluator)|   | (ONNX / XGBoost)    |   |   (RAG / Vector)  |                |
|  +---------+----------+   +----------+----------+   +---------+---------+                |
|            |                         |                        |                          |
|            +-------------------------+------------------------+                          |
|                                      |                                                   |
|                           +----------v----------+                                        |
|                           |   Decision Router   |                                        |
|                           |   (Tier A/B/C/Emg)  |                                        |
|                           +----------+----------+                                        |
|                                      |                                                   |
|                           +----------v----------+   +-------------------+                |
|                           |   Local SQLite DB   |---| Offline Sync Queue|                |
|                           +---------------------+   +-------------------+                |
+------------------------------------------------------------------------------------------+
```

---

## Core Components & Subsystems

### 1. Data Ingestion & Provenance Engine
- **Sources:** Orphadata (Rare Disease ontology), Human Phenotype Ontology (HPO), MONDO, Kaggle datasets, Govt facility registries.
- **Pipeline:** Download -> HTTP Validation -> SHA256 Checksum -> License Verification -> Schema Normalization -> Provenance Log (`dataset_manifest.json`).

### 2. Edge ML & Explainability Pipeline
- **Edge Model:** XGBoost / Gradient Boosting exported to ONNX format for zero-dependency cross-platform execution.
- **Explainability:** SHAP (SHapley Additive exPlanations) computes exact feature attribution scores per prediction.
- **Rules Safety Interlock:** Emergency rules (e.g. SpO2 < 90%, HR > 140 bpm, Systolic BP > 180 mmHg) evaluate prior to ML and cannot be overridden by ML outputs.

### 3. Offline LLM & Local Knowledge System (RAG)
- **Local LLM:** Quantized GGUF / Llama.cpp edge runtime.
- **Local Knowledge RAG:** Offline vector index built from validated clinical guidelines and phenotype definitions.
- **Constraint:** LLM acts solely as a communication assistant; it CANNOT mutate numerical ML risk scores or decision tiers.

### 4. Decision Router & Referral Intelligence
- **Tiers:** Tier A (Low Risk - Monitor), Tier B (Moderate Risk - Referral), Tier C (High Risk - Specialist Review), Emergency (Immediate Escalation).
- **Referral Engine:** Multi-criteria facility matching based on distance, required diagnostic capabilities, medication stock, and specialist availability.

### 5. Hash-Only Permissioned Blockchain Audit Log
- **Mechanism:** Hashes of cases, model predictions, emergency triggers, and doctor overrides are appended to an immutable ledger (Polygon Amoy / Ethereum testnet).
- **Privacy:** NO PII or patient symptoms are posted on-chain—only SHA-256 state hashes.

### 6. Federated Learning Simulation (FedAvg)
- **Architecture:** Flower framework simulation. Multiple clinics update local model weights using private clinical records, transmitting weight differentials to the central aggregator without sharing raw patient data.
