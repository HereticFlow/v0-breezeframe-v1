"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Camera, Upload, ArrowLeft, Lightbulb, Sparkles, Ruler, CheckCircle, Zap } from "lucide-react"

interface PhotoCaptureScreenProps {
  onNext: (photo: string, measurements: any) => void
  onBack: () => void
}

export default function PhotoCaptureScreen({ onNext, onBack }: PhotoCaptureScreenProps) {
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [aiMeasurements, setAiMeasurements] = useState<any>(null)

  const handleTakePhoto = () => {
    const mockPhoto = "/placeholder.svg?height=300&width=300"
    setCapturedPhoto(mockPhoto)
    startAIAnalysis()
  }

  const handleUploadFile = () => {
    const mockPhoto = "/placeholder.svg?height=300&width=300"
    setCapturedPhoto(mockPhoto)
    startAIAnalysis()
  }

  const startAIAnalysis = () => {
    setIsAnalyzing(true)
    setTimeout(() => {
      setAiMeasurements({
        width: 120,
        height: 150,
        confidence: 94,
        windowType: "Standard Rectangle",
        frameDetected: true,
        lightingConditions: "Good",
        recommendations: [
          "Perfect dimensions for BreezeFrame V2",
          "Excellent lighting for accurate measurement",
          "Window frame clearly detected",
        ],
      })
      setIsAnalyzing(false)
    }, 3000)
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
              AI Window Detection
            </h1>
            <p className="text-sm text-[#3A3A3A] opacity-70">Smart measurement for perfect fit</p>
          </div>
        </div>

        {/* AI Detection Info */}
        <Card className="p-4 bg-gradient-to-r from-[#F5A623]/10 to-[#8BD3DD]/10 border-none">
          <div className="flex items-start space-x-3">
            <Sparkles className="w-5 h-5 text-[#F5A623] mt-1" />
            <div>
              <h3 className="font-semibold text-[#3A3A3A] mb-1">Smart AI Measurement</h3>
              <p className="text-sm text-[#3A3A3A] opacity-80">
                Our AI will automatically detect your window dimensions and recommend the perfect BreezeFrame size.
              </p>
            </div>
          </div>
        </Card>

        {/* Camera preview area */}
        <Card className="p-6 bg-white/80 border-none shadow-lg">
          {isAnalyzing ? (
            /* AI Analysis Animation */
            <div className="text-center space-y-6">
              <div className="relative">
                <div className="w-20 h-20 mx-auto border-4 border-[#8BD3DD]/20 rounded-lg relative">
                  <div className="absolute inset-2 border-4 border-[#F5A623] border-t-transparent rounded-lg animate-spin"></div>
                  <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-[#F5A623]" />
                </div>

                {/* AI Detection Indicators */}
                <div className="absolute inset-0 pointer-events-none">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-2 h-2 bg-[#F5A623] rounded-full animate-pulse"
                      style={{
                        left: `${20 + i * 20}%`,
                        top: `${30 + (i % 2) * 40}%`,
                        animationDelay: `${i * 0.3}s`,
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-[#3A3A3A]">AI Analyzing Your Window</h3>
                <p className="text-sm text-[#3A3A3A] opacity-70">
                  Detecting dimensions, frame type, and optimal configuration...
                </p>
              </div>

              <div className="space-y-2 text-sm text-[#3A3A3A] opacity-60">
                <p className="flex items-center justify-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-[#8BD3DD]" />
                  <span>Window frame detected</span>
                </p>
                <p className="flex items-center justify-center space-x-2">
                  <Zap className="w-4 h-4 text-[#F5A623]" />
                  <span>Measuring dimensions</span>
                </p>
                <p className="flex items-center justify-center space-x-2">
                  <Sparkles className="w-4 h-4 text-[#8BD3DD]" />
                  <span>Calculating optimal size</span>
                </p>
              </div>
            </div>
          ) : aiMeasurements ? (
            /* AI Results */
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={capturedPhoto || "/placeholder.svg"}
                  alt="Captured window"
                  className="w-full h-40 object-cover rounded-lg"
                />
                {/* AI Detection Overlay */}
                <div className="absolute inset-2 border-2 border-[#F5A623] rounded-lg">
                  <div className="absolute -top-1 -left-1 w-3 h-3 border-2 border-[#F5A623] bg-white rounded-full"></div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 border-2 border-[#F5A623] bg-white rounded-full"></div>
                  <div className="absolute -bottom-1 -left-1 w-3 h-3 border-2 border-[#F5A623] bg-white rounded-full"></div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 border-2 border-[#F5A623] bg-white rounded-full"></div>
                </div>
              </div>

              {/* AI Detection Results */}
              <Card className="p-4 bg-gradient-to-r from-[#8BD3DD]/10 to-[#F5A623]/10 border-none">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-[#8BD3DD]" />
                      <h3 className="font-semibold text-[#3A3A3A]">AI Detection Complete</h3>
                    </div>
                    <span className="text-xs bg-[#8BD3DD]/20 text-[#3A3A3A] px-2 py-1 rounded-full">
                      {aiMeasurements.confidence}% Confidence
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 bg-white/60 rounded-lg">
                      <Ruler className="w-4 h-4 mx-auto text-[#F5A623] mb-1" />
                      <p className="text-xs font-medium text-[#3A3A3A]">Width</p>
                      <p className="text-lg font-bold text-[#F5A623]">{aiMeasurements.width}cm</p>
                    </div>
                    <div className="text-center p-3 bg-white/60 rounded-lg">
                      <Ruler className="w-4 h-4 mx-auto text-[#8BD3DD] mb-1" />
                      <p className="text-xs font-medium text-[#3A3A3A]">Height</p>
                      <p className="text-lg font-bold text-[#8BD3DD]">{aiMeasurements.height}cm</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-medium text-[#3A3A3A]">AI Recommendations:</p>
                    {aiMeasurements.recommendations.map((rec: string, index: number) => (
                      <div key={index} className="flex items-center space-x-2">
                        <CheckCircle className="w-3 h-3 text-[#8BD3DD]" />
                        <p className="text-xs text-[#3A3A3A] opacity-80">{rec}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setCapturedPhoto(null)
                    setAiMeasurements(null)
                  }}
                  className="flex-1 border-[#8BD3DD] text-[#3A3A3A] hover:bg-[#8BD3DD]/10"
                >
                  Retake
                </Button>
                <Button
                  onClick={() => onNext(capturedPhoto!, aiMeasurements)}
                  className="flex-1 bg-gradient-to-r from-[#F5A623] to-[#8BD3DD] text-white hover:opacity-90"
                >
                  Continue
                </Button>
              </div>
            </div>
          ) : capturedPhoto ? (
            <div className="space-y-4">
              <img
                src={capturedPhoto || "/placeholder.svg"}
                alt="Captured photo"
                className="w-full h-48 object-cover rounded-lg"
              />
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setCapturedPhoto(null)}
                  className="flex-1 border-[#8BD3DD] text-[#3A3A3A] hover:bg-[#8BD3DD]/10"
                >
                  Retake
                </Button>
                <Button
                  onClick={startAIAnalysis}
                  className="flex-1 bg-gradient-to-r from-[#F5A623] to-[#8BD3DD] text-white hover:opacity-90"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Analyze
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-6">
              <div className="w-full h-64 bg-gradient-to-br from-[#8BD3DD]/10 to-[#F5A623]/10 rounded-lg flex items-center justify-center border-2 border-dashed border-[#8BD3DD]/30">
                <div className="text-center space-y-2">
                  <Camera className="w-12 h-12 mx-auto text-[#8BD3DD] opacity-60" />
                  <p className="text-[#3A3A3A] opacity-60">AI Camera Detection</p>
                  <div className="flex space-x-1 justify-center">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div
                        key={i}
                        className="w-1.5 h-1.5 bg-[#F5A623] rounded-full animate-pulse"
                        style={{ animationDelay: `${i * 0.2}s` }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleTakePhoto}
                  className="w-full py-3 bg-gradient-to-r from-[#F5A623] to-[#8BD3DD] text-white hover:opacity-90"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  Take Photo for AI Analysis
                </Button>

                <Button
                  onClick={handleUploadFile}
                  variant="outline"
                  className="w-full py-3 border-[#8BD3DD] text-[#3A3A3A] hover:bg-[#8BD3DD]/10"
                >
                  <Upload className="w-5 h-5 mr-2" />
                  Upload Existing Photo
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Tips */}
        <Card className="p-4 bg-gradient-to-r from-[#8BD3DD]/10 to-[#F5A623]/10 border-none">
          <div className="flex items-start space-x-3">
            <Lightbulb className="w-4 h-4 text-[#F5A623] mt-0.5" />
            <div>
              <h3 className="font-semibold text-[#3A3A3A] text-sm mb-1">Perfect Detection Tips</h3>
              <p className="text-xs text-[#3A3A3A] opacity-80">
                Use natural light and capture the entire window frame. Avoid shadows and reflections for best AI
                accuracy.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
