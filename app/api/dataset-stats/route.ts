import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase-client"

export async function GET() {
  try {
    console.log("🔍 Récupération des statistiques dataset...")

    // Vérifier la connexion Supabase
    const { data: testConnection, error: connectionError } = await supabase
      .from("image_dataset")
      .select("count", { count: "exact", head: true })

    if (connectionError) {
      console.error("❌ Erreur connexion Supabase:", connectionError)
      return NextResponse.json({
        success: false,
        error: `Connexion Supabase échouée: ${connectionError.message}`,
        statistics: null,
      })
    }

    // Récupérer les statistiques de base
    const { count: totalImages } = await supabase.from("image_dataset").select("*", { count: "exact", head: true })

    const { data: images, error: imagesError } = await supabase
      .from("image_dataset")
      .select("quality_score, training_ready, source_site, created_at")

    if (imagesError) {
      console.error("❌ Erreur récupération images:", imagesError)
      return NextResponse.json({
        success: false,
        error: `Erreur données: ${imagesError.message}`,
        statistics: null,
      })
    }

    // Calculer les statistiques
    const trainingReady = images?.filter((img) => img.training_ready).length || 0
    const excellentQuality = images?.filter((img) => img.quality_score >= 80).length || 0
    const goodQuality = images?.filter((img) => img.quality_score >= 60 && img.quality_score < 80).length || 0
    const poorQuality = (totalImages || 0) - excellentQuality - goodQuality

    // Distribution par source
    const sourceDistribution: Record<string, number> = {}
    images?.forEach((img) => {
      const source = img.source_site || "unknown"
      sourceDistribution[source] = (sourceDistribution[source] || 0) + 1
    })

    // Score moyen
    const avgQualityScore = images?.length
      ? Math.round(images.reduce((sum, img) => sum + (img.quality_score || 0), 0) / images.length)
      : 0

    // Récupérer les imports récents
    const { data: recentImports } = await supabase
      .from("import_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5)

    // Dernière importation
    const lastImport = images?.length
      ? images.reduce((latest, img) => (new Date(img.created_at) > new Date(latest.created_at) ? img : latest))
          .created_at
      : null

    const statistics = {
      total_images: totalImages || 0,
      training_ready: trainingReady,
      excellent_quality: excellentQuality,
      good_quality: goodQuality,
      unique_sources: Object.keys(sourceDistribution).length,
      avg_quality_score: avgQualityScore,
      last_import: lastImport,
      source_distribution: sourceDistribution,
      quality_distribution: {
        excellent: excellentQuality,
        good: goodQuality,
        poor: poorQuality,
      },
      recent_imports: recentImports || [],
    }

    console.log("✅ Statistiques calculées:", statistics)

    return NextResponse.json({
      success: true,
      statistics,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("❌ Erreur critique:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erreur inconnue",
        statistics: null,
      },
      { status: 500 },
    )
  }
}
