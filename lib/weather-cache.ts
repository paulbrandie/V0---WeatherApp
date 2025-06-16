// Server-side weather data caching system
import { fetchWeatherData, type WeatherData } from "./weather-api"

interface CachedWeatherData {
  data: WeatherData
  lastUpdated: number
  city: string
}

class WeatherCache {
  private cache = new Map<string, CachedWeatherData>()
  private updateIntervals = new Map<string, NodeJS.Timeout>()
  private readonly CACHE_DURATION = 3 * 60 * 1000 // 3 minutes in milliseconds

  async getWeatherData(city: string): Promise<WeatherData> {
    const cacheKey = city.toLowerCase()
    const cached = this.cache.get(cacheKey)
    const now = Date.now()

    // Return cached data if it's still fresh
    if (cached && now - cached.lastUpdated < this.CACHE_DURATION) {
      return cached.data
    }

    // Fetch fresh data
    const data = await fetchWeatherData(city)

    // Update cache
    this.cache.set(cacheKey, {
      data,
      lastUpdated: now,
      city,
    })

    // Set up automatic updates for this city if not already running
    if (!this.updateIntervals.has(cacheKey)) {
      this.startAutoUpdate(city)
    }

    return data
  }

  private startAutoUpdate(city: string): void {
    const cacheKey = city.toLowerCase()

    const interval = setInterval(async () => {
      try {
        console.log(`Auto-updating weather data for ${city}`)
        const data = await fetchWeatherData(city)

        this.cache.set(cacheKey, {
          data,
          lastUpdated: Date.now(),
          city,
        })

        console.log(`Successfully updated weather data for ${city}`)
      } catch (error) {
        console.error(`Failed to auto-update weather for ${city}:`, error)
      }
    }, this.CACHE_DURATION)

    this.updateIntervals.set(cacheKey, interval)
  }

  stopAutoUpdate(city: string): void {
    const cacheKey = city.toLowerCase()
    const interval = this.updateIntervals.get(cacheKey)

    if (interval) {
      clearInterval(interval)
      this.updateIntervals.delete(cacheKey)
      this.cache.delete(cacheKey)
    }
  }

  getCacheStatus(): { city: string; lastUpdated: Date; age: string }[] {
    return Array.from(this.cache.entries()).map(([key, cached]) => ({
      city: cached.city,
      lastUpdated: new Date(cached.lastUpdated),
      age: `${Math.round((Date.now() - cached.lastUpdated) / 1000)}s ago`,
    }))
  }
}

// Singleton instance
export const weatherCache = new WeatherCache()
