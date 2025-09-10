"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Home, Sun, Moon, Heart, Activity, Bell, Leaf, Wind } from "lucide-react"

interface DailyRhythmTrackingScreenProps {
  onBack: () => void
}

export default function DailyRhythmTrackingScreen({ onBack }: DailyRhythmTrackingScreenProps) {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [todayProgress, setTodayProgress] = useState(65)
  const [nextReminder, setNextReminder] = useState("2:30 PM")

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const currentHour = currentTime.getHours()
  const timeOfDay = currentHour < 12 ? "morning" : currentHour < 18 ? "afternoon" : "evening"

  const getTimeIcon = () => {
    if (currentHour < 6 || currentHour > 18) return Moon
    if (currentHour < 8 || currentHour > 16) return Sun
    return Sun
  }

  const TimeIcon = getTimeIcon()

  const dailyActivities = [
    { time: "7:00 AM", activity: "Morning light exposure", completed: true, icon: Sun },
    { time: "10:30 AM", activity: "Vitamin D window", completed: true, icon: Activity },
    { time: "2:30 PM", activity: "Afternoon energy boost", completed: false, icon: Sun },
    { time: "6:00 PM", activity: "Evening wind-down", completed: false, icon: Moon },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF7EB] to-[#F5F5DC] p-6">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-[#3A3A3A]" style={{ fontFamily: "Playfair Display, serif" }}>
            Your Daily Rhythm
          </h1>
          <p className="text-[#3A3A3A] opacity-70">
            {currentTime.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </div>

        {/* Current Status */}
        <Card className="p-6 bg-gradient-to-br from-white/80 to-[#8BD3DD]/10 border-none shadow-lg">
          <div className="text-center space-y-4">
            <div className="relative">
              <div className="w-24 h-24 mx-auto border-4 border-[#8BD3DD]/20 rounded-full relative">
                <div
                  className="absolute inset-2 border-4 border-[#F5A623] rounded-full"
                  style={{
                    background: `conic-gradient(#F5A623 ${todayProgress * 3.6}deg, #8BD3DD20 ${todayProgress * 3.6}deg)`,
                  }}
                ></div>
                <TimeIcon className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-[#F5A623]" />
              </div>

              {/* Floating wellness indicators */}
              <div className="absolute inset-0 pointer-events-none">
                <Leaf className="absolute -top-2 -left-2 w-4 h-4 text-[#8BD3DD] opacity-60 animate-pulse" />
                <Heart className="absolute -top-2 -right-2 w-4 h-4 text-[#F5A623] opacity-60 animate-pulse" />
                <Wind className="absolute -bottom-2 -left-2 w-4 h-4 text-[#8BD3DD] opacity-60 animate-pulse" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-[#3A3A3A]">Wellness Progress</h3>
              <p className="text-3xl font-bold text-[#F5A623]">{todayProgress}%</p>
              <p className="text-sm text-[#3A3A3A] opacity-70">
                Great {timeOfDay}! You're on track for optimal wellness today.
              </p>
            </div>
          </div>
        </Card>

        {/* Today's Light Schedule */}
        <Card className="p-6 bg-white/80 border-none shadow-lg">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-[#8BD3DD]" />
              <h3 className="font-semibold text-[#3A3A3A]">Today's Wellness Schedule</h3>
            </div>

            <div className="space-y-3">
              {dailyActivities.map((activity, index) => (
                <div
                  key={index}
                  className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 ${
                    activity.completed
                      ? "bg-[#8BD3DD]/10 border border-[#8BD3DD]/20"
                      : "bg-[#F5A623]/10 border border-[#F5A623]/20"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      activity.completed ? "bg-[#8BD3DD] text-white" : "bg-[#F5A623] text-white"
                    }`}
                  >
                    {activity.completed ? (
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                    ) : (
                      <activity.icon className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-[#3A3A3A]">{activity.activity}</p>
                    <p className="text-sm text-[#3A3A3A] opacity-70">{activity.time}</p>
                  </div>
                  {activity.completed && <div className="text-[#8BD3DD] text-sm font-medium">✓ Done</div>}
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Next Reminder */}
        <Card className="p-4 bg-gradient-to-r from-[#F5A623]/10 to-[#8BD3DD]/10 border-none">
          <div className="flex items-center space-x-3">
            <Bell className="w-5 h-5 text-[#F5A623]" />
            <div>
              <p className="font-medium text-[#3A3A3A]">Next Wellness Reminder</p>
              <p className="text-sm text-[#3A3A3A] opacity-70">
                {nextReminder} - Time for your afternoon energy boost! Open your blinds wide for 10 minutes.
              </p>
            </div>
          </div>
        </Card>

        {/* Weekly Wellness Insights */}
        <Card className="p-4 bg-white/80 border-none shadow-lg">
          <div className="space-y-3">
            <h3 className="font-medium text-[#3A3A3A]">This Week's Insights</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center p-3 bg-[#8BD3DD]/10 rounded-lg">
                <p className="font-bold text-[#8BD3DD] text-lg">4.2</p>
                <p className="text-[#3A3A3A] opacity-70">Avg Mood</p>
              </div>
              <div className="text-center p-3 bg-[#F5A623]/10 rounded-lg">
                <p className="font-bold text-[#F5A623] text-lg">6.5h</p>
                <p className="text-[#3A3A3A] opacity-70">Daily Light</p>
              </div>
              <div className="text-center p-3 bg-[#8BD3DD]/10 rounded-lg">
                <p className="font-bold text-[#8BD3DD] text-lg">85%</p>
                <p className="text-[#3A3A3A] opacity-70">Sleep Quality</p>
              </div>
              <div className="text-center p-3 bg-[#F5A623]/10 rounded-lg">
                <p className="font-bold text-[#F5A623] text-lg">92%</p>
                <p className="text-[#3A3A3A] opacity-70">Wellness Score</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Seasonal Wellness Tip */}
        <Card className="p-4 bg-white/80 border-none shadow-lg">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Leaf className="w-5 h-5 text-[#8BD3DD]" />
              <h3 className="font-medium text-[#3A3A3A]">Seasonal Wellness</h3>
            </div>
            <p className="text-sm text-[#3A3A3A] opacity-80">
              Winter tip: Position your workspace within 1m of your window to combat seasonal fatigue and maintain
              healthy vitamin D levels naturally.
            </p>
          </div>
        </Card>

        {/* Back to Order Tracking */}
        <Button
          onClick={onBack}
          variant="outline"
          className="w-full py-3 border-[#8BD3DD] text-[#3A3A3A] hover:bg-[#8BD3DD]/10"
        >
          <Home className="w-5 h-5 mr-2" />
          Return to Order Tracking
        </Button>

        <p className="text-xs text-[#3A3A3A] opacity-60 text-center italic">
          "Your space breathes with you. Every moment is an opportunity to harmonize with nature's rhythm."
        </p>
      </div>
    </div>
  )
}
