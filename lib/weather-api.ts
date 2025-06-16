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

const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || "MyCloudyApp"
const BASE_URL = "https://api.openweathermap.org/data/2.5"

export async function fetchWeatherData(city = "Aberdeen"): Promise<WeatherData> {
  // Check if API key exists and is not the demo key
  if (!API_KEY || API_KEY === "demo_key") {
    console.warn("No OpenWeatherMap API key provided, using fallback data")
    return getFallbackWeatherData(city)
  }

  // Log API key status (first 8 characters only for security)
  console.log("Using API key:", API_KEY.substring(0, 8) + "...")

  try {
    // Fetch current weather
    const currentUrl = `${BASE_URL}/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`
    console.log("Fetching weather from:", currentUrl.replace(API_KEY, "***"))

    const currentResponse = await fetch(currentUrl)

    if (!currentResponse.ok) {
      const errorText = await currentResponse.text()
      console.error("Weather API Response:", {
        status: currentResponse.status,
        statusText: currentResponse.statusText,
        body: errorText,
      })

      // Handle specific error codes
      if (currentResponse.status === 401) {
        console.error("API Key Error: Invalid or missing API key")
        throw new Error("Invalid API key. Please check your NEXT_PUBLIC_OPENWEATHER_API_KEY")
      } else if (currentResponse.status === 404) {
        console.error("City not found:", city)
        throw new Error(`City "${city}" not found`)
      } else {
        throw new Error(`Weather API error: ${currentResponse.status} - ${currentResponse.statusText}`)
      }
    }

    const currentData = await currentResponse.json()
    console.log("Successfully fetched weather data for:", currentData.name)

    // Fetch hourly forecast (5-day/3-hour forecast)
    const forecastUrl = `${BASE_URL}/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`
    const forecastResponse = await fetch(forecastUrl)

    if (!forecastResponse.ok) {
      console.error("Forecast API error:", forecastResponse.status)
      // If current weather worked but forecast failed, use current data with fallback forecast
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

    return {
      current: {
        temperature: Math.round(currentData.main.temp),
        condition: mapWeatherCondition(currentData.weather[0].main),
        description: currentData.weather[0].description,
        humidity: currentData.main.humidity,
        windSpeed: Math.round(currentData.wind.speed * 2.237), // Convert m/s to mph
        feelsLike: Math.round(currentData.main.feels_like),
      },
      location: {
        name: currentData.name,
        country: currentData.sys.country,
      },
      hourly: hourlyForecasts,
      daily: dailyForecasts,
    }
  } catch (error) {
    console.error("Error fetching weather data:", error)
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
  const cityData = {
    London: { temp: 20, country: "GB" },
    Manchester: { temp: 18, country: "GB" },
    Birmingham: { temp: 19, country: "GB" },
    Edinburgh: { temp: 16, country: "GB" },
    Cardiff: { temp: 21, country: "GB" },
    Bristol: { temp: 20, country: "GB" },
    Liverpool: { temp: 18, country: "GB" },
    Glasgow: { temp: 15, country: "GB" },
    Multan: { temp: 32, country: "PK" },
  }

  const defaultData = cityData[city as keyof typeof cityData] || cityData.London

  return {
    current: {
      temperature: defaultData.temp,
      condition: "Cloudy",
      description: "Partly cloudy",
      humidity: 90,
      windSpeed: 6,
      feelsLike: defaultData.temp - 1,
    },
    location: {
      name: city,
      country: defaultData.country,
    },
    hourly: [
      { time: "1 PM", temperature: defaultData.temp, condition: "Cloudy", description: "Cloudy" },
      { time: "2 PM", temperature: defaultData.temp + 1, condition: "Rainy", description: "Rainy" },
      { time: "3 PM", temperature: defaultData.temp + 1, condition: "Rainy", description: "Rainy" },
      { time: "4 PM", temperature: defaultData.temp, condition: "Cloudy", description: "Cloudy" },
      { time: "5 PM", temperature: defaultData.temp + 1, condition: "Rainy", description: "Rainy" },
      { time: "6 PM", temperature: defaultData.temp + 1, condition: "Rainy", description: "Rainy" },
    ],
    daily: [
      { day: "Today", temperature: defaultData.temp, condition: "Mist", description: "Mist" },
      { day: "Tue", temperature: defaultData.temp + 12, condition: "Sunny", description: "Sunny" },
      { day: "Wed", temperature: defaultData.temp - 8, condition: "Rainy", description: "Rainy" },
      { day: "Thu", temperature: defaultData.temp - 7, condition: "Rainy", description: "Rainy" },
      { day: "Fri", temperature: defaultData.temp + 2, condition: "Mist", description: "Mist" },
      { day: "Sat", temperature: defaultData.temp + 2, condition: "Mist", description: "Mist" },
    ],
  }
}
