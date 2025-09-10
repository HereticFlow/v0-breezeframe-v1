"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Sun, Moon, Heart, Activity, TrendingUp, Leaf } from "lucide-react"

interface WellnessDashboardScreenProps {
  windowData: any
  lightFlowData: any
  wellnessConfig: any
  onNext: () => void
  onBack: () => void
}

export default function WellnessDashboardScreen({
  windowData,
  lightFlowData,
  wellnessConfig,
  onNext,
  onBack,
}: WellnessDashboardScreenProps) {
  const [selectedMetric, setSelectedMetric] = useState("light")
  const [moodRating, setMoodRating] = useState(4)

  const currentHour = new Date().getHours()
  const timeOfDay = currentHour < 12 ? "morning" : currentHour < 18 ? "afternoon" : "evening"

  const getWellnessRecommendation = () => {
    if (currentHour >= 10 && currentHour <= 14) {
      return "Perfect time for natural vitamin D! Position yourself 1m from your window for 15 minutes."
    } else if (currentHour >= 6 && currentHour <= 9) {
      return "Morning light exposure helps regulate your circadian rhythm. Open your blinds wide!"
    } else if (currentHour >= 15 && currentHour <= 17) {
      return "Afternoon light supports focus. Adjust your workspace to catch the golden rays."
    } else {
      return "Evening time - dim the lights gradually to prepare for restful sleep."
    }
  }

  const mockData = {
    lightExposure: [65, 78, 85, 92, 88, 75, 60],
    moodScores: [3, 4, 4, 5, 4, 4, 3],
    energyLevels: [60, 75, 80, 90, 85, 70, 55],
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  }

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
              Rhythms & Light
            </h1>
            <p className="text-sm text-[#3A3A3A] opacity-70">Your wellness dashboard</p>
          </div>
        </div>

        {/* Current Recommendation */}
        <Card className="p-4 bg-gradient-to-r from-[#F5A623]/10 to-[#8BD3DD]/10 border-none">
          <div className="flex items-start space-x-3">
            <Sun className="w-5 h-5 text-[#F5A623] mt-1" />
            <div>
              <p className="text-sm font-medium text-[#3A3A3A] mb-1">Right Now ({timeOfDay})</p>
              <p className="text-sm text-[#3A3A3A] opacity-80 italic">{getWellnessRecommendation()}</p>
            </div>
          </div>
        </Card>

        {/* Quick Mood Check */}
        {wellnessConfig.moodTracking && (
          <Card className="p-4 bg-white/80 border-none shadow-lg">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Heart className="w-5 h-5 text-[#8BD3DD]" />
                <h3 className="font-medium text-[#3A3A3A]">How are you feeling right now?</h3>
              </div>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <Button
                    key={rating}
                    variant="outline"
                    size="sm"
                    onClick={() => setMoodRating(rating)}
                    className={`w-10 h-10 p-0 rounded-full ${
                      moodRating === rating
                        ? "bg-[#F5A623]/20 border-[#F5A623] text-[#F5A623]"
                        : "border-[#8BD3DD]/30 text-[#3A3A3A] hover:bg-[#8BD3DD]/10"
                    }`}
                  >
                    {rating === 1 ? "😔" : rating === 2 ? "😐" : rating === 3 ? "🙂" : rating === 4 ? "😊" : "😄"}
                  </Button>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Wellness Metrics */}
        <Card className="p-6 bg-white/80 border-none shadow-lg">
          <div className="space-y-4">
            <h3 className="font-semibold text-[#3A3A3A]">Your Wellness Patterns</h3>

            {/* Metric Selector */}
            <div className="flex space-x-2">
              {[
                { id: "light", name: "Light", icon: Sun, color: "#F5A623" },
                { id: "mood", name: "Mood", icon: Heart, color: "#8BD3DD" },
                { id: "energy", name: "Energy", icon: Activity, color: "#F5A623" },
              ].map((metric) => (
                <Button
                  key={metric.id}
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedMetric(metric.id)}
                  className={`flex items-center space-x-1 ${
                    selectedMetric === metric.id
                      ? "bg-[#8BD3DD]/20 border-[#8BD3DD] text-[#3A3A3A]"
                      : "border-[#8BD3DD]/30 text-[#3A3A3A] hover:bg-[#8BD3DD]/10"
                  }`}
                >
                  <metric.icon className="w-3 h-3" />
                  <span className="text-xs">{metric.name}</span>
                </Button>
              ))}
            </div>

            {/* Chart Visualization */}
            <div className="h-32 relative bg-[#8BD3DD]/5 rounded-lg p-4">
              <div className="flex items-end justify-between h-full">
                {mockData.days.map((day, index) => {
                  const value =
                    selectedMetric === "light"
                      ? mockData.lightExposure[index]
                      : selectedMetric === "mood"
                        ? mockData.moodScores[index] * 20
                        : mockData.energyLevels[index]

                  return (
                    <div key={day} className="flex flex-col items-center space-y-1">
                      <div
                        className="w-6 bg-gradient-to-t from-[#F5A623] to-[#8BD3DD] rounded-t transition-all duration-300"
                        style={{ height: `${(value / 100) * 80}px` }}
                      ></div>
                      <span className="text-xs text-[#3A3A3A] opacity-60">{day}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Insights */}
            <div className="p-3 bg-[#8BD3DD]/10 rounded-lg">
              <div className="flex items-center space-x-2 mb-1">
                <TrendingUp className="w-4 h-4 text-[#8BD3DD]" />
                <span className="text-sm font-medium text-[#3A3A3A]">Weekly Insight</span>
              </div>
              <p className="text-sm text-[#3A3A3A] opacity-80">
                {selectedMetric === "light" &&
                  "Your light exposure peaks mid-week. Try maintaining consistency on weekends."}
                {selectedMetric === "mood" &&
                  "Your mood correlates strongly with morning light exposure. Keep those blinds open!"}
                {selectedMetric === "energy" &&
                  "Energy levels are highest when you get 2+ hours of natural light daily."}
              </p>
            </div>
          </div>
        </Card>

        {/* Seasonal Recommendations */}
        <Card className="p-4 bg-white/80 border-none shadow-lg">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Leaf className="w-5 h-5 text-[#8BD3DD]" />
              <h3 className="font-medium text-[#3A3A3A]">Seasonal Wellness Tip</h3>
            </div>
            <p className="text-sm text-[#3A3A3A] opacity-80">
              In winter, position your workspace within 1m of your window to combat seasonal fatigue and maintain
              vitamin D levels.
            </p>
          </div>
        </Card>

        {/* Circadian Rhythm Status */}
        {wellnessConfig.circadianMode && (
          <Card className="p-4 bg-white/80 border-none shadow-lg">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <Sun className="w-4 h-4 text-[#F5A623]" />
                    <Moon className="w-4 h-4 text-[#8BD3DD]" />
                  </div>
                  <h3 className="font-medium text-[#3A3A3A]">Circadian Rhythm</h3>
                </div>
                <span className="text-sm font-medium text-[#8BD3DD]">Synchronized</span>
              </div>

              <div className="flex items-center space-x-2">
                <div className="flex-1 h-2 bg-[#8BD3DD]/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#F5A623] to-[#8BD3DD] rounded-full transition-all duration-300"
                    style={{ width: `${(currentHour / 24) * 100}%` }}
                  ></div>
                </div>
                <span className="text-xs text-[#3A3A3A] opacity-60">{currentHour}:00</span>
              </div>
            </div>
          </Card>
        )}

        {/* Continue to Tracking */}
        <Button
          onClick={onNext}
          className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-[#F5A623] to-[#8BD3DD] text-white hover:opacity-90"
        >
          Start Daily Rhythm Tracking
        </Button>

        <p className="text-xs text-[#3A3A3A] opacity-60 text-center">
          "Your interior is an ecosystem. BreezeFrame balances light and privacy, like architectural breathing."
        </p>
      </div>
    </div>
  )
}
