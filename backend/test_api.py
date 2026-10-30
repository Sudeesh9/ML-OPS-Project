import sys
import os

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(CURRENT_DIR)
sys.path.insert(0, os.path.join(PROJECT_ROOT, "backend"))

from fastapi.testclient import TestClient
from app.main import app

def run_tests():
    client = TestClient(app)
    
    print("[1/5] Testing GET /health...")
    res = client.get("/health")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    assert res.json()["status"] == "healthy"
    print("  -> Health OK:", res.json())
    
    print("\n[2/5] Testing GET /model-info...")
    res = client.get("/model-info")
    assert res.status_code == 200
    data = res.json()
    assert "model_name" in data
    print("  -> Model Info OK. Model Name:", data["model_name"])
    
    print("\n[3/5] Testing POST /predict (Real review)...")
    res = client.post("/predict", json={
        "review": "The battery life lasts about 24 hours on medium volume. The plastic headband feels slightly cheap but overall solid for the price."
    })
    assert res.status_code == 200
    pred = res.json()
    print("  -> Real Review Prediction:", pred["prediction"], "Confidence:", pred["confidence"])
    
    print("\n[4/5] Testing POST /predict (Fake review)...")
    res = client.post("/predict", json={
        "review": "BEST ITEM EVER IN THE WORLD BUY NOW BUY NOW 1000 STARS PERFECT UNBELIEVABLE WOW FREE GIFT!!!"
    })
    assert res.status_code == 200
    pred2 = res.json()
    print("  -> Fake Review Prediction:", pred2["prediction"], "Confidence:", pred2["confidence"])
    
    print("\n[5/6] Testing GET /metrics...")
    res = client.get("/metrics")
    assert res.status_code == 200
    metrics = res.json()
    print("  -> Metrics OK. Total Predictions:", metrics["total_predictions"])
    
    print("\n[6/7] Testing POST /predict-file with sample reviews...")
    sample_file_path = os.path.join(PROJECT_ROOT, "data", "reviews.csv")
    with open(sample_file_path, "rb") as f:
        res = client.post(
            "/predict-file",
            files={"file": ("reviews.csv", f, "text/csv")},
            data={"review_column": "review_text", "label_column": "label", "clean_empty": "true"}
        )
    assert res.status_code == 200, f"Predict file error: {res.text}"
    file_res = res.json()
    print("  -> File Prediction OK. Total Processed:", file_res["summary"]["total_reviews"])
    print("     Fake %:", file_res["summary"]["fake_percentage"])
    print("     Accuracy:", file_res["summary"]["accuracy"])
    
    print("\n[7/7] Testing Evidently AI endpoints (/evidently/status, /evidently/drift-summary, /evidently/drift-report)...")
    res_ev_status = client.get("/evidently/status")
    assert res_ev_status.status_code == 200
    print("  -> Evidently Status OK:", res_ev_status.json()["status"], "Version:", res_ev_status.json()["version"])
    
    res_ev_drift = client.get("/evidently/drift-summary")
    assert res_ev_drift.status_code == 200
    print("  -> Evidently Drift Summary OK. Drift Share:", res_ev_drift.json()["drift_share"])
    
    res_ev_html = client.get("/evidently/drift-report")
    assert res_ev_html.status_code == 200
    assert "html" in res_ev_html.headers.get("content-type", "").lower()
    print("  -> Evidently HTML Report OK. Byte length:", len(res_ev_html.content))

    print("\nALL BACKEND & EVIDENTLY API TESTS PASSED SUCCESSFULLY! [SUCCESS]")

if __name__ == "__main__":
    run_tests()
