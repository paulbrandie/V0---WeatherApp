"use client"

import { ExternalLink, Key, CheckCircle, XCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"

export function ApiSetupNotice() {
  const [apiKeyStatus, setApiKeyStatus] = useState<{
    exists: boolean
    length: number
    isValid: boolean
    preview: string
  }>({
    exists: false,
    length: 0,
    isValid: false,
    preview: "",
  })

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY
    const exists = !!apiKey
    const length = apiKey?.length || 0
    const isValid = exists && length >= 32 && apiKey !== "your_api_key_here" && apiKey !== "demo_key"
    const preview = apiKey ? `${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}` : "none"

    setApiKeyStatus({ exists, length, isValid, preview })
  }, [])

  if (apiKeyStatus.isValid) {
    return (
      <Card className="bg-green-50 border-green-200 mb-6">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <h3 className="text-green-800 font-semibold">✅ API Key Configured</h3>
              <p className="text-green-700 text-sm">
                Using live weather data • Key: {apiKeyStatus.preview} • Updates every 3 minutes
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-red-50 border-red-200 mb-6">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-red-800 font-semibold mb-2 flex items-center gap-2">
              <Key className="w-4 h-4" />
              API Key Issue Detected
            </h3>

            <div className="text-red-700 text-sm mb-3">
              <p className="mb-2">Current status:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>API Key exists: {apiKeyStatus.exists ? "✅ Yes" : "❌ No"}</li>
                <li>Key length: {apiKeyStatus.length} characters (need 32)</li>
                <li>Key preview: {apiKeyStatus.preview}</li>
                <li>Valid format: {apiKeyStatus.isValid ? "✅ Yes" : "❌ No"}</li>
              </ul>
            </div>

            <div className="bg-red-100 p-3 rounded mb-4">
              <h4 className="font-semibold text-red-800 mb-2">🔧 How to Fix:</h4>
              <ol className="text-red-700 text-sm space-y-1 list-decimal list-inside">
                <li>Get a free API key from OpenWeatherMap (takes 2 minutes)</li>
                <li>
                  Create <code className="bg-red-200 px-1 rounded">.env.local</code> file in your project root
                </li>
                <li>
                  Add: <code className="bg-red-200 px-1 rounded">NEXT_PUBLIC_OPENWEATHER_API_KEY=your_32_char_key</code>
                </li>
                <li>Restart your development server</li>
                <li>New API keys can take up to 2 hours to activate</li>
              </ol>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-red-300 text-red-700 hover:bg-red-100"
                onClick={() => window.open("https://openweathermap.org/appid", "_blank")}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Get Free API Key
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-red-300 text-red-700 hover:bg-red-100"
                onClick={() => window.open("https://openweathermap.org/faq#error401", "_blank")}
              >
                Troubleshooting Guide
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
