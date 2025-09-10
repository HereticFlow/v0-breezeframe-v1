"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Sun, Moon, Sunrise, Sunset, Activity } from "lucide-react"

interface LightFlowVisualizationScreenProps {
  windowData: any
  onNext: (data: any) => void
  onBack: () => void
}

export default function LightFlowVisualizationScreen({
  windowData,
  onNext,
  onBack,
}: LightFlowVisualizationScreenProps) {
  const [currentTime, setCurrentTime] = useState(12)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => (prev >= 18 ? 6 : prev + 0.5))
      }, 500)
    }
    return () => clearInterval(interval)
  }, [isPlaying])

  const getLightIntensity = (time: number) => {
    if (time < 6 || time > 18) return 0.1
    if (time < 8 || time > 16) return 0.4
    if (time < 10 || time > 14) return 0.7
    return 1.0
  }

  const getTimeIcon = (time: number) => {
    if (time < 6 || time > 18) return Moon
    if (time < 8) return Sunrise
    if (time > 16) return Sunset
    return Sun
  }

  const getWellnessMessage = (time: number) => {
    if (time >= 10 && time <= 14) {
      return "Perfect time for vitamin D absorption and energy boost!"
    } else if (time >= 6 && time <= 9) {
      return "Morning light helps regulate your circadian rhythm."
    } else if (time >= 15 && time <= 17) {
      return "Afternoon light supports focus and productivity."
    } else {
      return "Evening time - prepare your space for rest and recovery."
    }
  }

  const lightIntensity = getLightIntensity(currentTime)
  const TimeIcon = getTimeIcon(currentTime)

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF7EB] to-[#F5F5DC] p-6">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="text-[#3A3A3A] hover:bg-[#8BD3DD]/10">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-[#3A3A3A]" style={{ fontFamily: "Playfair Display, serif" }}>
              Light Flow Harmony
            </h1>
            <p className="text-sm text-[#3A3A3A] opacity-70">Visualize your daily light rhythm</p>
          </div>
        </div>

        {/* Wellness Feedback */}
        <Card className="p-4 bg-gradient-to-r from-[#F5A623]/10 to-[#8BD3DD]/10 border-none">
          <div className="flex items-start space-x-3">
            <Activity className="w-5 h-5 text-[#F5A623] mt-1" />
            <div>
              <p className="text-sm font-medium text-[#3A3A3A] mb-1">Wellness Analysis</p>
              <p className="text-sm text-[#3A3A3A] opacity-80">
                Your {windowData?.width}cm window is ideal for letting in sunlight from 10h to 14h, perfect for natural
                vitamin D synthesis.
              </p>
            </div>
          </div>
        </Card>

        {/* Light Flow Visualization */}
        <Card className="p-6 bg-white/80 border-none shadow-lg">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-[#3A3A3A]">Daily Light Journey</h3>
              <div className="flex items-center space-x-2">
                <TimeIcon className="w-5 h-5 text-[#F5A623]" />
                <span className="text-sm font-medium text-[#3A3A3A]">{currentTime.toFixed(1)}h</span>
              </div>
            </div>

            {/* Room with Light Flow */}
            <div className="relative h-48 bg-gradient-to-br from-[#8BD3DD]/10 to-[#F5F5DC] rounded-lg border-2 border-[#8BD3DD]/20 overflow-hidden">
              {/* Room walls */}
              <div className="absolute inset-0 border-2 border-[#3A3A3A]/10 rounded-lg"></div>

              {/* Window */}
              <div className="absolute right-2 top-8 bottom-8 w-6 bg-gradient-to-l from-[#F5A623]/40 to-transparent rounded-l-lg border-l-2 border-[#F5A623]/30"></div>

              {/* Dynamic Light Rays */}
              <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute h-px bg-[#F5A623] transition-all duration-500"
                    style={{
                      width: `${lightIntensity * 80}px`,
                      top: `${(i - 3) * 8}px`,
                      opacity: lightIntensity * 0.8,
                      transform: `rotate(${(i - 3) * 3}deg)`,
                      transformOrigin: "right center",
                    }}
                  />
                ))}
              </div>

              {/* Light Pool on Floor */}
              <div
                className="absolute bottom-4 transition-all duration-500"
                style={{
                  right: `${20 + (1 - lightIntensity) * 40}px`,
                  width: `${lightIntensity * 60}px`,
                  height: `${lightIntensity * 20}px`,
                  background: `radial-gradient(ellipse, rgba(245, 166, 35, ${lightIntensity * 0.3}) 0%, transparent 70%)`,
                  borderRadius: "50%",
                }}
              ></div>

              {/* Person silhouette */}
              <div className="absolute left-1/3 bottom-8 w-4 h-8 bg-[#3A3A3A]/30 rounded-full"></div>

              {/* Wellness indicators */}
              <div className="absolute top-4 left-4 flex space-x-2">
                <div
                  className="w-3 h-3 rounded-full transition-all duration-500"
                  style={{
                    backgroundColor: lightIntensity > 0.7 ? "#F5A623" : lightIntensity > 0.4 ? "#8BD3DD" : "#3A3A3A",
                    opacity: 0.6,
                  }}
                ></div>
                <div
                  className="w-3 h-3 rounded-full transition-all duration-500"
                  style={{
                    backgroundColor: lightIntensity > 0.5 ? "#8BD3DD" : "#3A3A3A",
                    opacity: 0.4,
                  }}
                ></div>
              </div>
            </div>

            {/* Time Controls */}
            <div className="space-y-3">
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="border-[#8BD3DD] text-[#3A3A3A] hover:bg-[#8BD3DD]/10"
                >
                  {isPlaying ? "Pause" : "Play"} Day Cycle
                </Button>
                <input
                  type="range"
                  min="6"
                  max="18"
                  step="0.5"
                  value={currentTime}
                  onChange={(e) => setCurrentTime(Number.parseFloat(e.target.value))}
                  className="flex-1"
                />
              </div>

              {/* Wellness Message */}
              <div className="p-3 bg-[#F5A623]/10 rounded-lg">
                <p className="text-sm text-[#3A3A3A] opacity-80 italic">{getWellnessMessage(currentTime)}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Light Quality Metrics */}
        <Card className="p-4 bg-white/80 border-none shadow-lg">
          <div className="space-y-3">
            <h4 className="font-medium text-[#3A3A3A]">Light Quality Assessment</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-[#3A3A3A] opacity-70">Intensity</p>
                <p className="font-medium text-[#3A3A3A]">{Math.round(lightIntensity * 100)}%</p>
              </div>
              <div>
                <p className="text-[#3A3A3A] opacity-70">Wellness Score</p>
                <p className="font-medium text-[#F5A623]">
                  {lightIntensity > 0.7 ? "Excellent" : lightIntensity > 0.4 ? "Good" : "Low"}
                </p>
              </div>
              <div>
                <p className="text-[#3A3A3A] opacity-70">Circadian Support</p>
                <p className="font-medium text-[#8BD3DD]">
                  {currentTime >= 6 && currentTime <= 18 ? "Active" : "Rest Mode"}
                </p>
              </div>
              <div>
                <p className="text-[#3A3A3A] opacity-70">Energy Level</p>
                <p className="font-medium text-[#3A3A3A]">
                  {lightIntensity > 0.6 ? "High" : lightIntensity > 0.3 ? "Medium" : "Low"}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Continue Button */}
        <Button
          onClick={() => onNext({ lightIntensity, currentTime, wellnessScore: Math.round(lightIntensity * 100) })}
          className="w-full py-3 bg-gradient-to-r from-[#F5A623] to-[#8BD3DD] text-white hover:opacity-90"
        >
          Configure My Wellness Settings
        </Button>
      </div>
    </div>
  )
}
