import time
from collections import deque
from datetime import datetime
from typing import Dict, Any, List

class MonitorService:
    def __init__(self, max_recent: int = 50):
        self.start_time = time.time()
        self.total_predictions = 0
        self.fake_predictions = 0
        self.real_predictions = 0
        self.total_latency_ms = 0.0
        self.total_confidence = 0.0
        self.recent_logs = deque(maxlen=max_recent)

    def record_prediction(self, review_text: str, prediction: str, confidence: float, latency_ms: float):
        self.total_predictions += 1
        if prediction == "Fake":
            self.fake_predictions += 1
        else:
            self.real_predictions += 1
            
        self.total_latency_ms += latency_ms
        self.total_confidence += confidence
        
        snippet = (review_text[:60] + "...") if len(review_text) > 60 else review_text
        self.recent_logs.appendleft({
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "review_snippet": snippet,
            "prediction": prediction,
            "confidence": round(confidence, 4),
            "latency_ms": round(latency_ms, 2)
        })

    def get_metrics(self) -> Dict[str, Any]:
        uptime = round(time.time() - self.start_time, 1)
        avg_latency = round(self.total_latency_ms / max(1, self.total_predictions), 2)
        avg_confidence = round(self.total_confidence / max(1, self.total_predictions), 4)
        fake_rate = round((self.fake_predictions / max(1, self.total_predictions)) * 100, 2)
        
        return {
            "total_predictions": self.total_predictions,
            "fake_predictions": self.fake_predictions,
            "real_predictions": self.real_predictions,
            "fake_rate_percentage": fake_rate,
            "avg_confidence": avg_confidence,
            "avg_latency_ms": avg_latency,
            "uptime_seconds": uptime,
            "recent_activity": list(self.recent_logs)
        }

monitor = MonitorService()
