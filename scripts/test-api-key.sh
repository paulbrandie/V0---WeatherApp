#!/bin/bash

echo "🔍 Testing OpenWeatherMap API Key"
echo "================================="

API_KEY="4c16ffa8df277ffbc8eb902919682541"

echo "✅ API Key: ${API_KEY:0:8}...${API_KEY: -4}"
echo "📏 Key length: ${#API_KEY} characters"

# Test API key with OpenWeatherMap
echo ""
echo "🧪 Testing API key with OpenWeatherMap..."

RESPONSE=$(curl -s "https://api.openweathermap.org/data/2.5/weather?q=London&appid=$API_KEY&units=metric")

if echo "$RESPONSE" | grep -q '"cod":401'; then
    echo "❌ API key is invalid or not activated"
    echo "🔗 Check: https://openweathermap.org/faq#error401"
    echo ""
    echo "Response:"
    echo "$RESPONSE"
elif echo "$RESPONSE" | grep -q '"name":"London"'; then
    echo "✅ API key is working correctly!"
    TEMP=$(echo "$RESPONSE" | grep -o '"temp":[0-9.]*' | cut -d ':' -f2)
    WEATHER=$(echo "$RESPONSE" | grep -o '"main":"[^"]*"' | cut -d '"' -f4)
    echo "🌡️  Current temperature in London: ${TEMP}°C"
    echo "🌤️  Weather condition: $WEATHER"
else
    echo "⚠️  Unexpected response:"
    echo "$RESPONSE"
fi

echo ""
echo "🚀 Your API key should now work in the weather app!"
