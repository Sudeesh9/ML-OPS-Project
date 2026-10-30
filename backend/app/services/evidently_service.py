import os
import re
from datetime import datetime
from typing import Dict, Any, Optional, List
import pandas as pd

from evidently import Report
from evidently.presets import DataDriftPreset, DataSummaryPreset

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(CURRENT_DIR)))
DEFAULT_DATA_PATH = os.path.join(PROJECT_ROOT, "data", "reviews.csv")

class EvidentlyService:
    def __init__(self, data_path: str = DEFAULT_DATA_PATH):
        self.data_path = data_path
        self._cached_html: Optional[str] = None
        self._cached_summary: Optional[Dict[str, Any]] = None
        self._last_generated: Optional[str] = None

    def load_reference_dataset(self) -> pd.DataFrame:
        """Loads baseline reference dataset tracked by DVC/MLOps."""
        if not os.path.exists(self.data_path):
            raise FileNotFoundError(f"Reference dataset not found at {self.data_path}")
        return pd.read_csv(self.data_path)

    def extract_nlp_features(self, df: pd.DataFrame, review_col: str = "review_text") -> pd.DataFrame:
        """
        Extracts structural and stylistic NLP attributes for statistical drift tracking.
        """
        enriched = df.copy()
        if review_col not in enriched.columns:
            # Fall back to first text-like column
            text_cols = [c for c in enriched.columns if enriched[c].dtype == object]
            review_col = text_cols[0] if text_cols else enriched.columns[0]

        texts = enriched[review_col].fillna("").astype(str)
        enriched["char_length"] = texts.apply(len)
        enriched["word_count"] = texts.apply(lambda t: len(t.split()))
        enriched["exclamation_count"] = texts.apply(lambda t: t.count("!"))
        enriched["caps_ratio"] = texts.apply(lambda t: round(sum(1 for c in t if c.isupper()) / max(1, len(t)), 4))
        
        return enriched

    def run_drift_analysis(
        self, 
        current_df: Optional[pd.DataFrame] = None, 
        review_col: str = "review_text"
    ) -> Dict[str, Any]:
        """
        Runs Evidently AI Data Drift analysis between reference baseline and current reviews.
        """
        ref_df = self.load_reference_dataset()

        # If no current dataset provided, compare held-out / second half as live sample
        if current_df is None or current_df.empty:
            half = len(ref_df) // 2
            ref_data = ref_df.iloc[:half].copy()
            curr_data = ref_df.iloc[half:].copy()
        else:
            ref_data = ref_df.copy()
            curr_data = current_df.copy()

        # Enrich with NLP features
        ref_enriched = self.extract_nlp_features(ref_data, review_col="review_text" if "review_text" in ref_data.columns else ref_data.columns[1])
        curr_enriched = self.extract_nlp_features(curr_data, review_col=review_col)

        # Select common feature columns for statistical drift testing
        common_features = [
            c for c in ["char_length", "word_count", "exclamation_count", "caps_ratio", "rating", "label"]
            if c in ref_enriched.columns and c in curr_enriched.columns
        ]

        if not common_features:
            common_features = ["char_length", "word_count", "exclamation_count", "caps_ratio"]

        ref_features = ref_enriched[common_features]
        curr_features = curr_enriched[common_features]

        # Execute Evidently AI Report
        report = Report([DataDriftPreset()])
        snapshot = report.run(reference_data=ref_features, current_data=curr_features)

        # Generate HTML report string
        html_str = snapshot.get_html_str(as_iframe=False)
        self._cached_html = html_str

        # Parse metrics from snapshot dict
        metrics_dict = snapshot.dict().get("metrics", [])
        drift_share = 0.0
        drifted_count = 0
        total_columns = len(common_features)
        column_drifts = []

        for m in metrics_dict:
            metric_name = m.get("metric_name", "")
            val = m.get("value")

            if "DriftedColumnsCount" in metric_name and isinstance(val, dict):
                drift_share = float(val.get("share", 0.0))
                drifted_count = int(val.get("count", 0))
            elif "ValueDrift" in metric_name:
                # Extract column name, method, threshold
                col_match = re.search(r"column=([^,)]+)", metric_name)
                method_match = re.search(r"method=([^,)]+)", metric_name)
                thresh_match = re.search(r"threshold=([^,)]+)", metric_name)

                col_name = col_match.group(1) if col_match else "unknown"
                method = method_match.group(1) if method_match else "Statistical Test"
                threshold = float(thresh_match.group(1)) if thresh_match else 0.05
                p_val = float(val) if val is not None else 1.0

                is_drifted = p_val < threshold if threshold <= 0.5 else p_val > threshold

                column_drifts.append({
                    "column": col_name,
                    "drift_detected": is_drifted,
                    "p_value_or_score": round(p_val, 6),
                    "threshold": threshold,
                    "method": method
                })

        summary = {
            "status": "success",
            "dataset_drift_detected": drift_share > 0.5,
            "drift_share": round(drift_share, 4),
            "drift_share_percentage": round(drift_share * 100, 2),
            "drifted_features_count": drifted_count,
            "total_features_evaluated": total_columns,
            "features_evaluated": common_features,
            "column_drift_details": column_drifts,
            "reference_sample_count": len(ref_features),
            "current_sample_count": len(curr_features),
            "timestamp": datetime.now().isoformat()
        }

        self._cached_summary = summary
        self._last_generated = summary["timestamp"]
        return summary

    def get_cached_html(self) -> str:
        """Returns the pre-computed Evidently HTML report, generating one if not cached."""
        if not self._cached_html:
            self.run_drift_analysis()
        return self._cached_html or "<html><body><h3>Evidently AI report unavailable.</h3></body></html>"

    def get_summary(self) -> Dict[str, Any]:
        """Returns drift summary statistics, running drift check if necessary."""
        if not self._cached_summary:
            return self.run_drift_analysis()
        return self._cached_summary

evidently_service = EvidentlyService()
