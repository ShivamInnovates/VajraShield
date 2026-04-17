# API Gateway Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Copy only requirements first for better caching
COPY api_gateway/requirements.txt ./requirements.txt

RUN pip install --no-cache-dir -r requirements.txt

# Copy all source code
COPY api_gateway/ ./api_gateway/
COPY security/ ./security/

# Set PYTHONPATH to include the /app directory
ENV PYTHONPATH=/app

EXPOSE 8000

CMD ["uvicorn", "api_gateway.main:app", "--host", "0.0.0.0", "--port", "8000"]
