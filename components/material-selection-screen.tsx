"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Check, Shield, Settings, Eye, Layers } from "lucide-react"

interface MaterialSelectionScreenProps {
  onNext: (material: any) => void
  onBack: () => void
}

export default function MaterialSelectionScreen({ onNext, onBack }: MaterialSelectionScreenProps) {
  const [selectedFabric, setSelectedFabric] = useState("smart-cotton")
  const [selectedMechanism, setSelectedMechanism] = useState("manual")
  const [mosquitoMesh, setMosquitoMesh] = useState(true)
  const [chainMechanism, setChainMechanism] = useState(false)
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

  const mechanismOptions = [
    {
      id: "manual",
      name: "Manual Fold",
      price: 0,
      description: "Hand-operated accordion folding with magnetic closure",
      features: ["Simple", "Reliable", "Silent"],
    },
  ]

  const getTotalPrice = () => {
    const basePrice = 35 // Solo Kit base price
    const fabricUpgrade = fabricOptions.find((f) => f.id === selectedFabric)?.price || 0
    return basePrice + fabricUpgrade
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF7EB] to-[#F5F5DC] p-6">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="text-[#3A3A3A] hover:bg-[#8BD3DD]/10">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold text-[#3A3A3A]" style={{ fontFamily: "Playfair Display, serif" }}>
            Configure System
          </h1>
        </div>

        {/* System Specs */}
        <Card className="p-4 bg-gradient-to-r from-[#8BD3DD]/10 to-[#F5A623]/10 border-none">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-sm font-medium text-[#3A3A3A]">Dimensions</p>
              <p className="text-xs text-[#3A3A3A] opacity-70">100cm × 100cm × 6cm</p>
            </div>
            <div>
              <p className="text-sm font-medium text-[#3A3A3A]">Panel Size</p>
              <p className="text-xs text-[#3A3A3A] opacity-70">50cm × 100cm each</p>
            </div>
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
                    {fabric.price === 0 ? "Included" : `+$${fabric.price}`}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Mechanism Selection */}
        <div className="space-y-3">
          <h3 className="font-semibold text-[#3A3A3A]">Folding Mechanism</h3>
          {mechanismOptions.map((mechanism) => (
            <Card
              key={mechanism.id}
              className={`p-4 cursor-pointer transition-all duration-300 border-2 ${
                selectedMechanism === mechanism.id
                  ? "border-[#F5A623] bg-gradient-to-r from-[#F5A623]/10 to-[#8BD3DD]/10"
                  : "border-transparent bg-white/80 hover:bg-white/90"
              }`}
              onClick={() => setSelectedMechanism(mechanism.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium text-[#3A3A3A]">{mechanism.name}</h4>
                    {mechanism.id === "chain-assisted" && <Settings className="w-4 h-4 text-[#8BD3DD]" />}
                    {selectedMechanism === mechanism.id && <Check className="w-4 h-4 text-[#F5A623]" />}
                  </div>
                  <p className="text-sm text-[#3A3A3A] opacity-70 mb-2">{mechanism.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {mechanism.features.map((feature) => (
                      <span key={feature} className="px-2 py-1 text-xs bg-[#8BD3DD]/20 text-[#3A3A3A] rounded-full">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-[#3A3A3A]">
                    {mechanism.price === 0 ? "Included" : `+$${mechanism.price}`}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Additional Options */}
        <div className="space-y-3">
          <h3 className="font-semibold text-[#3A3A3A]">Additional Features</h3>

          {/* Mosquito Mesh */}
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
                onClick={() => setMosquitoMesh(!mosquitoMesh)}
                className={`h-6 w-10 p-0 ${mosquitoMesh ? "bg-[#8BD3DD]" : "bg-gray-300"} rounded-full`}
              >
                <div
                  className={`w-4 h-4 bg-white rounded-full transition-transform ${
                    mosquitoMesh ? "translate-x-2" : "-translate-x-2"
                  }`}
                />
              </Button>
            </div>
          </Card>
        </div>

        {/* Price Summary */}
        <Card className="p-4 bg-gradient-to-r from-[#F5A623]/10 to-[#8BD3DD]/10 border-none">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-[#3A3A3A]">Total Price:</span>
            <span className="text-2xl font-bold text-[#3A3A3A]">€{getTotalPrice()}</span>
          </div>
        </Card>

        {/* Continue button */}
        <Button
          onClick={() =>
            onNext({
              fabric: fabricOptions.find((f) => f.id === selectedFabric)?.name,
              mechanism: mechanismOptions.find((m) => m.id === selectedMechanism)?.name,
              mosquitoMesh,
              chainMechanism: selectedMechanism === "chain-assisted" || chainMechanism,
              price: getTotalPrice(),
            })
          }
          className="w-full py-3 bg-gradient-to-r from-[#F5A623] to-[#8BD3DD] text-white hover:opacity-90"
        >
          Continue to Review
        </Button>

        {/* Fabric Preview Modal */}
        <FabricPreview
          fabric={previewFabric}
          isVisible={showFabricPreview}
          onClose={() => setShowFabricPreview(false)}
        />
      </div>
    </div>
  )
}
