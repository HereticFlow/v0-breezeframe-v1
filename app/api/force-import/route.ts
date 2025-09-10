import { type NextRequest, NextResponse } from "next/server"
import { supabase, importLogsDB } from "@/lib/supabase-client"
import { ImageDatasetManager } from "@/lib/image-dataset-manager"

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  let importLog // Declare importLog variable

  try {
    console.log("🚀 Starting force import process...")

    // Log the start of import
    importLog = await importLogsDB.logImport({
      import_type: "force_import",
      status: "started",
      records_processed: 0,
      records_success: 0,
      records_failed: 0,
      details: { message: "Force import started" },
      created_at: new Date().toISOString(),
    })

    // Vérifier que les tables existent
    const { data: testData, error: testError } = await supabase
      .from("image_dataset")
      .select("count", { count: "exact", head: true })

    if (testError && testError.code === "42P01") {
      await supabase
        .from("import_logs")
        .update({
          status: "failed",
          records_processed: 0,
          records_success: 0,
          records_failed: 1,
          duration_ms: 0,
          details: { error: "Tables non créées" },
        })
        .eq("id", importLog.id)

      return NextResponse.json(
        {
          error: "Tables non créées",
          message: "Veuillez d'abord créer les tables avec le script SQL fourni.",
          sql_needed: true,
        },
        { status: 400 },
      )
    }

    // Lancer l'import
    await ImageDatasetManager.importToSupabase()

    // Vérifier le résultat
    const { count: finalCount, error: countError } = await supabase
      .from("image_dataset")
      .select("*", { count: "exact", head: true })

    if (countError) {
      throw new Error(`Erreur vérification finale: ${countError.message}`)
    }

    const endTime = Date.now()
    const duration = endTime - startTime

    // Update import log with success
    await supabase
      .from("import_logs")
      .update({
        status: "completed",
        records_processed: finalCount || 0,
        records_success: finalCount || 0,
        records_failed: 0,
        duration_ms: duration,
        details: {
          images_imported: finalCount || 0,
        },
      })
      .eq("id", importLog.id)

    console.log("✅ Force import completed successfully")

    return NextResponse.json({
      success: true,
      message: "Import completed successfully",
      images_imported: finalCount || 0,
      duration_ms: duration,
      import_id: importLog.id,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    const endTime = Date.now()
    const duration = endTime - startTime

    console.error("❌ Force import failed:", error)

    // Log the failure
    try {
      await supabase
        .from("import_logs")
        .update({
          status: "failed",
          records_processed: 0,
          records_success: 0,
          records_failed: 1,
          duration_ms: duration,
          details: { error: "Import process failed" },
        })
        .eq("id", importLog.id)
    } catch (logError) {
      console.error("Failed to log error:", logError)
    }

    return NextResponse.json(
      {
        error: "Erreur lors de l'import",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 },
    )
  }
}
