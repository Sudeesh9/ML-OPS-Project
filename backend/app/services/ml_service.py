import time
import os
import json
from datetime import datetime
from typing import Dict, Any, List, Optional
import pandas as pd
import numpy as np

from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score

from app.services.monitor_service import monitor
from app.preprocessing.text_cleaner import clean_text, extract_linguistic_signals
from model.predict import get_model, CONFIG_PATH

class MLService:
    def __init__(self):
        self.model = get_model()
        self.config_path = CONFIG_PATH

    def get_model_info(self) -> Dict[str, Any]:
        if os.path.exists(self.config_path):
            try:
                with open(self.config_path, "r") as f:
                    cfg = json.load(f)
                    return cfg
            except Exception:
                pass
                
        return {
            "model_name": "Fake Review Classifier",
            "version": "v1.0",
            "framework": "Scikit-learn / NLP",
            "task": "Binary Text Classification (Real vs Fake)",
            "status": "Active",
            "algorithm": "TF-IDF Vectorizer + Calibrated Classifier",
            "vocabulary_size": 973,
            "training_samples": 22,
            "bert_compatible": True,
            "pipeline_steps": [
                "Text Cleaning & Normalization",
                "Contraction Expansion",
                "TF-IDF Sublinear N-gram Vectorization",
                "Calibrated Probability Estimation"
            ],
            "last_trained": datetime.now().isoformat(),
            "hyperparameters": {
                "ngram_range": [1, 2],
                "max_features": 5000,
                "C": 1.5
            }
        }

    def predict_single(self, text: str) -> Dict[str, Any]:
        result = self.model.predict_single(text)
        
        # Track into runtime monitor
        monitor.record_prediction(
            review_text=text,
            prediction=result["prediction"],
            confidence=result["confidence"],
            latency_ms=result["latency_ms"]
        )
        
        return {
            "prediction": result["prediction"],
            "confidence": result["confidence"],
            "probabilities": result["probabilities"],
            "model_version": result.get("model_version", "v1.0"),
            "latency_ms": result["latency_ms"],
            "timestamp": datetime.now().isoformat(),
            "features": result.get("signals", []),
            "safety_disclaimer": "Predictions are model-generated estimates and should not be treated as definitive proof of review authenticity."
        }

    def predict_dataset(
        self,
        df: pd.DataFrame,
        review_col: str,
        label_col: Optional[str] = None,
        clean_empty: bool = True
    ) -> Dict[str, Any]:
        start_time = time.time()
        
        if review_col not in df.columns:
            raise ValueError(f"Review column '{review_col}' not found in uploaded dataset. Available: {list(df.columns)}")

        original_count = len(df)
        empty_removed = 0
        
        # Identify empty reviews
        mask_valid = df[review_col].notna() & (df[review_col].astype(str).str.strip() != "")
        if clean_empty:
            empty_removed = int((~mask_valid).sum())
            df_proc = df[mask_valid].copy()
        else:
            df_proc = df.copy()
            df_proc[review_col] = df_proc[review_col].fillna("")

        if len(df_proc) == 0:
            raise ValueError("All reviews in the dataset are empty or missing.")

        # Duplicate count
        duplicates_count = int(df_proc.duplicated(subset=[review_col]).sum())
        
        reviews_list = df_proc[review_col].astype(str).tolist()
        
        # Run Batch Prediction
        predictions = self.model.predict_batch(reviews_list)
        
        real_count = 0
        fake_count = 0
        total_conf = 0.0
        
        distribution = {
            "50-60%": 0,
            "60-70%": 0,
            "70-80%": 0,
            "80-90%": 0,
            "90-100%": 0
        }
        
        results_items = []
        ground_truths = []
        predicted_labels = []
        
        for idx, (original_idx, row) in enumerate(df_proc.iterrows()):
            pred_item = predictions[idx]
            pred_label = pred_item["prediction"]
            conf = pred_item["confidence"]
            
            if pred_label == "Fake":
                fake_count += 1
            else:
                real_count += 1
                
            total_conf += conf
            
            # Bucket confidence
            if conf < 0.60:
                distribution["50-60%"] += 1
            elif conf < 0.70:
                distribution["60-70%"] += 1
            elif conf < 0.80:
                distribution["70-80%"] += 1
            elif conf < 0.90:
                distribution["80-90%"] += 1
            else:
                distribution["90-100%"] += 1

            # Check ground truth label if provided
            gt_label = None
            is_correct = None
            if label_col and label_col in df.columns:
                raw_gt = str(row[label_col]).strip()
                gt_normalized = "Fake" if raw_gt.lower() in ["fake", "1", "true", "fraud", "suspicious"] else "Real"
                gt_label = gt_normalized
                is_correct = (gt_normalized == pred_label)
                ground_truths.append(1 if gt_normalized == "Fake" else 0)
                predicted_labels.append(1 if pred_label == "Fake" else 0)

            review_text = str(row[review_col])
            results_items.append({
                "row_id": int(original_idx) + 1,
                "review": review_text,
                "prediction": pred_label,
                "confidence": conf,
                "ground_truth": gt_label,
                "is_correct": is_correct,
                "exclamation_count": pred_item.get("exclamation_count", 0),
                "word_count": pred_item.get("word_count", 0),
                "signals": pred_item.get("signals", [])
            })
            
            # Record in monitor
            monitor.record_prediction(
                review_text=review_text,
                prediction=pred_label,
                confidence=conf,
                latency_ms=0.5
            )

        total_processed = len(df_proc)
        fake_percentage = round((fake_count / max(1, total_processed)) * 100, 2)
        avg_confidence = round(total_conf / max(1, total_processed), 4)

        # Ground truth evaluation metrics if label col provided
        acc, prec, rec, f1 = None, None, None, None
        if ground_truths and len(ground_truths) == len(predicted_labels):
            acc = round(float(accuracy_score(ground_truths, predicted_labels)), 4)
            prec = round(float(precision_score(ground_truths, predicted_labels, zero_division=0)), 4)
            rec = round(float(recall_score(ground_truths, predicted_labels, zero_division=0)), 4)
            f1 = round(float(f1_score(ground_truths, predicted_labels, zero_division=0)), 4)

        processing_time_ms = round((time.time() - start_time) * 1000, 2)

        summary = {
            "total_reviews": total_processed,
            "real_count": real_count,
            "fake_count": fake_count,
            "fake_percentage": fake_percentage,
            "avg_confidence": avg_confidence,
            "confidence_distribution": distribution,
            "accuracy": acc,
            "precision": prec,
            "recall": rec,
            "f1_score": f1,
            "empty_removed": empty_removed,
            "duplicates_found": duplicates_count
        }

        return {
            "summary": summary,
            "results": results_items,
            "model_version": getattr(self.model, "version", "v1.0"),
            "processing_time_ms": processing_time_ms
        }

ml_service = MLService()
