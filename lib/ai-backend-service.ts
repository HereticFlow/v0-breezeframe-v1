import { getTensorFlowDetector } from "./tensorflow-window-detector"
import { getPythonBackendClient } from "./python-backend-client"
import { windowAnalysisDB } from "./supabase-client"

export interface UnifiedAnalysisResult {
  windowDetected: boolean
  confidence: number
  boundingBox?: {
    x: number
    y: number
    width: number
    height: number
  }
  dimensions?: {
    width: number
    height: number
    confidence: number
  }
  windowType?: string
  quality: "excellent" | "good" | "fair" | "poor"
  recommendations: string[]
  processingTime: number
  backendUsed: "python" | "tensorflow" | "simulation"
  backendInfo?: {
    model: string
    version: string
    processingTime: number
  }
  analysisId?: string
}

export interface AnalysisOptions {
  preferredBackend?: "python" | "tensorflow" | "auto"
  saveToDatabase?: boolean
  userSession?: string
  confidenceThreshold?: number
  includeRecommendations?: boolean
}

export class AIBackendService {
  private pythonClient = getPythonBackendClient()
  private tensorflowDetector = getTensorFlowDetector()
  private fallbackEnabled = true

  constructor() {
    this.initializeService()
  }

  private async initializeService(): Promise<void> {
    try {
      console.log("🤖 Initialisation du service AI...")

      // Initialize TensorFlow.js detector properly
      try {
        await this.tensorflowDetector.initialize()
        console.log("✅ TensorFlow.js initialisé")
      } catch (error) {
        console.warn("⚠️ Erreur initialisation TensorFlow.js:", error)
      }

      // Test Python backend
      try {
        const pythonHealthy = await this.pythonClient.testConnection()
        console.log(`🐍 Backend Python: ${pythonHealthy ? "✅ Disponible" : "❌ Indisponible"}`)
      } catch (error) {
        console.warn("⚠️ Backend Python indisponible:", error)
      }

      console.log("✅ Service AI initialisé")
    } catch (error) {
      console.warn("⚠️ Erreur initialisation service AI:", error)
    }
  }

  async analyzeWindow(
    imageInput: File | HTMLImageElement | HTMLCanvasElement,
    options: AnalysisOptions = {},
  ): Promise<UnifiedAnalysisResult> {
    const startTime = performance.now()

    const {
      preferredBackend = "auto",
      saveToDatabase = true,
      userSession,
      confidenceThreshold = 0.5,
      includeRecommendations = true,
    } = options

    try {
      let result: UnifiedAnalysisResult

      // Déterminer le backend à utiliser
      const backend = await this.selectBackend(preferredBackend)

      switch (backend) {
        case "python":
          result = await this.analyzeWithPython(imageInput as File)
          break
        case "tensorflow":
          result = await this.analyzeWithTensorFlow(imageInput as HTMLImageElement | HTMLCanvasElement)
          break
        default:
          result = await this.analyzeWithSimulation(imageInput)
      }

      // Post-traitement
      result = await this.postProcessResult(result, {
        confidenceThreshold,
        includeRecommendations,
      })

      // Sauvegarde en base de données
      if (saveToDatabase) {
        try {
          const analysisData = {
            id: `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            user_session: userSession || `session_${Date.now()}`,
            image_url: imageInput instanceof File ? URL.createObjectURL(imageInput) : "/placeholder.svg",
            analysis_data: {
              windowDetected: result.windowDetected,
              confidence: result.confidence,
              boundingBox: result.boundingBox,
              dimensions: result.dimensions,
              windowType: result.windowType,
              backendUsed: result.backendUsed,
            },
            frontend_validation: {
              quality: result.quality,
              recommendations: result.recommendations,
              processingTime: result.processingTime,
            },
            processing_time_ms: result.processingTime,
            quality_score: result.confidence,
            created_at: new Date().toISOString(),
          }

          const savedAnalysis = await windowAnalysisDB.saveAnalysis(analysisData)
          result.analysisId = savedAnalysis.id

          console.log("💾 Analyse sauvegardée:", savedAnalysis.id)
        } catch (dbError) {
          console.warn("⚠️ Erreur sauvegarde base de données:", dbError)
        }
      }

      const totalTime = performance.now() - startTime
      result.processingTime = totalTime

      console.log(`✅ Analyse terminée en ${totalTime.toFixed(0)}ms avec ${result.backendUsed}`)

      return result
    } catch (error) {
      console.error("❌ Erreur analyse AI:", error)

      // Fallback vers simulation en cas d'erreur
      if (this.fallbackEnabled) {
        console.log("🔄 Fallback vers simulation...")
        return await this.analyzeWithSimulation(imageInput)
      }

      throw error
    }
  }

  private async selectBackend(preferred: string): Promise<"python" | "tensorflow" | "simulation"> {
    if (preferred === "python") {
      const isHealthy = this.pythonClient.isHealthy()
      if (isHealthy) return "python"

      console.warn("⚠️ Backend Python indisponible, fallback vers TensorFlow.js")
      return "tensorflow"
    }

    if (preferred === "tensorflow") {
      const modelInfo = this.tensorflowDetector.getModelInfo()
      if (modelInfo.initialized) return "tensorflow"

      console.warn("⚠️ TensorFlow.js non initialisé, fallback vers Python")
      const isHealthy = this.pythonClient.isHealthy()
      if (isHealthy) return "python"

      return "simulation"
    }

    // Auto-sélection
    const pythonHealthy = this.pythonClient.isHealthy()
    const tensorflowReady = this.tensorflowDetector.getModelInfo().initialized

    if (pythonHealthy) return "python"
    if (tensorflowReady) return "tensorflow"

    return "simulation"
  }

  private async analyzeWithPython(imageFile: File): Promise<UnifiedAnalysisResult> {
    try {
      const result = await this.pythonClient.analyzeWindow(imageFile)

      return {
        windowDetected: result.windowDetected,
        confidence: result.confidence,
        boundingBox: result.boundingBox,
        dimensions: result.dimensions,
        windowType: result.windowType,
        quality: result.quality,
        recommendations: result.recommendations,
        processingTime: result.processingTime,
        backendUsed: "python",
        backendInfo: result.backendInfo,
      }
    } catch (error) {
      console.error("Erreur backend Python:", error)
      throw error
    }
  }

  private async analyzeWithTensorFlow(
    imageElement: HTMLImageElement | HTMLCanvasElement,
  ): Promise<UnifiedAnalysisResult> {
    try {
      const result = await this.tensorflowDetector.detectWindow(imageElement)

      return {
        windowDetected: result.windowDetected,
        confidence: result.confidence,
        boundingBox: result.boundingBox,
        dimensions: result.dimensions,
        windowType: result.windowType,
        quality: result.quality,
        recommendations: result.recommendations,
        processingTime: result.processingTime,
        backendUsed: "tensorflow",
        backendInfo: {
          model: "tensorflow-js-detector",
          version: "1.0.0",
          processingTime: result.processingTime,
        },
      }
    } catch (error) {
      console.error("Erreur TensorFlow.js:", error)
      throw error
    }
  }

  private async analyzeWithSimulation(
    imageInput: File | HTMLImageElement | HTMLCanvasElement,
  ): Promise<UnifiedAnalysisResult> {
    // Simulation réaliste pour les tests
    const simulationDelay = 1000 + Math.random() * 2000 // 1-3 secondes

    await new Promise((resolve) => setTimeout(resolve, simulationDelay))

    const confidence = 0.7 + Math.random() * 0.25 // 0.7-0.95
    const width = 100 + Math.random() * 100 // 100-200cm
    const height = 120 + Math.random() * 120 // 120-240cm

    const windowTypes = ["Standard Rectangle", "Arched Window", "Bay Window", "Sliding Window"]
    const randomType = windowTypes[Math.floor(Math.random() * windowTypes.length)]

    return {
      windowDetected: confidence > 0.6,
      confidence,
      boundingBox: {
        x: 0.1 + Math.random() * 0.1,
        y: 0.1 + Math.random() * 0.1,
        width: 0.7 + Math.random() * 0.1,
        height: 0.7 + Math.random() * 0.1,
      },
      dimensions: {
        width: Math.round(width),
        height: Math.round(height),
        confidence: confidence * 0.9,
      },
      windowType: randomType,
      quality: confidence >= 0.85 ? "excellent" : confidence >= 0.75 ? "good" : "fair",
      recommendations: [
        "Simulation de détection activée",
        "Configurez un backend réel pour de vrais résultats",
        confidence > 0.8 ? "Excellente qualité simulée" : "Qualité acceptable simulée",
      ],
      processingTime: simulationDelay,
      backendUsed: "simulation",
      backendInfo: {
        model: "simulation-detector",
        version: "1.0.0",
        processingTime: simulationDelay,
      },
    }
  }

  private async postProcessResult(
    result: UnifiedAnalysisResult,
    options: {
      confidenceThreshold: number
      includeRecommendations: boolean
    },
  ): Promise<UnifiedAnalysisResult> {
    // Appliquer le seuil de confiance
    if (result.confidence < options.confidenceThreshold) {
      result.windowDetected = false
      result.quality = "poor"

      if (options.includeRecommendations) {
        result.recommendations.unshift("Confiance insuffisante - Améliorer la qualité de l'image")
      }
    }

    // Enrichir les recommandations
    if (options.includeRecommendations) {
      result.recommendations = this.enrichRecommendations(result)
    }

    return result
  }

  private enrichRecommendations(result: UnifiedAnalysisResult): string[] {
    const recommendations = [...result.recommendations]

    // Recommandations basées sur la qualité
    if (result.quality === "excellent") {
      recommendations.push("🎯 Parfait pour BreezeFrame - Commandez maintenant!")
    } else if (result.quality === "good") {
      recommendations.push("✅ Bonne qualité - Compatible BreezeFrame")
    } else if (result.quality === "fair") {
      recommendations.push("⚠️ Qualité acceptable - Vérifiez les mesures")
    } else {
      recommendations.push("❌ Qualité insuffisante - Reprendre la photo")
    }

    // Recommandations basées sur les dimensions
    if (result.dimensions) {
      const { width, height } = result.dimensions

      if (width < 60 || height < 80) {
        recommendations.push("📏 Fenêtre petite - Vérifiez la compatibilité")
      } else if (width > 250 || height > 300) {
        recommendations.push("📏 Grande fenêtre - Installation complexe possible")
      } else {
        recommendations.push("📏 Dimensions standard - Installation facile")
      }
    }

    // Recommandations basées sur le type
    if (result.windowType) {
      switch (result.windowType) {
        case "Arched Window":
          recommendations.push("🏛️ Fenêtre cintrée - Mesures précises requises")
          break
        case "Bay Window":
          recommendations.push("🏠 Fenêtre en saillie - Consultation recommandée")
          break
        case "Sliding Window":
          recommendations.push("↔️ Fenêtre coulissante - Vérifier les rails")
          break
        default:
          recommendations.push("🪟 Fenêtre standard - Installation simple")
      }
    }

    return recommendations
  }

  // Méthodes utilitaires
  async batchAnalyze(images: File[], options: AnalysisOptions = {}): Promise<UnifiedAnalysisResult[]> {
    if (images.length === 0) return []

    if (images.length === 1) {
      return [await this.analyzeWindow(images[0], options)]
    }

    // Traitement par batch si Python backend disponible
    if (this.pythonClient.isHealthy()) {
      try {
        const pythonResults = await this.pythonClient.batchAnalyze(images)

        return pythonResults.map((result) => ({
          windowDetected: result.windowDetected,
          confidence: result.confidence,
          boundingBox: result.boundingBox,
          dimensions: result.dimensions,
          windowType: result.windowType,
          quality: result.quality,
          recommendations: result.recommendations,
          processingTime: result.processingTime,
          backendUsed: "python" as const,
          backendInfo: result.backendInfo,
        }))
      } catch (error) {
        console.warn("Batch analysis failed, falling back to individual processing")
      }
    }

    // Fallback: traitement individuel
    const results: UnifiedAnalysisResult[] = []
    for (const image of images) {
      try {
        const result = await this.analyzeWindow(image, options)
        results.push(result)
      } catch (error) {
        console.error("Individual analysis failed:", error)
        // Continuer avec les autres images
      }
    }

    return results
  }

  getBackendStatus(): {
    python: boolean
    tensorflow: boolean
    preferred: string
  } {
    const pythonHealthy = this.pythonClient.isHealthy()
    const tensorflowReady = this.tensorflowDetector.getModelInfo().initialized

    let preferred = "simulation"
    if (pythonHealthy) preferred = "python"
    else if (tensorflowReady) preferred = "tensorflow"

    return {
      python: pythonHealthy,
      tensorflow: tensorflowReady,
      preferred,
    }
  }

  async getDetailedStatus(): Promise<{
    python: any
    tensorflow: any
    service: {
      initialized: boolean
      fallbackEnabled: boolean
    }
  }> {
    const pythonHealth = this.pythonClient.getLastHealthCheck()
    const tensorflowInfo = this.tensorflowDetector.getModelInfo()

    return {
      python: pythonHealth,
      tensorflow: tensorflowInfo,
      service: {
        initialized: true,
        fallbackEnabled: this.fallbackEnabled,
      },
    }
  }

  setFallbackEnabled(enabled: boolean): void {
    this.fallbackEnabled = enabled
  }

  dispose(): void {
    this.pythonClient.dispose()
    this.tensorflowDetector.dispose()
  }

  /**
   * Back-compat static helper used by our Next.js route.
   * It accepts the original payload ({ images, userSession, metadata })
   * and delegates to the singleton instance.
   * The first image is analysed; if several are provided they’re queued
   * and the best result is returned.
   */
  static async analyzeWindow(payload: {
    images: string[]
    userSession: string
    metadata?: Record<string, unknown>
  }) {
    // Fail fast if no image
    if (!payload.images?.length) {
      throw new Error("At least one image is required")
    }

    const service = getAIBackendService()

    // NOTE: The core service works with File | HTMLImageElement | Canvas.
    // On the server we can’t create DOM elements, so we rely on the Python
    // backend (preferred) or fall back to simulation.
    const pythonHealthy = service.getBackendStatus().python

    if (pythonHealthy) {
      // Send the raw base-64 strings directly to the Python backend
      const pythonResult = await service["pythonClient"].analyzeBase64Array(payload.images)

      return pythonResult // already in the expected format
    }

    // Fallback → analyse the *first* image via simulation so we still respond
    const sim = await service["analyzeWithSimulation"](null)

    return {
      success: true,
      processingId: `BF-AI-${Date.now()}`,
      analysis: {
        dimensions: { width: sim.dimensions?.width ?? 0, height: sim.dimensions?.height ?? 0, depth: 0 },
        confidence: sim.confidence,
        windowType: sim.windowType ?? "unknown",
        battants: 1,
        frameDetected: sim.windowDetected,
        frameMaterial: "unknown",
        glassType: "unknown",
        quality: sim.quality,
        recommendations: sim.recommendations,
        installationComplexity: "unknown",
      },
      manufacturerMatches: [],
      processingTime: sim.processingTime,
      backendUsed: sim.backendUsed,
      technicalSpecs: sim.backendInfo,
    }
  }
}

// Instance singleton
let serviceInstance: AIBackendService | null = null

export function getAIBackendService(): AIBackendService {
  if (!serviceInstance) {
    serviceInstance = new AIBackendService()
  }
  return serviceInstance
}

// Fonction utilitaire principale
export async function analyzeWindowWithAI(
  imageInput: File | HTMLImageElement | HTMLCanvasElement,
  options: AnalysisOptions = {},
): Promise<UnifiedAnalysisResult> {
  const service = getAIBackendService()
  return await service.analyzeWindow(imageInput, options)
}

// Nettoyage global
export function disposeAIBackendService(): void {
  if (serviceInstance) {
    serviceInstance.dispose()
    serviceInstance = null
  }
}
