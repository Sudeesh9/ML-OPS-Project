from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class SingleReviewRequest(BaseModel):
    review: str = Field(..., min_length=1, description="Customer review text to evaluate")

class SignalFeature(BaseModel):
    signal: str
    impact: str  # 'suspicious', 'authentic', 'neutral'
    detail: str

class SingleReviewResponse(BaseModel):
    prediction: str = Field(..., description="'Fake' or 'Real'")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Model prediction confidence score")
    probabilities: Dict[str, float] = Field(..., description="Probability breakdown for Real and Fake")
    model_version: str = Field(..., description="Active model release version")
    latency_ms: float = Field(..., description="Inference latency in milliseconds")
    timestamp: str = Field(..., description="ISO 8601 prediction timestamp")
    features: List[SignalFeature] = Field(default_factory=list, description="Linguistic and stylistic cues extracted from text")
    safety_disclaimer: str = Field(
        default="Predictions are model-generated estimates and should not be treated as definitive proof of review authenticity."
    )

class ReviewPredictionItem(BaseModel):
    row_id: int
    review: str
    prediction: str
    confidence: float
    ground_truth: Optional[str] = None
    is_correct: Optional[bool] = None
    exclamation_count: int = 0
    word_count: int = 0
    signals: List[str] = Field(default_factory=list)

class ConfidenceDistribution(BaseModel):
    range_50_60: int = 0
    range_60_70: int = 0
    range_70_80: int = 0
    range_80_90: int = 0
    range_90_100: int = 0

class DatasetSummary(BaseModel):
    total_reviews: int
    real_count: int
    fake_count: int
    fake_percentage: float
    avg_confidence: float
    confidence_distribution: Dict[str, int]
    accuracy: Optional[float] = None
    precision: Optional[float] = None
    recall: Optional[float] = None
    f1_score: Optional[float] = None
    empty_removed: int = 0
    duplicates_found: int = 0

class DatasetPredictionResponse(BaseModel):
    filename: str
    review_column: str
    label_column: Optional[str] = None
    summary: DatasetSummary
    results: List[ReviewPredictionItem]
    model_version: str
    processing_time_ms: float

class ModelInfoResponse(BaseModel):
    model_name: str
    version: str
    framework: str
    task: str
    status: str
    algorithm: str
    vocabulary_size: int
    training_samples: int
    bert_compatible: bool
    pipeline_steps: List[str]
    last_trained: str
    hyperparameters: Dict[str, Any]

class RecentPredictionLog(BaseModel):
    timestamp: str
    review_snippet: str
    prediction: str
    confidence: float
    latency_ms: float

class SystemMetricsResponse(BaseModel):
    total_predictions: int
    fake_predictions: int
    real_predictions: int
    fake_rate_percentage: float
    avg_confidence: float
    avg_latency_ms: float
    uptime_seconds: float
    recent_activity: List[RecentPredictionLog]
