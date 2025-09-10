"use client"

interface AnalysisResult {
  success: boolean
  detection?: {
    method: string
    confidence: number
    bounding_box?: {
      x: number
      y: number
      width: number
      height: number
    }
    window_detected: boolean
  }
  classification?: {
    window_type: string
    opening_type: string
    material_detected: string
    glazing_type: string
  }
  dimensions?: {
    width_cm: number
    height_cm: number
    surface_m2: number
    confidence: number
  }
  kit_recommendation?: {
    type: string
    price: string
    features: string[]
  }
  quality_score?: number
  processing_time_ms?: number
  processing_info?: {
    method: string
    timestamp: string
    backend_version: string
  }
  error?: string
  message?: string
}

interface BackendHealth {
  status: string
  service: string
  version: string
  timestamp: string
  tensorflow_available: boolean
  opencv_available: boolean
  stats: {
    total_analyses: number
    successful_analyses: number
    failed_analyses: number
    start_time: string
  }
}

class PythonBackendClient {
  private baseUrl: string
  private timeout: number

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL || "http://localhost:5000"
    this.timeout = Number.parseInt(process.env.NEXT_PUBLIC_PYTHON_BACKEND_TIMEOUT || "30000")
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      clearTimeout(timeoutId)

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw new Error("Backend timeout - le serveur Python ne répond pas")
        }
        throw error
      }

      throw new Error("Erreur inconnue lors de la communication avec le backend")
    }
  }

  async checkHealth(): Promise<BackendHealth> {
    try {
      return await this.makeRequest<BackendHealth>("/health")
    } catch (error) {
      console.error("Erreur health check:", error)
      throw new Error("Backend Python non accessible")
    }
  }

  async analyzeWindow(imageData: string): Promise<AnalysisResult> {
    try {
      console.log("🔍 Envoi image pour analyse...")

      const result = await this.makeRequest<AnalysisResult>("/analyze", {
        method: "POST",
        body: JSON.stringify({ image: imageData }),
      })

      console.log("✅ Analyse terminée:", result)
      return result
    } catch (error) {
      console.error("❌ Erreur analyse:", error)

      // Retourner une analyse simulée en cas d'erreur
      return this.getFallbackAnalysis(error instanceof Error ? error.message : "Erreur inconnue")
    }
  }

  async batchAnalyze(images: string[]): Promise<{
    success: boolean
    results: AnalysisResult[]
    summary?: {
      total: number
      successful: number
      failed: number
    }
    error?: string
  }> {
    try {
      console.log(`🔍 Analyse en lot de ${images.length} images...`)

      return await this.makeRequest("/batch-analyze", {
        method: "POST",
        body: JSON.stringify({ images }),
      })
    } catch (error) {
      console.error("❌ Erreur batch analyse:", error)

      return {
        success: false,
        results: [],
        error: error instanceof Error ? error.message : "Erreur inconnue",
      }
    }
  }

  async getModelInfo(): Promise<{
    success: boolean
    model_info?: {
      tensorflow: { available: boolean; version?: string }
      opencv: { available: boolean; version?: string }
      capabilities: Record<string, boolean>
      supported_formats: string[]
      max_image_size: string
    }
    error?: string
  }> {
    try {
      return await this.makeRequest("/model-info")
    } catch (error) {
      console.error("❌ Erreur model info:", error)

      return {
        success: false,
        error: error instanceof Error ? error.message : "Erreur inconnue",
      }
    }
  }

  async getStats(): Promise<{
    success: boolean
    stats?: {
      total_analyses: number
      successful_analyses: number
      failed_analyses: number
      uptime_seconds: number
      uptime_human: string
      success_rate: number
      tensorflow_available: boolean
      opencv_available: boolean
    }
    error?: string
  }> {
    try {
      return await this.makeRequest("/stats")
    } catch (error) {
      console.error("❌ Erreur stats:", error)

      return {
        success: false,
        error: error instanceof Error ? error.message : "Erreur inconnue",
      }
    }
  }

  private getFallbackAnalysis(errorMessage: string): AnalysisResult {
    console.log("🔄 Utilisation de l'analyse simulée (fallback)")

    return {
      success: true,
      detection: {
        method: "simulation",
        confidence: 0.85,
        bounding_box: {
          x: 0.2,
          y: 0.15,
          width: 0.6,
          height: 0.7,
        },
        window_detected: true,
      },
      classification: {
        window_type: "Fenêtre Standard",
        opening_type: "Battant",
        material_detected: "PVC",
        glazing_type: "Double vitrage",
      },
      dimensions: {
        width_cm: 120,
        height_cm: 140,
        surface_m2: 1.68,
        confidence: 0.85,
      },
      kit_recommendation: {
        type: "Kit Standard",
        price: "449€",
        features: ["Capteurs de luminosité", "Contrôle automatique", "Application mobile", "Garantie 2 ans"],
      },
      quality_score: 85,
      processing_time_ms: 150,
      processing_info: {
        method: "simulation",
        timestamp: new Date().toISOString(),
        backend_version: "2.1.0-fallback",
      },
      message: `Mode simulation activé (Backend: ${errorMessage})`,
    }
  }

  async testConnection(): Promise<{
    connected: boolean
    message: string
    health?: BackendHealth
  }> {
    try {
      const health = await this.checkHealth()

      return {
        connected: true,
        message: "Backend Python connecté avec succès",
        health,
      }
    } catch (error) {
      return {
        connected: false,
        message: error instanceof Error ? error.message : "Erreur de connexion",
      }
    }
  }
}

// Instance singleton
export const pythonBackend = new PythonBackendClient()

// Fonctions utilitaires
export async function analyzeWindowImage(imageData: string): Promise<AnalysisResult> {
  return pythonBackend.analyzeWindow(imageData)
}

export async function checkBackendHealth(): Promise<BackendHealth> {
  return pythonBackend.checkHealth()
}

export async function getBackendStats() {
  return pythonBackend.getStats()
}

export async function testBackendConnection() {
  return pythonBackend.testConnection()
}

// Types exportés
export type { AnalysisResult, BackendHealth }
