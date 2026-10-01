# synDx Versioned Case Schema Specification

**Schema Version:** `1.0.0`  
**Standard Identifier:** `synDx-case-v1.0.0`  
**Status:** Active  

---

## 1. Overview & Privacy Principles

The synDx case schema defines the standard representation for clinical decision-support cases evaluated in low-resource settings. To ensure patient privacy and regulatory compliance (HIPAA / Digital Personal Data Protection), the schema enforces a strict **three-tier boundary**:

1. **Local Patient Context (Device-Confined):**
   - Demographics (`age`, `gender`, `phc`, `visit_date`).
   - Stored strictly on the local healthcare worker device or local clinic database.
   - **Never transmitted to shared blockchain audit ledgers or central telemetry logs.**

2. **Clinical Evaluation Payload (Encrypted in Transit / Parameterized at Rest):**
   - Bedside vitals (`spo2`, `hr`, `bp`, `temp`).
   - Biomarkers and labs (`cp`, `urine_copper`, `plt`, `cr`, `liver`, `tt`, `tbil`, `proteinuria`).
   - Hallmark clinical signs (`kf_ring`, `brainstem_damage`, `tremor`, `psych_score`).
   - Triage classification (`tier`, `confidence`, `primary_condition`, `is_emergency`, `emergency_triggers`).

3. **Shared Cryptographic Audit Trail (Zero-PII / Zero Raw Labs):**
   - Contains only pseudorandom `case_id`, `event_type`, cryptographic hashes (`case_hash`, `diagnosis_hash`), `model_version`, transaction hash (`tx_hash`), block number, and timestamp.
   - **Zero patient identifiers and zero raw clinical values are permitted in shared audit records.**

---

## 2. Case Schema Definition (v1.0.0)

```json
{
  "$schema": "https://syndx.org/schemas/case-v1.0.0.json",
  "schema_version": "1.0.0",
  "id": "CASE-8F3A1C",
  "client_mutation_id": "mut_1727771234_8f3a1c",
  "created_at": "2026-10-01T10:30:00.000Z",
  "updated_at": "2026-10-01T10:35:00.000Z",
  "status": "pending",
  
  "patient_context": {
    "patient_id": "PT-9104",
    "age": 29,
    "gender": "Male",
    "phc_facility": "Kaveripattinam PHC — Sector 4",
    "visit_date": "2026-10-01",
    "is_sample": false
  },

  "clinical_vitals": {
    "spo2": 97,
    "hr": 78,
    "bp": "122/80",
    "temp": 36.8
  },

  "biomarkers": {
    "ceruloplasmin_g_l": 0.018,
    "urine_copper_ug_24h": 468.6,
    "platelets_10e9_l": 217,
    "serum_creatinine_umol_l": 67.7,
    "liver_subscores": "16.6 / 17.5",
    "thrombin_time_s": 16.9,
    "total_bilirubin_umol_l": 16.7,
    "proteinuria": "Negative"
  },

  "hallmark_signs": {
    "kf_ring": 1,
    "brainstem_damage": 1,
    "tremor": 1,
    "psychiatric_score": 7.0
  },

  "triage_result": {
    "tier": "A",
    "primary_condition": "Wilson Disease — Neurological Manifestation Phenotype",
    "confidence": 92,
    "is_emergency": false,
    "emergency_triggers": [],
    "needs_review": false,
    "needs_review_reasons": [],
    "model_version": "synDx-edge-nb-v1.0"
  },

  "referral_recommendation": {
    "facility_id": "FAC-01",
    "facility_name": "City General — Emergency & Trauma Centre",
    "distance_km": 1.8,
    "drug_stock": "yes"
  },

  "physician_decision": {
    "status": "confirmed",
    "note": "K-F rings slit-lamp positive; neurological phenotype confirmed.",
    "reviewer_name": "Dr. Ananya Sen, MD, DM",
    "reviewer_reg": "TMC-REG-2026-8812",
    "decided_at": "2026-10-01T10:40:00.000Z"
  },

  "audit_proof": {
    "case_hash": "8f3a1c9e4b7e02aa",
    "diagnosis_hash": "4b7e02aa91f6c503",
    "model_version": "synDx-edge-nb-v1.0"
  },

  "sync_state": {
    "state": "synced",
    "attempts": 1,
    "last_synced_at": "2026-10-01T10:35:10.000Z",
    "last_error": null
  }
}
```

---

## 3. Field Specifications & Constraints

| Field | Type | Required | Description & Validation Rules |
| :--- | :--- | :--- | :--- |
| `schema_version` | String | **Yes** | Must match `"1.0.0"` |
| `id` | String | **Yes** | Case ID format: `CASE-[A-Z0-9]{6}` |
| `client_mutation_id` | String | **Yes** | Unique client UUID/mutation key for idempotency: `mut_[timestamp]_[hex]` |
| `status` | String | **Yes** | One of `['pending', 'confirmed', 'more-tests', 'overridden']` |
| `clinical_vitals.spo2` | Number | **Yes** | Range: `50` to `100` (%) |
| `clinical_vitals.hr` | Number | **Yes** | Range: `30` to `240` (bpm) |
| `clinical_vitals.bp` | String | **Yes** | Format: `[sys]/[dia]` mmHg |
| `clinical_vitals.temp`| Number | **Yes** | Range: `30.0` to `45.0` (°C) |
| `triage_result.tier` | String | **Yes** | One of `['A', 'B', 'C']` |
| `triage_result.confidence`| Number | **Yes** | Range: `0` to `100` (%) |
| `sync_state.state` | String | **Yes** | One of `['draft', 'queued', 'syncing', 'synced', 'failed']` |

---

## 4. Sync State Machine

```
   [User Editing]
         │
         ▼
     (Draft) ─────────────── Auto-saved to localStorage (syndx_case_draft)
         │
         ▼ (Submit Case / Review)
     (Queued) ────────────── Enqueued with unique client_mutation_id
         │
         ▼ (Network Available / Manual Sync Triggered)
    (Syncing)
      ├── [HTTP 200/201] ───► (Synced) ─── Processed idempotently
      └── [Network/4xx/5xx] ─► (Failed) ── Cached with last_error, retried with backoff
```

---

## 5. Audit Trail Privacy Guarantees

Shared audit records stored in SQLite and cryptographically chained **MUST ONLY** contain:
- `case_id`: De-identified random token (`CASE-XXXXXX`).
- `event_type`: Clinical event enumeration (`INFERENCE_GENERATED`, `DOCTOR_CONFIRMED`, `OFFLINE_SYNC_INTAKE`).
- `case_hash`: SHA-256 HMAC of normalized clinical features (one-way digest).
- `diagnosis_hash`: SHA-256 HMAC of condition + confidence (one-way digest).
- `model_version`: Active model identifier (`synDx-edge-nb-v1.0`).
- `tx_hash`: Cryptographic proof transaction hash.
- `block_number`: Monotonic block sequence integer.
- `status`: Verification state (`CONFIRMED`, `VERIFIED_IMMUTABLE`).

**Prohibited in Audit Records:**
- ❌ Patient names, addresses, or phone numbers.
- ❌ Direct raw lab values (serum copper, bilirubin, creatinine).
- ❌ Plaintext physician notes containing identifying details.
