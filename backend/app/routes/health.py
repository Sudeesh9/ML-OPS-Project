from fastapi import APIRouter
from datetime import datetime
import os

router = APIRouter(tags=["Health"])

@router.get("/health")
def get_health():
    model_exists = os.path.exists(os.path.join(os.path.dirname(__file__), "..", "..", "..", "model", "model.joblib"))
    return {
        "status": "healthy",
        "service": "fake-review-detection-api",
        "version": "1.0.0",
        "model_loaded": model_exists,
        "timestamp": datetime.now().isoformat()
    }
