import { NextResponse } from "next/server"
import { weatherCache } from "../../../lib/weather-cache"

export async function GET() {
  try {
    const cacheStatus = weatherCache.getCacheStatus()

    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      cache: cacheStatus,
      uptime: process.uptime(),
      port: process.env.PORT || 3023,
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
        port: process.env.PORT || 3023,
      },
      { status: 500 },
    )
  }
}
