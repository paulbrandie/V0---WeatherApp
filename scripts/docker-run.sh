#!/bin/bash

# Run the weather app with Docker Compose

echo "🐳 Starting Weather App with Docker Compose..."

# Make sure we have the environment file
if [ ! -f .env.docker ]; then
    echo "⚠️  Creating .env.docker file..."
    echo "NEXT_PUBLIC_OPENWEATHER_API_KEY=your_api_key_here" > .env.docker
    echo "Please edit .env.docker with your actual API key"
fi

# Start the services
docker-compose up -d

echo "✅ Weather App is running!"
echo ""
echo "🌐 Access the app: http://localhost:3000"
echo "📊 Health check: http://localhost:3000/api/health"
echo "🔍 View logs: docker-compose logs -f"
echo "🛑 Stop app: docker-compose down"
