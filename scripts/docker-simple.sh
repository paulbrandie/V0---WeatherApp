#!/bin/bash

echo "🐳 Building Simple Weather App Docker Image..."

# Clean up any existing containers first
echo "🧹 Cleaning up existing containers..."
docker stop weather-app-container 2>/dev/null || true
docker rm weather-app-container 2>/dev/null || true
docker rmi weather-app-simple 2>/dev/null || true

# Build using the simple Dockerfile
echo "🔨 Building Docker image..."
docker build -f Dockerfile.simple -t weather-app-simple . --no-cache

if [ $? -eq 0 ]; then
    echo "✅ Simple Docker image built successfully!"
    echo ""
    echo "🚀 Running the container..."
    
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
    sleep 20
    
    echo "🧪 Testing health endpoint..."
    if curl -s http://localhost:3023/api/health > /dev/null; then
        echo "✅ App is responding! Weather app is ready!"
        echo ""
        echo "🌤️  Try these URLs:"
        echo "   • Main app: http://localhost:3023"
        echo "   • Health: http://localhost:3023/api/health"
        echo "   • Weather API: http://localhost:3023/api/weather?city=London"
    else
        echo "⚠️  App might still be starting. Check logs with:"
        echo "   docker logs weather-app-container"
        echo ""
        echo "🔍 Container status:"
        docker ps | grep weather-app-container
    fi
else
    echo "❌ Docker build failed!"
    echo ""
    echo "🔧 Troubleshooting:"
    echo "1. Check Docker is running: docker --version"
    echo "2. Free up space: docker system prune -f"
    echo "3. Check build logs above for specific errors"
    exit 1
fi
