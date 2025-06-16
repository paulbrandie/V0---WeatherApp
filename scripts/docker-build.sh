#!/bin/bash

echo "🐳 Building Weather App Docker Image..."

# Create environment file if it doesn't exist
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local with your API key..."
    echo "NEXT_PUBLIC_OPENWEATHER_API_KEY=4c16ffa8df277ffbc8eb902919682541" > .env.local
fi

# Clean up any existing containers and images
echo "🧹 Cleaning up existing containers..."
docker-compose down 2>/dev/null || true
docker rmi weather-app 2>/dev/null || true

# Build the Docker image
echo "🔨 Building Docker image..."
docker build --no-cache -t weather-app .

if [ $? -eq 0 ]; then
    echo "✅ Docker image built successfully!"
    echo ""
    echo "🚀 To run the container:"
    echo "docker run -p 3023:3023 -e NEXT_PUBLIC_OPENWEATHER_API_KEY=4c16ffa8df277ffbc8eb902919682541 -e PORT=3023 weather-app"
    echo ""
    echo "🔧 Or use docker-compose:"
    echo "docker-compose up -d"
    echo ""
    echo "📊 Check health status:"
    echo "curl http://localhost:3023/api/health"
    echo ""
    echo "🔍 View logs:"
    echo "docker-compose logs -f weather-app"
else
    echo "❌ Docker build failed!"
    echo ""
    echo "🔧 Troubleshooting tips:"
    echo "1. Make sure Docker is running"
    echo "2. Try: docker system prune -f"
    echo "3. Check available disk space"
    exit 1
fi
