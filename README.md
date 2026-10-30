# Fake Review Detection System (MLOps Powered)

[![CI Pipeline](https://github.com/example/fake-review-detection/actions/workflows/ci.yml/badge.svg)](https://github.com/example/fake-review-detection/actions)
[![Python 3.12](https://img.shields.io/badge/python-3.12-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18+-61DAFB.svg)](https://reactjs.org/)
[![DVC](https://img.shields.io/badge/DVC-Data%20Versioning-945DD6.svg)](https://dvc.org/)
[![MLflow](https://img.shields.io/badge/MLflow-Tracking-0194E2.svg)](https://mlflow.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg)](https://www.docker.com/)

An enterprise-grade, modern web application that detects whether customer reviews are **REAL or FAKE** using Machine Learning and demonstrates an end-to-end **MLOps workflow** (Data Versioning, Experiment Tracking, CI/CD, Containerization, and Model Monitoring).

Designed specifically for college capstone demonstrations, technical portfolios, and production deployment.

---

## 📑 Table of Contents

- [1. Project Overview](#1-project-overview)
- [2. Key Features](#2-key-features)
- [3. System Architecture](#3-system-architecture)
- [4. Technology Stack](#4-technology-stack)
- [5. Project Folder Structure](#5-project-folder-structure)
- [6. Installation & Quick Start](#6-installation--quick-start)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [7. ML Model & NLP Pipeline](#7-ml-model--nlp-pipeline)
  - [Training & Evaluation](#training--evaluation)
  - [Hugging Face BERT / Transformer Plug-in](#hugging-face-bert--transformer-plug-in)
- [8. MLOps Components](#8-mlops-components)
  - [DVC Data Versioning](#dvc-data-versioning)
  - [MLflow Experiment Tracking](#mlflow-experiment-tracking)
  - [Real-Time Monitoring & Prometheus Metrics](#real-time-monitoring--prometheus-metrics)
- [9. Docker & Containerization](#9-docker--containerization)
- [10. CI/CD with GitHub Actions](#10-cicd-with-github-actions)
- [11. API Documentation](#11-api-documentation)
- [12. Model Safety & Disclaimer](#12-model-safety--disclaimer)

---

## 1. Project Overview

Customer reviews heavily influence purchasing decisions, leading to widespread manipulation by bot networks, paid incentivized reviewers, and spam campaigns. 

This **Fake Review Detection System** provides:
1. **Interactive Batch Dataset Upload & Prediction**: Upload CSV or XLSX datasets, select columns, filter invalid/empty reviews, and execute batch NLP predictions.
2. **Instant Single-Review Tester**: Paste any customer review with immediate probability scoring and linguistic signal extraction.
3. **Comprehensive Visual Dashboard**: Interactive Recharts donut charts, distribution bars, and paginated review tables with 🟢 REAL and 🔴 FAKE badges.
4. **End-to-End MLOps Pipeline**: Reproducible dataset versioning using **DVC**, experiment tracking via **MLflow**, automated testing via **GitHub Actions CI**, and container orchestration with **Docker Compose**.

---

## 2. Key Features

- **NLP Preprocessing Engine**: HTML unescaping, contraction expansion (`can't` → `cannot`), punctuation profiling, and token sanitization.
- **Explainability & Linguistic Signals**: Highlights excessive exclamation marks, ALL-CAPS shouting, promotional hype clichés, and lack of specific experiential details.
- **Modular Model Interface**: Built with `BaseModelClassifier` abstraction; effortlessly swap between the scikit-learn TF-IDF model and a fine-tuned Hugging Face BERT model.
- **Dataset Validation**: Detects and cleans empty reviews, warns of duplicate entries, and validates ground-truth accuracy if a label column is provided.
- **CSV Result Export**: Download prediction results with full confidence scores and extracted stylistic flags.
- **Dark/Light Mode**: Full responsive theme toggle designed with modern AI aesthetics.

---

## 3. System Architecture

```text
                USER / CLIENT
                      │
                      ▼
            React Web Application (Vite + Tailwind CSS)
                      │
                      ▼
            FastAPI Backend Gateway (Port 8000)
                      │
        ┌─────────────┴─────────────┐
        ▼                           ▼
  NLP Preprocessing            ML Model Inference
  (Text cleaning & cues)      (TF-IDF + Calibrated Classifier)
                                    │
                                    ▼
                             Fake / Real Score
                                    │
             ┌──────────────────────┼──────────────────────┐
             ▼                      ▼                      ▼
          MLflow                   DVC                 Monitoring
    Experiment Tracking     Dataset Versioning       Runtime Metrics
     (Runs & Metrics)        (dvc.yaml pipeline)   (Prometheus & Logs)
```

---

## 4. Technology Stack

### Frontend
- **Framework**: React 18 (Vite build tool)
- **Styling**: Tailwind CSS with custom glassmorphism and dark mode
- **Charts**: Recharts (Pie/Donut, Distribution Bar, Confidence Histogram)
- **Icons**: Lucide React

### Backend & ML
- **API Framework**: FastAPI, Uvicorn, Starlette
- **Data Validation**: Pydantic v2
- **Data Processing**: Pandas, OpenPyXL
- **Machine Learning**: Scikit-Learn, Joblib, NumPy
- **Experiment Tracking**: MLflow
- **Data Versioning**: DVC (Data Version Control)

### DevOps & Infrastructure
- **Containerization**: Docker, Docker Compose
- **CI/CD**: GitHub Actions (`.github/workflows/ci.yml`)

---

## 5. Project Folder Structure

```text
fake-review-detection/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   └── ReviewDetailModal.jsx
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── DatasetAnalysisPage.jsx
│   │   │   ├── SingleReviewPage.jsx
│   │   │   ├── MlopsDashboardPage.jsx
│   │   │   └── ArchitecturePage.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── Dockerfile
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── routes/
│   │   │   ├── health.py
│   │   │   ├── predict.py
│   │   │   ├── model_info.py
│   │   │   └── metrics.py
│   │   ├── services/
│   │   │   ├── ml_service.py
│   │   │   └── monitor_service.py
│   │   ├── models/
│   │   │   └── schemas.py
│   │   └── preprocessing/
│   │       └── text_cleaner.py
│   ├── test_api.py
│   ├── requirements.txt
│   └── Dockerfile
│
├── model/
│   ├── train.py
│   ├── predict.py
│   ├── model.joblib
│   └── model_config.json
│
├── data/
│   └── reviews.csv
│
├── dvc.yaml
├── params.yaml
├── Dockerfile
├── docker-compose.yml
├── .gitignore
├── README.md
│
└── .github/
    └── workflows/
        └── ci.yml
```

---

## 6. Installation & Quick Start

### Prerequisites
- Python 3.10+ (tested on Python 3.12)
- Node.js 18+ and npm
- Git

### Backend Setup

1. Open a terminal in the project directory:
```bash
cd backend
```

2. Create and activate a virtual environment (optional but recommended):
```bash
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate
```

3. Install required Python packages:
```bash
pip install -r requirements.txt
```

4. Train the baseline model and initialize configuration:
```bash
python ../model/train.py
```

5. Launch the FastAPI server:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
- API will be live at: `http://localhost:8000`
- Interactive Swagger docs at: `http://localhost:8000/docs`

---

### Frontend Setup

1. Open a new terminal and navigate to `frontend`:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the Vite development server:
```bash
npm run dev
```
- Frontend will be live at: `http://localhost:3000`

---

## 7. ML Model & NLP Pipeline

### Pipeline Architecture
$$\text{Raw Review Text} \longrightarrow \text{Text Cleaning} \longrightarrow \text{Sublinear TF-IDF (1,2-grams)} \longrightarrow \text{Calibrated Classifier} \longrightarrow \text{Fake/Real Prediction}$$

### Training & Evaluation
To retrain the model and evaluate against held-out test data:
```bash
python model/train.py
```
This script computes authentic scikit-learn metrics (Accuracy, Precision, Recall, F1, ROC-AUC) without fabrication and logs them directly to `model/model_config.json` and MLflow.

### Hugging Face BERT / Transformer Plug-in
The inference layer in `model/predict.py` implements `BaseModelClassifier`. To upgrade to BERT:
1. Save fine-tuned BERT weights into `model/weights/`.
2. Update `model/model_config.json`:
```json
{
  "model_type": "bert"
}
```
3. The system will automatically instantiate `TransformerBERTClassifier` without modifying any API or frontend code.

---

## 8. MLOps Components

### DVC Data Versioning
The dataset pipeline is declared in `dvc.yaml`:
```bash
# Initialize DVC
dvc init

# Track the dataset
dvc add data/reviews.csv

# Execute reproducible pipeline
dvc repro
```

### MLflow Experiment Tracking
Experiments, hyperparameters, and artifacts are logged during training runs:
```bash
# Launch the MLflow Web UI
mlflow ui --port 5000
```
Open `http://localhost:5000` to visualize run comparisons, loss curves, and artifact files.

### Real-Time Monitoring & Prometheus Metrics
The backend tracks real-time prediction volume, latency, and fake/real distribution:
- JSON format: `GET /metrics`
- Prometheus exposition format: `GET /metrics?format=prometheus`

### Evidently AI Data Drift & Distribution Guardrails
Evidently AI continuously analyzes live inference inputs and uploaded batches against baseline distributions:
- **Interactive Visual HTML Report**: `GET /evidently/drift-report` (open in browser or embed in iframe)
- **Structured Drift Metrics (JSON)**: `GET /evidently/drift-summary`
- **Evaluated NLP Attributes**: Character length, word count, exclamation frequency, caps ratio, rating, and label using two-sample **Kolmogorov-Smirnov (K-S)** and **Chi-Square** statistical tests.
- **On-Demand Drift Computation**: `POST /evidently/run-drift` with custom datasets.

---

## 9. Docker & Containerization

Build and run both the frontend and backend using Docker Compose:

```bash
docker compose up --build
```

- Web UI: `http://localhost:3000`
- FastAPI Backend: `http://localhost:8000`

To stop:
```bash
docker compose down
```

---

## 10. CI/CD with GitHub Actions

The automated workflow located at `.github/workflows/ci.yml` triggers on every push and pull request:
1. **Backend Linting**: Flake8 static code analysis.
2. **Model Training & Verification**: Runs `model/train.py` to ensure reproducible model generation.
3. **API Integration Tests**: Executes `backend/test_api.py`.
4. **Frontend Production Build**: Runs `npm run build` to verify React bundling.
5. **Docker Container Verification**: Validates Dockerfile buildability.

---

## 11. API Documentation

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health status and model load confirmation |
| `POST` | `/predict` | Predicts Real/Fake for a single review JSON |
| `POST` | `/preview-file` | Previews columns and first 10 rows of uploaded file |
| `POST` | `/predict-file` | Batch processes CSV/XLSX review datasets |
| `GET` | `/sample-file` | Downloads the bundled 30-sample review dataset |
| `GET` | `/model-info` | Returns model architecture, version, and training params |
| `GET` | `/metrics` | Real-time monitoring metrics (JSON or Prometheus) |
| `GET` | `/mlops-info` | Current DVC and MLflow metadata |

### Sample Prediction Request
```http
POST /predict HTTP/1.1
Host: localhost:8000
Content-Type: application/json

{
  "review": "Excellent product and fast delivery"
}
```

### Sample Response
```json
{
  "prediction": "Real",
  "confidence": 0.94,
  "probabilities": {
    "Real": 0.94,
    "Fake": 0.06
  },
  "model_version": "v1.0",
  "latency_ms": 5.4,
  "timestamp": "2026-09-27T18:30:00.000Z",
  "safety_disclaimer": "Predictions are model-generated estimates and should not be treated as definitive proof of review authenticity."
}
```

---

## 12. Model Safety & Disclaimer

> [!NOTE]
> Predictions are model-generated estimates and should not be treated as definitive proof of review authenticity. Authenticity scores represent probabilistic likelihoods based on linguistic patterns, vocabulary usage, and stylistic markers.

---

## 13. License

Distributed under the MIT License.
