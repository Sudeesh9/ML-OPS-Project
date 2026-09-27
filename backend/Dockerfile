FROM python:3.12-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements
COPY backend/requirements.txt /app/backend/requirements.txt
RUN pip install --no-cache-dir -r /app/backend/requirements.txt

# Copy project files
COPY data /app/data
COPY model /app/model
COPY backend /app/backend
COPY params.yaml /app/params.yaml
COPY dvc.yaml /app/dvc.yaml

# Set environment variables
ENV PYTHONPATH="/app/backend:/app"
ENV PYTHONUNBUFFERED=1

EXPOSE 8000

# Pre-train / verify model on build
RUN python /app/model/train.py

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
