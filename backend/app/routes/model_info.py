from fastapi import APIRouter
from app.services.ml_service import ml_service

router = APIRouter(tags=["Model Info"])

@router.get("/model-info")
def get_model_information():
    """
    Returns architecture, hyperparameter, training, and BERT compatibility details
    of the active review classifier.
    """
    return ml_service.get_model_info()
