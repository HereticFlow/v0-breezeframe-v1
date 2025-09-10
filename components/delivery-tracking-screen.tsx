"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Home, Package, Truck, CheckCircle, Settings, Star, Wind, Sparkles, Heart } from "lucide-react"

interface DeliveryTrackingScreenProps {
  onBack: () => void
  onWellnessJourney: () => void
  orderComplete: boolean
  wellnessUnlocked: boolean
}

export default function DeliveryTrackingScreen({
  onBack,
  onWellnessJourney,
  orderComplete,
  wellnessUnlocked,
}: DeliveryTrackingScreenProps) {
  const [currentStep, setCurrentStep] = useState(2)
  const [assemblyProgress, setAssemblyProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setAssemblyProgress((prev) => (prev + 1) % 100)
    }, 150)

    return () => clearInterval(interval)
  }, [])

  const steps = [
    { id: 1, name: "Order Confirmed", icon: CheckCircle, completed: true },
    { id: 2, name: "Manufacturing", icon: Settings, completed: currentStep >= 2 },
    { id: 3, name: "Quality Check", icon: Star, completed: currentStep >= 3 },
    { id: 4, name: "Shipped", icon: Truck, completed: currentStep >= 4 },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF7EB] to-[#F5F5DC] p-6">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-[#3A3A3A]" style={{ fontFamily: "Playfair Display, serif" }}>
            BreezeFrame Production
          </h1>
          <p className="text-[#3A3A3A] opacity-70">Order #BF-V2-2024-001</p>
        </div>

        {/* Wellness Journey Always Available */}
        <Card className="p-4 bg-gradient-to-r from-[#F5A623]/10 to-[#8BD3DD]/10 border-none shadow-lg">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Heart className="w-5 h-5 text-[#F5A623]" />
              <h3 className="font-semibold text-[#3A3A3A]">✨ Your Wellness Journey Awaits</h3>
            </div>
            <p className="text-sm text-[#3A3A3A] opacity-80">
              While we craft your BreezeFrame, explore our beautiful wellness journey. Discover window assessment, light
              flow visualization, and daily rhythm tracking.
            </p>
            <Button
              onClick={onWellnessJourney}
              className="w-full py-3 bg-gradient-to-r from-[#F5A623] to-[#8BD3DD] text-white hover:opacity-90"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Explore Wellness Journey
            </Button>
          </div>
        </Card>

        {/* Progress Steps */}
        <Card className="p-6 bg-white/80 border-none shadow-lg">
          <div className="space-y-6">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center space-x-4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    step.completed
                      ? "bg-gradient-to-r from-[#F5A623] to-[#8BD3DD] text-white"
                      : "bg-gray-200 text-gray-400"
                  }`}
                >
                  <step.icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className={`font-medium ${step.completed ? "text-[#3A3A3A]" : "text-gray-400"}`}>{step.name}</h3>
                  {step.completed && (
                    <p className="text-sm text-[#3A3A3A] opacity-70">
                      {step.id === 1 && "Payment processed and production scheduled"}
                      {step.id === 2 && "Smart cotton panels being printed and assembled"}
                      {step.id === 3 && "Testing folding mechanism and magnetic closure"}
                      {step.id === 4 && "Package prepared for shipping"}
                    </p>
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-px h-8 ${step.completed ? "bg-[#8BD3DD]" : "bg-gray-200"}`} />
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Manufacturing Animation */}
        <Card className="p-6 bg-gradient-to-br from-[#8BD3DD]/10 to-[#F5A623]/10 border-none shadow-lg overflow-hidden">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Settings className="w-5 h-5 text-[#F5A623] animate-spin" />
              <h3 className="font-semibold text-[#3A3A3A]">Currently Manufacturing</h3>
            </div>

            {/* BreezeFrame Assembly Animation */}
            <div className="relative h-32 bg-gradient-to-r from-[#8BD3DD]/20 via-[#F5A623]/20 to-[#8BD3DD]/20 rounded-lg">
              {/* Panel Casings */}
              <div className="absolute left-2 top-2 w-4 h-28 bg-[#8BD3DD]/40 rounded"></div>
              <div className="absolute right-2 top-2 w-4 h-28 bg-[#8BD3DD]/40 rounded"></div>

              {/* Animated Panels */}
              <div className="absolute left-6 top-4 right-6 bottom-4 flex space-x-2">
                <div
                  className="flex-1 bg-gradient-to-br from-[#F5A623]/30 to-[#8BD3DD]/30 rounded border border-[#F5A623]/50 flex transition-all duration-300"
                  style={{ transform: `scaleX(${0.7 + (assemblyProgress % 30) / 100})` }}
                >
                  <div className="flex-1 border-r border-[#8BD3DD]/30 flex items-center justify-center">
                    <Star className="w-3 h-3 text-[#F5A623] animate-spin" />
                  </div>
                  <div className="flex-1 border-r border-[#8BD3DD]/30"></div>
                  <div className="flex-1 flex items-center justify-center">
                    <Star className="w-3 h-3 text-[#8BD3DD] animate-spin" style={{ animationDelay: "0.5s" }} />
                  </div>
                </div>

                <div
                  className="flex-1 bg-gradient-to-bl from-[#F5A623]/30 to-[#8BD3DD]/30 rounded border border-[#F5A623]/50 flex transition-all duration-300"
                  style={{ transform: `scaleX(${0.7 + ((assemblyProgress + 15) % 30) / 100})` }}
                >
                  <div className="flex-1 border-r border-[#8BD3DD]/30 flex items-center justify-center">
                    <Star className="w-3 h-3 text-[#8BD3DD] animate-spin" style={{ animationDelay: "1s" }} />
                  </div>
                  <div className="flex-1 border-r border-[#8BD3DD]/30"></div>
                  <div className="flex-1 flex items-center justify-center">
                    <Star className="w-3 h-3 text-[#F5A623] animate-spin" style={{ animationDelay: "1.5s" }} />
                  </div>
                </div>
              </div>

              {/* Floating elements */}
              <Wind
                className="absolute top-2 left-1/2 w-4 h-4 text-[#8BD3DD] opacity-60 animate-bounce"
                style={{ animationDelay: "0s" }}
              />
              <Package
                className="absolute bottom-2 right-1/4 w-4 h-4 text-[#F5A623] opacity-60 animate-pulse"
                style={{ animationDelay: "1s" }}
              />
            </div>

            <div className="text-center">
              <p className="text-sm text-[#3A3A3A] opacity-70">
                Printing your custom design on smart cotton fabric with integrated rotating star elements
              </p>
            </div>
          </div>
        </Card>

        {/* Production Details */}
        <Card className="p-4 bg-white/80 border-none shadow-lg">
          <div className="space-y-3">
            <h3 className="font-semibold text-[#3A3A3A]">Production Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#3A3A3A] opacity-70">Panel Casings:</span>
                <span className="text-[#3A3A3A]">✓ Completed</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#3A3A3A] opacity-70">Smart Cotton Printing:</span>
                <span className="text-[#F5A623]">In Progress</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#3A3A3A] opacity-70">Magnetic Closure:</span>
                <span className="text-[#3A3A3A] opacity-50">Pending</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#3A3A3A] opacity-70">Chain Mechanism:</span>
                <span className="text-[#3A3A3A] opacity-50">Pending</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Estimated Completion */}
        <Card className="p-4 bg-white/80 border-none shadow-lg">
          <div className="text-center space-y-2">
            <h3 className="font-semibold text-[#3A3A3A]">Estimated Completion</h3>
            <p className="text-2xl font-bold text-[#F5A623]">March 18, 2024</p>
            <p className="text-sm text-[#3A3A3A] opacity-70">Professional installation scheduled for March 20</p>
          </div>
        </Card>

        {/* Back to Home */}
        <Button
          onClick={onBack}
          variant="outline"
          className="w-full py-3 border-[#8BD3DD] text-[#3A3A3A] hover:bg-[#8BD3DD]/10"
        >
          <Home className="w-5 h-5 mr-2" />
          Design Another BreezeFrame
        </Button>
      </div>
    </div>
  )
}
