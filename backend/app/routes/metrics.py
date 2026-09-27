import os
import json
from fastapi import APIRouter, Response, Request
from app.services.monitor_service import monitor
from app.models.schemas import SystemMetricsResponse

router = APIRouter(tags=["Metrics & MLOps"])

MODEL_CONFIG_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "..", "model", "model_config.json")
DVC_YAML_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "..", "dvc.yaml")

@router.get("/metrics")
def get_system_metrics(request: Request, format: str = "json"):
    """
    Returns real-time prediction metrics and latency statistics.
    Supports JSON output as well as Prometheus exposition format (?format=prometheus).
    """
    data = monitor.get_metrics()
    
    # Check if Prometheus format requested
    accept = request.headers.get("accept", "")
    if format == "prometheus" or "text/plain" in accept:
        prom_lines = [
            "# HELP fake_review_total_predictions Total number of predictions served",
            "# TYPE fake_review_total_predictions counter",
            f"fake_review_total_predictions {data['total_predictions']}",
            "",
            "# HELP fake_review_fake_predictions Number of reviews classified as Fake",
            "# TYPE fake_review_fake_predictions counter",
            f"fake_review_fake_predictions {data['fake_predictions']}",
            "",
            "# HELP fake_review_real_predictions Number of reviews classified as Real",
            "# TYPE fake_review_real_predictions counter",
            f"fake_review_real_predictions {data['real_predictions']}",
            "",
            "# HELP fake_review_avg_latency_ms Average inference latency in milliseconds",
            "# TYPE fake_review_avg_latency_ms gauge",
            f"fake_review_avg_latency_ms {data['avg_latency_ms']}",
            "",
            "# HELP fake_review_avg_confidence Average prediction confidence score",
            "# TYPE fake_review_avg_confidence gauge",
            f"fake_review_avg_confidence {data['avg_confidence']}",
            "",
            "# HELP fake_review_uptime_seconds Application uptime in seconds",
            "# TYPE fake_review_uptime_seconds gauge",
            f"fake_review_uptime_seconds {data['uptime_seconds']}"
        ]
        return Response(content="\n".join(prom_lines), media_type="text/plain; version=0.0.4")
        
    return data

@router.get("/mlops-info")
def get_mlops_info():
    """
    Returns MLOps tracking metadata including MLflow experiments, DVC tracking,
    and model versioning.
    """
    model_cfg = {}
    if os.path.exists(MODEL_CONFIG_PATH):
        try:
            with open(MODEL_CONFIG_PATH, "r") as f:
                model_cfg = json.load(f)
        except Exception:
            pass

    dvc_configured = os.path.exists(DVC_YAML_PATH)

    return {
        "mlflow": {
            "experiment_name": model_cfg.get("mlflow", {}).get("experiment_name", "fake-review-detection"),
            "run_id": model_cfg.get("mlflow", {}).get("run_id", "local-run"),
            "status": "Active" if model_cfg.get("mlflow", {}).get("enabled") else "Configured",
            "artifact_store": "mlruns/"
        },
        "dvc": {
            "configured": dvc_configured,
            "pipeline_stages": ["preprocess", "train", "evaluate"],
            "tracked_dataset": "data/reviews.csv",
            "dataset_version": model_cfg.get("dvc", {}).get("version", "v1.0")
        },
        "model_versioning": {
            "active_version": model_cfg.get("version", "v1.0"),
            "model_type": model_cfg.get("algorithm", "TF-IDF + Calibrated Logistic Regression"),
            "framework": model_cfg.get("framework", "Scikit-learn / NLP"),
            "bert_ready": model_cfg.get("bert_compatible", True)
        },
        "ci_cd": {
            "provider": "GitHub Actions",
            "workflow_file": ".github/workflows/ci.yml",
            "pipeline_steps": [
                "Setup Python & Node.js",
                "Install Backend & Frontend Dependencies",
                "Execute Backend Unit & Model Tests",
                "Build React Frontend Production Bundle",
                "Build & Verify Docker Containers"
            ]
        }
    }
