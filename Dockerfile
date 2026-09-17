# Multi-stage Dockerfile for synDx Clinical Decision Platform
FROM python:3.11-slim

# Install Node.js & system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    gnupg \
    build-essential \
    sqlite3 \
    libgomp1 \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy Node dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy Python requirements & install
COPY requirements.txt* ./
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir \
    fastapi==0.110.0 \
    uvicorn==0.28.0 \
    pydantic==2.6.4 \
    pandas==2.2.1 \
    numpy==1.26.4 \
    scikit-learn==1.4.1.post1 \
    xgboost==2.0.3 \
    lightgbm==4.3.0 \
    joblib==1.3.2

# Copy source code and data
COPY . .

# Expose ports: 3000 (Express Portal & DB API), 8000 (FastAPI ML Microservice)
EXPOSE 3000 8000

# Create entrypoint script to launch both services
RUN echo '#!/bin/sh\n\
python3 -m uvicorn pipeline.clinical_service:app --host 0.0.0.0 --port 8000 &\n\
sleep 2\n\
node server.js\n' > /app/entrypoint.sh && chmod +x /app/entrypoint.sh

CMD ["/app/entrypoint.sh"]
