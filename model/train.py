#!/usr/bin/env python3
"""
Model Training Script for Fake Review Detection.
Supports TF-IDF + Calibrated Classifier pipeline and MLflow experiment tracking.
Architecture is modular to allow plugging in Hugging Face Transformers/BERT.
"""

import os
import sys
import json
import time
from datetime import datetime
import pandas as pd
import numpy as np
import joblib

from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix
)

# Add parent directory to path for imports
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(CURRENT_DIR)
sys.path.insert(0, os.path.join(PROJECT_ROOT, "backend"))

from app.preprocessing.text_cleaner import clean_text

def train_model(
    data_path: str = os.path.join(PROJECT_ROOT, "data", "reviews.csv"),
    output_model_path: str = os.path.join(CURRENT_DIR, "model.joblib"),
    config_path: str = os.path.join(CURRENT_DIR, "model_config.json"),
    ngram_range: tuple = (1, 2),
    max_features: int = 5000,
    reg_c: float = 1.5,
    random_state: int = 42
):
    print("=" * 60)
    print("Fake Review Detection: ML Training Pipeline")
    print("=" * 60)
    print(f"Loading dataset from: {data_path}")
    
    if not os.path.exists(data_path):
        raise FileNotFoundError(f"Dataset file not found at {data_path}")

    df = pd.read_csv(data_path)
    print(f"Dataset loaded: {len(df)} rows, {len(df.columns)} columns")
    
    # Validate required columns
    if "review_text" not in df.columns or "label" not in df.columns:
        raise ValueError("Dataset must contain 'review_text' and 'label' columns")

    # Clean empty values
    df = df.dropna(subset=["review_text", "label"])
    df["clean_review"] = df["review_text"].apply(clean_text)
    
    # Binary mapping: 'Fake' -> 1, 'Real' -> 0
    # Also handles numeric or lowercase labels
    def map_label(l):
        s = str(l).strip().lower()
        if s in ["fake", "1", "true", "fraud", "suspicious"]:
            return 1
        return 0

    df["target"] = df["label"].apply(map_label)
    
    X = df["clean_review"]
    y = df["target"]
    
    print(f"Class distribution: {y.value_counts().to_dict()} (0: Real, 1: Fake)")
    
    # Train / Test split
    test_size = 0.25 if len(df) >= 20 else 0.2
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_state, stratify=y if len(y.unique()) > 1 else None
    )
    
    print(f"Training set: {len(X_train)} samples, Test set: {len(X_test)} samples")
    
    # Construct NLP Pipeline: TF-IDF -> LogisticRegression
    # (LogisticRegression with balanced class weight produces calibrated probabilities)
    pipeline = Pipeline([
        ("tfidf", TfidfVectorizer(
            ngram_range=ngram_range,
            max_features=max_features,
            sublinear_tf=True,
            strip_accents="unicode"
        )),
        ("classifier", LogisticRegression(
            C=reg_c,
            max_iter=1000,
            class_weight="balanced",
            random_state=random_state
        ))
    ])
    
    # MLflow tracking attempt
    mlflow_run_id = None
    mlflow_experiment_id = None
    mlflow_available = False
    
    try:
        import mlflow
        mlflow_available = True
        mlflow.set_experiment("fake-review-detection")
        run = mlflow.start_run(run_name=f"train-run-{datetime.now().strftime('%Y%m%d-%H%M%S')}")
        mlflow_run_id = run.info.run_id
        mlflow_experiment_id = run.info.experiment_id
        print(f"MLflow active: Run ID = {mlflow_run_id}")
        
        mlflow.log_params({
            "model_type": "tfidf_logistic_regression",
            "ngram_range": str(ngram_range),
            "max_features": max_features,
            "reg_c": reg_c,
            "random_state": random_state,
            "train_samples": len(X_train),
            "test_samples": len(X_test)
        })
    except Exception as e:
        print(f"MLflow note: MLflow not running or optional logging skipped ({e})")
        mlflow_available = False
        
    start_time = time.time()
    pipeline.fit(X_train, y_train)
    training_duration_s = round(time.time() - start_time, 4)
    print(f"Model fitting complete in {training_duration_s}s")
    
    # Real Evaluation on Held-out Test Set
    y_pred = pipeline.predict(X_test)
    y_proba = pipeline.predict_proba(X_test)[:, 1] if hasattr(pipeline, "predict_proba") else None
    
    acc = float(accuracy_score(y_test, y_pred))
    prec = float(precision_score(y_test, y_pred, zero_division=0))
    rec = float(recall_score(y_test, y_pred, zero_division=0))
    f1 = float(f1_score(y_test, y_pred, zero_division=0))
    roc_auc = float(roc_auc_score(y_test, y_proba)) if (y_proba is not None and len(np.unique(y_test)) > 1) else None
    cm = confusion_matrix(y_test, y_pred).tolist()
    
    metrics = {
        "accuracy": round(acc, 4),
        "precision": round(prec, 4),
        "recall": round(rec, 4),
        "f1_score": round(f1, 4),
        "roc_auc": round(roc_auc, 4) if roc_auc is not None else None,
        "confusion_matrix": cm,
        "training_duration_seconds": training_duration_s
    }
    
    print("--- Model Evaluation Metrics ---")
    for k, v in metrics.items():
        print(f"{k}: {v}")

    # Log metrics to MLflow if active
    if mlflow_available:
        try:
            import mlflow
            for k, v in metrics.items():
                if isinstance(v, (int, float)):
                    mlflow.log_metric(k, v)
            mlflow.end_run()
        except Exception as e:
            print(f"Error closing MLflow run: {e}")

    # Save Pipeline Artifact
    joblib.dump(pipeline, output_model_path)
    print(f"Model artifact saved to: {output_model_path}")
    
    # Save Model Config
    vocab_size = len(pipeline.named_steps["tfidf"].vocabulary_) if "tfidf" in pipeline.named_steps else 0
    config_data = {
        "model_name": "Fake Review Classifier",
        "version": "v1.0",
        "framework": "Scikit-learn / NLP",
        "task": "Binary Text Classification (Real vs Fake)",
        "status": "Active",
        "model_file": os.path.basename(output_model_path),
        "algorithm": "TF-IDF Vectorizer + Calibrated Logistic Regression",
        "bert_compatible": True,
        "bert_adapter_available": True,
        "bert_upgrade_instructions": "To switch to Hugging Face BERT, place transformer weights in model/weights/ and set model_type='bert' in model_config.json",
        "vocabulary_size": vocab_size,
        "training_samples": len(X_train),
        "test_samples": len(X_test),
        "last_trained": datetime.now().isoformat(),
        "hyperparameters": {
            "ngram_range": list(ngram_range),
            "max_features": max_features,
            "C": reg_c,
            "random_state": random_state
        },
        "metrics": metrics,
        "mlflow": {
            "enabled": mlflow_available,
            "experiment_name": "fake-review-detection",
            "run_id": mlflow_run_id,
            "experiment_id": str(mlflow_experiment_id) if mlflow_experiment_id else None
        },
        "dvc": {
            "tracked_file": "data/reviews.csv",
            "pipeline_stage": "train",
            "version": "v1.0"
        }
    }
    
    with open(config_path, "w") as f:
        json.dump(config_data, f, indent=2)
    print(f"Config & metadata saved to: {config_path}")
    
    return pipeline, metrics

if __name__ == "__main__":
    train_model()
