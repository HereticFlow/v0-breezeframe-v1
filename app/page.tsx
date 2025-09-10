"use client"

import { useState } from "react"
import { HomeScreen } from "@/components/home-screen"
import { PhotoCaptureScreen } from "@/components/photo-capture-screen"
import { WindowAssessmentScreen } from "@/components/window-assessment-screen"
import { DesignSelectionScreen } from "@/components/design-selection-screen"
import { MaterialSelectionScreen } from "@/components/material-selection-screen"
import { KitSelectionScreen } from "@/components/kit-selection-screen"
import { OrderReviewScreen } from "@/components/order-review-screen"
import { SystemConfigurationScreen } from "@/components/system-configuration-screen"
import { WellnessConfigurationScreen } from "@/components/wellness-configuration-screen"
import { WellnessDashboardScreen } from "@/components/wellness-dashboard-screen"
import { WellnessJourneyScreen } from "@/components/wellness-journey-screen"
import { LightFlowVisualizationScreen } from "@/components/light-flow-visualization-screen"
import { DailyRhythmTrackingScreen } from "@/components/daily-rhythm-tracking-screen"
import { DeliveryTrackingScreen } from "@/components/delivery-tracking-screen"
import { DataManagementScreen } from "@/components/data-management-screen"
import { AdvancedWindowConfigurator } from "@/components/advanced-window-configurator"
import ARPreviewComponent from "@/components/ar-preview-component"

export type Screen =
  | "home"
  | "photo-capture"
  | "window-assessment"
  | "design-selection"
  | "material-selection"
  | "kit-selection"
  | "order-review"
  | "system-configuration"
  | "wellness-configuration"
  | "wellness-dashboard"
  | "wellness-journey"
  | "light-flow-visualization"
  | "daily-rhythm-tracking"
  | "delivery-tracking"
  | "data-management"
  | "advanced-configurator"
  | "ar-preview"

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("home")
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [windowData, setWindowData] = useState<any>(null)
  const [selectedDesign, setSelectedDesign] = useState<any>(null)
  const [selectedMaterial, setSelectedMaterial] = useState<any>(null)
  const [selectedKit, setSelectedKit] = useState<any>(null)
  const [orderData, setOrderData] = useState<any>(null)

  const navigateToScreen = (screen: Screen) => {
    setCurrentScreen(screen)
  }

  const handleImageCapture = (imageData: string) => {
    setCapturedImage(imageData)
    setCurrentScreen("window-assessment")
  }

  const handleWindowAssessment = (data: any) => {
    setWindowData(data)
    setCurrentScreen("design-selection")
  }

  const handleDesignSelection = (design: any) => {
    setSelectedDesign(design)
    setCurrentScreen("material-selection")
  }

  const handleMaterialSelection = (material: any) => {
    setSelectedMaterial(material)
    setCurrentScreen("kit-selection")
  }

  const handleKitSelection = (kit: any) => {
    setSelectedKit(kit)
    setCurrentScreen("order-review")
  }

  const handleOrderReview = (order: any) => {
    setOrderData(order)
    setCurrentScreen("system-configuration")
  }

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case "home":
        return <HomeScreen onNavigate={navigateToScreen} />

      case "photo-capture":
        return <PhotoCaptureScreen onImageCapture={handleImageCapture} onBack={() => setCurrentScreen("home")} />

      case "window-assessment":
        return (
          <WindowAssessmentScreen
            capturedImage={capturedImage}
            onAssessmentComplete={handleWindowAssessment}
            onBack={() => setCurrentScreen("photo-capture")}
          />
        )

      case "design-selection":
        return (
          <DesignSelectionScreen
            windowData={windowData}
            onDesignSelect={handleDesignSelection}
            onBack={() => setCurrentScreen("window-assessment")}
          />
        )

      case "material-selection":
        return (
          <MaterialSelectionScreen
            selectedDesign={selectedDesign}
            onMaterialSelect={handleMaterialSelection}
            onBack={() => setCurrentScreen("design-selection")}
          />
        )

      case "kit-selection":
        return (
          <KitSelectionScreen
            selectedMaterial={selectedMaterial}
            onKitSelect={handleKitSelection}
            onBack={() => setCurrentScreen("material-selection")}
          />
        )

      case "order-review":
        return (
          <OrderReviewScreen
            windowData={windowData}
            selectedDesign={selectedDesign}
            selectedMaterial={selectedMaterial}
            selectedKit={selectedKit}
            onOrderConfirm={handleOrderReview}
            onBack={() => setCurrentScreen("kit-selection")}
          />
        )

      case "system-configuration":
        return (
          <SystemConfigurationScreen
            orderData={orderData}
            onConfigurationComplete={() => setCurrentScreen("wellness-configuration")}
            onBack={() => setCurrentScreen("order-review")}
          />
        )

      case "wellness-configuration":
        return (
          <WellnessConfigurationScreen
            onConfigurationComplete={() => setCurrentScreen("wellness-dashboard")}
            onBack={() => setCurrentScreen("system-configuration")}
          />
        )

      case "wellness-dashboard":
        return (
          <WellnessDashboardScreen
            onNavigate={navigateToScreen}
            onBack={() => setCurrentScreen("wellness-configuration")}
          />
        )

      case "wellness-journey":
        return <WellnessJourneyScreen onBack={() => setCurrentScreen("wellness-dashboard")} />

      case "light-flow-visualization":
        return <LightFlowVisualizationScreen onBack={() => setCurrentScreen("wellness-dashboard")} />

      case "daily-rhythm-tracking":
        return <DailyRhythmTrackingScreen onBack={() => setCurrentScreen("wellness-dashboard")} />

      case "delivery-tracking":
        return <DeliveryTrackingScreen orderData={orderData} onBack={() => setCurrentScreen("wellness-dashboard")} />

      case "data-management":
        return <DataManagementScreen onBack={() => setCurrentScreen("wellness-dashboard")} />

      case "advanced-configurator":
        return <AdvancedWindowConfigurator onBack={() => setCurrentScreen("home")} />

      case "ar-preview":
        return (
          <ARPreviewComponent
            windowData={windowData}
            kitData={selectedKit}
            onClose={() => setCurrentScreen("design-selection")}
          />
        )

      default:
        return <HomeScreen onNavigate={navigateToScreen} />
    }
  }

  return <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">{renderCurrentScreen()}</div>
}
