# synDx Wilson Phenotype ML Pipeline Specification & Evaluation

**Pipeline Identifier:** `synDx-wilson-pipeline-v1.0.0`  
**Model Family Version:** `synDx-edge-nb-v1.0`  
**Evaluation Date:** October 2026  
**Document Status:** Complete & Audited  
**Cohort Scope:** Single-center Wilson disease cohort ($N = 185$)  
**Clinical Role:** Decision-support research prototype (phenotypic subtyping); **NOT** a diagnostic device.

---

> [!IMPORTANT]
> ### Critical Clinical Disclaimer & Regulatory Boundary
> 1. **Not a Disease vs. Healthy Classifier**: Every patient in this cohort ($N=185$) has clinically and biochemically confirmed Wilson disease. The classification target (`label`) distinguishes a **neurological-symptom phenotype** from a **predominantly hepatic / neuro-asymptomatic phenotype** *within* the Wilson disease population. It does **not** differentiate Wilson disease from healthy controls or other liver/neurological conditions.
> 2. **Preliminary Research Prototype**: Due to the small sample size ($N=185$, with only $n=22$ Class 0 cases overall and $n=5$ in the validation set), all reported metrics are **strictly preliminary** with wide confidence intervals.
> 3. **No Synthetic Augmentation**: Zero patient records were synthesized, oversampled (SMOTE/ADASYN), or duplicated to inflate the cohort. The dataset represents 185 unique, authentic patient records.
> 4. **No Claim of Clinical Validation**: This prototype has not undergone prospective clinical trials or regulatory review. It must not be used as an autonomous diagnostic device.

---

## 1. Dataset Provenance & Cohort Composition

### 1.1 Source & Lineage
- **Primary Data Source:** De-identified clinical study dataset (`Data_Sheet_1.CSV` / `clinical_data.xlsx`), mirrored in `data/clinical/raw/`.
- **Ancillary Study Context:** Supplement files (`MDC3-12-185-s001.docx`, `MDC3-12-185-s003.docx`, `supp_awt035_brain-2012-01768-File010.xlsx`) documenting a single-center retrospective study of confirmed hepatolenticular degeneration (Wilson disease) cases.
- **Inclusion Criteria:**
  - Clinically and biochemically confirmed Wilson disease per Leipzig criteria (elevated 24-hour urinary copper, low serum ceruloplasmin, Kayser-Fleischer rings, and/or ATP7B mutation analysis).
  - Complete cranial MRI / neuroimaging evaluations.
  - Complete abdominal ultrasound morphometry.
  - Complete routine hematological, coagulation, liver function, and renal biochemical profiles.
- **Exclusion of Synthetic Records:**
  - Audited row count: **Exactly 185 unique patient records**.
  - Duplicate rows: **0**.
  - Missing entries: **0** across all $185 \times 43$ cells.

### 1.2 Cohort Demographics
- **Total Patients ($N$):** 185
- **Gender:** 114 Male (61.6%), 71 Female (38.4%) (encoded as $1.0$ for Male, $-1.0$ for Female).
- **Age:** Range 7 to 56 years (Median: 22.0, Mean: 23.4 $\pm$ 8.9 years).
- **Kayser-Fleischer (K-F) Rings:** Present in 157 patients (84.9%), Absent in 28 patients (15.1%).

---

## 2. Target Label Definition

- **Target Variable:** `label` (Column 43).
- **Target Type:** Binary integer $\{0, 1\}$.
- **Clinical Meaning:**
  - `label = 1` (**Neurological Manifestation Phenotype**, $n = 163$, $88.11\%$):
    Patients exhibiting clinical neurological signs (e.g., tremor, dystonia, parkinsonism, dysarthria, ataxia, dysphagia) corroborated by cranial neuroimaging abnormalities.
  - `label = 0` (**Absence of Neurological Phenotype / Hepatic Predominance**, $n = 22$, $11.89\%$):
    Patients presenting primarily with hepatic symptoms (hepatomegaly, cirrhosis, ascites, acute liver injury) without overt neurological involvement.
- **Class Imbalance Ratio:**
  $$r_{\text{imbalance}} = \frac{N_{\text{neg}}}{N_{\text{pos}}} = \frac{22}{163} \approx 0.1350 \quad (1 : 7.41)$$
  *Crucial note on evaluation:* Due to this imbalance, a naive majority-class classifier achieves an apparent accuracy of $88.1\%$ while providing zero clinical value for identifying the minority phenotype. Therefore, **Balanced Accuracy**, **PR-AUC**, and **Specificity** are prioritized over raw accuracy.

---

## 3. Feature Schema (42 Clinical Predictors)

The feature space comprises 42 continuous, ordinal, and binary clinical indicators across 5 medical domains:

| # | Feature Name | Domain | Type | Range / Values | Physiological / Clinical Significance |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `Cirrhosis(es/No)` | Ultrasound | Binary | 0 or 1 | Ultrasonographic evidence of macronodular or micronodular liver cirrhosis. |
| 2 | `Ascites(es/No)` | Ultrasound | Binary | 0 or 1 | Presence of peritoneal free fluid detected via abdominal sonography. |
| 3 | `lenticular nucleus damage  (es/No)` | Neuroimaging | Binary | 0 or 1 | MRI T2/FLAIR hyperintensity in putamen or globus pallidus. |
| 4 | `Thalamus damage (es/No)` | Neuroimaging | Binary | 0 or 1 | Thalamic T2 signal hyperintensity or atrophy. |
| 5 | `Brainstem damage(es/No)` | Neuroimaging | Binary | 0 or 1 | Midbrain ("giant panda face"), pons, or medulla involvement on cranial MRI. |
| 6 | `Cerebral ventricular system dilation(es/No)` | Neuroimaging | Binary | 0 or 1 | Ventricular enlargement secondary to subcortical cerebral atrophy. |
| 7 | `Deepening of the sulci and fissures of the brain(es/No)` | Neuroimaging | Binary | 0 or 1 | Cortical sulcal widening reflecting cerebral parenchymal volume loss. |
| 8 | `Cerebral peduncle damage(es/No)` | Neuroimaging | Binary | 0 or 1 | T2 hyperintensity in cerebral peduncles (substantia nigra tracts). |
| 9 | `Cerebral cortex damage(es/No)` | Neuroimaging | Binary | 0 or 1 | Focal or diffuse cerebral cortical lesions. |
| 10 | `Qther brain regions damage(es/No)` | Neuroimaging | Binary | 0 or 1 | Cerebellar dentate nucleus, corpus callosum, or white matter lesions. |
| 11 | `Liver capsule smoothing(es/No)` | Ultrasound | Binary | 0 or 1 | Preservation or blunting of hepatic capsular contours. |
| 12 | `Enhanced internal echo in the liver(es/No)` | Ultrasound | Binary | 0 or 1 | Diffuse hyperechoic hepatic parenchymal texture. |
| 13 | `Homogeneous echogenicity in the liver(es/No)` | Ultrasound | Binary | 0 or 1 | Uniform parenchymal acoustic impedance without coarse nodules. |
| 14 | `Clear internal blood vessels in the liver(es/No)` | Ultrasound | Binary | 0 or 1 | Preservation of hepatic and portal vein architectural visibility. |
| 15 | `WBC` | Hematology | Float | 1.4 – 15.6 $\times 10^9$/L | White blood cell count (infection or hypersplenism indicator). |
| 16 | `RBC` | Hematology | Float | 2.1 – 6.2 $\times 10^{12}$/L | Red blood cell count (anemia / hemolysis assessment). |
| 17 | `Hb` | Hematology | Float | 46.1 – 174.0 g/L | Hemoglobin concentration. |
| 18 | `PLT` | Hematology | Float | 25.0 – 430.0 $\times 10^9$/L | Platelet count (thrombocytopenia reflects hypersplenism/portal HTN). |
| 19 | `PT` | Coagulation | Float | 9.8 – 24.5 s | Prothrombin time (synthetic liver function indicator). |
| 20 | `INR` | Coagulation | Float | 0.82 – 2.45 | International normalized ratio. |
| 21 | `APTT` | Coagulation | Float | 22.0 – 58.0 s | Activated partial thromboplastin time. |
| 22 | `FBG` | Coagulation | Float | 1.1 – 4.8 g/L | Fibrinogen concentration. |
| 23 | `TT` | Coagulation | Float | 14.5 – 26.0 s | Thrombin time. |
| 24 | `ALT` | Liver Biochem | Float | 5.0 – 280.0 U/L | Alanine aminotransferase (acute hepatocellular damage). |
| 25 | `AST)` | Liver Biochem | Float | 10.0 – 310.0 U/L | Aspartate aminotransferase. |
| 26 | `TBA` | Liver Biochem | Float | 1.0 – 125.0 $\mu$mol/L | Total bile acids (cholestasis marker). |
| 27 | `TBIL` | Liver Biochem | Float | 5.2 – 148.0 $\mu$mol/L | Total bilirubin. |
| 28 | `DBIL` | Liver Biochem | Float | 1.0 – 82.0 $\mu$mol/L | Direct (conjugated) bilirubin. |
| 29 | `IBIL` | Liver Biochem | Float | 4.0 – 66.0 $\mu$mol/L | Indirect (unconjugated) bilirubin. |
| 30 | `TP` | Liver Biochem | Float | 45.0 – 85.0 g/L | Total serum protein. |
| 31 | `ALB` | Liver Biochem | Float | 22.0 – 52.0 g/L | Serum albumin (hepatic synthetic capacity). |
| 32 | `GGT` | Liver Biochem | Float | 8.0 – 350.0 U/L | Gamma-glutamyl transferase. |
| 33 | `AKP` | Liver Biochem | Float | 35.0 – 480.0 U/L | Alkaline phosphatase. |
| 34 | `BUN` | Renal Biochem | Float | 1.8 – 14.5 mmol/L | Blood urea nitrogen. |
| 35 | `Cr` | Renal Biochem | Float | 32.0 – 145.0 $\mu$mol/L | Serum creatinine (renal clearance assessment). |
| 36 | `24-hour urine copper` | Copper Metabolism | Float | 120.0 – 4500.0 $\mu$g/24h | Pathognomonic hypercupric excretion in Wilson disease. |
| 37 | `CP` | Copper Metabolism | Float | 0.002 – 0.28 g/L | Serum ceruloplasmin (characteristically subnormal in WD). |
| 38 | `Psychiatric symptom score` | Clinical Scale | Float | 0.0 – 10.0 | Semiquantitative neuropsychiatric assessment scale. |
| 39 | `Liver symptom score` | Clinical Scale | Float | 0.0 – 6.0 | Semiquantitative hepatic decompensation score. |
| 40 | `Gender` | Demographic | Ordinal | -1.0 or 1.0 | Encoded biological sex (-1.0 = Female, 1.0 = Male). |
| 41 | `Age` | Demographic | Float | 7.0 – 56.0 years | Patient age at presentation. |
| 42 | `K-F ring(es/No)` | Ophthalmology | Binary | 0 or 1 | Kayser-Fleischer corneal copper deposition on slit-lamp exam. |

---

## 4. Preprocessing Protocol & Data Integrity

The preprocessing script ([`training/clinical/01_preprocessing.py`](file:///c:/Users/NIKIL/Documents/syndx1/training/clinical/01_preprocessing.py)) enforces the following invariants:

1. **Whitespace Trimming:** Strips leading and trailing whitespace from column headers (e.g., `"  Cerebral ventricular..."` $\to$ `"Cerebral ventricular..."`).
2. **Missing Value Audit:** Requires zero NaN/null values. Any missing value aborts execution.
3. **Duplicate Detection:** Requires zero exact duplicate rows across all 43 columns.
4. **Data Typing:** Verifies all 42 predictors are numeric (integers or floating-point numbers). No one-hot expansion is needed because all clinical indicators are already encoded numerically.
5. **No Synthetic Oversampling:** Strictly bans SMOTE, ADASYN, bootstrapping, or Gaussian jittering. Models are trained on the authentic clinical data distribution.

---

## 5. Patient-Level Splitting & Sealed Test Partition

To avoid data leakage and prevent overly optimistic evaluation, the 185-patient cohort is partitioned using a stratified 60 / 20 / 20 split with fixed random seed `42`:

```
Full Cohort (N = 185 unique patients)
├── Training Partition (60%, n = 111)
│   ├── Class 0 (Absence of Neuro Phenotype): n = 13 (11.7%)
│   └── Class 1 (Neuro Manifestation):        n = 98 (88.3%)
├── Validation Partition (20%, n = 37)  [ACTIVE COMPARISON BENCHMARK]
│   ├── Class 0 (Absence of Neuro Phenotype): n =  5 (13.5%)
│   └── Class 1 (Neuro Manifestation):        n = 32 (86.5%)
└── Final Test Partition (20%, n = 37)  [SEALED — NEVER TOUCHED]
    ├── Class 0 (Absence of Neuro Phenotype): n =  4 (10.8%)
    └── Class 1 (Neuro Manifestation):        n = 33 (89.2%)
```

### Partitioning Rules:
- **Zero Patient Overlap:** Every patient record belongs to exactly one partition.
- **Sealed Test Set:** In accordance with strict ML governance, the test set (`data/clinical/splits/X_test.csv`) was isolated during Stage 01 and remains locked (`RUN_FINAL_TEST = False`). It is **never** used during model selection, tuning, or threshold selection.

---

## 6. Model Architectures & Hyperparameters

Three baseline model architectures were configured and saved under `models/clinical/`:

### 6.1 XGBoost (`xgboost-v1.0`)
- **Library:** `xgboost` 3.4.1 (`XGBClassifier`)
- **Hyperparameters:**
  - `n_estimators`: 100
  - `learning_rate`: 0.05
  - `max_depth`: 3 (shallow depth to prevent overfitting on $n=111$)
  - `subsample`: 0.8
  - `colsample_bytree`: 0.8
  - `objective`: `'binary:logistic'`
  - `random_state`: 42
- **Artifact:** `models/clinical/xgboost/xgboost_model.json`

### 6.2 LightGBM (`lightgbm-v1.0`)
- **Library:** `lightgbm` 4.7.0 (`LGBMClassifier` / `Booster`)
- **Hyperparameters:**
  - `n_estimators`: 100
  - `learning_rate`: 0.05
  - `max_depth`: 3
  - `num_leaves`: 7
  - `subsample`: 0.8
  - `subsample_freq`: 1
  - `colsample_bytree`: 0.8
  - `objective`: `'binary'`
  - `random_state`: 42
- **Artifact:** `models/clinical/lightgbm/lightgbm_model.txt`

### 6.3 Random Forest (`random-forest-v1.0`)
- **Library:** `scikit-learn` 1.9.0 (`RandomForestClassifier`)
- **Hyperparameters:**
  - `n_estimators`: 300
  - `max_depth`: 5
  - `min_samples_split`: 4
  - `min_samples_leaf`: 2
  - `max_features`: `'sqrt'`
  - `random_state`: 42
- **Artifact:** `models/clinical/random_forest/random_forest_model.joblib`

### 6.4 Tri-Model Ensemble (`ensemble-v1.0`)
- **Method:** Unweighted arithmetic mean of predicted probabilities:
  $$\hat{P}_{\text{ensemble}}(y = 1 \mid \mathbf{x}) = \frac{1}{3}\left[\hat{P}_{\text{XGB}}(\mathbf{x}) + \hat{P}_{\text{LGB}}(\mathbf{x}) + \hat{P}_{\text{RF}}(\mathbf{x})\right]$$

---

## 7. Comprehensive Evaluation Metrics

All models were evaluated on the isolated validation set ($n = 37$) using an uncalibrated classification threshold of $\tau = 0.50$:

| Evaluation Metric | XGBoost | LightGBM | Random Forest | Tri-Model Ensemble | Clinical Interpretation |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **ROC-AUC** | **0.7875** | 0.7500 | 0.7000 | **0.7812** | Ranking discrimination across all operating thresholds. |
| **PR-AUC** | **0.9621** | 0.9501 | 0.9364 | **0.9587** | Precision-recall tradeoff under heavy class imbalance. |
| **Accuracy** | 0.9189 | 0.9189 | 0.8649 | **0.9189** | Overall proportion of correct classifications (34/37). |
| **Balanced Accuracy** | **0.7000** | **0.7000** | 0.5000 | **0.7000** | Macro-average of Sensitivity and Specificity ($\frac{1.0 + 0.4}{2}$). |
| **Sensitivity (Recall)**| 1.0000 | 1.0000 | 1.0000 | 1.0000 | Correct detection of neurological phenotype ($32/32$). |
| **Specificity** | **0.4000** | **0.4000** | 0.0000 | **0.4000** | Correct detection of absence of neuro phenotype ($2/5$). |
| **Precision (PPV)** | 0.9143 | 0.9143 | 0.8649 | 0.9143 | Reliability of positive phenotype classification ($32/35$). |
| **F1-Score** | **0.9552** | **0.9552** | 0.9275 | **0.9552** | Harmonic mean of precision and recall. |
| **Log Loss** | **0.3140** | 0.3410 | 0.3587 | **0.3168** | Cross-entropy penalty on probability calibration. |
| **Brier Score** | **0.0873** | 0.0909 | 0.1057 | **0.0881** | Mean squared probability error. |

### Validation Confusion Matrix ($\tau = 0.50$):
```
XGBoost & LightGBM:
                 Actual Neg (0)   Actual Pos (1)
Predicted Neg (0)      2 (TN)            0 (FN)
Predicted Pos (1)      3 (FP)           32 (TP)

Random Forest:
                 Actual Neg (0)   Actual Pos (1)
Predicted Neg (0)      0 (TN)            0 (FN)
Predicted Pos (1)      5 (FP)           32 (TP)
```

---

## 8. Reproducible Evaluation Commands

To reproduce the exact evaluation metrics and audit report from the terminal:

### Option A: Python CLI
```bash
python pipeline/evaluate_wilson.py --verbose
```

### Option B: npm CLI
```bash
npm run eval:wilson
```

### Option C: Complete Test Suite
```bash
npm test
```

---

## 9. Input Validation & Edge-Case Rules

The inference engine strictly validates incoming clinical payloads before running prediction:

1. **Feature Completeness:** Incoming payload must supply the 42 clinical features or fall back gracefully to the published cohort mean baselines (`feature_means`).
2. **Type Enforcement:** Features must be valid floating-point numbers or integers. Corrupt string entries (e.g., `"NaN"`, `"undefined"`) trigger HTTP 422 / validation errors.
3. **Physiological Range Boundaries:**
   - Age: $0.0 \le \text{age} \le 120.0$ years.
   - SpO2: $50 \le \text{SpO2} \le 100\%$.
   - Blood Pressure: Systolic must be strictly greater than Diastolic.
   - Ceruloplasmin: $0.0 \le \text{CP} \le 1.0$ g/L.
   - 24h Urine Copper: $\ge 0.0 \; \mu\text{g}/24\text{h}$.
4. **Output Integrity:**
   - Probabilities strictly in $[0.0, 1.0]$.
   - Deterministic risk tier:
     - $P \ge 0.75 \implies$ **Tier A (High Risk / Pronounced Neurological Phenotype)**
     - $0.45 \le P < 0.75 \implies$ **Tier B (Moderate Risk / Mixed Presentation)**
     - $P < 0.45 \implies$ **Tier C (Low Neurological Risk / Hepatic Predominance)**
   - Mandatory inclusion of `medical_disclaimer` in every inference response.
