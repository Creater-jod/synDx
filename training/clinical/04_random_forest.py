"""
synDx Clinical ML Pipeline
============================
Stage 04 — Random Forest Baseline Model

Author  : synDx ML Team
Dataset : Wilson-disease patient cohort (n=185)
Target  : label (neurological-symptom phenotype; NOT a Wilson-disease vs healthy classifier)
Seed    : 42

IMPORTANT CLINICAL DISCLAIMER
------------------------------
This dataset consists of Wilson-disease patients and the current label represents
neurological-symptom phenotype classification, not Wilson disease versus healthy/control
diagnosis. Therefore, performance from this experiment must not be interpreted as
validated Wilson disease diagnostic performance or as evidence for clinical deployment.

Pipeline stages
---------------
  01_preprocessing.py
  02_xgboost.py
  03_lightgbm.py
  04_random_forest.py  <-- YOU ARE HERE
  05_ensemble.py
  06_shap.py
"""

import os
import sys
import json
import datetime
import pathlib
import pandas as pd
import numpy as np
import sklearn
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    roc_auc_score,
    average_precision_score,
    accuracy_score,
    balanced_accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    log_loss,
    brier_score_loss,
)

# ──────────────────────────────────────────────
# Global Configuration & Reproducibility
# ──────────────────────────────────────────────
RANDOM_STATE = 42

# Guard against accidental test set evaluation during baseline development
RUN_FINAL_TEST = False

MEDICAL_DISCLAIMER = (
    "This dataset consists of Wilson-disease patients and the current label represents "
    "neurological-symptom phenotype classification, not Wilson disease versus healthy/control "
    "diagnosis. Therefore, performance from this experiment must not be interpreted as "
    "validated Wilson disease diagnostic performance or as evidence for clinical deployment."
)

# ──────────────────────────────────────────────
# Paths (relative to project root)
# ──────────────────────────────────────────────
SCRIPT_DIR   = pathlib.Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent.parent

# Candidate split directories
SPLITS_CANDIDATES = [
    PROJECT_ROOT / "data" / "clinical" / "splits",
]

# Output directories
MODELS_DIR  = PROJECT_ROOT / "models"  / "clinical" / "random_forest"
REPORTS_DIR = PROJECT_ROOT / "reports" / "clinical" / "random_forest"

TARGET_COLUMN       = "label"
EXPECTED_FEATURES   = 42
EXPECTED_TRAIN_ROWS = 111
EXPECTED_VAL_ROWS   = 37
EXPECTED_TEST_ROWS  = 37


# ──────────────────────────────────────────────
# Helper Functions
# ──────────────────────────────────────────────

def find_splits_dir() -> pathlib.Path:
    for c in SPLITS_CANDIDATES:
        if (c / "X_train.csv").exists():
            return c
    print("[ERROR] Preprocessed splits directory not found. Expected candidates:", file=sys.stderr)
    for c in SPLITS_CANDIDATES:
        print(f"  - {c}", file=sys.stderr)
    print("Please run 'python training/clinical/01_preprocessing.py' first.", file=sys.stderr)
    sys.exit(1)


def compute_metrics(y_true: np.ndarray, y_prob: np.ndarray, threshold: float = 0.5) -> dict:
    y_pred = (y_prob >= threshold).astype(int)
    cm = confusion_matrix(y_true, y_pred, labels=[0, 1])
    tn, fp, fn, tp = cm.ravel()
    specificity = float(tn / (tn + fp)) if (tn + fp) > 0 else 0.0

    return {
        "roc_auc": float(roc_auc_score(y_true, y_prob)),
        "pr_auc": float(average_precision_score(y_true, y_prob)),
        "accuracy": float(accuracy_score(y_true, y_pred)),
        "balanced_accuracy": float(balanced_accuracy_score(y_true, y_pred)),
        "sensitivity_recall": float(recall_score(y_true, y_pred, zero_division=0)),
        "specificity": specificity,
        "precision": float(precision_score(y_true, y_pred, zero_division=0)),
        "f1_score": float(f1_score(y_true, y_pred, zero_division=0)),
        "log_loss": float(log_loss(y_true, y_prob)),
        "brier_score": float(brier_score_loss(y_true, y_prob)),
        "confusion_matrix": {
            "tn": int(tn),
            "fp": int(fp),
            "fn": int(fn),
            "tp": int(tp),
        },
        "threshold": float(threshold),
    }


# ──────────────────────────────────────────────
# Main Pipeline
# ──────────────────────────────────────────────

def main() -> None:
    print("=" * 40)
    print("synDx - Random Forest Clinical Model")
    print("=" * 40)

    # 1. Output directories creation
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)

    # 2. Locate and load preprocessed data
    print("\nLoading preprocessed datasets...")
    splits_dir = find_splits_dir()

    try:
        X_train = pd.read_csv(splits_dir / "X_train.csv")
        y_train = pd.read_csv(splits_dir / "y_train.csv")[TARGET_COLUMN]
        X_val   = pd.read_csv(splits_dir / "X_val.csv")
        y_val   = pd.read_csv(splits_dir / "y_val.csv")[TARGET_COLUMN]
        X_test  = pd.read_csv(splits_dir / "X_test.csv")
        y_test  = pd.read_csv(splits_dir / "y_test.csv")[TARGET_COLUMN]
    except Exception as err:
        print(f"[ERROR] Failed loading split CSVs from {splits_dir}: {err}", file=sys.stderr)
        sys.exit(1)

    # 3. Strict Data Verification
    print(f"\nTrain:\n{X_train.shape[0]} samples x {X_train.shape[1]} features")
    print(f"\nValidation:\n{X_val.shape[0]} samples x {X_val.shape[1]} features")
    print(f"\nTest:\n{X_test.shape[0]} samples x {X_test.shape[1]} features")

    if X_train.shape != (EXPECTED_TRAIN_ROWS, EXPECTED_FEATURES):
        print(f"[ERROR] Unexpected X_train shape: {X_train.shape}, expected ({EXPECTED_TRAIN_ROWS}, {EXPECTED_FEATURES})", file=sys.stderr)
        sys.exit(1)
    if X_val.shape != (EXPECTED_VAL_ROWS, EXPECTED_FEATURES):
        print(f"[ERROR] Unexpected X_val shape: {X_val.shape}, expected ({EXPECTED_VAL_ROWS}, {EXPECTED_FEATURES})", file=sys.stderr)
        sys.exit(1)
    if X_test.shape != (EXPECTED_TEST_ROWS, EXPECTED_FEATURES):
        print(f"[ERROR] Unexpected X_test shape: {X_test.shape}, expected ({EXPECTED_TEST_ROWS}, {EXPECTED_FEATURES})", file=sys.stderr)
        sys.exit(1)

    # Feature consistency assertion
    if not (list(X_train.columns) == list(X_val.columns) == list(X_test.columns)):
        print("[ERROR] Feature consistency check FAILED across splits!", file=sys.stderr)
        sys.exit(1)
    print("\nFeature consistency:\nPASSED")

    # Numeric check
    for col in X_train.columns:
        if not np.issubdtype(X_train[col].dtype, np.number):
            print(f"[ERROR] Feature '{col}' is not numeric! Type: {X_train[col].dtype}", file=sys.stderr)
            sys.exit(1)
    print("\nNumeric feature check:\nPASSED")

    # Missing value check
    total_nulls = sum([
        X_train.isnull().sum().sum(), y_train.isnull().sum(),
        X_val.isnull().sum().sum(),   y_val.isnull().sum(),
        X_test.isnull().sum().sum(),  y_test.isnull().sum(),
    ])
    if total_nulls > 0:
        print(f"[ERROR] Dataset contains {total_nulls} missing values!", file=sys.stderr)
        sys.exit(1)
    print("\nMissing value check:\nPASSED")

    # Target values check
    unique_targets = set(y_train.unique()) | set(y_val.unique()) | set(y_test.unique())
    if not unique_targets.issubset({0, 1}):
        print(f"[ERROR] Target values out of domain {unique_targets}!", file=sys.stderr)
        sys.exit(1)

    # Print class distributions
    print("\nClass distribution:")
    print("Train:")
    n_neg = int((y_train == 0).sum())
    n_pos = int((y_train == 1).sum())
    for cls in [0, 1]:
        print(f"Class {cls} = {int((y_train == cls).sum())}")

    print("\nValidation:")
    for cls in [0, 1]:
        print(f"Class {cls} = {int((y_val == cls).sum())}")

    print("\nTest:")
    for cls in [0, 1]:
        print(f"Class {cls} = {int((y_test == cls).sum())}")

    # 4. Class Imbalance (class_weight=None)
    print("\nClass imbalance:")
    print(f"Negative training samples (Class 0): {n_neg}")
    print(f"Positive training samples (Class 1): {n_pos}")
    print("class_weight                       : None (unweighted baseline)")

    # 5. Random Forest Model Configuration
    # Conservative baseline parameters for n=111 clinical samples
    hyperparameters = {
        "n_estimators": 300,
        "max_depth": 5,
        "min_samples_split": 4,
        "min_samples_leaf": 2,
        "max_features": "sqrt",
        "random_state": RANDOM_STATE,
        "n_jobs": -1,
        "class_weight": None,
    }

    print("\n" + "-" * 40)
    print("Training Random Forest")
    print("-" * 40)

    model = RandomForestClassifier(**hyperparameters)
    model.fit(X_train, y_train)

    print("\nTraining complete.")

    # 6. Validation Evaluation
    print("\n" + "-" * 40)
    print("Validation Results")
    print("-" * 40)

    val_probs = model.predict_proba(X_val)[:, 1]
    val_metrics = compute_metrics(y_val.to_numpy(), val_probs, threshold=0.5)

    print(f"\nROC-AUC:           {val_metrics['roc_auc']:.4f}")
    print(f"PR-AUC:            {val_metrics['pr_auc']:.4f}")
    print(f"Accuracy:          {val_metrics['accuracy']:.4f}")
    print(f"Balanced Accuracy: {val_metrics['balanced_accuracy']:.4f}")
    print(f"Sensitivity:       {val_metrics['sensitivity_recall']:.4f}")
    print(f"Specificity:       {val_metrics['specificity']:.4f}")
    print(f"Precision:         {val_metrics['precision']:.4f}")
    print(f"F1:                {val_metrics['f1_score']:.4f}")
    print(f"Log Loss:          {val_metrics['log_loss']:.4f}")
    print(f"Brier Score:       {val_metrics['brier_score']:.4f}")

    print("\nConfusion Matrix:")
    print(f"TN: {val_metrics['confusion_matrix']['tn']}")
    print(f"FP: {val_metrics['confusion_matrix']['fp']}")
    print(f"FN: {val_metrics['confusion_matrix']['fn']}")
    print(f"TP: {val_metrics['confusion_matrix']['tp']}")

    # 7. Save Model & Metadata
    model_path = MODELS_DIR / "random_forest_model.joblib"
    metadata_path = MODELS_DIR / "random_forest_metadata.json"

    joblib.dump(model, model_path)

    metadata = {
        "model_name": "synDx_clinical_random_forest",
        "model_type": "RandomForestClassifier",
        "training_datetime_utc": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "random_seed": RANDOM_STATE,
        "feature_names": list(X_train.columns),
        "number_of_features": len(X_train.columns),
        "training_rows": len(X_train),
        "validation_rows": len(X_val),
        "test_rows": len(X_test),
        "class_distribution": {
            "train": {"0": n_neg, "1": n_pos},
            "val": {"0": int((y_val == 0).sum()), "1": int((y_val == 1).sum())},
            "test": {"0": int((y_test == 0).sum()), "1": int((y_test == 1).sum())},
        },
        "hyperparameters": {k: (str(v) if not isinstance(v, (int, float, bool, str, type(None))) else v) for k, v in hyperparameters.items()},
        "scikit_learn_version": sklearn.__version__,
        "joblib_version": joblib.__version__,
        "target_column": TARGET_COLUMN,
        "target_description": "neurological-symptom phenotype within Wilson-disease cohort (0=absence, 1=presence)",
        "medical_disclaimer": MEDICAL_DISCLAIMER,
    }

    with open(metadata_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    # 8. Save Reports
    val_metrics_path = REPORTS_DIR / "validation_metrics.json"
    with open(val_metrics_path, "w", encoding="utf-8") as f:
        json.dump(val_metrics, f, indent=2)

    val_preds_df = pd.DataFrame({
        "sample_index": y_val.index,
        "y_true": y_val.values,
        "predicted_probability": val_probs,
        "predicted_class_threshold_0_5": (val_probs >= 0.5).astype(int),
    })
    val_preds_path = REPORTS_DIR / "validation_predictions.csv"
    val_preds_df.to_csv(val_preds_path, index=False)

    cm_df = pd.DataFrame({
        "Metric": ["True Negative (TN)", "False Positive (FP)", "False Negative (FN)", "True Positive (TP)"],
        "Count": [
            val_metrics["confusion_matrix"]["tn"],
            val_metrics["confusion_matrix"]["fp"],
            val_metrics["confusion_matrix"]["fn"],
            val_metrics["confusion_matrix"]["tp"],
        ]
    })
    cm_path = REPORTS_DIR / "confusion_matrix.csv"
    cm_df.to_csv(cm_path, index=False)

    config_path = REPORTS_DIR / "model_config.json"
    with open(config_path, "w", encoding="utf-8") as f:
        json.dump({
            "model": "Random Forest",
            "hyperparameters": {k: (str(v) if not isinstance(v, (int, float, bool, str, type(None))) else v) for k, v in hyperparameters.items()},
            "seed": RANDOM_STATE,
            "run_final_test": RUN_FINAL_TEST,
        }, f, indent=2)

    # Feature Importance
    importance_df = pd.DataFrame({
        "feature": X_train.columns,
        "importance": model.feature_importances_,
    }).sort_values(by="importance", ascending=False)
    importance_path = REPORTS_DIR / "feature_importance.csv"
    importance_df.to_csv(importance_path, index=False)

    # 9. Optional Final Test Evaluation (guarded)
    if RUN_FINAL_TEST:
        print("\n" + "-" * 40)
        print("Final Test Set Evaluation (RUN_FINAL_TEST=True)")
        print("-" * 40)
        test_probs = model.predict_proba(X_test)[:, 1]
        test_metrics = compute_metrics(y_test.to_numpy(), test_probs, threshold=0.5)

        test_metrics_path = REPORTS_DIR / "test_metrics.json"
        with open(test_metrics_path, "w", encoding="utf-8") as f:
            json.dump(test_metrics, f, indent=2)

        test_preds_df = pd.DataFrame({
            "sample_index": y_test.index,
            "y_true": y_test.values,
            "predicted_probability": test_probs,
            "predicted_class_threshold_0_5": (test_probs >= 0.5).astype(int),
        })
        test_preds_path = REPORTS_DIR / "test_predictions.csv"
        test_preds_df.to_csv(test_preds_path, index=False)

        print(f"Test ROC-AUC: {test_metrics['roc_auc']:.4f}")
        print(f"Test PR-AUC:  {test_metrics['pr_auc']:.4f}")
        print(f"Saved: {test_metrics_path}")
        print(f"Saved: {test_preds_path}")
    else:
        print("\n[INFO] Test set untouched (RUN_FINAL_TEST=False). Preserved for final evaluation.")

    # 10. Summary Artifacts Display
    print("\n" + "-" * 40)
    print("Artifacts")
    print("-" * 40)
    print(f"\nModel:\n{model_path}")
    print(f"\nReports:\n{REPORTS_DIR}")

    print("\n" + "=" * 40)
    print("RANDOM FOREST STAGE COMPLETE")
    print("=" * 40)


if __name__ == "__main__":
    main()
