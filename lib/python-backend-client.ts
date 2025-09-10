export interface PythonAnalysisResult {
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
  backendInfo: {
    model: string
    version: string
    processingTime: number
  }
}

export interface PythonBackendHealth {
  status: "healthy" | "unhealthy"
  version: string
  models: {
    detection: boolean
    classification: boolean
    dimension: boolean
  }
  uptime: number
  lastCheck: string
}

export class PythonBackendClient {
  private baseUrl: string
  private timeout: number
  private healthCheckInterval: NodeJS.Timeout | null = null
  private lastHealthCheck: PythonBackendHealth | null = null

  constructor(baseUrl = "http://localhost:5000", timeout = 30000) {
    this.baseUrl = baseUrl.replace(/\/$/, "") // Supprimer slash final
    this.timeout = timeout
    this.startHealthChecks()
  }

  private startHealthChecks(): void {
    // Vérifier la santé du backend toutes les 30 secondes
    this.healthCheckInterval = setInterval(async () => {
      try {
        this.lastHealthCheck = await this.checkHealth()
      } catch (error) {
        console.warn("Health check failed:", error)
        this.lastHealthCheck = null
      }
    }, 30000)

    // Premier check immédiat
    this.checkHealth()
      .then((health) => {
        this.lastHealthCheck = health
      })
      .catch(() => {
        this.lastHealthCheck = null
      })
  }

  async checkHealth(): Promise<PythonBackendHealth> {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5_000) // 5 s

      const res = await fetch(`${this.baseUrl}/health`, {
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (res.ok) {
        const data = await res.json()
        return {
          status: "healthy",
          version: data.version ?? "unknown",
          models: {
            detection: !!data.models?.detection,
            classification: !!data.models?.classification,
            dimension: !!data.models?.dimension,
          },
          uptime: data.uptime ?? 0,
          lastCheck: new Date().toISOString(),
        }
      }
    } catch (err) {
      console.warn("Python backend unreachable:", err)
    }

    // Fallback → unhealthy
    return {
      status: "unhealthy",
      version: "unknown",
      models: { detection: false, classification: false, dimension: false },
      uptime: 0,
      lastCheck: new Date().toISOString(),
    }
  }

  async analyzeWindow(imageFile: File): Promise<PythonAnalysisResult> {
    const startTime = performance.now()

    try {
      // Vérifier si le backend est disponible
      if (!this.lastHealthCheck || this.lastHealthCheck.status !== "healthy") {
        throw new Error("Python backend not available")
      }

      // Préparer les données
      const formData = new FormData()
      formData.append("image", imageFile)
      formData.append(
        "options",
        JSON.stringify({
          includeClassification: true,
          includeDimensions: true,
          confidenceThreshold: 0.5,
        }),
      )

      // Créer le contrôleur d'annulation
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.timeout)

      // Envoyer la requête
      const response = await fetch(`${this.baseUrl}/analyze`, {
        method: "POST",
        body: formData,
        signal: controller.signal,
        headers: {
          "X-Client": "breezeframe-web",
          "X-Request-ID": `req_${Date.now()}`,
        },
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Analysis failed: ${response.status} - ${errorText}`)
      }

      const result = await response.json()
      const processingTime = performance.now() - startTime

      return {
        windowDetected: result.window_detected || false,
        confidence: result.confidence || 0,
        boundingBox: result.bounding_box
          ? {
              x: result.bounding_box.x,
              y: result.bounding_box.y,
              width: result.bounding_box.width,
              height: result.bounding_box.height,
            }
          : undefined,
        dimensions: result.dimensions
          ? {
              width: result.dimensions.width,
              height: result.dimensions.height,
              confidence: result.dimensions.confidence,
            }
          : undefined,
        windowType: result.window_type || "Unknown",
        quality: this.mapQuality(result.quality || result.confidence),
        recommendations: result.recommendations || [],
        processingTime,
        backendInfo: {
          model: result.model_info?.name || "python-detector",
          version: result.model_info?.version || "1.0.0",
          processingTime: result.processing_time || 0,
        },
      }
    } catch (error) {
      console.error("Python backend analysis failed:", error)
      throw error
    }
  }

  async analyzeWindowFromBase64(base64Image: string): Promise<PythonAnalysisResult> {
    const startTime = performance.now()

    try {
      if (!this.lastHealthCheck || this.lastHealthCheck.status !== "healthy") {
        throw new Error("Python backend not available")
      }

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.timeout)

      const response = await fetch(`${this.baseUrl}/analyze-base64`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Client": "breezeframe-web",
          "X-Request-ID": `req_${Date.now()}`,
        },
        body: JSON.stringify({
          image: base64Image,
          options: {
            includeClassification: true,
            includeDimensions: true,
            confidenceThreshold: 0.5,
          },
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Analysis failed: ${response.status} - ${errorText}`)
      }

      const result = await response.json()
      const processingTime = performance.now() - startTime

      return {
        windowDetected: result.window_detected || false,
        confidence: result.confidence || 0,
        boundingBox: result.bounding_box
          ? {
              x: result.bounding_box.x,
              y: result.bounding_box.y,
              width: result.bounding_box.width,
              height: result.bounding_box.height,
            }
          : undefined,
        dimensions: result.dimensions
          ? {
              width: result.dimensions.width,
              height: result.dimensions.height,
              confidence: result.dimensions.confidence,
            }
          : undefined,
        windowType: result.window_type || "Unknown",
        quality: this.mapQuality(result.quality || result.confidence),
        recommendations: result.recommendations || [],
        processingTime,
        backendInfo: {
          model: result.model_info?.name || "python-detector",
          version: result.model_info?.version || "1.0.0",
          processingTime: result.processing_time || 0,
        },
      }
    } catch (error) {
      console.error("Python backend base64 analysis failed:", error)
      throw error
    }
  }

  async batchAnalyze(images: File[]): Promise<PythonAnalysisResult[]> {
    if (images.length === 0) {
      return []
    }

    if (images.length === 1) {
      return [await this.analyzeWindow(images[0])]
    }

    try {
      if (!this.lastHealthCheck || this.lastHealthCheck.status !== "healthy") {
        throw new Error("Python backend not available")
      }

      const formData = new FormData()
      images.forEach((image, index) => {
        formData.append(`image_${index}`, image)
      })
      formData.append("batch_size", images.length.toString())

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.timeout * 2) // Double timeout pour batch

      const response = await fetch(`${this.baseUrl}/batch-analyze`, {
        method: "POST",
        body: formData,
        signal: controller.signal,
        headers: {
          "X-Client": "breezeframe-web",
          "X-Request-ID": `batch_${Date.now()}`,
        },
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Batch analysis failed: ${response.status} - ${errorText}`)
      }

      const results = await response.json()

      return results.map((result: any) => ({
        windowDetected: result.window_detected || false,
        confidence: result.confidence || 0,
        boundingBox: result.bounding_box
          ? {
              x: result.bounding_box.x,
              y: result.bounding_box.y,
              width: result.bounding_box.width,
              height: result.bounding_box.height,
            }
          : undefined,
        dimensions: result.dimensions
          ? {
              width: result.dimensions.width,
              height: result.dimensions.height,
              confidence: result.dimensions.confidence,
            }
          : undefined,
        windowType: result.window_type || "Unknown",
        quality: this.mapQuality(result.quality || result.confidence),
        recommendations: result.recommendations || [],
        processingTime: result.processing_time || 0,
        backendInfo: {
          model: result.model_info?.name || "python-detector",
          version: result.model_info?.version || "1.0.0",
          processingTime: result.processing_time || 0,
        },
      }))
    } catch (error) {
      console.error("Python backend batch analysis failed:", error)
      throw error
    }
  }

  private mapQuality(qualityOrConfidence: string | number): "excellent" | "good" | "fair" | "poor" {
    if (typeof qualityOrConfidence === "string") {
      switch (qualityOrConfidence.toLowerCase()) {
        case "excellent":
          return "excellent"
        case "good":
          return "good"
        case "fair":
          return "fair"
        default:
          return "poor"
      }
    }

    // Si c'est un nombre (confidence)
    const confidence = qualityOrConfidence
    if (confidence >= 0.9) return "excellent"
    if (confidence >= 0.75) return "good"
    if (confidence >= 0.6) return "fair"
    return "poor"
  }

  async testConnection(): Promise<boolean> {
    const health = await this.checkHealth()
    return health.status === "healthy"
  }

  isHealthy(): boolean {
    return this.lastHealthCheck?.status === "healthy"
  }

  getLastHealthCheck(): PythonBackendHealth | null {
    return this.lastHealthCheck
  }

  dispose(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval)
      this.healthCheckInterval = null
    }
  }

  // Méthodes utilitaires
  getBaseUrl(): string {
    return this.baseUrl
  }

  setTimeout(timeout: number): void {
    this.timeout = timeout
  }

  async getModelInfo(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to get model info: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Failed to get model info:", error)
      throw error
    }
  }
}

// Instance singleton
let clientInstance: PythonBackendClient | null = null

export function getPythonBackendClient(): PythonBackendClient {
  if (!clientInstance) {
    const backendUrl = process.env.PYTHON_BACKEND_URL || "http://localhost:5000"
    const timeout = Number.parseInt(process.env.PYTHON_BACKEND_TIMEOUT || "30000")
    clientInstance = new PythonBackendClient(backendUrl, timeout)
  }
  return clientInstance
}

// Fonction utilitaire pour analyser une fenêtre
export async function analyzeWindowWithPython(imageFile: File): Promise<PythonAnalysisResult> {
  const client = getPythonBackendClient()
  return await client.analyzeWindow(imageFile)
}

// Nettoyage global
export function disposePythonBackendClient(): void {
  if (clientInstance) {
    clientInstance.dispose()
    clientInstance = null
  }
}
