import re
import html
from typing import Dict, Any, List, Tuple

# Suspicious high-frequency promotional n-grams often seen in incentivized/bot fake reviews
SUSPICIOUS_KEYWORDS = [
    "must buy", "best ever", "greatest ever", "miracle", "100% legit", "buy now", 
    "click buy", "flawless", "free product", "promotional", "in exchange for", 
    "gift card", "revolutionary", "best seller", "supreme", "life-changing", 
    "do not hesitate", "run to buy", "10/10 perfect", "magical", "1000% recommended"
]

# Genuine specificity indicators typically found in verified customer experiences
AUTHENTIC_INDICATORS = [
    "after testing", "weeks of use", "battery life", "customer support", "setup took", 
    "noise cancelling", "measured", "degrees", "celsius", "inches", "grams", 
    "firmware", "drawback", "however", "although", "minor issue", "sturdy", 
    "plastic housing", "cable was missing", "washable", "fit was slightly"
]

CONTRACTIONS = {
    "can't": "cannot",
    "won't": "will not",
    "n't": " not",
    "'re": " are",
    "'s": " is",
    "'d": " would",
    "'ll": " will",
    "'ve": " have",
    "'m": " am"
}

def expand_contractions(text: str) -> str:
    for contraction, expansion in CONTRACTIONS.items():
        text = text.replace(contraction, expansion)
    return text

def clean_text(text: str) -> str:
    """
    Cleans raw review text for NLP vectorization and model input.
    - Unescapes HTML
    - Strips URLs and email addresses
    - Expands common contractions
    - Strips excessive repeating characters (e.g. 'sooooo goooood' -> 'soo good')
    - Normalizes excessive whitespace
    """
    if not isinstance(text, str):
        return ""
    
    # Unescape HTML entities
    text = html.unescape(text)
    
    # Remove URLs
    text = re.sub(r'https?://\S+|www\.\S+', '', text)
    
    # Remove Email addresses
    text = re.sub(r'\S+@\S+', '', text)
    
    # Expand contractions
    text = expand_contractions(text.lower())
    
    # Replace excessive character repetitions (more than 2 identical chars reduced to 2)
    text = re.sub(r'(.)\1{2,}', r'\1\1', text)
    
    # Keep alphanumeric and basic punctuation
    text = re.sub(r'[^a-zA-Z0-9\s.,!?\'"\-]', ' ', text)
    
    # Normalize whitespaces
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def extract_linguistic_signals(raw_text: str) -> Tuple[List[Dict[str, str]], Dict[str, Any]]:
    """
    Extracts stylistic, punctuation, and keyword signals to provide explainability
    for the model's prediction.
    """
    if not raw_text or not isinstance(raw_text, str):
        return [], {"caps_ratio": 0.0, "exclamation_count": 0, "length": 0, "word_count": 0}

    total_len = len(raw_text)
    words = raw_text.split()
    word_count = len(words)
    exclamation_count = raw_text.count('!')
    question_count = raw_text.count('?')
    
    # Calculate ALL CAPS words (excluding single letters like 'I' or 'A')
    upper_words = [w for w in words if w.isupper() and len(w) > 1]
    caps_ratio = len(upper_words) / max(1, word_count)
    
    lower_text = raw_text.lower()
    
    signals = []
    
    # Check for excessive exclamation marks
    if exclamation_count >= 3:
        signals.append({
            "signal": "High Exclamation Density",
            "impact": "suspicious",
            "detail": f"{exclamation_count} exclamation marks detected, indicating exaggerated enthusiasm."
        })
    elif exclamation_count == 0 and word_count > 15:
        signals.append({
            "signal": "Calm Balanced Tone",
            "impact": "authentic",
            "detail": "No hyperbolic exclamation marks; factual and measured tone."
        })
        
    # Check for shouting / excessive caps
    if caps_ratio > 0.15:
        signals.append({
            "signal": "Capitalization Shouting",
            "impact": "suspicious",
            "detail": f"{round(caps_ratio * 100, 1)}% capitalized words ({', '.join(upper_words[:3])})."
        })
        
    # Check for suspicious promotional keywords
    found_suspicious = [kw for kw in SUSPICIOUS_KEYWORDS if kw in lower_text]
    if found_suspicious:
        signals.append({
            "signal": "Promotional Language",
            "impact": "suspicious",
            "detail": f"Matched promotional phrases: {', '.join(found_suspicious[:3])}"
        })
        
    # Check for authentic descriptive markers
    found_authentic = [ind for ind in AUTHENTIC_INDICATORS if ind in lower_text]
    if found_authentic:
        signals.append({
            "signal": "Specific Experience Details",
            "impact": "authentic",
            "detail": f"Contains descriptive nuance: {', '.join(found_authentic[:3])}"
        })
        
    # Length signal
    if word_count < 7:
        signals.append({
            "signal": "Vague / Ultra-short Text",
            "impact": "suspicious",
            "detail": f"Only {word_count} words; lacks substantive product experience."
        })
    elif 20 <= word_count <= 80:
        signals.append({
            "signal": "Substantive Review Length",
            "impact": "authentic",
            "detail": f"Well-developed review body of {word_count} words."
        })

    metrics = {
        "caps_ratio": round(caps_ratio, 3),
        "exclamation_count": exclamation_count,
        "question_count": question_count,
        "length": total_len,
        "word_count": word_count
    }
    
    return signals, metrics
