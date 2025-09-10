"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  ArrowLeft,
  MapPin,
  CreditCard,
  Truck,
  Shield,
  Settings,
  Star,
  Ruler,
  Zap,
  Smartphone,
  Wind,
  Thermometer,
  Volume2,
} from "lucide-react"

interface OrderReviewScreenProps {
  design: any
  kit: any
  systemConfig: any
  aiMeasurements: any
  onNext: () => void
  onBack: () => void
}

export default function OrderReviewScreen({
  design,
  kit,
  systemConfig,
  aiMeasurements,
  onNext,
  onBack,
}: OrderReviewScreenProps) {
  const getSystemIcon = () => {
    if (systemConfig?.system === "motorized-smart") return Smartphone
    if (systemConfig?.system === "motorized-basic") return Zap
    return Settings
  }

  const SystemIcon = getSystemIcon()

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF7EB] to-[#F5F5DC] p-6">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="text-[#3A3A3A] hover:bg-[#8BD3DD]/10">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold text-[#3A3A3A]" style={{ fontFamily: "Playfair Display, serif" }}>
            Review Your BreezeFrame
          </h1>
        </div>

        {/* AI Measurements Confirmation */}
        {aiMeasurements && (
          <Card className="p-4 bg-gradient-to-r from-[#8BD3DD]/10 to-[#F5A623]/10 border-none">
            <div className="flex items-center space-x-3">
              <Ruler className="w-5 h-5 text-[#F5A623]" />
              <div>
                <p className="text-sm font-medium text-[#3A3A3A]">
                  AI Measured: {aiMeasurements.width}cm × {aiMeasurements.height}cm
                </p>
                <p className="text-xs text-[#3A3A3A] opacity-70">
                  {aiMeasurements.confidence}% AI confidence • Perfect fit guaranteed
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* System Preview */}
        <Card className="p-6 bg-white/80 border-none shadow-lg">
          <div className="space-y-4">
            {/* BreezeFrame Visualization */}
            <div className="w-full h-32 relative bg-gradient-to-br from-[#8BD3DD]/10 to-[#F5A623]/10 rounded-lg border-2 border-[#F5A623]/30">
              {/* Panel Casings */}
              <div className="absolute left-0 top-0 w-3 h-full bg-[#8BD3DD]/30 rounded-l-lg"></div>
              <div className="absolute right-0 top-0 w-3 h-full bg-[#8BD3DD]/30 rounded-r-lg"></div>

              {/* Foldable Panels with Design */}
              <div className="absolute left-3 top-2 right-3 bottom-2 flex space-x-1">
                <div className="flex-1 bg-gradient-to-br from-[#F5A623]/20 to-[#8BD3DD]/20 rounded border border-[#F5A623]/40 flex">
                  <div className="flex-1 border-r border-[#8BD3DD]/20 flex items-center justify-center">
                    <Star className="w-3 h-3 text-[#F5A623] animate-spin" style={{ animationDuration: "4s" }} />
                  </div>
                  <div className="flex-1 border-r border-[#8BD3DD]/20"></div>
                  <div className="flex-1 flex items-center justify-center">
                    <Star className="w-3 h-3 text-[#8BD3DD] animate-spin" style={{ animationDuration: "3s" }} />
                  </div>
                </div>
                <div className="flex-1 bg-gradient-to-bl from-[#F5A623]/20 to-[#8BD3DD]/20 rounded border border-[#F5A623]/40 flex">
                  <div className="flex-1 border-r border-[#8BD3DD]/20 flex items-center justify-center">
                    <Star className="w-3 h-3 text-[#8BD3DD] animate-spin" style={{ animationDuration: "3s" }} />
                  </div>
                  <div className="flex-1 border-r border-[#8BD3DD]/20"></div>
                  <div className="flex-1 flex items-center justify-center">
                    <Star className="w-3 h-3 text-[#F5A623] animate-spin" style={{ animationDuration: "4s" }} />
                  </div>
                </div>
              </div>

              {/* System Indicator */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <SystemIcon className="w-4 h-4 text-[#8BD3DD]" />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#F5A623]/20 to-[#8BD3DD]/20 border border-[#F5A623]/40 flex items-center justify-center">
                  {design?.icon && <design.icon className="w-6 h-6 text-[#F5A623]" />}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-[#3A3A3A] text-lg">{design?.name}</h3>
                  <p className="text-sm text-[#3A3A3A] opacity-70">
                    {kit?.name} • {design?.description}
                  </p>
                </div>
              </div>

              <div className="border-t border-[#8BD3DD]/20 pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#3A3A3A]">Kit:</span>
                  <span className="font-medium text-[#3A3A3A]">
                    {kit?.name} (€{kit?.price})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#3A3A3A]">System:</span>
                  <span className="font-medium text-[#3A3A3A] flex items-center space-x-1">
                    <SystemIcon className="w-4 h-4" />
                    <span>
                      {systemConfig?.system === "manual"
                        ? "Manual"
                        : systemConfig?.system === "motorized-basic"
                          ? "Motorized"
                          : "Smart Home"}
                    </span>
                  </span>
                </div>

                {/* Additional Features */}
                {systemConfig?.features?.mosquitoMesh && (
                  <div className="flex justify-between">
                    <span className="text-[#3A3A3A]">Mosquito Mesh:</span>
                    <span className="font-medium text-[#3A3A3A] flex items-center space-x-1">
                      <Shield className="w-4 h-4 text-[#8BD3DD]" />
                      <span>Included</span>
                    </span>
                  </div>
                )}

                {systemConfig?.features?.airQuality && (
                  <div className="flex justify-between">
                    <span className="text-[#3A3A3A]">Air Quality:</span>
                    <span className="font-medium text-[#3A3A3A] flex items-center space-x-1">
                      <Wind className="w-4 h-4 text-[#F5A623]" />
                      <span>Monitoring</span>
                    </span>
                  </div>
                )}

                {systemConfig?.features?.humidity && (
                  <div className="flex justify-between">
                    <span className="text-[#3A3A3A]">Climate Control:</span>
                    <span className="font-medium text-[#3A3A3A] flex items-center space-x-1">
                      <Thermometer className="w-4 h-4 text-[#8BD3DD]" />
                      <span>Auto-Adjust</span>
                    </span>
                  </div>
                )}

                {systemConfig?.features?.noiseReduction && (
                  <div className="flex justify-between">
                    <span className="text-[#3A3A3A]">Noise Reduction:</span>
                    <span className="font-medium text-[#3A3A3A] flex items-center space-x-1">
                      <Volume2 className="w-4 h-4 text-[#F5A623]" />
                      <span>Active</span>
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-lg font-bold border-t border-[#8BD3DD]/20 pt-2">
                  <span className="text-[#3A3A3A]">Total:</span>
                  <span className="text-[#3A3A3A]">€{systemConfig?.totalPrice}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Wellness Journey Unlock Preview */}
        {systemConfig?.wellnessUnlocked && (
          <Card className="p-4 bg-gradient-to-r from-[#F5A623]/10 to-[#8BD3DD]/10 border-none">
            <div className="space-y-2">
              <h4 className="font-semibold text-[#3A3A3A]">🎁 Bonus: Wellness Harmony Unlocked!</h4>
              <p className="text-sm text-[#3A3A3A] opacity-80">
                Smart Home Integration includes premium wellness features: environmental monitoring, circadian rhythm
                tracking, and automated wellness optimization.
              </p>
            </div>
          </Card>
        )}

        {/* Shipping Info */}
        <Card className="p-4 bg-white/80 border-none shadow-lg">
          <div className="flex items-center space-x-3">
            <Truck className="w-5 h-5 text-[#8BD3DD]" />
            <div>
              <h4 className="font-medium text-[#3A3A3A]">
                {systemConfig?.isMotorized ? "Professional Installation" : "Free Shipping"}
              </h4>
              <p className="text-sm text-[#3A3A3A] opacity-70">
                {systemConfig?.isMotorized
                  ? "Expert installation included • 5-7 business days"
                  : "DIY kit with installation guide • 3-5 business days"}
              </p>
            </div>
          </div>
        </Card>

        {/* Shipping Address */}
        <Card className="p-4 bg-white/80 border-none shadow-lg">
          <div className="flex items-start space-x-3">
            <MapPin className="w-5 h-5 text-[#8BD3DD] mt-1" />
            <div>
              <h4 className="font-medium text-[#3A3A3A] mb-1">
                {systemConfig?.isMotorized ? "Installation Address" : "Shipping Address"}
              </h4>
              <p className="text-sm text-[#3A3A3A] opacity-70">
                123 Nature Lane
                <br />
                Green Valley, CA 90210
                <br />
                United States
              </p>
            </div>
          </div>
        </Card>

        {/* Payment Method */}
        <Card className="p-4 bg-white/80 border-none shadow-lg">
          <div className="flex items-center space-x-3">
            <CreditCard className="w-5 h-5 text-[#8BD3DD]" />
            <div>
              <h4 className="font-medium text-[#3A3A3A]">Payment Method</h4>
              <p className="text-sm text-[#3A3A3A] opacity-70">•••• •••• •••• 4242</p>
            </div>
          </div>
        </Card>

        {/* Place Order button */}
        <Button
          onClick={onNext}
          className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-[#F5A623] to-[#8BD3DD] text-white hover:opacity-90 shadow-lg"
        >
          Order Your BreezeFrame - €{systemConfig?.totalPrice}
        </Button>

        <p className="text-xs text-[#3A3A3A] opacity-60 text-center">
          Includes 2-year warranty{systemConfig?.isMotorized ? ", professional installation" : ""} &{" "}
          {systemConfig?.wellnessUnlocked ? "wellness harmony unlock" : "wellness journey access"}
        </p>
      </div>
    </div>
  )
}
