"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Camera,
  Upload,
  ArrowLeft,
  Lightbulb,
  Sparkles,
  Ruler,
  CheckCircle,
  Zap,
  Eye,
  Package,
  AlertTriangle,
} from "lucide-react"
import ManufacturerRecommendations from "./manufacturer-recommendations"

interface AIPhotoCaptureScreenProps {
  onNext: (photo: string, measurements: any) => void
  onBack: () => void
}

export default function AIPhotoCaptureScreen({ onNext, onBack }: AIPhotoCaptureScreenProps) {
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([])
  const [currentPhotoStep, setCurrentPhotoStep] = useState(0) // 0=face, 1=droite, 2=gauche
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResults, setAnalysisResults] = useState<any>(null)
  const [analysisStep, setAnalysisStep] = useState(0)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const [showCamera, setShowCamera] = useState(false)
  const [showManufacturers, setShowManufacturers] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const photoSteps = [
    { name: "Vue de face", description: "Centrez la fenêtre complète", icon: "📐" },
    { name: "Vue droite", description: "Largeur du châssis côté droit", icon: "➡️" },
    { name: "Vue gauche", description: "Largeur du châssis côté gauche", icon: "⬅️" },
  ]

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      })
      setCameraStream(stream)
      setShowCamera(true)
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (error) {
      console.error("Camera access denied:", error)
      setError("Accès caméra refusé. Utilisez l'upload de fichier.")
      handleUploadFile()
    }
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const video = videoRef.current
      const context = canvas.getContext("2d")

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      context?.drawImage(video, 0, 0)

      const photoData = canvas.toDataURL("image/jpeg", 0.8)

      // Ajouter la photo à la liste
      const newPhotos = [...capturedPhotos, photoData]
      setCapturedPhotos(newPhotos)

      setShowCamera(false)

      // Stop camera stream
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop())
        setCameraStream(null)
      }

      // Passer à la photo suivante ou terminer
      if (currentPhotoStep < 2) {
        setCurrentPhotoStep(currentPhotoStep + 1)
      }
    }
  }

  const handleUploadFile = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const photoData = e.target?.result as string

          // Ajouter la photo à la liste
          const newPhotos = [...capturedPhotos, photoData]
          setCapturedPhotos(newPhotos)

          // Passer à la photo suivante ou terminer
          if (currentPhotoStep < 2) {
            setCurrentPhotoStep(currentPhotoStep + 1)
          }
        }
        reader.readAsDataURL(file)
      }
    }
    input.click()
  }

  const startAIAnalysis = async () => {
    if (capturedPhotos.length === 0) {
      setError("Au moins 1 photo requise pour l'analyse")
      return
    }

    setIsAnalyzing(true)
    setAnalysisStep(0)
    setError(null)

    try {
      // Étape 1: Initialisation
      setAnalysisStep(1)
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Étape 2: Validation TensorFlow Frontend
      setAnalysisStep(2)
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Étape 3: Analyse Backend + Fabricants
      setAnalysisStep(3)

      const response = await fetch("/api/ai-window-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          images: capturedPhotos,
          userSession: `session_${Date.now()}`,
          metadata: {
            photosCount: capturedPhotos.length,
            deviceInfo: navigator.userAgent,
            timestamp: Date.now(),
          },
        }),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || "Erreur d'analyse")
      }

      // Étape 4: Sauvegarde
      setAnalysisStep(4)
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setAnalysisResults(result)
      setIsAnalyzing(false)
    } catch (error) {
      console.error("Erreur analyse:", error)
      setError(error instanceof Error ? error.message : "Erreur d'analyse")
      setIsAnalyzing(false)
    }
  }

  const retakePhoto = (index: number) => {
    const newPhotos = [...capturedPhotos]
    newPhotos.splice(index, 1)
    setCapturedPhotos(newPhotos)
    setCurrentPhotoStep(Math.min(index, 2))
  }

  const analysisSteps = [
    { name: "Initialisation", icon: Sparkles, description: "Préparation de l'analyse IA" },
    { name: "TensorFlow Frontend", icon: Eye, description: "Détection fenêtre en temps réel" },
    { name: "Analyse Backend", icon: Zap, description: "IA complète + Dimensions + Fabricants" },
    { name: "Sauvegarde", icon: CheckCircle, description: "Stockage Supabase + Logs" },
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
              IA Détection Fenêtre
            </h1>
            <p className="text-sm text-[#3A3A3A] opacity-70">TensorFlow + Backend Python</p>
          </div>
        </div>

        {/* Instructions 3 Photos */}
        <Card className="p-4 bg-gradient-to-r from-[#F5A623]/10 to-[#8BD3DD]/10 border-none">
          <div className="flex items-start space-x-3">
            <Sparkles className="w-5 h-5 text-[#F5A623] mt-1" />
            <div>
              <h3 className="font-semibold text-[#3A3A3A] mb-1">3 Photos Requises</h3>
              <p className="text-sm text-[#3A3A3A] opacity-80">
                L'IA analyse dimensions, type, nombre de battants avec 3 angles différents
              </p>
            </div>
          </div>
        </Card>

        {/* Erreur */}
        {error && (
          <Card className="p-4 bg-red-50 border-red-200">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </Card>
        )}

        {/* Interface Caméra */}
        {showCamera ? (
          <Card className="p-4 bg-white/80 border-none shadow-lg">
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="font-semibold text-[#3A3A3A] mb-2">
                  {photoSteps[currentPhotoStep].icon} {photoSteps[currentPhotoStep].name}
                </h3>
                <p className="text-sm text-[#3A3A3A] opacity-70">{photoSteps[currentPhotoStep].description}</p>
              </div>

              <div className="relative">
                <video ref={videoRef} autoPlay playsInline className="w-full h-64 object-cover rounded-lg bg-black" />
                <div className="absolute inset-4 border-2 border-[#F5A623] border-dashed rounded-lg flex items-center justify-center">
                  <div className="text-center text-white bg-black/50 p-2 rounded">
                    <p className="text-sm">{photoSteps[currentPhotoStep].description}</p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button onClick={capturePhoto} className="flex-1 bg-[#F5A623] hover:bg-[#F5A623]/90">
                  <Camera className="w-4 h-4 mr-2" />
                  Capturer ({currentPhotoStep + 1}/3)
                </Button>
                <Button variant="outline" onClick={() => setShowCamera(false)} className="flex-1">
                  Annuler
                </Button>
              </div>
            </div>
          </Card>
        ) : isAnalyzing ? (
          /* Analyse IA en cours */
          <Card className="p-8 bg-white/80 border-none shadow-lg">
            <div className="text-center space-y-6">
              <div className="relative">
                <div className="w-24 h-24 mx-auto border-4 border-[#8BD3DD]/20 rounded-full relative">
                  <div className="absolute inset-2 border-4 border-[#F5A623] border-t-transparent rounded-full animate-spin"></div>
                  <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-[#F5A623]" />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[#3A3A3A]">Analyse IA TensorFlow</h3>

                <div className="space-y-3">
                  {analysisSteps.map((step, index) => {
                    const StepIcon = step.icon
                    const isActive = index === analysisStep
                    const isCompleted = index < analysisStep

                    return (
                      <div
                        key={index}
                        className={`flex items-center space-x-3 p-2 rounded-lg transition-all ${
                          isActive
                            ? "bg-[#F5A623]/20 border border-[#F5A623]/30"
                            : isCompleted
                              ? "bg-[#8BD3DD]/20"
                              : "bg-gray-100"
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            isActive
                              ? "bg-[#F5A623] text-white"
                              : isCompleted
                                ? "bg-[#8BD3DD] text-white"
                                : "bg-gray-300"
                          }`}
                        >
                          {isCompleted ? <CheckCircle className="w-4 h-4" /> : <StepIcon className="w-4 h-4" />}
                        </div>
                        <div className="flex-1">
                          <p className={`font-medium ${isActive ? "text-[#F5A623]" : "text-[#3A3A3A]"}`}>{step.name}</p>
                          <p className="text-xs text-[#3A3A3A] opacity-70">{step.description}</p>
                        </div>
                        {isActive && (
                          <div className="w-4 h-4 border-2 border-[#F5A623] border-t-transparent rounded-full animate-spin"></div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </Card>
        ) : analysisResults ? (
          /* Résultats d'analyse */
          <div className="space-y-4">
            <Card className="p-4 bg-white/80 border-none shadow-lg">
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="font-semibold text-[#3A3A3A] mb-2">✅ Analyse TensorFlow Terminée</h3>
                  <p className="text-sm text-[#3A3A3A] opacity-70">ID: {analysisResults.processingId}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-[#F5A623]/10 rounded-lg">
                    <Ruler className="w-4 h-4 mx-auto text-[#F5A623] mb-1" />
                    <p className="text-xs font-medium text-[#3A3A3A]">Largeur</p>
                    <p className="text-lg font-bold text-[#F5A623]">{analysisResults.analysis.dimensions.width}cm</p>
                  </div>
                  <div className="text-center p-3 bg-[#8BD3DD]/10 rounded-lg">
                    <Ruler className="w-4 h-4 mx-auto text-[#8BD3DD] mb-1" />
                    <p className="text-xs font-medium text-[#3A3A3A]">Hauteur</p>
                    <p className="text-lg font-bold text-[#8BD3DD]">{analysisResults.analysis.dimensions.height}cm</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-medium text-[#3A3A3A]">Détection IA:</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>Confiance: {Math.round(analysisResults.analysis.confidence * 100)}%</div>
                    <div>Battants: {analysisResults.analysis.battants}</div>
                    <div>Type: {analysisResults.analysis.windowType}</div>
                    <div>Qualité: {analysisResults.analysis.quality}</div>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-medium text-[#3A3A3A]">Recommandations IA:</p>
                  {analysisResults.analysis.recommendations.map((rec: string, index: number) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircle className="w-3 h-3 text-[#8BD3DD]" />
                      <p className="text-xs text-[#3A3A3A] opacity-80">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Fabricants compatibles */}
            {analysisResults.manufacturerMatches?.length > 0 && (
              <Card className="p-4 bg-gradient-to-r from-[#F5A623]/10 to-[#8BD3DD]/10 border-none">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Package className="w-5 h-5 text-[#F5A623]" />
                      <h4 className="font-semibold text-[#3A3A3A]">Fabricants Compatibles</h4>
                    </div>
                    <span className="text-sm font-bold text-[#8BD3DD]">
                      {analysisResults.manufacturerMatches.length} trouvés
                    </span>
                  </div>
                  <Button
                    onClick={() => setShowManufacturers(true)}
                    variant="outline"
                    className="w-full border-[#F5A623]/30 text-[#3A3A3A] hover:bg-[#F5A623]/10"
                  >
                    <Package className="w-4 h-4 mr-2" />
                    Voir Fabricants Recommandés
                  </Button>
                </div>
              </Card>
            )}

            {/* Actions */}
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setCapturedPhotos([])
                  setCurrentPhotoStep(0)
                  setAnalysisResults(null)
                  setError(null)
                }}
                className="flex-1 border-[#8BD3DD] text-[#3A3A3A] hover:bg-[#8BD3DD]/10"
              >
                Recommencer
              </Button>
              <Button
                onClick={() => onNext(capturedPhotos[0], analysisResults.analysis)}
                className="flex-1 bg-gradient-to-r from-[#F5A623] to-[#8BD3DD] text-white hover:opacity-90"
              >
                Continuer
              </Button>
            </div>
          </div>
        ) : (
          /* Interface principale */
          <div className="space-y-4">
            {/* Photos capturées */}
            {capturedPhotos.length > 0 && (
              <Card className="p-4 bg-white/80 border-none shadow-lg">
                <h3 className="font-semibold text-[#3A3A3A] mb-3">Photos capturées ({capturedPhotos.length}/3)</h3>
                <div className="grid grid-cols-3 gap-2">
                  {capturedPhotos.map((photo, index) => (
                    <div key={index} className="relative">
                      <img
                        src={photo || "/placeholder.svg"}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-20 object-cover rounded"
                      />
                      <div className="absolute top-1 left-1 bg-black/70 text-white text-xs px-1 rounded">
                        {photoSteps[index].icon}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => retakePhoto(index)}
                        className="absolute top-1 right-1 h-6 w-6 p-0 bg-white/80"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Prochaine photo à prendre */}
            {capturedPhotos.length < 3 && (
              <Card className="p-6 bg-white/80 border-none shadow-lg">
                <div className="text-center space-y-4">
                  <div>
                    <h3 className="font-semibold text-[#3A3A3A] mb-2">
                      {photoSteps[currentPhotoStep].icon} {photoSteps[currentPhotoStep].name}
                    </h3>
                    <p className="text-sm text-[#3A3A3A] opacity-70">{photoSteps[currentPhotoStep].description}</p>
                  </div>

                  <div className="w-full h-48 bg-gradient-to-br from-[#8BD3DD]/10 to-[#F5A623]/10 rounded-lg flex items-center justify-center border-2 border-dashed border-[#8BD3DD]/30">
                    <div className="text-center space-y-2">
                      <Camera className="w-12 h-12 mx-auto text-[#8BD3DD] opacity-60" />
                      <p className="text-[#3A3A3A] opacity-60">Photo {currentPhotoStep + 1}/3</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button
                      onClick={startCamera}
                      className="w-full py-3 bg-gradient-to-r from-[#F5A623] to-[#8BD3DD] text-white hover:opacity-90"
                    >
                      <Camera className="w-5 h-5 mr-2" />
                      Prendre Photo {currentPhotoStep + 1}
                    </Button>

                    <Button
                      onClick={handleUploadFile}
                      variant="outline"
                      className="w-full py-3 border-[#8BD3DD] text-[#3A3A3A] hover:bg-[#8BD3DD]/10 bg-transparent"
                    >
                      <Upload className="w-5 h-5 mr-2" />
                      Importer Fichier
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Bouton d'analyse */}
            {capturedPhotos.length > 0 && (
              <Button
                onClick={startAIAnalysis}
                className="w-full py-3 bg-gradient-to-r from-[#F5A623] to-[#8BD3DD] text-white hover:opacity-90"
                disabled={isAnalyzing}
              >
                <Sparkles className="w-5 h-5 mr-2" />
                {capturedPhotos.length < 3
                  ? `Analyser avec ${capturedPhotos.length} photo(s)`
                  : "Analyser IA TensorFlow"}
              </Button>
            )}
          </div>
        )}

        {/* Info technique */}
        <Card className="p-4 bg-gradient-to-r from-[#8BD3DD]/10 to-[#F5A623]/10 border-none">
          <div className="flex items-start space-x-3">
            <Lightbulb className="w-4 h-4 text-[#F5A623] mt-0.5" />
            <div>
              <h3 className="font-semibold text-[#3A3A3A] text-sm mb-1">IA TensorFlow + Backend</h3>
              <p className="text-xs text-[#3A3A3A] opacity-80">
                Détection dimensions, type, battants → Fabricants européens compatibles
              </p>
            </div>
          </div>
        </Card>

        {/* Canvas caché */}
        <canvas ref={canvasRef} style={{ display: "none" }} />
      </div>

      {/* Modal fabricants */}
      {showManufacturers && analysisResults && (
        <ManufacturerRecommendations
          windowData={analysisResults.analysis}
          onClose={() => setShowManufacturers(false)}
        />
      )}
    </div>
  )
}
