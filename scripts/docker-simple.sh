#!/bin/bash

echo "🐳 Building Simple Weather App Docker Image..."

# Build using the simple Dockerfile
docker build -f Dockerfile.simple -t weather-app-simple .

if [ $? -eq 0 ]; then
    echo "✅ Simple Docker image built successfully!"
    echo ""
    echo "🚀 Running the container..."
    
    # Stop any existing container
    docker stop weather-app-container 2>/dev/null || true
    docker rm weather-app-container 2>/dev/null || true
    
    # Run the container
    docker run -d \
        --name weather-app-container \
        -p 3023:3023 \
        -e NEXT_PUBLIC_OPENWEATHER_API_KEY=4c16ffa8df277ffbc8eb902919682541 \
        -e PORT=3023 \
        weather-app-simple
    
    echo "✅ Container is running!"
    echo ""
    echo "🌐 Access the app: http://localhost:3023"
    echo "📊 Health check: http://localhost:3023/api/health"
    echo "🔍 View logs: docker logs -f weather-app-container"
    echo "🛑 Stop container: docker stop weather-app-container"
    
    # Wait and test
    echo ""
    echo "⏳ Waiting for app to start..."
    sleep 15
    
    if curl -s http://localhost:3023/api/health > /dev/null; then
        echo "✅ App is responding! Weather app is ready!"
    else
        echo "⚠️  App might still be starting. Check logs with: docker logs weather-app-container"
    fi
else
    echo "❌ Docker build failed!"
    exit 1
fi
