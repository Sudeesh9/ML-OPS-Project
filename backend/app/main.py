import os
import sys
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Ensure backend root is in sys.path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(CURRENT_DIR)
PROJECT_ROOT = os.path.dirname(BACKEND_DIR)

if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

# Ensure compatibility for evidently with pandas 3.x
try:
    import pandas.core.dtypes.common as _pd_common
    if not hasattr(_pd_common, "infer_dtype_from_object"):
        from pandas.api.types import infer_dtype
        _pd_common.infer_dtype_from_object = lambda val: (infer_dtype([val], skipna=False), None)
except Exception:
    pass

from app.routes import health, predict, model_info, metrics, evidently_routes
from app.services.ml_service import ml_service

app = FastAPI(
    title="Fake Review Detection API",
    description="Production-ready NLP & Machine Learning API for detecting authentic vs suspicious/fake customer reviews with MLOps tracking.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(health.router)
app.include_router(predict.router)
app.include_router(model_info.router)
app.include_router(metrics.router)
app.include_router(evidently_routes.router)

FRONTEND_DIST = os.path.join(PROJECT_ROOT, "frontend", "dist")

if os.path.exists(FRONTEND_DIST) and os.path.exists(os.path.join(FRONTEND_DIST, "index.html")):
    from fastapi.staticfiles import StaticFiles
    from fastapi.responses import FileResponse

    assets_dir = os.path.join(FRONTEND_DIST, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/")
    def serve_frontend_index():
        return FileResponse(os.path.join(FRONTEND_DIST, "index.html"))

    @app.get("/{full_path:path}")
    async def serve_spa_routes(full_path: str):
        if full_path in ["health", "docs", "redoc", "openapi.json", "metrics", "model-info"]:
            return {"error": "Not Found"}
        target_file = os.path.join(FRONTEND_DIST, full_path)
        if os.path.isfile(target_file):
            return FileResponse(target_file)
        return FileResponse(os.path.join(FRONTEND_DIST, "index.html"))
else:
    @app.get("/")
    def read_root():
        return {
            "system": "Fake Review Detection System",
            "status": "online",
            "documentation": "/docs",
            "health": "/health",
            "metrics": "/metrics",
            "model_info": "/model-info",
            "evidently_drift_summary": "/evidently/drift-summary",
            "evidently_drift_report": "/evidently/drift-report",
            "disclaimer": "Predictions are model-generated estimates and should not be treated as definitive proof of review authenticity."
        }

@app.on_event("startup")
def startup_event():
    print("Initializing Fake Review Detection System...")
    # Pre-warm model
    try:
        dummy = ml_service.predict_single("Preheating model pipeline with initial sample review.")
        print(f"Model pre-warmed successfully. Active model version: {dummy.get('model_version')}")
    except Exception as e:
        print(f"Startup warning during model initialization: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
