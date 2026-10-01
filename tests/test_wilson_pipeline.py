"""
synDx Wilson ML Pipeline Python Unit & Integration Tests
=========================================================
Tests dataset invariants, split boundaries, model loading,
prediction bounds, and FastAPI input validation logic.
"""

import unittest
import pathlib
import numpy as np
import pandas as pd
from fastapi import HTTPException

# Add project root to sys.path
PROJECT_ROOT = pathlib.Path(__file__).resolve().parent.parent
import sys
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from pipeline.clinical_service import (
    load_models,
    models,
    feature_means,
    ClinicalFeatures,
    predict_clinical_phenotype,
    FEATURE_NAMES,
    MEDICAL_DISCLAIMER
)


class TestWilsonPipeline(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        load_models()
        cls.raw_path = PROJECT_ROOT / "data" / "clinical" / "raw" / "Data_Sheet_1.CSV"
        cls.splits_dir = PROJECT_ROOT / "data" / "clinical" / "splits"

    def test_raw_dataset_invariants(self):
        """Strict non-inflation test: Cohort must be exactly 185 unique patient records."""
        df = pd.read_csv(self.raw_path)
        df.columns = df.columns.str.strip()

        self.assertEqual(df.shape[0], 185, "Cohort size must be exactly 185 records. Do not inflate dataset!")
        self.assertEqual(df.shape[1], 43, "Dataset must have 42 predictors + 1 label.")
        self.assertEqual(df.isnull().sum().sum(), 0, "Dataset must have zero missing values.")
        self.assertEqual(df.duplicated().sum(), 0, "Dataset must contain zero duplicate rows.")

        y_counts = df["label"].value_counts().to_dict()
        self.assertEqual(y_counts[1], 163, "Class 1 count must be 163.")
        self.assertEqual(y_counts[0], 22, "Class 0 count must be 22.")

    def test_patient_level_splits_non_leakage(self):
        """Verifies 60/20/20 partition sizes and strict zero patient record overlap."""
        x_train = pd.read_csv(self.splits_dir / "X_train.csv")
        x_val = pd.read_csv(self.splits_dir / "X_val.csv")
        x_test = pd.read_csv(self.splits_dir / "X_test.csv")

        self.assertEqual(len(x_train), 111)
        self.assertEqual(len(x_val), 37)
        self.assertEqual(len(x_test), 37)
        self.assertEqual(len(x_train) + len(x_val) + len(x_test), 185)

        # Check for intersection
        train_tuples = set(map(tuple, x_train.values))
        val_tuples = set(map(tuple, x_val.values))
        test_tuples = set(map(tuple, x_test.values))

        self.assertEqual(len(train_tuples.intersection(val_tuples)), 0, "Data leakage between train and val!")
        self.assertEqual(len(train_tuples.intersection(test_tuples)), 0, "Data leakage between train and test!")
        self.assertEqual(len(val_tuples.intersection(test_tuples)), 0, "Data leakage between val and test!")

    def test_model_probabilities_bounded(self):
        """Verifies that all three models produce probabilities bounded in [0.0, 1.0]."""
        x_val = pd.read_csv(self.splits_dir / "X_val.csv")

        if "xgboost" in models:
            p_xgb = models["xgboost"].predict_proba(x_val)[:, 1]
            self.assertTrue(np.all(p_xgb >= 0.0) and np.all(p_xgb <= 1.0))

        if "lightgbm" in models:
            p_lgb = models["lightgbm"].predict(x_val)
            self.assertTrue(np.all(p_lgb >= 0.0) and np.all(p_lgb <= 1.0))

        if "random_forest" in models:
            p_rf = models["random_forest"].predict_proba(x_val)[:, 1]
            self.assertTrue(np.all(p_rf >= 0.0) and np.all(p_rf <= 1.0))

    def test_inference_valid_preset(self):
        """Verifies successful inference on a canonical clinical input."""
        valid_input = ClinicalFeatures(features={
            "Age": 29.0,
            "Gender": 1.0,
            "24-hour urine copper": 468.6,
            "CP": 0.018,
            "Psychiatric symptom score": 7.0,
            "Liver symptom score": 1.0,
            "K-F ring(es/No)": 1.0
        })

        resp = predict_clinical_phenotype(valid_input)
        self.assertIn(resp.predicted_class, (0, 1))
        self.assertTrue(0.0 <= resp.ensemble_probability <= 1.0)
        self.assertTrue(0.0 <= resp.xgboost_probability <= 1.0)
        self.assertTrue(0.0 <= resp.lightgbm_probability <= 1.0)
        self.assertTrue(0.0 <= resp.random_forest_probability <= 1.0)
        self.assertIn("Tier", resp.risk_tier)
        self.assertIn("Consensus", resp.model_consensus)
        self.assertGreater(len(resp.top_contributing_features), 0)
        self.assertEqual(resp.medical_disclaimer, MEDICAL_DISCLAIMER)

    def test_inference_input_validation_negative_age(self):
        """Input validation: Rejects negative age."""
        bad_input = ClinicalFeatures(features={"Age": -10.0})
        with self.assertRaises(HTTPException) as ctx:
            predict_clinical_phenotype(bad_input)
        self.assertEqual(ctx.exception.status_code, 422)

    def test_inference_input_validation_negative_copper(self):
        """Input validation: Rejects negative copper."""
        bad_input = ClinicalFeatures(features={"24-hour urine copper": -100.0})
        with self.assertRaises(HTTPException) as ctx:
            predict_clinical_phenotype(bad_input)
        self.assertEqual(ctx.exception.status_code, 422)

    def test_inference_input_validation_invalid_binary(self):
        """Input validation: Rejects non-binary indicator."""
        bad_input = ClinicalFeatures(features={"K-F ring(es/No)": 7.0})
        with self.assertRaises(HTTPException) as ctx:
            predict_clinical_phenotype(bad_input)
        self.assertEqual(ctx.exception.status_code, 422)


if __name__ == "__main__":
    unittest.main()
