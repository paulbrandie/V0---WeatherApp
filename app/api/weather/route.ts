import { type NextRequest, NextResponse } from "next/server"
import { weatherCache } from "../../../lib/weather-cache"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const city = searchParams.get("city") || "London"

    const weatherData = await weatherCache.getWeatherData(city)

    return NextResponse.json({
      success: true,
      data: weatherData,
      cached: true,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Weather API error:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch weather data",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
