# synDx Clinical Model Evaluation Report Package

This standalone directory contains the complete technical evaluation package for the **synDx clinical machine-learning pipeline** (Stages 02–04 baseline models).

---

## Directory Structure

```text
evaluation_report/
├── README.md                                          # This summary file
├── index.html                                         # Interactive web report (entry point)
├── synDx_clinical_model_evaluation_report.html       # Full HTML research evaluation report
├── synDx_clinical_model_evaluation_report.md         # Full Markdown research evaluation report
├── model_comparison.csv                              # Exact cross-model validation metrics table
└── graphs/                                           # Publication-grade figures (300 DPI)
    ├── accuracy_comparison.png                       # Accuracy vs. Balanced Accuracy
    ├── roc_curves.png                                # Validation ROC curves
    ├── precision_recall_curves.png                   # Precision-Recall curves
    ├── sensitivity_specificity.png                   # Sensitivity vs. Specificity breakdown
    ├── overall_metrics.png                           # 5-metric overall performance profile
    ├── xgboost_confusion_matrix.png                  # XGBoost confusion matrix heatmap
    ├── lightgbm_confusion_matrix.png                 # LightGBM confusion matrix heatmap
    ├── random_forest_confusion_matrix.png            # Random Forest confusion matrix heatmap
    ├── xgboost_feature_importance.png                # XGBoost top 12 features by gain
    ├── lightgbm_feature_importance.png               # LightGBM top 12 features by splits
    └── random_forest_feature_importance.png          # Random Forest top 12 features by Gini
```

---

## Validation Summary ($n = 37$)

| Model | ROC-AUC | PR-AUC | Accuracy | Balanced Accuracy | Sensitivity | Specificity | Precision | F1 | Log Loss | Brier Score |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **XGBoost** | **0.7875** | **0.9621** | **0.9189** | **0.7000** | **1.0000** | **0.4000** | **0.9143** | **0.9552** | **0.3132** | **0.0875** |
| **LightGBM** | 0.7500 | 0.9501 | **0.9189** | **0.7000** | **1.0000** | **0.4000** | **0.9143** | **0.9552** | 0.3410 | 0.0909 |
| **Random Forest** | 0.7000 | 0.9364 | 0.8649 | 0.5000 | **1.0000** | 0.0000 | 0.8649 | 0.9275 | 0.3587 | 0.1057 |

---

> **Important**: This is a validation-only report evaluating phenotype classification within a Wilson disease cohort ($n=185$). It is NOT a diagnostic model for Wilson disease. The final test set remains **SEALED — not evaluated**.
