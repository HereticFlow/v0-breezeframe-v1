import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase-client"

export async function GET() {
  try {
    // Récupérer un échantillon de données de chaque table
    const results = {
      images: [],
      analyses: [],
      manufacturers: [],
      logs: [],
      stats: null,
    }

    // Images dataset
    const { data: images, error: imagesError } = await supabase
      .from("image_dataset")
      .select("*")
      .limit(10)
      .order("created_at", { ascending: false })

    if (!imagesError && images) {
      results.images = images
    }

    // Window analyses
    const { data: analyses, error: analysesError } = await supabase
      .from("window_analysis")
      .select("*")
      .limit(5)
      .order("created_at", { ascending: false })

    if (!analysesError && analyses) {
      results.analyses = analyses
    }

    // Manufacturers
    const { data: manufacturers, error: manufacturersError } = await supabase
      .from("window_manufacturers")
      .select("*")
      .limit(5)
      .order("created_at", { ascending: false })

    if (!manufacturersError && manufacturers) {
      results.manufacturers = manufacturers
    }

    // Import logs
    const { data: logs, error: logsError } = await supabase
      .from("import_logs")
      .select("*")
      .limit(5)
      .order("created_at", { ascending: false })

    if (!logsError && logs) {
      results.logs = logs
    }

    // Quick stats
    const { data: stats, error: statsError } = await supabase.from("dataset_quick_stats").select("*").single()

    if (!statsError && stats) {
      results.stats = stats
    }

    return NextResponse.json(results)
  } catch (error) {
    console.error("Erreur récupération preview:", error)
    return NextResponse.json(
      {
        error: "Erreur lors de la récupération des données",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 },
    )
  }
}
