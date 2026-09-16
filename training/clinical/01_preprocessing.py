"""
synDx Clinical ML Pipeline
============================
Stage 01 — Preprocessing

Author  : synDx ML Team
Dataset : Wilson-disease patient cohort (n=185)
Target  : label (neurological-symptom phenotype; NOT a Wilson-disease vs healthy classifier)
Seed    : 42

IMPORTANT CLINICAL DISCLAIMER
------------------------------
This script prepares a Wilson-disease patient cohort for ML research.
The 'label' column encodes a *neurological-symptom phenotype* within the WD cohort.
This is NOT a validated diagnostic model distinguishing WD from healthy controls.
No synthetic records are generated. No labels are modified.

Pipeline stages
---------------
  01_preprocessing.py  <-- YOU ARE HERE
  02_xgboost.py
  03_lightgbm.py
  04_random_forest.py
  05_ensemble.py
  06_shap.py
"""

import os
import sys
import pathlib
import pandas as pd
from sklearn.model_selection import train_test_split

# ──────────────────────────────────────────────
# Reproducibility
# ──────────────────────────────────────────────
RANDOM_STATE = 42

# ──────────────────────────────────────────────
# Paths (relative to project root)
# ──────────────────────────────────────────────
SCRIPT_DIR   = pathlib.Path(__file__).resolve().parent          # .../clinical/
PROJECT_ROOT = SCRIPT_DIR.parent.parent                         # SYNDX root

# Supported raw dataset paths (checks standard spec and actual workspace paths)
RAW_CANDIDATES = [
    PROJECT_ROOT / "data"  / "clinical" / "raw"  / "clinical_data.xlsx",
    PROJECT_ROOT / "data"  / "clinical" / "raw"  / "Data_Sheet_1.CSV",
    PROJECT_ROOT / "datas" / "clincal"  / "raws" / "Data_Sheet_1.CSV",
    PROJECT_ROOT / "datas" / "clincal"  / "raws" / "clinical_data.xlsx",
]

# Output directories: populate both standard spec and legacy workspace paths
PROCESSED_DIRS = [
    PROJECT_ROOT / "data"  / "clinical" / "processed",
    PROJECT_ROOT / "datas" / "clincal"  / "processed",
]
SPLITS_DIRS = [
    PROJECT_ROOT / "data"  / "clinical" / "splits",
    PROJECT_ROOT / "datas" / "clincal"  / "splits",
]

TARGET_COLUMN       = "label"
EXPECTED_ROWS       = 185
EXPECTED_TOTAL_COLS = 43  # including target


# ──────────────────────────────────────────────
# Main Pipeline
# ──────────────────────────────────────────────

def main() -> None:
    print("=" * 40)
    print("synDx CLINICAL PREPROCESSING")
    print("=" * 40)

    # Ensure output directories exist
    for p_dir in PROCESSED_DIRS:
        p_dir.mkdir(parents=True, exist_ok=True)
    for s_dir in SPLITS_DIRS:
        s_dir.mkdir(parents=True, exist_ok=True)

    # Locate raw dataset
    raw_path = None
    for candidate in RAW_CANDIDATES:
        if candidate.exists():
            raw_path = candidate
            break

    if raw_path is None:
        print("[ERROR] Could not find raw dataset among candidates:", file=sys.stderr)
        for c in RAW_CANDIDATES:
            print(f"  - {c}", file=sys.stderr)
        sys.exit(1)

    print("\nLoading:")
    try:
        rel_path = raw_path.relative_to(PROJECT_ROOT)
        print(f"{rel_path}")
    except ValueError:
        print(f"{raw_path}")

    # Load data
    if raw_path.suffix.lower() == ".csv":
        df = pd.read_csv(raw_path)
    else:
        df = pd.read_excel(raw_path)

    # Strip leading/trailing whitespaces from column names
    df.columns = df.columns.str.strip()

    # Dataset validation
    print(f"\nDataset shape:\n{df.shape[0]} rows × {df.shape[1]} columns")

    missing_val_count = int(df.isnull().sum().sum())
    print(f"\nMissing values:\n{missing_val_count}")

    dup_count = int(df.duplicated().sum())
    print(f"\nDuplicate rows:\n{dup_count}")

    if TARGET_COLUMN not in df.columns:
        print(f"[ERROR] Target column '{TARGET_COLUMN}' not found in dataset!", file=sys.stderr)
        sys.exit(1)

    if df.shape[0] != EXPECTED_ROWS:
        print(f"[WARNING] Row count mismatch: expected {EXPECTED_ROWS}, found {df.shape[0]}", file=sys.stderr)

    if df.shape[1] != EXPECTED_TOTAL_COLS:
        print(f"[WARNING] Column count mismatch: expected {EXPECTED_TOTAL_COLS}, found {df.shape[1]}", file=sys.stderr)

    if missing_val_count > 0:
        print("[WARNING] Missing values detected in raw data!", file=sys.stderr)

    if dup_count > 0:
        print("[WARNING] Exact duplicate rows detected in raw data!", file=sys.stderr)

    print(f"\nTarget:\n{TARGET_COLUMN}")

    # Class distribution of full dataset
    counts = df[TARGET_COLUMN].value_counts().sort_index()
    print("\nClass distribution:")
    for cls, cnt in counts.items():
        print(f"{cls}: {cnt}")

    # ── STEP 1: Separate X and y ─────────────────────────────────────────────
    X = df.drop(columns=[TARGET_COLUMN])
    y = df[TARGET_COLUMN]

    # ── STEP 2: Categorical Features ─────────────────────────────────────────
    # Identify string/object columns vs numeric binary columns
    cat_cols = X.select_dtypes(include=["object", "category"]).columns.tolist()
    bin_cols = [c for c in X.columns if X[c].nunique() <= 2]

    print("\nCategorical columns:")
    if cat_cols:
        for c in cat_cols:
            print(f"- {c}")
        # One-hot encode string/category columns if any exist
        X = pd.get_dummies(X, columns=cat_cols, drop_first=False)
    else:
        print("None (all 42 features are numeric int64/float64)")
        print(f"- Detected {len(bin_cols)} binary 0/1 clinical indicator columns (retained as numeric)")

    print(f"\nEncoded feature count:\n{X.shape[1]}")

    # ── STEP 3: Check Class Imbalance ────────────────────────────────────────
    print("\nClass percentages:")
    total = len(y)
    for cls, cnt in counts.items():
        print(f"Class {cls}: {100.0 * cnt / total:.1f}%")

    # ── STEP 4: Train / Validation / Test Splits (60/20/20) ──────────────────
    # Stage 1: split into 80% temporary and 20% test
    X_temp, X_test, y_temp, y_test = train_test_split(
        X, y,
        test_size=0.20,
        random_state=RANDOM_STATE,
        stratify=y
    )

    # Stage 2: split 80% temporary into 60% train and 20% val
    # 0.25 * 0.80 = 0.20 of original total
    X_train, X_val, y_train, y_val = train_test_split(
        X_temp, y_temp,
        test_size=0.25,
        random_state=RANDOM_STATE,
        stratify=y_temp
    )

    print(f"\nDataset split:")
    print(f"Training:   {len(X_train)}")
    print(f"Validation: {len(X_val)}")
    print(f"Test:       {len(X_test)}")

    print(f"\nTraining shape:\n{X_train.shape}")
    print(f"Validation shape:\n{X_val.shape}")
    print(f"Test shape:\n{X_test.shape}")

    print("\nTraining class distribution:")
    for cls, cnt in y_train.value_counts().sort_index().items():
        pct = 100.0 * cnt / len(y_train)
        print(f"Class {cls}: {cnt} ({pct:.1f}%)")

    print("\nValidation class distribution:")
    for cls, cnt in y_val.value_counts().sort_index().items():
        pct = 100.0 * cnt / len(y_val)
        print(f"Class {cls}: {cnt} ({pct:.1f}%)")

    print("\nTest class distribution:")
    for cls, cnt in y_test.value_counts().sort_index().items():
        pct = 100.0 * cnt / len(y_test)
        print(f"Class {cls}: {cnt} ({pct:.1f}%)")

    # Verify both classes exist in every split
    for split_name, split_y in [("Training", y_train), ("Validation", y_val), ("Test", y_test)]:
        if split_y.nunique() < 2:
            print(f"[FATAL] Split '{split_name}' contains fewer than 2 classes!", file=sys.stderr)
            sys.exit(1)

    # ── Feature Consistency Check ────────────────────────────────────────────
    try:
        assert list(X_train.columns) == list(X_val.columns), "X_train and X_val columns differ!"
        assert list(X_train.columns) == list(X_test.columns), "X_train and X_test columns differ!"
        print("\nFeature consistency:\nPASSED")
    except AssertionError as err:
        print(f"\nFeature consistency:\nFAILED: {err}", file=sys.stderr)
        sys.exit(1)

    # ── STEP 5: Save Outputs ─────────────────────────────────────────────────
    saved_files = []
    for p_dir in PROCESSED_DIRS:
        x_enc_path = p_dir / "X_encoded.csv"
        y_enc_path = p_dir / "y.csv"
        X.to_csv(x_enc_path, index=False)
        y.to_csv(y_enc_path, index=False)
        saved_files.extend([x_enc_path, y_enc_path])

    for s_dir in SPLITS_DIRS:
        files = {
            "X_train.csv": X_train,
            "X_val.csv": X_val,
            "X_test.csv": X_test,
            "y_train.csv": y_train,
            "y_val.csv": y_val,
            "y_test.csv": y_test,
        }
        for fname, data in files.items():
            out_path = s_dir / fname
            data.to_csv(out_path, index=False)
            saved_files.append(out_path)

    print("\nSaved files:")
    for f in sorted(set(saved_files)):
        try:
            rel = f.relative_to(PROJECT_ROOT)
            print(f"  {rel}")
        except ValueError:
            print(f"  {f}")

    print("\n" + "=" * 40)
    print("PREPROCESSING COMPLETE")
    print("=" * 40)


if __name__ == "__main__":
    main()
