"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Sun, Heart, Leaf, Wind } from "lucide-react"
import WindowAssessmentScreen from "./window-assessment-screen"
import LightFlowVisualizationScreen from "./light-flow-visualization-screen"
import WellnessConfigurationScreen from "./wellness-configuration-screen"
import WellnessDashboardScreen from "./wellness-dashboard-screen"
import DailyRhythmTrackingScreen from "./daily-rhythm-tracking-screen"

interface WellnessJourneyScreenProps {
  aiMeasurements: any
  onBack: () => void
  wellnessUnlocked: boolean
}

export default function WellnessJourneyScreen({
  aiMeasurements,
  onBack,
  wellnessUnlocked,
}: WellnessJourneyScreenProps) {
  const [currentWellnessScreen, setCurrentWellnessScreen] = useState(0)
  const [windowData, setWindowData] = useState<any>(null)
  const [lightFlowData, setLightFlowData] = useState<any>(null)
  const [wellnessConfig, setWellnessConfig] = useState({
    circadianMode: true,
    moodTracking: true,
    naturalSounds: true,
    autoAdjust: true,
  })

  // Remove the locked state - wellness journey is always available after purchase
  const wellnessScreens = [
    // V25 Wellness Journey - Beautiful exploration for ALL customers
    <WellnessHomeScreen key="wellness-home" onNext={() => setCurrentWellnessScreen(1)} onBack={onBack} />,
    <WindowAssessmentScreen
      key="assessment"
      aiMeasurements={aiMeasurements}
      onNext={(data) => {
        setWindowData(data)
        setCurrentWellnessScreen(2)
      }}
      onBack={() => setCurrentWellnessScreen(0)}
    />,
    <LightFlowVisualizationScreen
      key="lightflow"
      windowData={windowData}
      onNext={(data) => {
        setLightFlowData(data)
        setCurrentWellnessScreen(3)
      }}
      onBack={() => setCurrentWellnessScreen(1)}
    />,
    <WellnessConfigurationScreen
      key="config"
      onNext={(config) => {
        setWellnessConfig(config)
        setCurrentWellnessScreen(4)
      }}
      onBack={() => setCurrentWellnessScreen(2)}
    />,
    <WellnessDashboardScreen
      key="dashboard"
      windowData={windowData}
      lightFlowData={lightFlowData}
      wellnessConfig={wellnessConfig}
      onNext={() => setCurrentWellnessScreen(5)}
      onBack={() => setCurrentWellnessScreen(3)}
    />,
    <DailyRhythmTrackingScreen key="tracking" onBack={() => onBack()} />,
  ]

  return <div className="min-h-screen bg-[#FFF7EB] overflow-hidden">{wellnessScreens[currentWellnessScreen]}</div>
}

// Update the wellness home screen to emphasize it's a beautiful exploration
function WellnessHomeScreen({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const currentHour = new Date().getHours()
  const timeOfDay = currentHour < 12 ? "morning" : currentHour < 18 ? "afternoon" : "evening"
  const greeting = {
    morning: "Good morning. Your space awakens with you.",
    afternoon: "Good afternoon. Let natural light energize your day.",
    evening: "Good evening. Time to harmonize with nature's rhythm.",
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF7EB] via-[#FFF7EB] to-[#F5F5DC] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Floating wellness elements */}
      <div className="absolute inset-0 pointer-events-none">
        <Leaf
          className="absolute top-20 left-10 w-6 h-6 text-[#8BD3DD] opacity-30 animate-pulse"
          style={{ animationDelay: "0s", animationDuration: "4s" }}
        />
        <Sun
          className="absolute top-32 right-16 w-5 h-5 text-[#F5A623] opacity-40 animate-bounce"
          style={{ animationDelay: "1s", animationDuration: "5s" }}
        />
        <Wind
          className="absolute bottom-40 left-20 w-5 h-5 text-[#8BD3DD] opacity-25 animate-pulse"
          style={{ animationDelay: "2s", animationDuration: "3s" }}
        />
        <Heart
          className="absolute bottom-32 right-12 w-4 h-4 text-[#F5A623] opacity-30 animate-pulse"
          style={{ animationDelay: "3s", animationDuration: "4s" }}
        />
      </div>

      <div className="text-center space-y-8 max-w-md">
        {/* Back Button */}
        <div className="flex items-center space-x-4 mb-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="text-[#3A3A3A] hover:bg-[#8BD3DD]/10">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1"></div>
        </div>

        {/* Header */}
        <div className="space-y-4">
          <h1
            className="text-4xl font-bold text-[#3A3A3A] tracking-wide"
            style={{ fontFamily: "Playfair Display, serif" }}
          >
            Wellness Journey
          </h1>
          <p className="text-lg text-[#3A3A3A] opacity-80 leading-relaxed">A Beautiful Exploration</p>
          <p className="text-sm text-[#3A3A3A] opacity-60 italic">{greeting[timeOfDay]}</p>
        </div>

        {/* Welcome Message */}
        <Card className="p-6 bg-gradient-to-br from-white/80 to-[#8BD3DD]/10 border-none shadow-lg backdrop-blur-sm">
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <Heart className="w-5 h-5 text-[#F5A623]" />
              <p className="text-sm font-medium text-[#3A3A3A]">Welcome to Your Wellness Journey</p>
            </div>
            <p className="text-sm text-[#3A3A3A] opacity-80 leading-relaxed italic">
              "While your BreezeFrame is being crafted, discover how to optimize your space for wellness, natural light
              harmony, and architectural breathing."
            </p>
          </div>
        </Card>

        {/* Journey Preview */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="space-y-2">
            <Sun className="w-8 h-8 mx-auto text-[#F5A623]" />
            <p className="text-xs text-[#3A3A3A] opacity-70">Window Assessment</p>
          </div>
          <div className="space-y-2">
            <Heart className="w-8 h-8 mx-auto text-[#8BD3DD]" />
            <p className="text-xs text-[#3A3A3A] opacity-70">Light Flow</p>
          </div>
          <div className="space-y-2">
            <Leaf className="w-8 h-8 mx-auto text-[#8BD3DD]" />
            <p className="text-xs text-[#3A3A3A] opacity-70">Daily Rhythm</p>
          </div>
        </div>

        {/* Begin Journey Button */}
        <Button
          onClick={onNext}
          className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-[#F5A623] to-[#8BD3DD] hover:from-[#F5A623]/90 hover:to-[#8BD3DD]/90 text-white border-none shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
        >
          Begin Wellness Exploration
        </Button>

        <p className="text-sm text-[#3A3A3A] opacity-60">
          "A beautiful side journey that brings you back to track your BreezeFrame creation."
        </p>
      </div>
    </div>
  )
}
