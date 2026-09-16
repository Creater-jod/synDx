"""
synDx Clinical ML Pipeline
============================
Stage 05 - Cross-Model Comparison & Metrics Aggregation

Author  : synDx ML Team
Dataset : Wilson-disease patient cohort (n=185)
"""

import pathlib
import json
import pandas as pd

SCRIPT_DIR = pathlib.Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent.parent
REPORTS_DIR = PROJECT_ROOT / "reports" / "clinical"

MODELS = [
    ("XGBoost", REPORTS_DIR / "xgboost" / "validation_metrics.json"),
    ("LightGBM", REPORTS_DIR / "lightgbm" / "validation_metrics.json"),
    ("Random Forest", REPORTS_DIR / "random_forest" / "validation_metrics.json"),
]

def main():
    print("=" * 50)
    print("synDx CLINICAL MODEL COMPARISON (Stage 05)")
    print("=" * 50)

    rows = []
    for model_name, path in MODELS:
        if not path.exists():
            print(f"[ERROR] Metrics file not found: {path}")
            return
        with open(path, "r", encoding="utf-8") as f:
            m = json.load(f)
        
        rows.append({
            "Model": model_name,
            "ROC-AUC": round(m["roc_auc"], 4),
            "PR-AUC": round(m["pr_auc"], 4),
            "Accuracy": round(m["accuracy"], 4),
            "Balanced Accuracy": round(m["balanced_accuracy"], 4),
            "Sensitivity": round(m["sensitivity_recall"], 4),
            "Specificity": round(m["specificity"], 4),
            "Precision": round(m["precision"], 4),
            "F1": round(m["f1_score"], 4),
            "Log Loss": round(m["log_loss"], 4),
            "Brier Score": round(m["brier_score"], 4),
        })

    df = pd.DataFrame(rows)
    out_csv = REPORTS_DIR / "model_comparison.csv"
    df.to_csv(out_csv, index=False)
    print(f"\n[+] Saved consolidated comparison table to:\n    {out_csv}\n")
    print(df.to_string(index=False))

    # Also update evaluation_report directory if it exists
    eval_csv = PROJECT_ROOT / "evaluation_report" / "model_comparison.csv"
    if eval_csv.parent.exists():
        df.to_csv(eval_csv, index=False)
        print(f"[+] Synced to: {eval_csv}")

if __name__ == "__main__":
    main()
