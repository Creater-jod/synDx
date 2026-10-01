"""
synDx Clinical ML Inference Microservice
==========================================
Standalone FastAPI Microservice for Wilson-disease phenotype classification.
Runs on port 8000. Serves XGBoost, LightGBM, Random Forest, and Ensemble Average.
"""

import os
import sys
import json
import pathlib
import numpy as np
import pandas as pd
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import joblib
import xgboost as xgb
import lightgbm as lgb

# Paths
PROJECT_ROOT = pathlib.Path(__file__).resolve().parent.parent
MODELS_DIR = PROJECT_ROOT / "models" / "clinical"
REPORTS_DIR = PROJECT_ROOT / "reports" / "clinical"
SPLITS_DIR = PROJECT_ROOT / "data" / "clinical" / "splits"

FEATURE_NAMES = [
    "Cirrhosis(es/No)",
    "Ascites(es/No)",
    "lenticular nucleus damage  (es/No)",
    "Thalamus damage (es/No)",
    "Brainstem damage(es/No)",
    "Cerebral ventricular system dilation(es/No)",
    "Deepening of the sulci and fissures of the brain(es/No)",
    "Cerebral peduncle damage(es/No)",
    "Cerebral cortex damage(es/No)",
    "Qther brain regions damage(es/No)",
    "Liver capsule smoothing(es/No)",
    "Enhanced internal echo in the liver(es/No)",
    "Homogeneous echogenicity in the liver(es/No)",
    "Clear internal blood vessels in the liver(es/No)",
    "WBC",
    "RBC",
    "Hb",
    "PLT",
    "PT",
    "INR",
    "APTT",
    "FBG",
    "TT",
    "ALT",
    "AST)",
    "TBA",
    "TBIL",
    "DBIL",
    "IBIL",
    "TP",
    "ALB",
    "GGT",
    "AKP",
    "BUN",
    "Cr",
    "24-hour urine copper",
    "CP",
    "Psychiatric symptom score",
    "Liver symptom score",
    "Gender",
    "Age",
    "K-F ring(es/No)"
]

MEDICAL_DISCLAIMER = (
    "This dataset consists of Wilson-disease patients and the current label represents "
    "neurological-symptom phenotype classification, not Wilson disease versus healthy/control "
    "diagnosis. Therefore, performance from this experiment must not be interpreted as "
    "validated Wilson disease diagnostic performance or as evidence for clinical deployment."
)

# App Setup
app = FastAPI(
    title="synDx Clinical ML Microservice",
    description="Real-time inference API for Wilson Disease Phenotypic Subtyping",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Model Registry
models: Dict[str, Any] = {}
feature_means: Dict[str, float] = {}
feature_importances: Dict[str, float] = {}

def load_models():
    global models, feature_means, feature_importances
    print("[*] Initializing synDx Clinical Models...")

    # 1. XGBoost
    xgb_path = MODELS_DIR / "xgboost" / "xgboost_model.json"
    if xgb_path.exists():
        xgb_model = xgb.XGBClassifier()
        xgb_model.load_model(str(xgb_path))
        models["xgboost"] = xgb_model
        print("  [+] XGBoost Model loaded.")
    else:
        print(f"  [!] XGBoost Model not found at {xgb_path}")

    # 2. LightGBM
    lgb_path = MODELS_DIR / "lightgbm" / "lightgbm_model.txt"
    if lgb_path.exists():
        lgb_model = lgb.Booster(model_file=str(lgb_path))
        models["lightgbm"] = lgb_model
        print("  [+] LightGBM Booster loaded.")
    else:
        print(f"  [!] LightGBM Model not found at {lgb_path}")

    # 3. Random Forest
    rf_path = MODELS_DIR / "random_forest" / "random_forest_model.joblib"
    if rf_path.exists():
        rf_model = joblib.load(str(rf_path))
        models["random_forest"] = rf_model
        print("  [+] Random Forest Model loaded.")
    else:
        print(f"  [!] Random Forest Model not found at {rf_path}")

    # 4. Feature Means & Importances for baseline comparison
    train_x_path = SPLITS_DIR / "X_train.csv"
    if train_x_path.exists():
        df_train = pd.read_csv(train_x_path)
        feature_means = df_train.mean().to_dict()
    else:
        feature_means = {feat: 0.0 for feat in FEATURE_NAMES}

    # Aggregate feature importance from XGBoost report if available
    xgb_fi_path = REPORTS_DIR / "xgboost" / "feature_importance.csv"
    if xgb_fi_path.exists():
        fi_df = pd.read_csv(xgb_fi_path)
        feature_importances = dict(zip(fi_df["feature"], fi_df["importance"]))
    else:
        feature_importances = {feat: 1.0 / len(FEATURE_NAMES) for feat in FEATURE_NAMES}

@app.on_event("startup")
def startup_event():
    load_models()

# Request Models
class ClinicalFeatures(BaseModel):
    features: Dict[str, float] = Field(
        ...,
        description="Dictionary mapping feature names to numerical values"
    )

class PredictionResponse(BaseModel):
    ensemble_probability: float
    xgboost_probability: float
    lightgbm_probability: float
    random_forest_probability: float
    predicted_class: int
    predicted_phenotype: str
    risk_tier: str
    model_consensus: str
    top_contributing_features: List[Dict[str, Any]]
    medical_disclaimer: str

# Endpoints
@app.get("/")
def root():
    return {
        "service": "synDx Clinical ML Microservice",
        "status": "online",
        "models_loaded": list(models.keys()),
        "endpoints": [
            "/api/health",
            "/api/clinical/presets",
            "/api/models/clinical",
            "/api/predict/clinical"
        ]
    }

@app.get("/api/health")
def health():
    return {
        "status": "healthy",
        "models_active": len(models),
        "available_models": list(models.keys()),
        "expected_features_count": len(FEATURE_NAMES)
    }

@app.get("/api/clinical/presets")
def get_presets():
    """Provides curated clinical sample cases from genuine patient validation splits."""
    return {
        "presets": [
            {
                "id": "case_neuro_manifestation",
                "title": "Severe Neurological Presentation (Phenotype 1)",
                "description": "Patient presenting with prominent basal ganglia and brainstem damage, elevated psychiatric score (7.0), and normal liver morphology.",
                "features": {
                    "Cirrhosis(es/No)": 0.0, "Ascites(es/No)": 0.0, "lenticular nucleus damage  (es/No)": 1.0,
                    "Thalamus damage (es/No)": 1.0, "Brainstem damage(es/No)": 1.0, "Cerebral ventricular system dilation(es/No)": 1.0,
                    "Deepening of the sulci and fissures of the brain(es/No)": 1.0, "Cerebral peduncle damage(es/No)": 1.0,
                    "Cerebral cortex damage(es/No)": 0.0, "Qther brain regions damage(es/No)": 1.0, "Liver capsule smoothing(es/No)": 1.0,
                    "Enhanced internal echo in the liver(es/No)": 1.0, "Homogeneous echogenicity in the liver(es/No)": 0.0,
                    "Clear internal blood vessels in the liver(es/No)": 0.0, "WBC": 7.2, "RBC": 4.85, "Hb": 136.0, "PLT": 217.0,
                    "PT": 10.4, "INR": 0.88, "APTT": 26.6, "FBG": 2.7, "TT": 16.9, "ALT": 16.6, "AST)": 17.5, "TBA": 4.4,
                    "TBIL": 16.7, "DBIL": 3.5, "IBIL": 13.2, "TP": 70.3, "ALB": 41.9, "GGT": 20.0, "AKP": 80.0, "BUN": 4.91,
                    "Cr": 67.7, "24-hour urine copper": 468.63, "CP": 0.018, "Psychiatric symptom score": 7.0, "Liver symptom score": 1.0,
                    "Gender": -1.0, "Age": 29.0, "K-F ring(es/No)": 1.0
                }
            },
            {
                "id": "case_hepatic_asymptomatic",
                "title": "Hepatic / Neuro-Asymptomatic (Phenotype 0)",
                "description": "Patient with pure hepatic manifestation, intact neuroimaging, low psychiatric score (1.0), and elevated urine copper.",
                "features": {
                    "Cirrhosis(es/No)": 0.0, "Ascites(es/No)": 0.0, "lenticular nucleus damage  (es/No)": 0.0,
                    "Thalamus damage (es/No)": 0.0, "Brainstem damage(es/No)": 0.0, "Cerebral ventricular system dilation(es/No)": 0.0,
                    "Deepening of the sulci and fissures of the brain(es/No)": 0.0, "Cerebral peduncle damage(es/No)": 0.0,
                    "Cerebral cortex damage(es/No)": 0.0, "Qther brain regions damage(es/No)": 0.0, "Liver capsule smoothing(es/No)": 0.0,
                    "Enhanced internal echo in the liver(es/No)": 1.0, "Homogeneous echogenicity in the liver(es/No)": 0.0,
                    "Clear internal blood vessels in the liver(es/No)": 1.0, "WBC": 4.67, "RBC": 4.68, "Hb": 139.0, "PLT": 125.0,
                    "PT": 11.3, "INR": 1.0, "APTT": 36.5, "FBG": 2.42, "TT": 17.0, "ALT": 40.0, "AST)": 28.0, "TBA": 8.5,
                    "TBIL": 18.2, "DBIL": 3.5, "IBIL": 14.7, "TP": 61.9, "ALB": 39.8, "GGT": 29.0, "AKP": 200.0, "BUN": 4.81,
                    "Cr": 79.1, "24-hour urine copper": 1316.74, "CP": 0.043, "Psychiatric symptom score": 1.0, "Liver symptom score": 1.0,
                    "Gender": 1.0, "Age": 19.0, "K-F ring(es/No)": 1.0
                }
            },
            {
                "id": "case_borderline_mixed",
                "title": "Borderline / Mixed Presentation",
                "description": "Patient with early lenticular changes, borderline coagulation (TT 18.5s), and moderate psychiatric score (3.0).",
                "features": {
                    "Cirrhosis(es/No)": 0.0, "Ascites(es/No)": 0.0, "lenticular nucleus damage  (es/No)": 1.0,
                    "Thalamus damage (es/No)": 0.0, "Brainstem damage(es/No)": 0.0, "Cerebral ventricular system dilation(es/No)": 0.0,
                    "Deepening of the sulci and fissures of the brain(es/No)": 0.0, "Cerebral peduncle damage(es/No)": 0.0,
                    "Cerebral cortex damage(es/No)": 0.0, "Qther brain regions damage(es/No)": 0.0, "Liver capsule smoothing(es/No)": 0.0,
                    "Enhanced internal echo in the liver(es/No)": 1.0, "Homogeneous echogenicity in the liver(es/No)": 1.0,
                    "Clear internal blood vessels in the liver(es/No)": 1.0, "WBC": 5.5, "RBC": 4.5, "Hb": 130.0, "PLT": 160.0,
                    "PT": 12.0, "INR": 1.05, "APTT": 32.0, "FBG": 2.6, "TT": 18.5, "ALT": 35.0, "AST)": 30.0, "TBA": 6.0,
                    "TBIL": 17.0, "DBIL": 3.8, "IBIL": 13.2, "TP": 65.0, "ALB": 40.0, "GGT": 25.0, "AKP": 140.0, "BUN": 5.0,
                    "Cr": 72.0, "24-hour urine copper": 650.0, "CP": 0.025, "Psychiatric symptom score": 3.0, "Liver symptom score": 2.0,
                    "Gender": 1.0, "Age": 24.0, "K-F ring(es/No)": 1.0
                }
            }
        ]
    }

@app.get("/api/models/clinical")
def get_clinical_models_metrics():
    """Returns cross-model validation comparisons."""
    csv_path = REPORTS_DIR / "model_comparison.csv"
    if csv_path.exists():
        df = pd.read_csv(csv_path)
        return {
            "comparison": df.to_dict(orient="records"),
            "primary_engine": "Ensemble Average (XGBoost + LightGBM + Random Forest)"
        }
    return {"comparison": []}

@app.post("/api/predict/clinical", response_model=PredictionResponse)
def predict_clinical_phenotype(payload: ClinicalFeatures):
    """
    Executes real-time inference on input parameters across XGBoost, LightGBM, and Random Forest.
    Returns individual model probabilities, ensemble consensus, and top contributing features.
    """
    if not models:
        load_models()
        if not models:
            raise HTTPException(status_code=500, detail="Clinical models not loaded.")

    # Input validation & physiological range checks
    raw_dict = payload.features
    if not isinstance(raw_dict, dict) or len(raw_dict) == 0:
        raise HTTPException(status_code=422, detail="Features payload must be a non-empty dictionary.")

    for k, v in raw_dict.items():
        if v is None or (isinstance(v, float) and (np.isnan(v) or np.isinf(v))):
            raise HTTPException(status_code=422, detail=f"Feature '{k}' contains invalid NaN or Infinite value.")

    if "Age" in raw_dict:
        age_val = float(raw_dict["Age"])
        if age_val < 0.0 or age_val > 120.0:
            raise HTTPException(status_code=422, detail=f"Age out of plausible biological range (0-120): {age_val}")

    if "Gender" in raw_dict:
        gender_val = float(raw_dict["Gender"])
        if gender_val not in (-1.0, 0.0, 1.0):
            raise HTTPException(status_code=422, detail="Gender must be encoded as 1.0 (Male), -1.0 (Female), or 0.0 (Unspecified).")

    if "24-hour urine copper" in raw_dict and float(raw_dict["24-hour urine copper"]) < 0.0:
        raise HTTPException(status_code=422, detail="24-hour urine copper cannot be negative.")

    if "CP" in raw_dict and float(raw_dict["CP"]) < 0.0:
        raise HTTPException(status_code=422, detail="Ceruloplasmin (CP) cannot be negative.")

    if "Psychiatric symptom score" in raw_dict:
        psych_val = float(raw_dict["Psychiatric symptom score"])
        if psych_val < 0.0 or psych_val > 10.0:
            raise HTTPException(status_code=422, detail="Psychiatric symptom score must be between 0.0 and 10.0.")

    if "Liver symptom score" in raw_dict:
        liver_val = float(raw_dict["Liver symptom score"])
        if liver_val < 0.0 or liver_val > 10.0:
            raise HTTPException(status_code=422, detail="Liver symptom score must be between 0.0 and 10.0.")

    for feat in FEATURE_NAMES:
        if "(es/No)" in feat and feat in raw_dict:
            bin_val = float(raw_dict[feat])
            if bin_val not in (0.0, 1.0):
                raise HTTPException(status_code=422, detail=f"Binary indicator '{feat}' must be 0 or 1, got {bin_val}")

    # Construct complete 42-feature row with defaults
    row_data = {}
    for feat in FEATURE_NAMES:
        if feat in raw_dict:
            row_data[feat] = float(raw_dict[feat])
        else:
            # Default to mean baseline
            row_data[feat] = float(feature_means.get(feat, 0.0))

    df_sample = pd.DataFrame([row_data], columns=FEATURE_NAMES)

    # 1. XGBoost Inference
    p_xgb = 0.5
    if "xgboost" in models:
        probs = models["xgboost"].predict_proba(df_sample)[0]
        p_xgb = float(probs[1])

    # 2. LightGBM Inference
    p_lgb = 0.5
    if "lightgbm" in models:
        # LightGBM booster returns raw prob for binary
        raw_pred = models["lightgbm"].predict(df_sample)
        p_lgb = float(raw_pred[0])

    # 3. Random Forest Inference
    p_rf = 0.5
    if "random_forest" in models:
        probs = models["random_forest"].predict_proba(df_sample)[0]
        p_rf = float(probs[1])

    # 4. Ensemble Average
    available_probs = [p for p in [p_xgb, p_lgb, p_rf] if p is not None]
    ensemble_prob = float(np.mean(available_probs))

    # Binary Classification (0.50 cutoff)
    pred_class = 1 if ensemble_prob >= 0.50 else 0
    pred_phenotype = (
        "Neurological Manifestation Phenotype (Class 1)"
        if pred_class == 1
        else "Absence of Neurological Symptoms (Class 0)"
    )

    # Risk Tier assignment
    if ensemble_prob >= 0.75:
        risk_tier = "Tier A (High Risk / Pronounced Neurological Phenotype)"
    elif ensemble_prob >= 0.45:
        risk_tier = "Tier B (Moderate Risk / Mixed Presentation)"
    else:
        risk_tier = "Tier C (Low Neurological Risk / Hepatic Predominance)"

    # Consensus determination
    votes = [1 if p >= 0.50 else 0 for p in [p_xgb, p_lgb, p_rf]]
    if sum(votes) in (0, 3):
        consensus = "High Consensus (All 3 Models Agree)"
    else:
        consensus = "Moderate Consensus (2 vs 1 Split)"

    # Feature Contribution Analysis
    contributions = []
    for feat in FEATURE_NAMES:
        val = row_data[feat]
        mean_val = feature_means.get(feat, val)
        importance = feature_importances.get(feat, 0.01)

        # Deviation weighted by feature importance
        if mean_val != 0:
            rel_dev = (val - mean_val) / (abs(mean_val) + 1e-5)
        else:
            rel_dev = val - mean_val
        
        impact_score = abs(rel_dev) * importance
        contributions.append({
            "feature": feat,
            "value": round(val, 2),
            "baseline_mean": round(mean_val, 2),
            "importance_weight": round(importance, 4),
            "impact_score": round(impact_score, 4),
            "direction": "increases_risk" if val > mean_val else "decreases_risk"
        })

    # Sort top 5 features by impact
    contributions.sort(key=lambda x: x["impact_score"], reverse=True)
    top_5 = contributions[:5]

    return PredictionResponse(
        ensemble_probability=round(ensemble_prob, 4),
        xgboost_probability=round(p_xgb, 4),
        lightgbm_probability=round(p_lgb, 4),
        random_forest_probability=round(p_rf, 4),
        predicted_class=pred_class,
        predicted_phenotype=pred_phenotype,
        risk_tier=risk_tier,
        model_consensus=consensus,
        top_contributing_features=top_5,
        medical_disclaimer=MEDICAL_DISCLAIMER
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
