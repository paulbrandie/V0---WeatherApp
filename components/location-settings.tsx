"use client"

import { useState } from "react"
import { Settings, MapPin, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const popularCities = [
  "London",
  "Manchester",
  "Birmingham",
  "Edinburgh",
  "Cardiff",
  "Bristol",
  "Liverpool",
  "Glasgow",
  "Newcastle",
  "Leeds",
  "Sheffield",
  "Nottingham",
  "New York",
  "Los Angeles",
  "Chicago",
  "Houston",
  "Phoenix",
  "Philadelphia",
  "Paris",
  "Berlin",
  "Madrid",
  "Rome",
  "Amsterdam",
  "Vienna",
  "Tokyo",
  "Seoul",
  "Beijing",
  "Shanghai",
  "Mumbai",
  "Delhi",
  "Sydney",
  "Melbourne",
  "Toronto",
  "Vancouver",
  "Dubai",
  "Singapore",
]

interface LocationSettingsProps {
  currentLocation: string
  onLocationChange: (location: string) => void
}

export function LocationSettings({ currentLocation, onLocationChange }: LocationSettingsProps) {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [customLocation, setCustomLocation] = useState("")

  const filteredCities = popularCities.filter((city) => city.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleLocationSelect = (location: string) => {
    onLocationChange(location)
    setOpen(false)
    setSearchTerm("")
    setCustomLocation("")
  }

  const handleCustomLocationSubmit = () => {
    if (customLocation.trim()) {
      onLocationChange(customLocation.trim())
      setOpen(false)
      setSearchTerm("")
      setCustomLocation("")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-gray-600 hover:text-gray-800">
          <Settings className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Choose Location
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="search">Search Cities</Label>
            <Input
              id="search"
              placeholder="Search for a city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="custom">Or Enter Custom Location</Label>
            <div className="flex gap-2">
              <Input
                id="custom"
                placeholder="Enter city name..."
                value={customLocation}
                onChange={(e) => setCustomLocation(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleCustomLocationSubmit()}
              />
              <Button onClick={handleCustomLocationSubmit} disabled={!customLocation.trim()}>
                <Check className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Popular Cities</Label>
            <div className="max-h-48 overflow-y-auto space-y-1">
              {filteredCities.map((city) => (
                <Button
                  key={city}
                  variant={currentLocation === city ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => handleLocationSelect(city)}
                >
                  {city}
                  {currentLocation === city && <Check className="h-4 w-4 ml-auto" />}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
