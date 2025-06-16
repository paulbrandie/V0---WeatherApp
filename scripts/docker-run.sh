#!/bin/bash

echo "🐳 Starting Weather App with Docker Compose..."

# Make sure we have the environment setup
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local with your API key..."
    echo "NEXT_PUBLIC_OPENWEATHER_API_KEY=4c16ffa8df277ffbc8eb902919682541" > .env.local
fi

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker-compose down 2>/dev/null || true

# Start the services
echo "🚀 Starting weather app..."
docker-compose up -d --build

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Weather App is running!"
    echo ""
    echo "🌐 Access the app: http://localhost:3023"
    echo "📊 Health check: http://localhost:3023/api/health"
    echo ""
    echo "📋 Useful commands:"
    echo "🔍 View logs: docker-compose logs -f weather-app"
    echo "🛑 Stop app: docker-compose down"
    echo "🔄 Restart: docker-compose restart weather-app"
    echo "📊 Container status: docker-compose ps"
    echo ""
    echo "⏳ Waiting for app to start..."
    sleep 10
    
    # Test if the app is responding
    if curl -s http://localhost:3023/api/health > /dev/null; then
        echo "✅ App is responding! Check http://localhost:3023"
    else
        echo "⚠️  App might still be starting. Check logs with: docker-compose logs -f"
    fi
else
    echo "❌ Failed to start weather app!"
    echo "🔍 Check logs: docker-compose logs weather-app"
    exit 1
fi
