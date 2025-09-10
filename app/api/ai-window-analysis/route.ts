import { type NextRequest, NextResponse } from "next/server"
import { AIBackendService } from "@/lib/ai-backend-service"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { images, userSession, metadata } = body

    // Validation des données d'entrée
    if (!images || !Array.isArray(images) || images.length < 1) {
      return NextResponse.json({ success: false, error: "Au moins 1 image requise" }, { status: 400 })
    }

    if (!userSession) {
      return NextResponse.json({ success: false, error: "Session utilisateur requise" }, { status: 400 })
    }

    // Lancer l'analyse IA complète
    const result = await AIBackendService.analyzeWindow({
      images,
      userSession,
      metadata: {
        timestamp: Date.now(),
        ...metadata,
      },
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Erreur API analyse IA:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Erreur interne du serveur",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 },
    )
  }
}
