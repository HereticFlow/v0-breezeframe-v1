"use client"

import { useState } from "react"
import HomeScreen from "@/components/home-screen"
import AIPhotoCaptureScreen from "@/components/ai-photo-capture-screen"
import DesignSelectionScreen from "@/components/design-selection-screen"
import SystemConfigurationScreen from "@/components/system-configuration-screen"
import OrderReviewScreen from "@/components/order-review-screen"
import DeliveryTrackingScreen from "@/components/delivery-tracking-screen"
import WellnessJourneyScreen from "@/components/wellness-journey-screen"
import KitSelectionScreen from "@/components/kit-selection-screen"
import DataManagementScreen from "@/components/data-management-screen"

export default function BreezeframeApp() {
  const [currentScreen, setCurrentScreen] = useState(0)
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)
  const [aiMeasurements, setAiMeasurements] = useState<any>(null)
  const [selectedDesign, setSelectedDesign] = useState<any>(null)
  const [selectedKit, setSelectedKit] = useState<any>(null)
  const [systemConfig, setSystemConfig] = useState<any>(null)
  const [orderComplete, setOrderComplete] = useState(false)
  const [wellnessUnlocked, setWellnessUnlocked] = useState(false)

  const screens = [
    // V33 Complete Data Management Integration
    <HomeScreen key="home" onNext={() => setCurrentScreen(1)} onDataManagement={() => setCurrentScreen(8)} />,
    <AIPhotoCaptureScreen
      key="ai-photo"
      onNext={(photo, measurements) => {
        setSelectedPhoto(photo)
        setAiMeasurements(measurements)
        setCurrentScreen(2)
      }}
      onBack={() => setCurrentScreen(0)}
    />,
    <DesignSelectionScreen
      key="design"
      photo={selectedPhoto}
      aiMeasurements={aiMeasurements}
      selectedKit={selectedKit}
      onNext={(design) => {
        setSelectedDesign(design)
        setCurrentScreen(3)
      }}
      onBack={() => setCurrentScreen(1)}
    />,
    <KitSelectionScreen
      key="kit"
      onNext={(kit) => {
        setSelectedKit(kit)
        setCurrentScreen(4)
      }}
      onBack={() => setCurrentScreen(2)}
    />,
    <SystemConfigurationScreen
      key="system"
      selectedKit={selectedKit}
      onNext={(config) => {
        setSystemConfig(config)
        setWellnessUnlocked(true)
        setCurrentScreen(5)
      }}
      onBack={() => setCurrentScreen(3)}
    />,
    <OrderReviewScreen
      key="review"
      design={selectedDesign}
      kit={selectedKit}
      systemConfig={systemConfig}
      aiMeasurements={aiMeasurements}
      onNext={() => {
        setOrderComplete(true)
        setWellnessUnlocked(true)
        setCurrentScreen(6)
      }}
      onBack={() => setCurrentScreen(4)}
    />,
    <DeliveryTrackingScreen
      key="tracking"
      onBack={() => setCurrentScreen(0)}
      onWellnessJourney={() => setCurrentScreen(7)}
      orderComplete={orderComplete}
      wellnessUnlocked={wellnessUnlocked}
    />,
    <WellnessJourneyScreen
      key="wellness"
      aiMeasurements={aiMeasurements}
      onBack={() => setCurrentScreen(6)}
      wellnessUnlocked={wellnessUnlocked}
    />,
    // New Data Management Screen
    <DataManagementScreen key="data-management" onBack={() => setCurrentScreen(0)} />,
  ]

  return <div className="min-h-screen bg-[#FFF7EB] overflow-hidden">{screens[currentScreen]}</div>
}
