FROM python:3.10-slim

# Nainštalujeme základné build nástroje potrebné pre insightface
RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    git \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# Skopírujeme kód faceRecognition
COPY faceRecognition /app/faceRecognition

