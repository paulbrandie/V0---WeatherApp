// Weather API utilities and types
export interface WeatherData {
  current: {
    temperature: number
    condition: string
    description: string
    humidity: number
    windSpeed: number
    feelsLike: number
  }
  location: {
    name: string
    country: string
  }
  hourly: Array<{
    time: string
    temperature: number
    condition: string
    description: string
  }>
  daily: Array<{
    day: string
    temperature: number
    condition: string
    description: string
  }>
}

const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY
const BASE_URL = "https://api.openweathermap.org/data/2.5"

export async function fetchWeatherData(city = "London"): Promise<WeatherData> {
  // Debug API key status
  console.log("=== API Key Debug Info ===")
  console.log("API Key exists:", !!API_KEY)
  console.log("API Key length:", API_KEY?.length || 0)
  console.log("API Key first 8 chars:", API_KEY?.substring(0, 8) || "none")
  console.log("API Key last 4 chars:", API_KEY?.substring(API_KEY.length - 4) || "none")

  // Check if API key exists and is not obviously invalid
  if (!API_KEY || API_KEY.length < 10 || API_KEY === "your_api_key_here" || API_KEY === "demo_key") {
    console.warn("❌ Invalid or missing API key, using fallback data")
    console.warn("Expected: 32-character alphanumeric string")
    console.warn("Got:", API_KEY || "undefined")
    return getFallbackWeatherData(city)
  }

  try {
    // Test API key first with a simple request
    const testUrl = `${BASE_URL}/weather?q=London&appid=${API_KEY}&units=metric`
    console.log("🔍 Testing API key with:", testUrl.replace(API_KEY, "***"))

    const testResponse = await fetch(testUrl)

    if (!testResponse.ok) {
      const errorText = await testResponse.text()
      console.error("❌ API Key Test Failed:")
      console.error("Status:", testResponse.status)
      console.error("Response:", errorText)

      if (testResponse.status === 401) {
        console.error("🔑 API Key is invalid or not activated")
        console.error("1. Check your API key is correct")
        console.error("2. Wait up to 2 hours for new keys to activate")
        console.error("3. Verify your OpenWeatherMap account is confirmed")
      }

      return getFallbackWeatherData(city)
    }

    console.log("✅ API key test successful, fetching weather for:", city)

    // Fetch current weather for the requested city
    const currentUrl = `${BASE_URL}/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`
    const currentResponse = await fetch(currentUrl)

    if (!currentResponse.ok) {
      const errorText = await currentResponse.text()
      console.error("Weather API Error:", {
        status: currentResponse.status,
        statusText: currentResponse.statusText,
        body: errorText,
        city: city,
      })

      if (currentResponse.status === 404) {
        console.error(`City "${city}" not found, using fallback data`)
      }

      return getFallbackWeatherData(city)
    }

    const currentData = await currentResponse.json()
    console.log("✅ Successfully fetched current weather for:", currentData.name)

    // Fetch forecast data
    const forecastUrl = `${BASE_URL}/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`
    const forecastResponse = await fetch(forecastUrl)

    if (!forecastResponse.ok) {
      console.error("Forecast API error:", forecastResponse.status)
      // Use current data with fallback forecast
      const fallbackData = getFallbackWeatherData(city)
      return {
        current: {
          temperature: Math.round(currentData.main.temp),
          condition: mapWeatherCondition(currentData.weather[0].main),
          description: currentData.weather[0].description,
          humidity: currentData.main.humidity,
          windSpeed: Math.round(currentData.wind.speed * 2.237),
          feelsLike: Math.round(currentData.main.feels_like),
        },
        location: {
          name: currentData.name,
          country: currentData.sys.country,
        },
        hourly: fallbackData.hourly,
        daily: fallbackData.daily,
      }
    }

    const forecastData = await forecastResponse.json()

    // Process hourly and daily forecasts
    const hourlyForecasts = processHourlyData(forecastData.list.slice(0, 6))
    const dailyForecasts = processDailyData(forecastData.list)

    const result = {
      current: {
        temperature: Math.round(currentData.main.temp),
        condition: mapWeatherCondition(currentData.weather[0].main),
        description: currentData.weather[0].description,
        humidity: currentData.main.humidity,
        windSpeed: Math.round(currentData.wind.speed * 2.237),
        feelsLike: Math.round(currentData.main.feels_like),
      },
      location: {
        name: currentData.name,
        country: currentData.sys.country,
      },
      hourly: hourlyForecasts,
      daily: dailyForecasts,
    }

    console.log("✅ Successfully processed all weather data")
    return result
  } catch (error) {
    console.error("❌ Error fetching weather data:", error)
    return getFallbackWeatherData(city)
  }
}

function processHourlyData(hourlyList: any[]): WeatherData["hourly"] {
  return hourlyList.map((item) => ({
    time: new Date(item.dt * 1000).toLocaleTimeString("en-US", {
      hour: "numeric",
      hour12: true,
    }),
    temperature: Math.round(item.main.temp),
    condition: mapWeatherCondition(item.weather[0].main),
    description: item.weather[0].description,
  }))
}

function processDailyData(forecastList: any[]): WeatherData["daily"] {
  const dailyData: { [key: string]: any } = {}

  forecastList.forEach((item) => {
    const date = new Date(item.dt * 1000)
    const dateKey = date.toDateString()

    if (!dailyData[dateKey]) {
      dailyData[dateKey] = {
        day: date.toLocaleDateString("en-US", { weekday: "short" }),
        temps: [],
        conditions: [],
      }
    }

    dailyData[dateKey].temps.push(item.main.temp)
    dailyData[dateKey].conditions.push(item.weather[0].main)
  })

  return Object.values(dailyData)
    .slice(0, 6)
    .map((day: any, index) => ({
      day: index === 0 ? "Today" : day.day,
      temperature: Math.round(Math.max(...day.temps)),
      condition: mapWeatherCondition(day.conditions[0]),
      description: day.conditions[0],
    }))
}

function mapWeatherCondition(condition: string): string {
  const conditionMap: { [key: string]: string } = {
    Clear: "Sunny",
    Clouds: "Cloudy",
    Rain: "Rainy",
    Drizzle: "Rainy",
    Thunderstorm: "Rainy",
    Snow: "Snowy",
    Mist: "Mist",
    Fog: "Mist",
    Haze: "Mist",
  }

  return conditionMap[condition] || "Cloudy"
}

function getFallbackWeatherData(city = "London"): WeatherData {
  console.log("📋 Using fallback weather data for:", city)

  const cityData = {
    London: { temp: 15, country: "GB" },
    Manchester: { temp: 13, country: "GB" },
    Birmingham: { temp: 14, country: "GB" },
    Edinburgh: { temp: 11, country: "GB" },
    Cardiff: { temp: 16, country: "GB" },
    Bristol: { temp: 15, country: "GB" },
    Liverpool: { temp: 13, country: "GB" },
    Glasgow: { temp: 10, country: "GB" },
    Multan: { temp: 32, country: "PK" },
    "New York": { temp: 18, country: "US" },
    Paris: { temp: 16, country: "FR" },
    Tokyo: { temp: 22, country: "JP" },
  }

  const defaultData = cityData[city as keyof typeof cityData] || { temp: 15, country: "GB" }

  return {
    current: {
      temperature: defaultData.temp,
      condition: "Cloudy",
      description: "Partly cloudy",
      humidity: 65,
      windSpeed: 8,
      feelsLike: defaultData.temp - 2,
    },
    location: {
      name: city,
      country: defaultData.country,
    },
    hourly: [
      { time: "1 PM", temperature: defaultData.temp, condition: "Cloudy", description: "Cloudy" },
      { time: "2 PM", temperature: defaultData.temp + 1, condition: "Sunny", description: "Sunny" },
      { time: "3 PM", temperature: defaultData.temp + 2, condition: "Sunny", description: "Sunny" },
      { time: "4 PM", temperature: defaultData.temp + 1, condition: "Cloudy", description: "Cloudy" },
      { time: "5 PM", temperature: defaultData.temp, condition: "Cloudy", description: "Cloudy" },
      { time: "6 PM", temperature: defaultData.temp - 1, condition: "Cloudy", description: "Cloudy" },
    ],
    daily: [
      { day: "Today", temperature: defaultData.temp, condition: "Cloudy", description: "Cloudy" },
      { day: "Tue", temperature: defaultData.temp + 3, condition: "Sunny", description: "Sunny" },
      { day: "Wed", temperature: defaultData.temp - 2, condition: "Rainy", description: "Rainy" },
      { day: "Thu", temperature: defaultData.temp + 1, condition: "Cloudy", description: "Cloudy" },
      { day: "Fri", temperature: defaultData.temp + 2, condition: "Sunny", description: "Sunny" },
      { day: "Sat", temperature: defaultData.temp, condition: "Cloudy", description: "Cloudy" },
    ],
  }
}
