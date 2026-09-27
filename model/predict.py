"""
Model Inference Layer for Fake Review Detection.
Provides a clean, modular abstraction (BaseModelClassifier) allowing
seamless hot-swapping between the TF-IDF / NLP Classifier and a Hugging Face
Transformer / BERT model.
"""

import os
import json
import time
from abc import ABC, abstractmethod
from typing import Dict, Any, List, Tuple
import joblib

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
CONFIG_PATH = os.path.join(CURRENT_DIR, "model_config.json")
MODEL_PATH = os.path.join(CURRENT_DIR, "model.joblib")

from app.preprocessing.text_cleaner import clean_text, extract_linguistic_signals

class BaseModelClassifier(ABC):
    """Abstract Base Class for review authenticity models."""
    
    @abstractmethod
    def predict_single(self, text: str) -> Dict[str, Any]:
        """Predict whether a single review is Real or Fake with confidence."""
        pass
    
    @abstractmethod
    def predict_batch(self, texts: List[str]) -> List[Dict[str, Any]]:
        """Predict a batch of reviews."""
        pass

class SklearnNLPClassifier(BaseModelClassifier):
    """
    NLP Pipeline classifier using TF-IDF and Calibrated Logistic Regression.
    Extracts linguistic cues and probability estimations.
    """
    def __init__(self, model_file: str = MODEL_PATH):
        self.model_file = model_file
        self.pipeline = None
        self.version = "v1.0"
        self._load_model()

    def _load_model(self):
        if os.path.exists(self.model_file):
            try:
                self.pipeline = joblib.load(self.model_file)
            except Exception as e:
                print(f"Warning: Could not load model from {self.model_file}: {e}")
                self.pipeline = None
        else:
            self.pipeline = None

    def predict_single(self, text: str) -> Dict[str, Any]:
        start_time = time.time()
        signals, metrics = extract_linguistic_signals(text)
        cleaned = clean_text(text)
        
        # If pipeline is loaded, predict using trained ML model
        if self.pipeline is not None:
            # Predict probabilities
            probs = self.pipeline.predict_proba([cleaned])[0]
            # classes_ typically [0, 1] where 0=Real, 1=Fake
            prob_real = float(probs[0])
            prob_fake = float(probs[1])
        else:
            # Fallback heuristic if model file hasn't been generated yet
            suspicious_count = sum(1 for s in signals if s.get("impact") == "suspicious")
            authentic_count = sum(1 for s in signals if s.get("impact") == "authentic")
            if suspicious_count > authentic_count:
                prob_fake = min(0.95, 0.60 + 0.10 * suspicious_count)
                prob_real = 1.0 - prob_fake
            else:
                prob_real = min(0.96, 0.65 + 0.08 * authentic_count)
                prob_fake = 1.0 - prob_real

        # Binary decision threshold at 0.50
        if prob_fake >= prob_real:
            prediction = "Fake"
            confidence = round(prob_fake, 4)
        else:
            prediction = "Real"
            confidence = round(prob_real, 4)

        latency_ms = round((time.time() - start_time) * 1000, 2)
        
        return {
            "prediction": prediction,
            "confidence": confidence,
            "probabilities": {
                "Real": round(prob_real, 4),
                "Fake": round(prob_fake, 4)
            },
            "signals": signals,
            "metrics": metrics,
            "latency_ms": latency_ms,
            "model_version": self.version
        }

    def predict_batch(self, texts: List[str]) -> List[Dict[str, Any]]:
        cleaned_list = [clean_text(t) for t in texts]
        results = []
        
        if self.pipeline is not None and len(texts) > 0:
            probs = self.pipeline.predict_proba(cleaned_list)
            for i, text in enumerate(texts):
                prob_real = float(probs[i][0])
                prob_fake = float(probs[i][1])
                signals, metrics = extract_linguistic_signals(text)
                
                if prob_fake >= prob_real:
                    pred = "Fake"
                    conf = round(prob_fake, 4)
                else:
                    pred = "Real"
                    conf = round(prob_real, 4)
                    
                results.append({
                    "prediction": pred,
                    "confidence": conf,
                    "probabilities": {"Real": round(prob_real, 4), "Fake": round(prob_fake, 4)},
                    "signals": [s["signal"] for s in signals],
                    "exclamation_count": metrics.get("exclamation_count", 0),
                    "word_count": metrics.get("word_count", 0)
                })
        else:
            for text in texts:
                res = self.predict_single(text)
                results.append({
                    "prediction": res["prediction"],
                    "confidence": res["confidence"],
                    "probabilities": res["probabilities"],
                    "signals": [s["signal"] for s in res["signals"]],
                    "exclamation_count": res["metrics"].get("exclamation_count", 0),
                    "word_count": res["metrics"].get("word_count", 0)
                })
                
        return results

class TransformerBERTClassifier(BaseModelClassifier):
    """
    BERT / Transformer Interface for Fake Review Classification.
    This class can be populated with AutoTokenizer and AutoModelForSequenceClassification
    from Hugging Face transformers when trained weights are supplied.
    """
    def __init__(self, model_name_or_path: str = "bert-base-uncased"):
        self.model_name_or_path = model_name_or_path
        self.version = "v2.0-bert-ready"
        self.is_loaded = False
        self._init_transformer()

    def _init_transformer(self):
        # Graceful placeholder: checks if transformers & torch are installed and weights exist
        try:
            from transformers import AutoTokenizer, AutoModelForSequenceClassification
            # If path exists or local checkpoint
            if os.path.exists(self.model_name_or_path):
                self.tokenizer = AutoTokenizer.from_pretrained(self.model_name_or_path)
                self.model = AutoModelForSequenceClassification.from_pretrained(self.model_name_or_path)
                self.is_loaded = True
            else:
                self.is_loaded = False
        except ImportError:
            self.is_loaded = False

    def predict_single(self, text: str) -> Dict[str, Any]:
        if not self.is_loaded:
            # Fall back cleanly to NLP classifier if weights not yet downloaded
            nlp = SklearnNLPClassifier()
            res = nlp.predict_single(text)
            res["model_version"] = "v2.0-bert-fallback"
            return res
        
        # When loaded, standard transformer forward pass:
        # inputs = self.tokenizer(text, return_tensors="pt", truncation=True, max_length=256)
        # outputs = self.model(**inputs)
        # ...
        pass

    def predict_batch(self, texts: List[str]) -> List[Dict[str, Any]]:
        if not self.is_loaded:
            nlp = SklearnNLPClassifier()
            return nlp.predict_batch(texts)
        pass

# Global Singleton instance
_model_instance = None

def get_model(reload: bool = False) -> BaseModelClassifier:
    global _model_instance
    if _model_instance is None or reload:
        # Check config to decide model class
        model_type = "tfidf"
        if os.path.exists(CONFIG_PATH):
            try:
                with open(CONFIG_PATH, "r") as f:
                    cfg = json.load(f)
                    model_type = cfg.get("model_type", "tfidf")
            except Exception:
                pass
                
        if model_type == "bert":
            _model_instance = TransformerBERTClassifier()
        else:
            _model_instance = SklearnNLPClassifier()
            
    return _model_instance
