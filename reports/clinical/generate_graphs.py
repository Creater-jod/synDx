"""
Generate high-resolution scientific visualization graphs for synDx Clinical Model Evaluation Report.
"""
import pathlib
import json
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import roc_curve, precision_recall_curve, roc_auc_score, average_precision_score

# Set style
plt.style.use('seaborn-v0_8-whitegrid' if 'seaborn-v0_8-whitegrid' in plt.style.available else 'default')
plt.rcParams['font.family'] = 'DejaVu Sans'
plt.rcParams['font.size'] = 11
plt.rcParams['axes.titlesize'] = 14
plt.rcParams['axes.titleweight'] = 'bold'
plt.rcParams['axes.labelsize'] = 12
plt.rcParams['axes.labelweight'] = 'bold'
plt.rcParams['figure.titlesize'] = 16

PROJECT_ROOT = pathlib.Path(__file__).resolve().parents[2]
REPORTS_DIR = PROJECT_ROOT / "reports" / "clinical"
GRAPHS_DIR = REPORTS_DIR / "graphs"
GRAPHS_DIR.mkdir(parents=True, exist_ok=True)

# Load comparison CSV
comparison_df = pd.read_csv(REPORTS_DIR / "model_comparison.csv")
print("Loaded comparison:")
print(comparison_df)

# Load predictions
xgb_preds = pd.read_csv(REPORTS_DIR / "xgboost" / "validation_predictions.csv")
lgb_preds = pd.read_csv(REPORTS_DIR / "lightgbm" / "validation_predictions.csv")
rf_preds  = pd.read_csv(REPORTS_DIR / "random_forest" / "validation_predictions.csv")

# Model color scheme
colors = {
    "XGBoost": "#1f77b4",       # Deep Blue
    "LightGBM": "#2ca02c",      # Forest Green / Emerald
    "Random Forest": "#ff7f0e", # Coral Amber
}

# -------------------------------------------------------------
# 1. Accuracy & Balanced Accuracy Comparison
# -------------------------------------------------------------
fig, ax = plt.subplots(figsize=(8, 5.5), dpi=300)
x = np.arange(len(comparison_df))
width = 0.35

rects1 = ax.bar(x - width/2, comparison_df['Accuracy'], width, label='Accuracy', color='#2b5c8f', edgecolor='black', linewidth=0.8, alpha=0.9)
rects2 = ax.bar(x + width/2, comparison_df['Balanced Accuracy'], width, label='Balanced Accuracy', color='#e26d5c', edgecolor='black', linewidth=0.8, alpha=0.9)

ax.set_ylabel('Score')
ax.set_title('Validation Accuracy vs. Balanced Accuracy\n(Wilson Disease Phenotype Classification)')
ax.set_xticks(x)
ax.set_xticklabels(comparison_df['Model'], fontweight='bold')
ax.set_ylim(0, 1.05)
ax.axhline(0.5, color='gray', linestyle='--', linewidth=1, label='Random Chance (Balanced Acc = 0.50)')
ax.legend(loc='lower right', frameon=True)

# Annotations
for rect in rects1:
    height = rect.get_height()
    ax.annotate(f'{height:.4f}',
                xy=(rect.get_x() + rect.get_width() / 2, height),
                xytext=(0, 4), textcoords="offset points",
                ha='center', va='bottom', fontsize=10, fontweight='bold')
for rect in rects2:
    height = rect.get_height()
    ax.annotate(f'{height:.4f}',
                xy=(rect.get_x() + rect.get_width() / 2, height),
                xytext=(0, 4), textcoords="offset points",
                ha='center', va='bottom', fontsize=10, fontweight='bold')

plt.tight_layout()
plt.savefig(GRAPHS_DIR / "accuracy_comparison.png", dpi=300)
plt.close()
print("Saved accuracy_comparison.png")

# -------------------------------------------------------------
# 2. ROC Curves
# -------------------------------------------------------------
fig, ax = plt.subplots(figsize=(7.5, 6), dpi=300)

models_pred = [
    ("XGBoost", xgb_preds, colors["XGBoost"]),
    ("LightGBM", lgb_preds, colors["LightGBM"]),
    ("Random Forest", rf_preds, colors["Random Forest"]),
]

for name, df_p, c in models_pred:
    fpr, tpr, _ = roc_curve(df_p['y_true'], df_p['predicted_probability'])
    auc_val = roc_auc_score(df_p['y_true'], df_p['predicted_probability'])
    ax.plot(fpr, tpr, label=f'{name} (ROC-AUC = {auc_val:.4f})', color=c, linewidth=2.4)

ax.plot([0, 1], [0, 1], 'k--', linewidth=1.2, label='Chance (AUC = 0.5000)')
ax.set_xlim([-0.02, 1.02])
ax.set_ylim([-0.02, 1.05])
ax.set_xlabel('False Positive Rate (1 - Specificity)')
ax.set_ylabel('True Positive Rate (Sensitivity)')
ax.set_title('Validation ROC Curves (n=37)')
ax.legend(loc='lower right', frameon=True, fontsize=11)
plt.tight_layout()
plt.savefig(GRAPHS_DIR / "roc_curves.png", dpi=300)
plt.close()
print("Saved roc_curves.png")

# -------------------------------------------------------------
# 3. Precision-Recall Curves
# -------------------------------------------------------------
fig, ax = plt.subplots(figsize=(7.5, 6), dpi=300)

for name, df_p, c in models_pred:
    precision, recall, _ = precision_recall_curve(df_p['y_true'], df_p['predicted_probability'])
    pr_auc = average_precision_score(df_p['y_true'], df_p['predicted_probability'])
    ax.plot(recall, precision, label=f'{name} (PR-AUC = {pr_auc:.4f})', color=c, linewidth=2.4)

# Baseline positive prevalence in validation set: 32 / 37 ≈ 0.8649
base_prev = 32 / 37
ax.axhline(base_prev, color='gray', linestyle='--', linewidth=1.2, label=f'Class Prevalence Baseline ({base_prev:.4f})')

ax.set_xlim([-0.02, 1.02])
ax.set_ylim([0.75, 1.03])
ax.set_xlabel('Recall (Sensitivity)')
ax.set_ylabel('Precision (Positive Predictive Value)')
ax.set_title('Validation Precision-Recall Curves (n=37)')
ax.legend(loc='lower left', frameon=True, fontsize=11)
plt.tight_layout()
plt.savefig(GRAPHS_DIR / "precision_recall_curves.png", dpi=300)
plt.close()
print("Saved precision_recall_curves.png")

# -------------------------------------------------------------
# 4. Sensitivity and Specificity Comparison
# -------------------------------------------------------------
fig, ax = plt.subplots(figsize=(8, 5.5), dpi=300)

rects1 = ax.bar(x - width/2, comparison_df['Sensitivity'], width, label='Sensitivity (Recall)', color='#2e8b57', edgecolor='black', linewidth=0.8, alpha=0.9)
rects2 = ax.bar(x + width/2, comparison_df['Specificity'], width, label='Specificity (True Neg Rate)', color='#d9534f', edgecolor='black', linewidth=0.8, alpha=0.9)

ax.set_ylabel('Rate')
ax.set_title('Validation Sensitivity vs. Specificity (Threshold = 0.5)')
ax.set_xticks(x)
ax.set_xticklabels(comparison_df['Model'], fontweight='bold')
ax.set_ylim(0, 1.15)
ax.legend(loc='upper right', frameon=True)

for rect in rects1:
    height = rect.get_height()
    ax.annotate(f'{height:.4f}',
                xy=(rect.get_x() + rect.get_width() / 2, height),
                xytext=(0, 4), textcoords="offset points",
                ha='center', va='bottom', fontsize=10, fontweight='bold')
for rect in rects2:
    height = rect.get_height()
    ax.annotate(f'{height:.4f}',
                xy=(rect.get_x() + rect.get_width() / 2, height),
                xytext=(0, 4), textcoords="offset points",
                ha='center', va='bottom', fontsize=10, fontweight='bold')

plt.tight_layout()
plt.savefig(GRAPHS_DIR / "sensitivity_specificity.png", dpi=300)
plt.close()
print("Saved sensitivity_specificity.png")

# -------------------------------------------------------------
# 5. Overall Metric Comparison
# -------------------------------------------------------------
fig, ax = plt.subplots(figsize=(10, 6), dpi=300)
metrics_to_plot = ['ROC-AUC', 'PR-AUC', 'Accuracy', 'Balanced Accuracy', 'F1']
x_m = np.arange(len(metrics_to_plot))
w_m = 0.25

for i, row in comparison_df.iterrows():
    vals = [row[m] for m in metrics_to_plot]
    offset = (i - 1) * w_m
    rects = ax.bar(x_m + offset, vals, w_m, label=row['Model'], color=colors[row['Model']], edgecolor='black', linewidth=0.8, alpha=0.9)
    for rect in rects:
        height = rect.get_height()
        ax.annotate(f'{height:.3f}',
                    xy=(rect.get_x() + rect.get_width() / 2, height),
                    xytext=(0, 3), textcoords="offset points",
                    ha='center', va='bottom', fontsize=8.5, rotation=0)

ax.set_ylabel('Metric Value')
ax.set_title('Cross-Model Overall Validation Profile')
ax.set_xticks(x_m)
ax.set_xticklabels(metrics_to_plot, fontweight='bold')
ax.set_ylim(0, 1.1)
ax.legend(loc='lower right', frameon=True)
plt.tight_layout()
plt.savefig(GRAPHS_DIR / "overall_metrics.png", dpi=300)
plt.close()
print("Saved overall_metrics.png")

# -------------------------------------------------------------
# 6, 7, 8. Confusion Matrices Heatmaps
# -------------------------------------------------------------
cms = {
    "xgboost": {"TN": 2, "FP": 3, "FN": 0, "TP": 32, "name": "XGBoost", "color": "Blues"},
    "lightgbm": {"TN": 2, "FP": 3, "FN": 0, "TP": 32, "name": "LightGBM", "color": "Greens"},
    "random_forest": {"TN": 0, "FP": 5, "FN": 0, "TP": 32, "name": "Random Forest", "color": "Oranges"},
}

for key, info in cms.items():
    matrix = np.array([[info["TN"], info["FP"]],
                       [info["FN"], info["TP"]]])
    fig, ax = plt.subplots(figsize=(5.5, 4.5), dpi=300)
    sns.heatmap(matrix, annot=True, fmt="d", cmap=info["color"], cbar=False,
                xticklabels=["Predicted Class 0", "Predicted Class 1"],
                yticklabels=["Actual Class 0", "Actual Class 1"],
                annot_kws={"size": 16, "weight": "bold"}, ax=ax,
                linewidths=1.5, linecolor="gray")
    ax.set_title(f'{info["name"]} - Validation Confusion Matrix\n(Threshold = 0.50)', fontsize=12, pad=12)
    plt.tight_layout()
    plt.savefig(GRAPHS_DIR / f"{key}_confusion_matrix.png", dpi=300)
    plt.close()
    print(f"Saved {key}_confusion_matrix.png")

# -------------------------------------------------------------
# 9, 10, 11. Feature Importances (Top 12)
# -------------------------------------------------------------
models_fi = [
    ("xgboost", "XGBoost (Gain / Weight)", colors["XGBoost"]),
    ("lightgbm", "LightGBM (Split Count)", colors["LightGBM"]),
    ("random_forest", "Random Forest (Mean Decrease Impurity)", colors["Random Forest"]),
]

for key, title_label, c in models_fi:
    fi_df = pd.read_csv(REPORTS_DIR / key / "feature_importance.csv")
    top_12 = fi_df.head(12).iloc[::-1]  # Invert for horizontal bar chart
    
    fig, ax = plt.subplots(figsize=(9, 6), dpi=300)
    bars = ax.barh(top_12['feature'], top_12['importance'], color=c, edgecolor='black', linewidth=0.7, alpha=0.85)
    
    # Add values
    for bar in bars:
        width_val = bar.get_width()
        val_str = f"{width_val:.4f}" if width_val < 1 else f"{int(width_val)}"
        ax.annotate(val_str,
                    xy=(width_val, bar.get_y() + bar.get_height() / 2),
                    xytext=(4, 0), textcoords="offset points",
                    ha='left', va='center', fontsize=9, fontweight='bold')
        
    ax.set_xlabel("Importance Metric Value")
    ax.set_title(f"Top 12 Features — {title_label}")
    # Expand xlim slightly for text
    ax.set_xlim(0, top_12['importance'].max() * 1.18)
    plt.tight_layout()
    plt.savefig(GRAPHS_DIR / f"{key}_feature_importance.png", dpi=300)
    plt.close()
    print(f"Saved {key}_feature_importance.png")

print("All 11 graphs generated successfully!")
