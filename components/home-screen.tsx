"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Leaf, Wind, Shield, Sparkles, Star, Play, Database } from "lucide-react"

interface HomeScreenProps {
  onNext: () => void
  onDataManagement?: () => void
}

export default function HomeScreen({ onNext, onDataManagement }: HomeScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF7EB] via-[#FFF7EB] to-[#F5F5DC] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Floating elements animation */}
      <div className="absolute inset-0 pointer-events-none">
        <Wind
          className="absolute top-20 left-10 w-6 h-6 text-[#8BD3DD] opacity-30 animate-pulse"
          style={{ animationDelay: "0s", animationDuration: "3s" }}
        />
        <Leaf
          className="absolute top-40 right-20 w-4 h-4 text-[#F5A623] opacity-40 animate-bounce"
          style={{ animationDelay: "1s", animationDuration: "4s" }}
        />
        <Shield
          className="absolute bottom-40 left-20 w-5 h-5 text-[#8BD3DD] opacity-25 animate-pulse"
          style={{ animationDelay: "2s" }}
        />
        <Sparkles
          className="absolute bottom-24 right-12 w-4 h-4 text-[#F5A623] opacity-30 animate-pulse"
          style={{ animationDelay: "3s" }}
        />
      </div>

      {/* Data Management Button */}
      <div className="absolute top-6 right-6">
        <Button
          variant="outline"
          size="sm"
          onClick={onDataManagement}
          className="border-[#8BD3DD]/30 text-[#3A3A3A] hover:bg-[#8BD3DD]/10"
        >
          <Database className="w-4 h-4 mr-2" />
          Mes Données
        </Button>
      </div>

      <div className="text-center space-y-8 max-w-md">
        {/* Header */}
        <div className="space-y-4">
          <h1
            className="text-4xl font-bold text-[#3A3A3A] tracking-wide"
            style={{ fontFamily: "Playfair Display, serif" }}
          >
            BreezeFrame V2
          </h1>
          <p className="text-lg text-[#3A3A3A] opacity-80 leading-relaxed">Smart Modular Window Blinds</p>
          <div className="flex items-center justify-center space-x-4 text-xs text-[#3A3A3A] opacity-60">
            <span className="flex items-center space-x-1">
              <Sparkles className="w-3 h-3" />
              <span>AI-Measured</span>
            </span>
            <span className="flex items-center space-x-1">
              <Wind className="w-3 h-3" />
              <span>Foldable</span>
            </span>
            <span className="flex items-center space-x-1">
              <Shield className="w-3 h-3" />
              <span>Mosquito Mesh</span>
            </span>
          </div>
        </div>

        {/* Hero Product Visualization */}
        <Card className="p-8 bg-gradient-to-br from-white/80 to-[#8BD3DD]/10 border-none shadow-lg backdrop-blur-sm">
          <div className="w-64 h-40 mx-auto relative">
            {/* Window Frame */}
            <div className="absolute inset-0 border-4 border-[#8BD3DD]/30 rounded-lg bg-gradient-to-br from-[#8BD3DD]/5 to-[#F5A623]/5">
              {/* AI Detection Indicators */}
              <div className="absolute -top-2 -left-2 w-4 h-4 bg-[#F5A623] rounded-full animate-pulse">
                <div className="absolute inset-1 bg-white rounded-full"></div>
              </div>
              <div
                className="absolute -top-2 -right-2 w-4 h-4 bg-[#F5A623] rounded-full animate-pulse"
                style={{ animationDelay: "0.5s" }}
              >
                <div className="absolute inset-1 bg-white rounded-full"></div>
              </div>

              {/* Panel Casings */}
              <div className="absolute left-0 top-0 w-6 h-full bg-gradient-to-r from-[#8BD3DD]/20 to-[#8BD3DD]/10 rounded-l-lg">
                <div className="w-full h-3 bg-[#F5A623]/30 rounded-t-lg"></div>
              </div>
              <div className="absolute right-0 top-0 w-6 h-full bg-gradient-to-l from-[#8BD3DD]/20 to-[#8BD3DD]/10 rounded-r-lg">
                <div className="w-full h-3 bg-[#F5A623]/30 rounded-t-lg"></div>
              </div>

              {/* Foldable Panels */}
              <div className="absolute left-6 top-6 right-6 bottom-6 flex space-x-2">
                {/* Left Panel */}
                <div className="flex-1 bg-gradient-to-br from-[#F5A623]/20 to-[#8BD3DD]/20 rounded-lg border-2 border-[#F5A623]/30 relative">
                  <div className="h-full flex">
                    <div className="flex-1 border-r border-[#8BD3DD]/20"></div>
                    <div className="flex-1 border-r border-[#8BD3DD]/20"></div>
                    <div className="flex-1"></div>
                  </div>
                  {/* Rotating stars */}
                  <Star
                    className="absolute top-2 left-2 w-3 h-3 text-[#F5A623] animate-spin opacity-60"
                    style={{ animationDuration: "4s" }}
                  />
                  <Star
                    className="absolute bottom-2 right-2 w-3 h-3 text-[#8BD3DD] animate-spin opacity-60"
                    style={{ animationDuration: "3s", animationDelay: "1s" }}
                  />
                </div>

                {/* Right Panel */}
                <div className="flex-1 bg-gradient-to-bl from-[#F5A623]/20 to-[#8BD3DD]/20 rounded-lg border-2 border-[#F5A623]/30 relative">
                  <div className="h-full flex">
                    <div className="flex-1 border-r border-[#8BD3DD]/20"></div>
                    <div className="flex-1 border-r border-[#8BD3DD]/20"></div>
                    <div className="flex-1"></div>
                  </div>
                  {/* Rotating stars */}
                  <Star
                    className="absolute top-2 right-2 w-3 h-3 text-[#8BD3DD] animate-spin opacity-60"
                    style={{ animationDuration: "3s", animationDelay: "0.5s" }}
                  />
                  <Star
                    className="absolute bottom-2 left-2 w-3 h-3 text-[#F5A623] animate-spin opacity-60"
                    style={{ animationDuration: "4s", animationDelay: "1.5s" }}
                  />
                </div>
              </div>

              {/* Magnetic closure indicator */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-12 bg-[#8BD3DD]/40 rounded-full"></div>
            </div>
          </div>

          <div className="mt-4 text-center">
            <p className="text-sm text-[#3A3A3A] opacity-70">AI-Measured • 100cm × 100cm Modular System</p>
          </div>
        </Card>

        {/* Features Grid */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-3 bg-white/60 border-none text-center">
            <Sparkles className="w-6 h-6 mx-auto text-[#F5A623] mb-2" />
            <p className="text-xs text-[#3A3A3A] opacity-70 font-medium">AI Detection</p>
          </Card>
          <Card className="p-3 bg-white/60 border-none text-center">
            <Wind className="w-6 h-6 mx-auto text-[#8BD3DD] mb-2" />
            <p className="text-xs text-[#3A3A3A] opacity-70 font-medium">Foldable Design</p>
          </Card>
          <Card className="p-3 bg-white/60 border-none text-center">
            <Shield className="w-6 h-6 mx-auto text-[#8BD3DD] mb-2" />
            <p className="text-xs text-[#3A3A3A] opacity-70 font-medium">Mosquito Mesh</p>
          </Card>
        </div>

        {/* Pricing */}
        <Card className="p-4 bg-gradient-to-r from-[#F5A623]/10 to-[#8BD3DD]/10 border-none">
          <div className="text-center space-y-2">
            <p className="text-sm text-[#3A3A3A] opacity-70">Starting from</p>
            <p className="text-2xl font-bold text-[#3A3A3A]">€35</p>
            <p className="text-xs text-[#3A3A3A] opacity-60">Solo Kit • DIY installation + Wellness Journey</p>
          </div>
        </Card>

        {/* CTA */}
        <div className="space-y-3">
          <Button
            onClick={onNext}
            className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-[#F5A623] to-[#8BD3DD] hover:from-[#F5A623]/90 hover:to-[#8BD3DD]/90 text-white border-none shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
          >
            <Play className="w-5 h-5 mr-2" />
            Start AI Measurement
          </Button>

          <p className="text-xs text-[#3A3A3A] opacity-60 text-center">
            Smart Cotton • AI-Measured • Wellness Journey Included
          </p>
        </div>
      </div>
    </div>
  )
}
