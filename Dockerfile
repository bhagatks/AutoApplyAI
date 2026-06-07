FROM alpine:latest

# Install system dependencies
RUN apk update && apk add --no-cache \
    python3 \
    py3-pip \
    tectonic \
    curl \
    ca-certificates \
    bash

WORKDIR /app

# Copy dependency definition
COPY requirements.txt .

# Install python packages
RUN pip install --break-system-packages -r requirements.txt

# Copy all workspace files (respecting .dockerignore)
COPY . .

# Expose port 8000
EXPOSE 8000

# Run uvicorn server on port 8000
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8000"]
