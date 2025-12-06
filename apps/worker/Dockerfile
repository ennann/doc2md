FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for markitdown
RUN apt-get update && apt-get install -y \
    gcc \
    libpoppler-cpp-dev \
    poppler-utils \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy worker code
COPY worker ./worker
COPY run_worker.py .

# Run the worker
CMD ["python", "run_worker.py"]
