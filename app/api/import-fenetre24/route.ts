import { type NextRequest, NextResponse } from "next/server"
import { Fenetre24DataImporter } from "@/scripts/import-fenetre24-data"

// API endpoint to trigger fenetre24 data import
export async function POST(request: NextRequest) {
  try {
    console.log("Starting fenetre24 data import...")

    // Import CSV data into Supabase
    await Fenetre24DataImporter.importToSupabase()

    return NextResponse.json({
      success: true,
      message: "Fenetre24 data imported successfully",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Import failed:", error)

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

// API endpoint to search manufacturers
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q") || ""

    if (!query) {
      return NextResponse.json(
        {
          success: false,
          error: "Query parameter 'q' is required",
        },
        { status: 400 },
      )
    }

    const results = await Fenetre24DataImporter.searchManufacturers(query)

    return NextResponse.json({
      success: true,
      results,
      count: results.length,
      query,
    })
  } catch (error) {
    console.error("Search failed:", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
