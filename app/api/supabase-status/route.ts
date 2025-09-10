import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase-client"

export async function GET() {
  try {
    console.log("🔍 Vérification du status Supabase...")

    const status = {
      connection: false,
      tables: {},
      errors: [],
      timestamp: new Date().toISOString(),
    }

    // Test de connexion basique
    try {
      const { data: connectionTest, error: connectionError } = await supabase
        .from("window_analysis")
        .select("count", { count: "exact", head: true })

      if (connectionError) {
        if (connectionError.code === "42P01") {
          status.errors.push("Table window_analysis n'existe pas")
        } else {
          status.errors.push(`Erreur connexion: ${connectionError.message}`)
        }
      } else {
        status.connection = true
      }
    } catch (error) {
      status.errors.push(`Erreur de connexion: ${error instanceof Error ? error.message : "Erreur inconnue"}`)
    }

    // Vérification de chaque table
    const tables = ["window_analysis", "window_manufacturers", "image_dataset", "import_logs", "dataset_quick_stats"]

    for (const tableName of tables) {
      try {
        const { count, error } = await supabase.from(tableName).select("*", { count: "exact", head: true })

        if (error) {
          status.tables[tableName] = {
            exists: false,
            count: 0,
            error: error.message,
          }
        } else {
          status.tables[tableName] = {
            exists: true,
            count: count || 0,
            error: null,
          }
        }
      } catch (error) {
        status.tables[tableName] = {
          exists: false,
          count: 0,
          error: error instanceof Error ? error.message : "Erreur inconnue",
        }
      }
    }

    console.log("✅ Status Supabase récupéré:", status)
    return NextResponse.json(status)
  } catch (error) {
    console.error("❌ Erreur vérification Supabase:", error)
    return NextResponse.json(
      {
        error: "Erreur lors de la vérification Supabase",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 },
    )
  }
}
