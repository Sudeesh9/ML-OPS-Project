import io
import os
import pandas as pd
from typing import Optional
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse

from app.models.schemas import (
    SingleReviewRequest,
    SingleReviewResponse,
    DatasetPredictionResponse
)
from app.services.ml_service import ml_service

router = APIRouter(tags=["Prediction"])

SAMPLE_DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "..", "data", "reviews.csv")

@router.post("/predict", response_model=SingleReviewResponse)
def predict_single_review(request: SingleReviewRequest):
    """
    Evaluates a single customer review and determines whether it is Real or Fake
    with confidence and extracted linguistic signals.
    """
    if not request.review or not request.review.strip():
        raise HTTPException(status_code=400, detail="Review text cannot be empty.")
    
    return ml_service.predict_single(request.review)

@router.post("/preview-file")
async def preview_dataset(file: UploadFile = File(...)):
    """
    Parses an uploaded CSV or XLSX file and returns column names, row count,
    file size, and a preview of the first 10 rows.
    """
    filename = file.filename or "uploaded_data.csv"
    contents = await file.read()
    file_size_kb = round(len(contents) / 1024, 2)

    try:
        if filename.endswith(".csv"):
            df = pd.read_csv(io.BytesIO(contents))
        elif filename.endswith((".xlsx", ".xls")):
            df = pd.read_excel(io.BytesIO(contents))
        else:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file format '{filename}'. Please upload a .csv or .xlsx file."
            )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse uploaded file: {str(e)}")

    if df.empty:
        raise HTTPException(status_code=400, detail="Uploaded file contains no data.")

    # Calculate validation flags
    null_counts = df.isnull().sum().to_dict()
    columns = list(df.columns)
    
    # Try guessing the review column
    potential_review_cols = [c for c in columns if any(kw in c.lower() for kw in ["review", "text", "comment", "feedback", "content"])]
    default_review_col = potential_review_cols[0] if potential_review_cols else (columns[0] if columns else "")

    # Try guessing the label column
    potential_label_cols = [c for c in columns if any(kw in c.lower() for kw in ["label", "target", "class", "is_fake", "category"])]
    default_label_col = potential_label_cols[0] if potential_label_cols else None

    # First 10 rows preview
    preview_rows = df.head(10).fillna("").to_dict(orient="records")

    return {
        "filename": filename,
        "file_size_kb": file_size_kb,
        "total_rows": len(df),
        "total_columns": len(columns),
        "columns": columns,
        "suggested_review_column": default_review_col,
        "suggested_label_column": default_label_col,
        "missing_counts": null_counts,
        "preview_rows": preview_rows
    }

@router.post("/predict-file", response_model=DatasetPredictionResponse)
async def predict_file(
    file: UploadFile = File(...),
    review_column: str = Form(...),
    label_column: Optional[str] = Form(None),
    clean_empty: bool = Form(True)
):
    """
    Processes an uploaded dataset file (CSV/XLSX), runs inference on the selected review column,
    and returns predictions, metrics, and distribution analytics.
    """
    filename = file.filename or "dataset.csv"
    contents = await file.read()

    try:
        if filename.endswith(".csv"):
            df = pd.read_csv(io.BytesIO(contents))
        elif filename.endswith((".xlsx", ".xls")):
            df = pd.read_excel(io.BytesIO(contents))
        else:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file format '{filename}'. Please upload a .csv or .xlsx file."
            )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read file: {str(e)}")

    if review_column not in df.columns:
        raise HTTPException(
            status_code=400,
            detail=f"Selected review column '{review_column}' does not exist in dataset. Available: {list(df.columns)}"
        )

    if label_column and label_column not in df.columns:
        label_column = None  # Ignore non-existent label column

    try:
        result = ml_service.predict_dataset(
            df=df,
            review_col=review_column,
            label_col=label_column,
            clean_empty=clean_empty
        )
        return {
            "filename": filename,
            "review_column": review_column,
            "label_column": label_column,
            "summary": result["summary"],
            "results": result["results"],
            "model_version": result["model_version"],
            "processing_time_ms": result["processing_time_ms"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@router.get("/sample-file")
def get_sample_dataset():
    """
    Downloads the bundled sample dataset for quick testing.
    """
    if os.path.exists(SAMPLE_DATA_PATH):
        return FileResponse(
            SAMPLE_DATA_PATH,
            media_type="text/csv",
            filename="sample_reviews.csv"
        )
    raise HTTPException(status_code=404, detail="Sample dataset not found.")
