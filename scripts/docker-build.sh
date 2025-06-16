#!/bin/bash

echo "🐳 Building Weather App Docker Image..."

# Create environment file if it doesn't exist
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local with your API key..."
    echo "NEXT_PUBLIC_OPENWEATHER_API_KEY=4c16ffa8df277ffbc8eb902919682541" > .env.local
fi

# Generate package-lock.json if it doesn't exist
if [ ! -f package-lock.json ]; then
    echo "📦 Generating package-lock.json..."
    npm install --package-lock-only
fi

# Build the Docker image
echo "🔨 Building Docker image..."
docker build -t weather-app .

if [ $? -eq 0 ]; then
    echo "✅ Docker image built successfully!"
    echo ""
    echo "🚀 To run the container:"
    echo "docker run -p 3000:3000 weather-app"
    echo ""
    echo "🔧 Or use docker-compose:"
    echo "docker-compose up -d"
    echo ""
    echo "📊 Check health status:"
    echo "curl http://localhost:3000/api/health"
else
    echo "❌ Docker build failed!"
    exit 1
fi
