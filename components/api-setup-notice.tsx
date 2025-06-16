"use client"

import { AlertCircle, ExternalLink, Key } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function ApiSetupNotice() {
  const hasApiKey =
    process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY && process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY !== "demo_key"

  if (hasApiKey) return null

  return (
    <Card className="bg-amber-50 border-amber-200 mb-6">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-amber-800 font-semibold mb-2 flex items-center gap-2">
              <Key className="w-4 h-4" />
              API Setup Required for Live Weather Data
            </h3>
            <p className="text-amber-700 text-sm mb-3">
              Currently showing demo data. To get live weather updates every 3 minutes:
            </p>
            <ol className="text-amber-700 text-sm space-y-1 mb-4 list-decimal list-inside">
              <li>Get a free API key from OpenWeatherMap (1,000 calls/day free)</li>
              <li>
                Create a <code className="bg-amber-100 px-1 rounded">.env.local</code> file in your project root
              </li>
              <li>
                Add: <code className="bg-amber-100 px-1 rounded">NEXT_PUBLIC_OPENWEATHER_API_KEY=your_key_here</code>
              </li>
              <li>Restart your development server</li>
            </ol>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-amber-300 text-amber-700 hover:bg-amber-100"
                onClick={() => window.open("https://openweathermap.org/appid", "_blank")}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Get Free API Key
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-amber-300 text-amber-700 hover:bg-amber-100"
                onClick={() => window.open("https://openweathermap.org/api", "_blank")}
              >
                API Documentation
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
