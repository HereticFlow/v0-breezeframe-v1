"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  ArrowLeft,
  Check,
  Shield,
  Settings,
  Zap,
  Smartphone,
  Thermometer,
  Wind,
  Volume2,
  Heart,
  Eye,
  Layers,
} from "lucide-react"

// Add fabric preview component
function FabricPreview({ fabric, isVisible, onClose }: { fabric: any; isVisible: boolean; onClose: () => void }) {
  const [zoomLevel, setZoomLevel] = useState(1)
  const [showMesh, setShowMesh] = useState(true)

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-white border-none shadow-2xl">
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-[#3A3A3A]">{fabric.name} Preview</h3>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          </div>

          {/* Fabric Texture Visualization */}
          <div className="relative">
            <div
              className="w-full h-48 rounded-lg border-2 border-[#8BD3DD]/30 overflow-hidden relative"
              style={{
                background:
                  fabric.id === "smart-cotton"
                    ? "linear-gradient(45deg, #F5F5DC 25%, #FFFAF0 25%, #FFFAF0 50%, #F5F5DC 50%, #F5F5DC 75%, #FFFAF0 75%, #FFFAF0)"
                    : "linear-gradient(30deg, #F0E68C 25%, #FFFACD 25%, #FFFACD 50%, #F0E68C 50%, #F0E68C 75%, #FFFACD 75%, #FFFACD)",
                backgroundSize: `${20 / zoomLevel}px ${20 / zoomLevel}px`,
                transform: `scale(${zoomLevel})`,
                transformOrigin: "center",
              }}
            >
              {/* Cotton Fiber Texture */}
              <div className="absolute inset-0 opacity-30">
                {Array.from({ length: 50 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-1 h-1 bg-[#8BD3DD] rounded-full opacity-60"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      transform: `rotate(${Math.random() * 360}deg)`,
                    }}
                  />
                ))}
              </div>

              {/* Micro-Mesh Overlay */}
              {showMesh && (
                <div className="absolute inset-0">
                  <svg width="100%" height="100%" className="opacity-40">
                    <defs>
                      <pattern id="mesh" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
                        <circle cx="4" cy="4" r="0.5" fill="none" stroke="#8BD3DD" strokeWidth="0.2" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#mesh)" />
                  </svg>
                </div>
              )}

              {/* Thread Pattern */}
              <div className="absolute inset-0 opacity-20">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div key={`h-${i}`} className="absolute w-full h-px bg-[#F5A623]" style={{ top: `${i * 5}%` }} />
                ))}
                {Array.from({ length: 20 }).map((_, i) => (
                  <div key={`v-${i}`} className="absolute h-full w-px bg-[#F5A623]" style={{ left: `${i * 5}%` }} />
                ))}
              </div>
            </div>

            {/* Zoom Controls */}
            <div className="absolute top-2 right-2 flex space-x-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setZoomLevel(Math.max(1, zoomLevel - 0.5))}
                className="w-8 h-8 p-0 bg-white/80"
              >
                -
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setZoomLevel(Math.min(3, zoomLevel + 0.5))}
                className="w-8 h-8 p-0 bg-white/80"
              >
                +
              </Button>
            </div>

            {/* Mesh Toggle */}
            <div className="absolute bottom-2 left-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowMesh(!showMesh)}
                className={`text-xs bg-white/80 ${showMesh ? "border-[#8BD3DD]" : ""}`}
              >
                <Layers className="w-3 h-3 mr-1" />
                Mesh
              </Button>
            </div>

            {/* Zoom Indicator */}
            <div className="absolute bottom-2 right-2 text-xs bg-white/80 px-2 py-1 rounded">{zoomLevel}x</div>
          </div>

          {/* Fabric Details */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-2 bg-[#8BD3DD]/10 rounded">
                <p className="font-medium text-[#3A3A3A]">Weave Pattern</p>
                <p className="text-xs text-[#3A3A3A] opacity-70">{fabric.texture.weave}</p>
              </div>
              <div className="p-2 bg-[#F5A623]/10 rounded">
                <p className="font-medium text-[#3A3A3A]">Thread Count</p>
                <p className="text-xs text-[#3A3A3A] opacity-70">{fabric.texture.threadCount}</p>
              </div>
              <div className="p-2 bg-[#8BD3DD]/10 rounded">
                <p className="font-medium text-[#3A3A3A]">Protection Level</p>
                <p className="text-xs text-[#3A3A3A] opacity-70">{fabric.texture.protection}</p>
              </div>
              <div className="p-2 bg-[#F5A623]/10 rounded">
                <p className="font-medium text-[#3A3A3A]">Breathability</p>
                <p className="text-xs text-[#3A3A3A] opacity-70">{fabric.texture.breathability}</p>
              </div>
            </div>

            {/* Micro-Mesh Detail */}
            <Card className="p-3 bg-gradient-to-r from-[#8BD3DD]/10 to-[#F5A623]/10 border-none">
              <div className="flex items-start space-x-2">
                <Shield className="w-4 h-4 text-[#8BD3DD] mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-[#3A3A3A]">Micro-Mesh Technology</p>
                  <p className="text-xs text-[#3A3A3A] opacity-70">
                    Ultra-fine mesh woven directly into cotton fibers. Openings are smaller than mosquito proboscis
                    (0.1-0.2mm) while maintaining excellent airflow and visibility.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </Card>
    </div>
  )
}

interface SystemConfigurationScreenProps {
  selectedKit: any
  onNext: (config: any) => void
  onBack: () => void
}

export default function SystemConfigurationScreen({ selectedKit, onNext, onBack }: SystemConfigurationScreenProps) {
  const [selectedSystem, setSelectedSystem] = useState("manual")
  const [additionalFeatures, setAdditionalFeatures] = useState({
    mosquitoMesh: true,
    airQuality: false,
    humidity: false,
    noiseReduction: false,
  })

  const [showFabricPreview, setShowFabricPreview] = useState(false)
  const [previewFabric, setPreviewFabric] = useState(null)

  const fabricOptions = [
    {
      id: "smart-cotton",
      name: "Smart Cotton Blend",
      price: 0,
      description: "Recycled cotton with micro-mesh integration",
      features: ["Eco-friendly", "Breathable", "Durable"],
      texture: {
        weave: "Plain weave with integrated micro-mesh",
        threadCount: "200 TC with 0.2mm mesh openings",
        protection: "99.5% mosquito protection",
        breathability: "High airflow retention",
      },
    },
    {
      id: "premium-cotton",
      name: "Premium Smart Cotton",
      price: 25,
      description: "Enhanced cotton blend with UV protection",
      features: ["UV Protection", "Stain Resistant", "Premium Feel"],
      texture: {
        weave: "Twill weave with reinforced micro-mesh",
        threadCount: "300 TC with 0.15mm mesh openings",
        protection: "99.8% mosquito protection + UV50+",
        breathability: "Optimal airflow with UV filtering",
      },
    },
  ]

  const [selectedFabric, setSelectedFabric] = useState("smart-cotton")

  // Pricing based on kit type
  const getMotorizedPricing = () => {
    const basePrices = {
      solo: { basic: 15, advanced: 40 },
      floor: { basic: 25, advanced: 50 },
      building: { basic: 40, advanced: 65 },
    }
    return basePrices[selectedKit?.id] || basePrices.solo
  }

  const motorizedPricing = getMotorizedPricing()

  const systemOptions = [
    {
      id: "manual",
      name: "Manual Operation",
      price: 0,
      description: "Hand-operated accordion folding with magnetic closure",
      features: ["Simple & Reliable", "Silent Operation", "No Power Required"],
      icon: Settings,
    },
    {
      id: "motorized-basic",
      name: "Motorized System",
      price: motorizedPricing.basic,
      description: "Electric motor with remote control",
      features: ["Remote Control", "Smartphone App", "Quiet Motor"],
      icon: Zap,
    },
    {
      id: "motorized-smart",
      name: "Smart Home Integration",
      price: motorizedPricing.advanced,
      description: "Full automation with environmental sensors",
      features: ["Smart Home Compatible", "Environmental Sensors", "Auto-Adjustment", "Voice Control"],
      icon: Smartphone,
      premium: true,
    },
  ]

  const sensorFeatures = [
    {
      id: "airQuality",
      name: "Air Quality Monitoring",
      description: "PM2.5, CO2, and VOC sensors",
      icon: Wind,
      price: 25,
      requiresMotorized: true,
    },
    {
      id: "humidity",
      name: "Humidity & Temperature",
      description: "Climate monitoring and auto-adjustment",
      icon: Thermometer,
      price: 20,
      requiresMotorized: true,
    },
    {
      id: "noiseReduction",
      name: "Noise Reduction System",
      description: "Active noise cancellation technology",
      icon: Volume2,
      price: 35,
      requiresMotorized: true,
    },
  ]

  const getTotalPrice = () => {
    const basePrice = selectedKit?.price || 35
    const systemUpgrade = systemOptions.find((s) => s.id === selectedSystem)?.price || 0
    const fabricUpgrade = fabricOptions.find((f) => f.id === selectedFabric)?.price || 0
    const featuresPrice = sensorFeatures.reduce((total, feature) => {
      return total + (additionalFeatures[feature.id] ? feature.price : 0)
    }, 0)
    return basePrice + systemUpgrade + fabricUpgrade + featuresPrice
  }

  const isMotorized = selectedSystem.includes("motorized")
  const wellnessUnlocked = true // Always unlock wellness journey after purchase
  const advancedWellnessFeatures = selectedSystem === "motorized-smart" // Only advanced sensors for smart home

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
              Configure System
            </h1>
            <p className="text-sm text-[#3A3A3A] opacity-70">{selectedKit?.name} • Advanced options</p>
          </div>
        </div>

        {/* Kit Summary */}
        <Card className="p-4 bg-gradient-to-r from-[#8BD3DD]/10 to-[#F5A623]/10 border-none">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#3A3A3A]">{selectedKit?.name}</p>
              <p className="text-xs text-[#3A3A3A] opacity-70">{selectedKit?.subtitle}</p>
            </div>
            <span className="text-lg font-bold text-[#F5A623]">€{selectedKit?.price}</span>
          </div>
        </Card>

        {/* Fabric Selection */}
        <div className="space-y-3">
          <h3 className="font-semibold text-[#3A3A3A]">Smart Cotton Fabric</h3>
          {fabricOptions.map((fabric) => (
            <Card
              key={fabric.id}
              className={`p-4 cursor-pointer transition-all duration-300 border-2 ${
                selectedFabric === fabric.id
                  ? "border-[#F5A623] bg-gradient-to-r from-[#F5A623]/10 to-[#8BD3DD]/10"
                  : "border-transparent bg-white/80 hover:bg-white/90"
              }`}
              onClick={() => setSelectedFabric(fabric.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium text-[#3A3A3A]">{fabric.name}</h4>
                    {selectedFabric === fabric.id && <Check className="w-4 h-4 text-[#F5A623]" />}
                  </div>
                  <p className="text-sm text-[#3A3A3A] opacity-70 mb-2">{fabric.description}</p>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {fabric.features.map((feature) => (
                      <span key={feature} className="px-2 py-1 text-xs bg-[#8BD3DD]/20 text-[#3A3A3A] rounded-full">
                        {feature}
                      </span>
                    ))}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation()
                      setPreviewFabric(fabric)
                      setShowFabricPreview(true)
                    }}
                    className="w-full mt-2 border-[#8BD3DD]/30 text-[#3A3A3A] hover:bg-[#8BD3DD]/10"
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    View Fabric Detail
                  </Button>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-[#3A3A3A]">
                    {fabric.price === 0 ? "Included" : `+€${fabric.price}`}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* System Type Selection */}
        <div className="space-y-3">
          <h3 className="font-semibold text-[#3A3A3A]">Operation System</h3>
          {systemOptions.map((system) => {
            const IconComponent = system.icon
            return (
              <Card
                key={system.id}
                className={`p-4 cursor-pointer transition-all duration-300 border-2 relative ${
                  selectedSystem === system.id
                    ? "border-[#F5A623] bg-gradient-to-r from-[#F5A623]/10 to-[#8BD3DD]/10 shadow-lg"
                    : "border-transparent bg-white/80 hover:bg-white/90 hover:shadow-md"
                }`}
                onClick={() => setSelectedSystem(system.id)}
              >
                {system.premium && (
                  <div className="absolute -top-2 left-4">
                    <span className="bg-gradient-to-r from-[#F5A623] to-[#8BD3DD] text-white text-xs font-bold px-2 py-1 rounded-full">
                      SMART
                    </span>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          selectedSystem === system.id ? "bg-[#F5A623]" : "bg-[#8BD3DD]/20"
                        }`}
                      >
                        <IconComponent
                          className={`w-5 h-5 ${selectedSystem === system.id ? "text-white" : "text-[#8BD3DD]"}`}
                        />
                      </div>
                      <div>
                        <h4 className="font-semibold text-[#3A3A3A]">{system.name}</h4>
                        <p className="text-sm text-[#3A3A3A] opacity-70">{system.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-[#3A3A3A]">
                        {system.price === 0 ? "Included" : `+€${system.price}`}
                      </p>
                      {selectedSystem === system.id && <Check className="w-5 h-5 text-[#F5A623] mt-1" />}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {system.features.map((feature) => (
                      <span key={feature} className="px-2 py-1 text-xs bg-[#8BD3DD]/20 text-[#3A3A3A] rounded-full">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        {/* Wellness Journey Always Unlocked */}
        <Card className="p-4 bg-gradient-to-r from-[#F5A623]/10 to-[#8BD3DD]/10 border-none">
          <div className="space-y-2">
            <h4 className="font-semibold text-[#3A3A3A] flex items-center space-x-2">
              <Heart className="w-4 h-4 text-[#F5A623]" />
              <span>🎉 Wellness Journey Included!</span>
            </h4>
            <p className="text-sm text-[#3A3A3A] opacity-80">
              Every BreezeFrame includes access to our architectural wellness journey: window assessment, light flow
              visualization, and daily rhythm tracking.
            </p>
            {selectedSystem === "motorized-smart" && (
              <p className="text-sm text-[#8BD3DD] font-medium">
                + Smart Home Integration unlocks advanced environmental monitoring and automation!
              </p>
            )}
          </div>
        </Card>

        {/* Additional Sensor Features */}
        <div className="space-y-3">
          <h3 className="font-semibold text-[#3A3A3A]">Environmental Sensors</h3>

          {/* Mosquito Mesh (Always Available) */}
          <Card className="p-4 bg-white/80 border-none shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-[#8BD3DD]" />
                <div>
                  <h4 className="font-medium text-[#3A3A3A]">Integrated Mosquito Mesh</h4>
                  <p className="text-sm text-[#3A3A3A] opacity-70">Micro-mesh protection built into fabric</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAdditionalFeatures((prev) => ({ ...prev, mosquitoMesh: !prev.mosquitoMesh }))}
                className={`h-6 w-10 p-0 ${additionalFeatures.mosquitoMesh ? "bg-[#8BD3DD]" : "bg-gray-300"} rounded-full`}
              >
                <div
                  className={`w-4 h-4 bg-white rounded-full transition-transform ${
                    additionalFeatures.mosquitoMesh ? "translate-x-2" : "-translate-x-2"
                  }`}
                />
              </Button>
            </div>
          </Card>

          {/* Advanced Sensor Features */}
          {sensorFeatures.map((feature) => {
            const IconComponent = feature.icon
            const isDisabled = feature.requiresMotorized && !isMotorized

            return (
              <Card
                key={feature.id}
                className={`p-4 border-none shadow-lg ${isDisabled ? "bg-gray-100 opacity-50" : "bg-white/80"}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <IconComponent className={`w-5 h-5 ${isDisabled ? "text-gray-400" : "text-[#F5A623]"}`} />
                    <div>
                      <h4 className={`font-medium ${isDisabled ? "text-gray-400" : "text-[#3A3A3A]"}`}>
                        {feature.name}
                        {feature.requiresMotorized && !isMotorized && (
                          <span className="text-xs text-gray-400 ml-2">(Requires Motorized)</span>
                        )}
                      </h4>
                      <p className={`text-sm opacity-70 ${isDisabled ? "text-gray-400" : "text-[#3A3A3A]"}`}>
                        {feature.description}
                      </p>
                      {!isDisabled && <p className="text-xs font-medium text-[#F5A623]">+€{feature.price}</p>}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={isDisabled}
                    onClick={() => setAdditionalFeatures((prev) => ({ ...prev, [feature.id]: !prev[feature.id] }))}
                    className={`h-6 w-10 p-0 ${
                      additionalFeatures[feature.id] && !isDisabled ? "bg-[#F5A623]" : "bg-gray-300"
                    } rounded-full`}
                  >
                    <div
                      className={`w-4 h-4 bg-white rounded-full transition-transform ${
                        additionalFeatures[feature.id] && !isDisabled ? "translate-x-2" : "-translate-x-2"
                      }`}
                    />
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>

        {/* Price Summary */}
        <Card className="p-4 bg-gradient-to-r from-[#F5A623]/10 to-[#8BD3DD]/10 border-none">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[#3A3A3A]">{selectedKit?.name}:</span>
              <span className="text-[#3A3A3A]">€{selectedKit?.price}</span>
            </div>
            {selectedSystem !== "manual" && (
              <div className="flex justify-between text-sm">
                <span className="text-[#3A3A3A]">System Upgrade:</span>
                <span className="text-[#3A3A3A]">+€{systemOptions.find((s) => s.id === selectedSystem)?.price}</span>
              </div>
            )}
            {selectedFabric !== "smart-cotton" && (
              <div className="flex justify-between text-sm">
                <span className="text-[#3A3A3A]">Fabric Upgrade:</span>
                <span className="text-[#3A3A3A]">+€{fabricOptions.find((f) => f.id === selectedFabric)?.price}</span>
              </div>
            )}
            {sensorFeatures.map(
              (feature) =>
                additionalFeatures[feature.id] && (
                  <div key={feature.id} className="flex justify-between text-sm">
                    <span className="text-[#3A3A3A]">{feature.name}:</span>
                    <span className="text-[#3A3A3A]">+€{feature.price}</span>
                  </div>
                ),
            )}
            <div className="border-t border-[#8BD3DD]/20 pt-2 flex justify-between items-center">
              <span className="font-semibold text-[#3A3A3A]">Total:</span>
              <span className="text-2xl font-bold text-[#3A3A3A]">€{getTotalPrice()}</span>
            </div>
          </div>
        </Card>

        {/* Continue Button */}
        <Button
          onClick={() =>
            onNext({
              system: selectedSystem,
              features: additionalFeatures,
              totalPrice: getTotalPrice(),
              wellnessUnlocked: true, // Always true
              advancedWellnessFeatures: selectedSystem === "motorized-smart",
              isMotorized,
            })
          }
          className="w-full py-3 bg-gradient-to-r from-[#F5A623] to-[#8BD3DD] text-white hover:opacity-90"
        >
          Continue to Review
        </Button>

        <p className="text-xs text-[#3A3A3A] opacity-60 text-center">
          {isMotorized
            ? "Professional installation included with motorized systems"
            : "DIY installation guide included"}
        </p>
      </div>

      {/* Fabric Preview Modal */}
      <FabricPreview fabric={previewFabric} isVisible={showFabricPreview} onClose={() => setShowFabricPreview(false)} />
    </div>
  )
}
