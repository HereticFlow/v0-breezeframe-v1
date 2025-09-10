"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Check, Star, Flower, TreePine, Ruler } from "lucide-react"

interface DesignSelectionScreenProps {
  photo: string | null
  aiMeasurements: any
  selectedKit: any
  onNext: (design: any) => void
  onBack: () => void
}

const designs = [
  {
    id: "forest-spirit",
    name: "Forest Spirit",
    description: "Organic patterns with rotating pine star designs",
    tags: ["Natural", "Rotating Stars"],
    icon: TreePine,
    pattern: "Pine tree motifs with 5cm rotating star borders",
    image: "/placeholder.svg?height=200&width=200",
  },
  {
    id: "golden-breeze",
    name: "Golden Breeze",
    description: "Warm sunset gradients with geometric star rotation",
    tags: ["Warm", "Geometric"],
    icon: Star,
    pattern: "Gradient waves with rotating geometric star elements",
    image: "/placeholder.svg?height=200&width=200",
  },
  {
    id: "botanical-fold",
    name: "Botanical Fold",
    description: "Delicate leaf patterns optimized for accordion folding",
    tags: ["Elegant", "Foldable"],
    icon: Flower,
    pattern: "Botanical prints designed for 3-segment folding",
    image: "/placeholder.svg?height=200&width=200",
  },
]

export default function DesignSelectionScreen({
  photo,
  aiMeasurements,
  selectedKit,
  onNext,
  onBack,
}: DesignSelectionScreenProps) {
  const [selectedDesign, setSelectedDesign] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF7EB] to-[#F5F5DC] p-6">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="text-[#3A3A3A] hover:bg-[#8BD3DD]/10">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold text-[#3A3A3A]" style={{ fontFamily: "Playfair Display, serif" }}>
            Choose Your Pattern
          </h1>
        </div>

        {/* Kit & AI Measurements Summary */}
        <Card className="p-4 bg-gradient-to-r from-[#8BD3DD]/10 to-[#F5A623]/10 border-none">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Ruler className="w-4 h-4 text-[#F5A623]" />
                <span className="text-sm font-medium text-[#3A3A3A]">
                  {selectedKit?.name} • {aiMeasurements?.width}cm × {aiMeasurements?.height}cm
                </span>
              </div>
              <span className="text-lg font-bold text-[#F5A623]">€{selectedKit?.price}</span>
            </div>
            <p className="text-xs text-[#3A3A3A] opacity-70">
              {selectedKit?.subtitle} • Perfect fit for BreezeFrame V2 modular system
            </p>
          </div>
        </Card>

        {/* Info Card */}
        <Card className="p-4 bg-gradient-to-r from-[#F5A623]/10 to-[#8BD3DD]/10 border-none">
          <p className="text-sm text-[#3A3A3A] opacity-80">
            Your design will be printed on smart cotton fabric with integrated rotating star elements in the 5cm
            borders.{" "}
            {selectedKit?.id === "building"
              ? "Synchronized across all building panels."
              : selectedKit?.id === "floor"
                ? "Coordinated across all floor windows."
                : "Optimized for your single window."}
          </p>
        </Card>

        {/* Design options */}
        <div className="space-y-4">
          {designs.map((design) => {
            const IconComponent = design.icon
            return (
              <Card
                key={design.id}
                className={`p-4 cursor-pointer transition-all duration-300 border-2 ${
                  selectedDesign === design.id
                    ? "border-[#F5A623] bg-gradient-to-r from-[#F5A623]/10 to-[#8BD3DD]/10 shadow-lg"
                    : "border-transparent bg-white/80 hover:bg-white/90 hover:shadow-md"
                }`}
                onClick={() => setSelectedDesign(design.id)}
              >
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      {/* Pattern Preview */}
                      <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-[#F5A623]/20 to-[#8BD3DD]/20 border-2 border-[#F5A623]/30 flex items-center justify-center">
                        <IconComponent className="w-8 h-8 text-[#F5A623]" />
                        {/* Rotating star indicators */}
                        <div
                          className="absolute -top-1 -left-1 w-3 h-3 bg-[#8BD3DD] rounded-full animate-spin"
                          style={{ animationDuration: "3s" }}
                        ></div>
                        <div
                          className="absolute -top-1 -right-1 w-3 h-3 bg-[#8BD3DD] rounded-full animate-spin"
                          style={{ animationDuration: "3s", animationDelay: "1s" }}
                        ></div>
                        <div
                          className="absolute -bottom-1 -left-1 w-3 h-3 bg-[#8BD3DD] rounded-full animate-spin"
                          style={{ animationDuration: "3s", animationDelay: "2s" }}
                        ></div>
                        <div
                          className="absolute -bottom-1 -right-1 w-3 h-3 bg-[#8BD3DD] rounded-full animate-spin"
                          style={{ animationDuration: "3s", animationDelay: "0.5s" }}
                        ></div>
                      </div>
                      {selectedDesign === design.id && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#F5A623] rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <h3 className="font-semibold text-[#3A3A3A] mb-1">{design.name}</h3>
                      <p className="text-sm text-[#3A3A3A] opacity-70 mb-2">{design.description}</p>
                      <div className="flex space-x-2">
                        {design.tags.map((tag) => (
                          <span key={tag} className="px-2 py-1 text-xs bg-[#8BD3DD]/20 text-[#3A3A3A] rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Pattern Details */}
                  <div className="pl-24">
                    <p className="text-xs text-[#3A3A3A] opacity-60 italic">{design.pattern}</p>
                  </div>

                  {/* Folding Preview */}
                  {selectedDesign === design.id && (
                    <div className="pl-24">
                      <div className="flex space-x-1 mt-2">
                        <div className="flex-1 h-8 bg-gradient-to-r from-[#F5A623]/30 to-[#8BD3DD]/30 rounded border-r border-[#8BD3DD]/20 flex items-center justify-center">
                          <div className="w-2 h-2 bg-[#F5A623] rounded-full"></div>
                        </div>
                        <div className="flex-1 h-8 bg-gradient-to-r from-[#8BD3DD]/30 to-[#F5A623]/30 rounded border-r border-[#8BD3DD]/20 flex items-center justify-center">
                          <div className="w-2 h-2 bg-[#8BD3DD] rounded-full"></div>
                        </div>
                        <div className="flex-1 h-8 bg-gradient-to-r from-[#F5A623]/30 to-[#8BD3DD]/30 rounded flex items-center justify-center">
                          <div className="w-2 h-2 bg-[#F5A623] rounded-full"></div>
                        </div>
                      </div>
                      <p className="text-xs text-[#3A3A3A] opacity-50 mt-1 text-center">3-Segment Folding Preview</p>
                    </div>
                  )}
                </div>
              </Card>
            )
          })}
        </div>

        {/* Continue button */}
        <Button
          onClick={() => {
            const selected = designs.find((d) => d.id === selectedDesign)
            if (selected) onNext(selected)
          }}
          disabled={!selectedDesign}
          className="w-full py-3 bg-gradient-to-r from-[#F5A623] to-[#8BD3DD] text-white hover:opacity-90 disabled:opacity-50"
        >
          Configure {selectedDesign ? designs.find((d) => d.id === selectedDesign)?.name : "Selection"}
        </Button>
      </div>
    </div>
  )
}
