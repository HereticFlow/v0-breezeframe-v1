"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Ruler, Sun, Compass, Leaf, Eye, CheckCircle, Sparkles } from "lucide-react"

interface WindowAssessmentScreenProps {
  aiMeasurements?: any
  onNext: (data: any) => void
  onBack: () => void
}

export default function WindowAssessmentScreen({ aiMeasurements, onNext, onBack }: WindowAssessmentScreenProps) {
  const [measurements, setMeasurements] = useState({
    width: aiMeasurements?.width?.toString() || "",
    height: aiMeasurements?.height?.toString() || "",
    orientation: "",
    roomType: "",
  })
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleAnalyze = () => {
    setIsAnalyzing(true)
    setTimeout(() => {
      setIsAnalyzing(false)
      onNext({
        ...measurements,
        lightScore: 85,
        wellnessRating: "Excellent",
        recommendations: ["Perfect for morning vitamin D", "Ideal workspace positioning"],
        aiDetected: true,
        confidence: aiMeasurements?.confidence || 94,
      })
    }, 2000) // Shorter since we already have the data
  }

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
              Your Window Profile
            </h1>
            <p className="text-sm text-[#3A3A3A] opacity-70">AI-detected wellness assessment</p>
          </div>
        </div>

        {/* AI Detection Success */}
        {aiMeasurements && (
          <Card className="p-4 bg-gradient-to-r from-[#8BD3DD]/10 to-[#F5A623]/10 border-none">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-[#8BD3DD] mt-1" />
              <div>
                <p className="text-sm font-medium text-[#3A3A3A] mb-1">✨ AI Window Profile Ready!</p>
                <p className="text-sm text-[#3A3A3A] opacity-80">
                  Your window dimensions and characteristics have been automatically detected with{" "}
                  {aiMeasurements.confidence}% confidence.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Inspiration Card */}
        <Card className="p-4 bg-gradient-to-r from-[#8BD3DD]/10 to-[#F5A623]/10 border-none">
          <div className="flex items-start space-x-3">
            <Eye className="w-5 h-5 text-[#8BD3DD] mt-1" />
            <div>
              <p className="text-sm text-[#3A3A3A] opacity-80 italic">
                "Your windows are not just openings, but guardians of your serenity and wellness."
              </p>
            </div>
          </div>
        </Card>

        {!isAnalyzing ? (
          <>
            {/* AI-Detected Window Measurements */}
            <Card className="p-6 bg-white/80 border-none shadow-lg">
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-4">
                  <Sparkles className="w-5 h-5 text-[#F5A623]" />
                  <h3 className="font-semibold text-[#3A3A3A]">AI-Detected Dimensions</h3>
                  <span className="text-xs bg-[#8BD3DD]/20 text-[#3A3A3A] px-2 py-1 rounded-full">
                    {aiMeasurements?.confidence || 94}% Confidence
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-[#F5A623]/10 rounded-lg">
                    <Ruler className="w-6 h-6 mx-auto text-[#F5A623] mb-2" />
                    <p className="text-sm font-medium text-[#3A3A3A]">Width</p>
                    <p className="text-2xl font-bold text-[#F5A623]">{aiMeasurements?.width || 120}cm</p>
                  </div>
                  <div className="text-center p-4 bg-[#8BD3DD]/10 rounded-lg">
                    <Ruler className="w-6 h-6 mx-auto text-[#8BD3DD] mb-2" />
                    <p className="text-sm font-medium text-[#3A3A3A]">Height</p>
                    <p className="text-2xl font-bold text-[#8BD3DD]">{aiMeasurements?.height || 150}cm</p>
                  </div>
                </div>

                {aiMeasurements?.windowType && (
                  <div className="p-3 bg-[#8BD3DD]/10 rounded-lg">
                    <p className="text-sm font-medium text-[#3A3A3A]">Window Type: {aiMeasurements.windowType}</p>
                    <p className="text-xs text-[#3A3A3A] opacity-70">
                      Frame clearly detected with excellent lighting conditions
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* Complete Your Profile */}
            <Card className="p-6 bg-white/80 border-none shadow-lg">
              <div className="space-y-4">
                <h3 className="font-semibold text-[#3A3A3A]">Complete Your Wellness Profile</h3>

                {/* Orientation */}
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <Compass className="w-5 h-5 text-[#8BD3DD]" />
                    <label className="font-medium text-[#3A3A3A]">Window Orientation</label>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {["North", "South", "East", "West"].map((direction) => (
                      <Button
                        key={direction}
                        variant="outline"
                        onClick={() => setMeasurements({ ...measurements, orientation: direction })}
                        className={`${
                          measurements.orientation === direction
                            ? "bg-[#8BD3DD]/20 border-[#8BD3DD] text-[#3A3A3A]"
                            : "border-[#8BD3DD]/30 text-[#3A3A3A] hover:bg-[#8BD3DD]/10"
                        }`}
                      >
                        {direction}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Room Type */}
                <div>
                  <label className="font-medium text-[#3A3A3A] mb-3 block">Room Purpose</label>
                  <div className="grid grid-cols-2 gap-3">
                    {["Bedroom", "Living Room", "Office", "Kitchen"].map((room) => (
                      <Button
                        key={room}
                        variant="outline"
                        onClick={() => setMeasurements({ ...measurements, roomType: room })}
                        className={`${
                          measurements.roomType === room
                            ? "bg-[#F5A623]/20 border-[#F5A623] text-[#3A3A3A]"
                            : "border-[#F5A623]/30 text-[#3A3A3A] hover:bg-[#F5A623]/10"
                        }`}
                      >
                        {room}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* AI Recommendations Preview */}
            {aiMeasurements?.recommendations && (
              <Card className="p-4 bg-white/80 border-none shadow-lg">
                <div className="space-y-2">
                  <h4 className="font-medium text-[#3A3A3A]">AI Wellness Insights</h4>
                  {aiMeasurements.recommendations.map((rec: string, index: number) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircle className="w-3 h-3 text-[#8BD3DD]" />
                      <p className="text-sm text-[#3A3A3A] opacity-80">{rec}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Analyze Button */}
            <Button
              onClick={handleAnalyze}
              disabled={!measurements.orientation || !measurements.roomType}
              className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-[#F5A623] to-[#8BD3DD] text-white hover:opacity-90 disabled:opacity-50"
            >
              Create My Wellness Profile
            </Button>
          </>
        ) : (
          /* Quick Analysis Animation */
          <Card className="p-8 bg-white/80 border-none shadow-lg">
            <div className="text-center space-y-6">
              <div className="relative">
                <div className="w-24 h-24 mx-auto border-4 border-[#8BD3DD]/20 rounded-full relative">
                  <div className="absolute inset-2 border-4 border-[#F5A623] border-t-transparent rounded-full animate-spin"></div>
                  <Sun className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-[#F5A623]" />
                </div>

                {/* Dancing leaves animation */}
                <div className="absolute inset-0 pointer-events-none">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Leaf
                      key={i}
                      className="absolute w-4 h-4 text-[#8BD3DD] opacity-60 animate-bounce"
                      style={{
                        left: `${20 + i * 15}%`,
                        top: `${30 + (i % 2) * 40}%`,
                        animationDelay: `${i * 0.5}s`,
                        animationDuration: "2s",
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-[#3A3A3A]">Finalizing Your Wellness Profile</h3>
                <p className="text-sm text-[#3A3A3A] opacity-70">Combining AI measurements with your room details...</p>
              </div>

              <div className="space-y-2 text-sm text-[#3A3A3A] opacity-60">
                <p>
                  ✓ AI dimensions confirmed: {aiMeasurements?.width}cm × {aiMeasurements?.height}cm
                </p>
                <p>✓ Room orientation: {measurements.orientation}</p>
                <p>✓ Calculating optimal wellness settings</p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
