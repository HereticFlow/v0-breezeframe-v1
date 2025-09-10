"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Moon, Sun, Heart, Volume2, Bell, Leaf } from "lucide-react"

interface WellnessConfigurationScreenProps {
  onNext: (config: any) => void
  onBack: () => void
}

export default function WellnessConfigurationScreen({ onNext, onBack }: WellnessConfigurationScreenProps) {
  const [config, setConfig] = useState({
    circadianMode: true,
    moodTracking: true,
    naturalSounds: false,
    autoAdjust: true,
    reminderFrequency: "gentle",
    sleepMode: true,
  })

  const toggleConfig = (key: string) => {
    setConfig((prev) => ({ ...prev, [key]: !prev[key] }))
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
              Wellness Harmony
            </h1>
            <p className="text-sm text-[#3A3A3A] opacity-70">Personalize your architectural wellness</p>
          </div>
        </div>

        {/* Circadian Rhythm */}
        <Card className="p-6 bg-white/80 border-none shadow-lg">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex space-x-1">
                  <Sun className="w-5 h-5 text-[#F5A623]" />
                  <Moon className="w-5 h-5 text-[#8BD3DD]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#3A3A3A]">Circadian Rhythm Support</h3>
                  <p className="text-sm text-[#3A3A3A] opacity-70">Sync with your natural sleep-wake cycle</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleConfig("circadianMode")}
                className={`h-6 w-10 p-0 ${config.circadianMode ? "bg-[#F5A623]" : "bg-gray-300"} rounded-full`}
              >
                <div
                  className={`w-4 h-4 bg-white rounded-full transition-transform ${
                    config.circadianMode ? "translate-x-2" : "-translate-x-2"
                  }`}
                />
              </Button>
            </div>

            {config.circadianMode && (
              <div className="p-3 bg-[#F5A623]/10 rounded-lg">
                <p className="text-sm text-[#3A3A3A] opacity-80">
                  Automatically adjusts light recommendations based on time of day to support healthy sleep patterns.
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Mood Tracking */}
        <Card className="p-6 bg-white/80 border-none shadow-lg">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Heart className="w-5 h-5 text-[#8BD3DD]" />
                <div>
                  <h3 className="font-semibold text-[#3A3A3A]">Mood & Energy Tracking</h3>
                  <p className="text-sm text-[#3A3A3A] opacity-70">Monitor how light affects your wellbeing</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleConfig("moodTracking")}
                className={`h-6 w-10 p-0 ${config.moodTracking ? "bg-[#8BD3DD]" : "bg-gray-300"} rounded-full`}
              >
                <div
                  className={`w-4 h-4 bg-white rounded-full transition-transform ${
                    config.moodTracking ? "translate-x-2" : "-translate-x-2"
                  }`}
                />
              </Button>
            </div>

            {config.moodTracking && (
              <div className="p-3 bg-[#8BD3DD]/10 rounded-lg">
                <p className="text-sm text-[#3A3A3A] opacity-80">
                  Daily mood check-ins help correlate your emotional state with light exposure patterns.
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Natural Sounds */}
        <Card className="p-6 bg-white/80 border-none shadow-lg">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Volume2 className="w-5 h-5 text-[#8BD3DD]" />
                <div>
                  <h3 className="font-semibold text-[#3A3A3A]">Ambient Nature Sounds</h3>
                  <p className="text-sm text-[#3A3A3A] opacity-70">Gentle sounds when adjusting your space</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleConfig("naturalSounds")}
                className={`h-6 w-10 p-0 ${config.naturalSounds ? "bg-[#8BD3DD]" : "bg-gray-300"} rounded-full`}
              >
                <div
                  className={`w-4 h-4 bg-white rounded-full transition-transform ${
                    config.naturalSounds ? "translate-x-2" : "-translate-x-2"
                  }`}
                />
              </Button>
            </div>

            {config.naturalSounds && (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  {["Forest Breeze", "Ocean Waves", "Rain Drops", "Bird Songs"].map((sound) => (
                    <Button
                      key={sound}
                      variant="outline"
                      size="sm"
                      className="text-xs border-[#8BD3DD]/30 text-[#3A3A3A] hover:bg-[#8BD3DD]/10"
                    >
                      {sound}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Wellness Reminders */}
        <Card className="p-6 bg-white/80 border-none shadow-lg">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Bell className="w-5 h-5 text-[#F5A623]" />
              <div>
                <h3 className="font-semibold text-[#3A3A3A]">Wellness Reminders</h3>
                <p className="text-sm text-[#3A3A3A] opacity-70">Gentle nudges for optimal light exposure</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-[#3A3A3A]">Reminder Style</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "gentle", name: "Gentle", desc: "Soft suggestions" },
                  { id: "regular", name: "Regular", desc: "Helpful reminders" },
                  { id: "focused", name: "Focused", desc: "Active coaching" },
                ].map((style) => (
                  <Button
                    key={style.id}
                    variant="outline"
                    size="sm"
                    onClick={() => setConfig((prev) => ({ ...prev, reminderFrequency: style.id }))}
                    className={`h-auto p-2 flex flex-col ${
                      config.reminderFrequency === style.id
                        ? "bg-[#F5A623]/20 border-[#F5A623] text-[#3A3A3A]"
                        : "border-[#F5A623]/30 text-[#3A3A3A] hover:bg-[#F5A623]/10"
                    }`}
                  >
                    <span className="text-xs font-medium">{style.name}</span>
                    <span className="text-xs opacity-70">{style.desc}</span>
                  </Button>
                ))}
              </div>
            </div>

            <div className="p-3 bg-[#F5A623]/10 rounded-lg">
              <p className="text-sm text-[#3A3A3A] opacity-80 italic">
                "It's 3 PM – open wide for 10 minutes for a vitamin D boost."
              </p>
            </div>
          </div>
        </Card>

        {/* Auto-Adjust Mode */}
        <Card className="p-6 bg-white/80 border-none shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Leaf className="w-5 h-5 text-[#8BD3DD]" />
              <div>
                <h3 className="font-semibold text-[#3A3A3A]">Adaptive Wellness Mode</h3>
                <p className="text-sm text-[#3A3A3A] opacity-70">Automatically optimize for eye comfort</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleConfig("autoAdjust")}
              className={`h-6 w-10 p-0 ${config.autoAdjust ? "bg-[#8BD3DD]" : "bg-gray-300"} rounded-full`}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full transition-transform ${
                  config.autoAdjust ? "translate-x-2" : "-translate-x-2"
                }`}
              />
            </Button>
          </div>
        </Card>

        {/* Continue Button */}
        <Button
          onClick={() => onNext(config)}
          className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-[#F5A623] to-[#8BD3DD] text-white hover:opacity-90"
        >
          Create My Wellness Dashboard
        </Button>

        <p className="text-xs text-[#3A3A3A] opacity-60 text-center">
          Your wellness settings can be adjusted anytime in your personal dashboard
        </p>
      </div>
    </div>
  )
}
