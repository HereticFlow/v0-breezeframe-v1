import { type NextRequest, NextResponse } from "next/server"
import { ImageDatasetManager } from "@/lib/image-dataset-manager"

// API endpoint pour importer le dataset d'images
export async function POST(request: NextRequest) {
  try {
    console.log("🚀 Starting image dataset import...")

    // Import des données CSV avec labellisation IA
    await ImageDatasetManager.importToSupabase()

    return NextResponse.json({
      success: true,
      message: "Image dataset imported successfully with AI labeling",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("❌ Dataset import failed:", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

// API endpoint pour rechercher dans le dataset
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")
    const format = (searchParams.get("format") as "tensorflow" | "pytorch" | "csv") || "csv"
    const action = searchParams.get("action")

    // Export pour ML
    if (action === "export") {
      const exportData = await ImageDatasetManager.exportForML(format)

      return NextResponse.json({
        success: true,
        data: exportData,
        format: format,
        timestamp: new Date().toISOString(),
      })
    }

    // Recherche dans le dataset
    if (query) {
      const results = await ImageDatasetManager.searchDataset(query)

      return NextResponse.json({
        success: true,
        results,
        count: results.length,
        query,
      })
    }

    // Statistiques du dataset
    const { supabase } = await import("@/lib/supabase-client")
    const { data: stats, error } = await supabase.from("dataset_quick_stats").select("*").single()

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      statistics: stats,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("❌ Dataset API error:", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
