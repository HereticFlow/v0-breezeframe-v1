import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase-client"

export async function GET() {
  try {
    console.log("🚀 API Quick Stats - Démarrage")

    // Test de connexion basique
    const { data: healthCheck, error: healthError } = await supabase
      .from("image_dataset")
      .select("count", { count: "exact", head: true })

    if (healthError) {
      console.error("❌ Erreur santé Supabase:", healthError)

      // Retourner une réponse d'erreur mais pas un crash
      return NextResponse.json({
        success: false,
        total_images: 0,
        samples: [],
        message: `Erreur Supabase: ${healthError.message}`,
        error: healthError.message,
        debug: {
          code: healthError.code,
          details: healthError.details,
          hint: healthError.hint,
        },
      })
    }

    const totalImages = healthCheck || 0
    console.log(`📊 Total images trouvées: ${totalImages}`)

    if (totalImages === 0) {
      return NextResponse.json({
        success: true,
        total_images: 0,
        samples: [],
        message: "Dataset vide - Aucune image importée",
      })
    }

    // Récupérer quelques exemples
    const { data: samples, error: samplesError } = await supabase
      .from("image_dataset")
      .select("id, title, source_site, quality_score, training_ready, created_at")
      .order("created_at", { ascending: false })
      .limit(5)

    if (samplesError) {
      console.error("❌ Erreur échantillons:", samplesError)
      return NextResponse.json({
        success: true,
        total_images: totalImages,
        samples: [],
        message: `${totalImages} images trouvées (erreur échantillons: ${samplesError.message})`,
      })
    }

    console.log("✅ Quick Stats récupérées avec succès")

    return NextResponse.json({
      success: true,
      total_images: totalImages,
      samples: samples || [],
      message: `${totalImages} images trouvées dans le dataset`,
    })
  } catch (error) {
    console.error("❌ Erreur critique Quick Stats:", error)

    return NextResponse.json(
      {
        success: false,
        total_images: 0,
        samples: [],
        message: "Erreur serveur critique",
        error: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 },
    )
  }
}
