"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Check, Home, Building, Building2, Shield, Wrench, Zap } from "lucide-react"

interface KitSelectionScreenProps {
  onNext: (kit: any) => void
  onBack: () => void
}

export default function KitSelectionScreen({ onNext, onBack }: KitSelectionScreenProps) {
  const [selectedKit, setSelectedKit] = useState<string | null>(null)

  const kits = [
    {
      id: "solo",
      name: "Solo Kit",
      subtitle: "1 or 2 panels",
      description: "Single Window",
      price: 35,
      originalPrice: 45,
      features: ["Solution for one window", "DIY installation (15min)", "Perfect for apartments", "1-year warranty"],
      icon: Home,
      popular: false,
    },
    {
      id: "floor",
      name: "Floor Kit",
      subtitle: "3-6 panels",
      description: "Complete Floor",
      price: 129,
      originalPrice: 160,
      features: [
        "Multiple windows (up to 4)",
        "Professional installation included",
        "Synchronized operation",
        "2-year warranty",
      ],
      icon: Building,
      popular: true,
    },
    {
      id: "building",
      name: "Full Building",
      subtitle: "Unlimited panels",
      description: "Entire building solution",
      price: 299,
      originalPrice: 375,
      features: [
        "Entire building solution",
        "Smart home integration",
        "Centralized control",
        "Ideal for businesses",
        "3-year warranty",
      ],
      icon: Building2,
      popular: false,
    },
  ]

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
              Choose Your Kit
            </h1>
            <p className="text-sm text-[#3A3A3A] opacity-70">Select the solution that fits your needs</p>
          </div>
        </div>

        {/* Kit Options */}
        <div className="space-y-4">
          {kits.map((kit) => {
            const IconComponent = kit.icon
            return (
              <Card
                key={kit.id}
                className={`p-6 cursor-pointer transition-all duration-300 border-2 relative ${
                  selectedKit === kit.id
                    ? "border-[#F5A623] bg-gradient-to-r from-[#F5A623]/10 to-[#8BD3DD]/10 shadow-lg"
                    : "border-transparent bg-white/80 hover:bg-white/90 hover:shadow-md"
                }`}
                onClick={() => setSelectedKit(kit.id)}
              >
                {kit.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-[#F5A623] to-[#8BD3DD] text-white text-xs font-bold px-3 py-1 rounded-full">
                      POPULAR
                    </span>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          selectedKit === kit.id ? "bg-[#F5A623]" : "bg-[#8BD3DD]/20"
                        }`}
                      >
                        <IconComponent
                          className={`w-6 h-6 ${selectedKit === kit.id ? "text-white" : "text-[#8BD3DD]"}`}
                        />
                      </div>
                      <div>
                        <h3 className="font-bold text-[#3A3A3A] text-lg">{kit.name}</h3>
                        <p className="text-sm text-[#3A3A3A] opacity-70">{kit.subtitle}</p>
                        <p className="text-sm font-medium text-[#8BD3DD]">{kit.description}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg line-through text-[#3A3A3A] opacity-40">€{kit.originalPrice}</span>
                        <span className="text-2xl font-bold text-[#F5A623]">€{kit.price}</span>
                      </div>
                      {selectedKit === kit.id && <Check className="w-6 h-6 text-[#F5A623] mt-1 ml-auto" />}
                    </div>
                  </div>

                  <div className="space-y-2">
                    {kit.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-[#8BD3DD] rounded-full"></div>
                        <span className="text-sm text-[#3A3A3A] opacity-80">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Installation & Warranty Icons */}
                  <div className="flex items-center justify-between pt-3 border-t border-[#8BD3DD]/20">
                    <div className="flex items-center space-x-4">
                      {kit.id === "solo" ? (
                        <div className="flex items-center space-x-1">
                          <Wrench className="w-4 h-4 text-[#8BD3DD]" />
                          <span className="text-xs text-[#3A3A3A] opacity-70">DIY</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1">
                          <Zap className="w-4 h-4 text-[#F5A623]" />
                          <span className="text-xs text-[#3A3A3A] opacity-70">Pro Install</span>
                        </div>
                      )}

                      <div className="flex items-center space-x-1">
                        <Shield className="w-4 h-4 text-[#8BD3DD]" />
                        <span className="text-xs text-[#3A3A3A] opacity-70">
                          {kit.id === "solo" ? "1yr" : kit.id === "floor" ? "2yr" : "3yr"} warranty
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        {/* Continue Button */}
        <Button
          onClick={() => {
            const selected = kits.find((k) => k.id === selectedKit)
            if (selected) onNext(selected)
          }}
          disabled={!selectedKit}
          className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-[#F5A623] to-[#8BD3DD] text-white hover:opacity-90 disabled:opacity-50"
        >
          Continue with {selectedKit ? kits.find((k) => k.id === selectedKit)?.name : "Selection"}
        </Button>

        <p className="text-xs text-[#3A3A3A] opacity-60 text-center">
          All kits include Wellness Journey access and mosquito mesh integration
        </p>
      </div>
    </div>
  )
}
