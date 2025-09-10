import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase-client"

export async function GET(request: NextRequest) {
  try {
    const checks = {
      supabase_connection: false,
      tables_exist: false,
      csv_access: false,
      environment_vars: false,
    }

    // Test connexion Supabase
    try {
      const { error } = await supabase.from("window_analysis").select("count", { count: "exact", head: true })

      checks.supabase_connection = true
      checks.tables_exist = !error || error.code !== "42P01"
    } catch (error) {
      checks.supabase_connection = false
    }

    // Test accès CSV
    try {
      const response = await fetch(
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/google%20%287%29-cRTOh554W2adWby6awWzt6P5vzbdvM.csv",
      )
      checks.csv_access = response.ok
    } catch (error) {
      checks.csv_access = false
    }

    // Test variables d'environnement
    checks.environment_vars = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

    return NextResponse.json({
      success: true,
      checks,
      ready: Object.values(checks).every(Boolean),
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
