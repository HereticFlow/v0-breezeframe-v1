import { createClient, type SupabaseClient } from "@supabase/supabase-js"

// Configuration Supabase pour BreezeFrame
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://pwjdrbllpyxvnqdrglpx.supabase.co"
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3amRyYmxscHl4dm5xZHJnbHB4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY5NzI2MjQsImV4cCI6MjA1MjU0ODYyNH0.8xQVQOKJQBJGqGJGJGJGJGJGJGJGJGJGJGJGJGJGJGJG"

console.log("🔗 Connexion Supabase:", supabaseUrl)

// Client Supabase configuré pour BreezeFrame
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: true,
  },
  db: {
    schema: "public",
  },
  global: {
    headers: {
      "X-Client-Info": "breezeframe-app@2.1.0",
    },
  },
})

// Types pour les tables de la base de données
export interface WindowAnalysis {
  id: string
  user_session?: string
  image_url?: string
  analysis_data?: any
  frontend_validation?: any
  processing_time_ms?: number
  quality_score?: number
  created_at?: string
}

export interface WindowManufacturer {
  id: string
  name: string
  brand?: string
  product_type?: string
  material?: string
  color?: string
  dimensions?: string
  price_range?: string
  features?: any
  quality_score?: number
  source_url?: string
  created_at?: string
}

export interface ImageDataset {
  id: string
  image_url: string
  image_base64?: string
  source_url?: string
  source_site?: string
  title?: string
  description?: string
  labels?: any
  ml_features?: any
  quality_score?: number
  training_ready?: boolean
  created_at?: string
}

export interface ImportLog {
  id: string
  import_type?: string
  status?: string
  records_processed?: number
  records_success?: number
  records_failed?: number
  error_details?: any
  duration_ms?: number
  details?: any
  created_at?: string
}

// Fonctions d'aide pour la base de données
export const windowAnalysisDB = {
  // Sauvegarder une analyse de fenêtre
  async saveAnalysis(analysisData: Partial<WindowAnalysis>): Promise<WindowAnalysis> {
    try {
      const { data, error } = await supabase.from("window_analysis").insert(analysisData).select().single()

      if (error) {
        console.error("Erreur sauvegarde analyse:", error)
        throw error
      }

      return data
    } catch (error) {
      console.error("Erreur sauvegarde analyse:", error)
      throw error
    }
  },

  // Récupérer une analyse par ID
  async getAnalysis(id: string): Promise<WindowAnalysis> {
    try {
      const { data, error } = await supabase.from("window_analysis").select("*").eq("id", id).single()

      if (error) {
        console.error("Erreur récupération analyse:", error)
        throw error
      }

      return data
    } catch (error) {
      console.error("Erreur récupération analyse:", error)
      throw error
    }
  },

  // Récupérer les analyses récentes
  async getRecentAnalyses(limit = 10): Promise<WindowAnalysis[]> {
    try {
      const { data, error } = await supabase
        .from("window_analysis")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit)

      if (error) {
        console.error("Erreur récupération analyses récentes:", error)
        return []
      }

      return data || []
    } catch (error) {
      console.error("Erreur récupération analyses récentes:", error)
      return []
    }
  },

  // Récupérer les analyses par session
  async getAnalysesBySession(sessionId: string): Promise<WindowAnalysis[]> {
    try {
      const { data, error } = await supabase
        .from("window_analysis")
        .select("*")
        .eq("user_session", sessionId)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Erreur récupération analyses session:", error)
        return []
      }

      return data || []
    } catch (error) {
      console.error("Erreur récupération analyses session:", error)
      return []
    }
  },

  // Alias pour compatibilité - récupérer les analyses utilisateur
  async getUserAnalyses(sessionId: string): Promise<WindowAnalysis[]> {
    return this.getAnalysesBySession(sessionId)
  },

  // Supprimer une analyse
  async deleteAnalysis(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.from("window_analysis").delete().eq("id", id)

      if (error) {
        console.error("Erreur suppression analyse:", error)
        return false
      }

      return true
    } catch (error) {
      console.error("Erreur suppression analyse:", error)
      return false
    }
  },
}

// Fonctions pour les fabricants
export const manufacturerDB = {
  async getAllManufacturers(): Promise<WindowManufacturer[]> {
    try {
      const { data, error } = await supabase
        .from("window_manufacturers")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Erreur récupération fabricants:", error)
        return []
      }

      return data || []
    } catch (error) {
      console.error("Erreur récupération fabricants:", error)
      return []
    }
  },

  async searchManufacturers(criteria: {
    material?: string
    product_type?: string
    color?: string
    brand?: string
  }): Promise<WindowManufacturer[]> {
    try {
      let query = supabase.from("window_manufacturers").select("*")

      if (criteria.material) {
        query = query.ilike("material", `%${criteria.material}%`)
      }
      if (criteria.product_type) {
        query = query.ilike("product_type", `%${criteria.product_type}%`)
      }
      if (criteria.color) {
        query = query.ilike("color", `%${criteria.color}%`)
      }
      if (criteria.brand) {
        query = query.ilike("brand", `%${criteria.brand}%`)
      }

      const { data, error } = await query.order("quality_score", { ascending: false })

      if (error) {
        console.error("Erreur recherche fabricants:", error)
        return []
      }

      return data || []
    } catch (error) {
      console.error("Erreur recherche fabricants:", error)
      return []
    }
  },

  async getRecommendations(analysisData: any): Promise<WindowManufacturer[]> {
    const criteria: any = {}

    if (analysisData.material) {
      criteria.material = analysisData.material
    }
    if (analysisData.window_type) {
      criteria.product_type = analysisData.window_type
    }
    if (analysisData.color) {
      criteria.color = analysisData.color
    }

    return this.searchManufacturers(criteria)
  },
}

// Fonctions pour le dataset
export const datasetDB = {
  async getDatasetStats(): Promise<any> {
    try {
      const { data, error } = await supabase
        .from("dataset_quick_stats")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .single()

      if (error) {
        console.error("Erreur récupération stats dataset:", error)
        return null
      }

      return data
    } catch (error) {
      console.error("Erreur récupération stats dataset:", error)
      return null
    }
  },

  async getTrainingReadyImages(limit = 100): Promise<ImageDataset[]> {
    try {
      const { data, error } = await supabase
        .from("image_dataset")
        .select("*")
        .eq("training_ready", true)
        .order("quality_score", { ascending: false })
        .limit(limit)

      if (error) {
        console.error("Erreur récupération images entraînement:", error)
        return []
      }

      return data || []
    } catch (error) {
      console.error("Erreur récupération images entraînement:", error)
      return []
    }
  },

  async getImagesBySource(source: string): Promise<ImageDataset[]> {
    try {
      const { data, error } = await supabase
        .from("image_dataset")
        .select("*")
        .eq("source_site", source)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Erreur récupération images par source:", error)
        return []
      }

      return data || []
    } catch (error) {
      console.error("Erreur récupération images par source:", error)
      return []
    }
  },

  async getAllImages(page = 0, limit = 50): Promise<{ data: ImageDataset[]; count: number }> {
    try {
      const { data, error, count } = await supabase
        .from("image_dataset")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(page * limit, (page + 1) * limit - 1)

      if (error) {
        console.error("Erreur récupération images:", error)
        return { data: [], count: 0 }
      }

      return { data: data || [], count: count || 0 }
    } catch (error) {
      console.error("Erreur récupération images:", error)
      return { data: [], count: 0 }
    }
  },
}

// Fonctions pour les logs d'import
export const importLogsDB = {
  async getRecentLogs(limit = 20): Promise<ImportLog[]> {
    try {
      const { data, error } = await supabase
        .from("import_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit)

      if (error) {
        console.error("Erreur récupération logs import:", error)
        return []
      }

      return data || []
    } catch (error) {
      console.error("Erreur récupération logs import:", error)
      return []
    }
  },

  async logImport(logData: Partial<ImportLog>): Promise<ImportLog> {
    try {
      const { data, error } = await supabase.from("import_logs").insert(logData).select().single()

      if (error) {
        console.error("Erreur log import:", error)
        throw error
      }

      return data
    } catch (error) {
      console.error("Erreur log import:", error)
      throw error
    }
  },
}

// Utilitaires de base de données
export const dbUtils = {
  async testConnection(): Promise<{ connected: boolean; tablesExist: boolean; error: string | null }> {
    try {
      const { data, error } = await supabase.from("window_analysis").select("count", { count: "exact", head: true })

      if (error && error.code === "42P01") {
        return { connected: true, tablesExist: false, error: "Tables non créées" }
      } else if (error) {
        return { connected: false, tablesExist: false, error: error.message }
      }

      return { connected: true, tablesExist: true, error: null }
    } catch (error) {
      return { connected: false, tablesExist: false, error: String(error) }
    }
  },

  async getTableCounts(): Promise<Record<string, number>> {
    const tables = ["window_analysis", "window_manufacturers", "image_dataset", "import_logs"]
    const counts: Record<string, number> = {}

    for (const table of tables) {
      try {
        const { count, error } = await supabase.from(table).select("*", { count: "exact", head: true })

        if (!error) {
          counts[table] = count || 0
        } else {
          counts[table] = -1
        }
      } catch (error) {
        counts[table] = -1
      }
    }

    return counts
  },

  async createSampleData(): Promise<WindowAnalysis> {
    try {
      const sampleAnalysis = {
        id: `BF-AI-${Date.now()}`,
        user_session: `session_${Date.now()}`,
        image_url: "/placeholder.svg?height=300&width=400&text=Sample+Window",
        analysis_data: {
          dimensions: { width: 120, height: 150, confidence: 0.95 },
          windowType: "Standard Rectangle",
          kitRecommendation: { primary: "solo" },
          recommendations: ["Perfect for BreezeFrame", "Good lighting conditions"],
        },
        frontend_validation: {
          windowDetected: true,
          confidence: 0.87,
          quality: "good",
          lighting: "good",
        },
        processing_time_ms: 2300,
        quality_score: 0.94,
        created_at: new Date().toISOString(),
      }

      const { data, error } = await supabase.from("window_analysis").insert(sampleAnalysis).select().single()

      if (error) {
        console.error("Erreur création données exemple:", error)
        throw error
      }

      return data
    } catch (error) {
      console.error("Erreur création données exemple:", error)
      throw error
    }
  },
}

// Test de connexion
export async function testSupabaseConnection(): Promise<boolean> {
  try {
    const { data, error } = await supabase.from("window_analysis").select("count", { count: "exact", head: true })

    if (error && error.code !== "42P01") {
      console.error("Erreur connexion Supabase:", error)
      return false
    }

    console.log("✅ Connexion Supabase OK")
    return true
  } catch (error) {
    console.error("Erreur test Supabase:", error)
    return false
  }
}

export default supabase
