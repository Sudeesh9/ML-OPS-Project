# Multi-stage Dockerfile for unified deployment
# Stage 1: Build React Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Python Backend with built static assets
FROM python:3.12-slim
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt /app/backend/requirements.txt
RUN pip install --no-cache-dir -r /app/backend/requirements.txt

COPY data /app/data
COPY model /app/model
COPY backend /app/backend
COPY params.yaml /app/params.yaml
COPY dvc.yaml /app/dvc.yaml

# Copy frontend production build
COPY --from=frontend-builder /frontend/dist /app/frontend/dist

ENV PYTHONPATH="/app/backend:/app"
ENV PYTHONUNBUFFERED=1

EXPOSE 8000

# Train / verify model
RUN python /app/model/train.py

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
