"use client"

import { useState, useEffect } from "react"
import { Wind, Droplets, RefreshCw } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { fetchWeatherData, type WeatherData } from "./lib/weather-api"
import { LocationSettings } from "./components/location-settings"
import { ApiSetupNotice } from "./components/api-setup-notice"

export default function WeatherApp() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [selectedLocation, setSelectedLocation] = useState("London")
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // Load saved location from localStorage on mount
  useEffect(() => {
    const savedLocation = localStorage.getItem("weather-location")
    if (savedLocation) {
      setSelectedLocation(savedLocation)
    }
  }, [])

  // Save location and load weather data when location changes
  useEffect(() => {
    localStorage.setItem("weather-location", selectedLocation)
    loadWeatherData(selectedLocation)

    // Set up automatic refresh every 3 minutes (180,000 milliseconds)
    const interval = setInterval(() => {
      loadWeatherData(selectedLocation)
    }, 180000) // 3 minutes = 180,000 milliseconds

    // Cleanup interval on component unmount or location change
    return () => clearInterval(interval)
  }, [selectedLocation])

  const loadWeatherData = async (city: string) => {
    setLoading(true)
    try {
      const data = await fetchWeatherData(city)
      setWeatherData(data)
      setLastUpdated(new Date())
    } catch (error) {
      console.error("Weather data error:", error)
      // Still try to get fallback data
      const fallbackData = await fetchWeatherData(city)
      setWeatherData(fallbackData)
      setLastUpdated(new Date())
    } finally {
      setLoading(false)
    }
  }

  const handleLocationChange = (location: string) => {
    setSelectedLocation(location)
  }

  const handleRefresh = () => {
    loadWeatherData(selectedLocation)
  }

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  const getCurrentDate = () => {
    return new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good Morning"
    if (hour < 17) return "Good Afternoon"
    return "Good Evening"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-600" />
          <p className="text-gray-600">Loading weather data...</p>
        </div>
      </div>
    )
  }

  if (!weatherData) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Failed to load weather data</p>
          <Button onClick={handleRefresh} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-medium text-gray-800 mb-1">{weatherData.location.name}</h1>
            <p className="text-gray-600">{getCurrentDate()}</p>
          </div>

          <div className="text-right">
            <p className="text-2xl font-medium text-gray-800 mb-1">{getGreeting()}</p>
            <p className="text-gray-600">{getCurrentTime()}</p>
            {lastUpdated && (
              <p className="text-xs text-gray-500 mt-1">
                Updated:{" "}
                {lastUpdated.toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                })}
              </p>
            )}
          </div>
        </div>

        {/* API Setup Notice */}
        <ApiSetupNotice />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Weather Display */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-8">
                <div className="text-9xl font-light text-gray-800">{weatherData.current.temperature}°</div>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Wind className="h-4 w-4" />
                    <span className="text-sm">{weatherData.current.windSpeed} mph</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Droplets className="h-4 w-4" />
                    <span className="text-sm">{weatherData.current.humidity} %</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <LocationSettings currentLocation={selectedLocation} onLocationChange={handleLocationChange} />
              </div>
            </div>

            <h2 className="text-2xl font-light text-gray-800 mb-8 capitalize">{weatherData.current.description}</h2>

            {/* Weekly Forecast */}
            <div className="grid grid-cols-6 gap-4">
              {weatherData.daily.map((day, index) => (
                <div key={index} className="text-center">
                  <p className="text-sm font-medium text-gray-800 mb-2">{day.day}</p>
                  <p className="text-2xl font-light text-gray-800 mb-1">{day.temperature}°</p>
                  <p className="text-xs text-gray-600 capitalize">{day.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Current Stats */}
            <Card className="bg-white/50 border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl font-light text-gray-800">{weatherData.current.temperature}°</span>
                  <div className="text-right text-sm text-gray-600">
                    <div className="flex items-center gap-1 mb-1">
                      <Wind className="h-3 w-3" />
                      <span>{weatherData.current.windSpeed} mph</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Droplets className="h-3 w-3" />
                      <span>{weatherData.current.humidity} %</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2">Feels like {weatherData.current.feelsLike}°</p>
                <p className="text-lg font-medium text-gray-800 capitalize">{weatherData.current.description}</p>
              </CardContent>
            </Card>

            {/* Hourly Forecast */}
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-4">Hourly Forecast</h3>
              <div className="grid grid-cols-3 gap-4">
                {weatherData.hourly.map((hour, index) => (
                  <Card key={index} className="bg-white/50 border-0 shadow-sm">
                    <CardContent className="p-4 text-center">
                      <p className="text-sm font-medium text-gray-800 mb-2">{hour.time}</p>
                      <p className="text-xl font-light text-gray-800 mb-1">{hour.temperature}°</p>
                      <p className="text-xs text-gray-600 capitalize">{hour.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
