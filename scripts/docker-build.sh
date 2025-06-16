#!/bin/bash

# Build and run the weather app in Docker

echo "🐳 Building Weather App Docker Image..."

# Copy environment variables
cp .env.local .env.docker 2>/dev/null || echo "No .env.local found, using environment variables"

# Build the Docker image
docker build -t weather-app .

echo "✅ Docker image built successfully!"
echo ""
echo "🚀 To run the container:"
echo "docker run -p 3000:3000 --env-file .env.docker weather-app"
echo ""
echo "🔧 Or use docker-compose:"
echo "docker-compose up -d"
echo ""
echo "📊 Check health status:"
echo "curl http://localhost:3000/api/health"
