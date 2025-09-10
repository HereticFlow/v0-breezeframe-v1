import { supabase } from "../lib/supabase-client"
import { ImageDatasetManager } from "../lib/image-dataset-manager"
import { Fenetre24DataImporter } from "./import-fenetre24-data"

interface SetupStep {
  id: string
  name: string
  description: string
  execute: () => Promise<boolean>
}

class AutoSetup {
  private steps: SetupStep[] = [
    {
      id: "check-supabase",
      name: "Vérification Supabase",
      description: "Vérifier la connexion à Supabase",
      execute: this.checkSupabaseConnection.bind(this),
    },
    {
      id: "create-tables",
      name: "Création des Tables",
      description: "Créer toutes les tables nécessaires",
      execute: this.createTables.bind(this),
    },
    {
      id: "import-fenetre24",
      name: "Import Fenetre24",
      description: "Importer les données fabricants",
      execute: this.importFenetre24.bind(this),
    },
    {
      id: "import-dataset",
      name: "Import Dataset IA",
      description: "Importer et labelliser les images avec IA",
      execute: this.importDataset.bind(this),
    },
    {
      id: "verify-data",
      name: "Vérification Finale",
      description: "Vérifier que toutes les données sont importées",
      execute: this.verifyData.bind(this),
    },
  ]

  async runAutoSetup(): Promise<void> {
    console.log("🚀 DÉMARRAGE DE L'AUTO-CONFIGURATION BREEZEFRAME")
    console.log("=".repeat(60))
    console.log("📅 Date:", new Date().toLocaleString())
    console.log("🌐 Environnement: Development")
    console.log("=".repeat(60))

    for (let i = 0; i < this.steps.length; i++) {
      const step = this.steps[i]
      console.log(`\n📋 ÉTAPE ${i + 1}/${this.steps.length}: ${step.name}`)
      console.log(`📝 ${step.description}`)
      console.log("-".repeat(50))

      const stepStartTime = Date.now()

      try {
        const success = await step.execute()
        const stepDuration = Date.now() - stepStartTime

        if (success) {
          console.log(`✅ ÉTAPE ${i + 1} TERMINÉE: ${step.name} (${stepDuration}ms)`)
        } else {
          console.log(`❌ ÉTAPE ${i + 1} ÉCHOUÉE: ${step.name}`)
          console.log("🛑 Arrêt de l'auto-configuration")
          return
        }
      } catch (error) {
        console.error(`❌ ERREUR ÉTAPE ${i + 1}:`, error)
        console.log("🛑 Arrêt de l'auto-configuration")
        return
      }

      // Pause entre les étapes
      await new Promise((resolve) => setTimeout(resolve, 500))
    }

    console.log("\n🎉 AUTO-CONFIGURATION TERMINÉE AVEC SUCCÈS!")
    console.log("=".repeat(60))
    console.log("✅ Toutes les données sont importées et prêtes")
    console.log("🌐 Accédez à votre app: http://localhost:3000")
    console.log("📊 Dashboard dataset: http://localhost:3000/dataset")
    console.log("⚙️  Panel admin: http://localhost:3000/admin")
    console.log("🔧 Setup checker: http://localhost:3000/setup")
    console.log("=".repeat(60))
  }

  private async checkSupabaseConnection(): Promise<boolean> {
    console.log("🔍 Test de connexion Supabase...")

    try {
      // Test simple de connexion
      const { data, error } = await supabase.from("window_analysis").select("count", { count: "exact", head: true })

      if (error && error.code === "42P01") {
        console.log("⚠️  Tables non créées (normal pour la première fois)")
        return true
      } else if (error) {
        console.error("❌ Erreur de connexion Supabase:", error.message)
        console.log("📋 Vérifiez vos variables d'environnement:")
        console.log("   - NEXT_PUBLIC_SUPABASE_URL")
        console.log("   - NEXT_PUBLIC_SUPABASE_ANON_KEY")
        return false
      }

      console.log("✅ Connexion Supabase établie")
      return true
    } catch (error) {
      console.error("❌ Erreur de connexion:", error)
      return false
    }
  }

  private async createTables(): Promise<boolean> {
    console.log("🏗️  Vérification et création des tables...")

    const tables = [
      {
        name: "window_analysis",
        description: "Analyses de fenêtres par IA",
      },
      {
        name: "window_manufacturers",
        description: "Données fabricants Fenetre24",
      },
      {
        name: "image_dataset",
        description: "Dataset d'images avec labels IA",
      },
      {
        name: "dataset_quick_stats",
        description: "Statistiques rapides du dataset",
      },
      {
        name: "import_logs",
        description: "Logs des imports",
      },
    ]

    let allTablesExist = true

    for (const table of tables) {
      try {
        console.log(`🔍 Vérification table: ${table.name}`)

        const { error } = await supabase.from(table.name).select("count", { count: "exact", head: true })

        if (error && error.code === "42P01") {
          console.log(`❌ Table ${table.name} manquante`)
          allTablesExist = false
        } else if (error) {
          console.log(`⚠️  Erreur table ${table.name}: ${error.message}`)
        } else {
          console.log(`✅ Table ${table.name} existe`)
        }
      } catch (error) {
        console.log(`⚠️  Table ${table.name}: ${error}`)
      }
    }

    if (!allTablesExist) {
      console.log("\n📋 TABLES MANQUANTES DÉTECTÉES")
      console.log("🔧 Veuillez exécuter les SQL suivants dans Supabase SQL Editor:")
      console.log("-".repeat(50))

      console.log(`
-- 1. Table d'analyse des fenêtres
CREATE TABLE IF NOT EXISTS window_analysis (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_session TEXT,
  image_url TEXT,
  analysis_data JSONB,
  frontend_validation JSONB,
  processing_time_ms INTEGER,
  quality_score FLOAT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Table des fabricants
CREATE TABLE IF NOT EXISTS window_manufacturers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT,
  product_type TEXT,
  material TEXT,
  color TEXT,
  dimensions TEXT,
  price_range TEXT,
  features JSONB,
  quality_score INTEGER,
  source_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Dataset d'images
CREATE TABLE IF NOT EXISTS image_dataset (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  image_base64 TEXT,
  source_url TEXT,
  source_site TEXT,
  title TEXT,
  description TEXT,
  labels JSONB,
  ml_features JSONB,
  quality_score INTEGER,
  training_ready BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Statistiques rapides
CREATE TABLE IF NOT EXISTS dataset_quick_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  total_images INTEGER,
  training_ready INTEGER,
  excellent_quality INTEGER,
  good_quality INTEGER,
  unique_sources INTEGER,
  avg_quality_score INTEGER,
  last_import TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Logs d'import
CREATE TABLE IF NOT EXISTS import_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  import_type TEXT,
  status TEXT,
  records_processed INTEGER,
  records_success INTEGER,
  records_failed INTEGER,
  error_details JSONB,
  duration_ms INTEGER,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
      `)

      console.log("-".repeat(50))
      console.log("⚠️  Après avoir exécuté ces SQL, relancez npm run auto-setup")
      return false
    }

    console.log("✅ Toutes les tables sont présentes")
    return true
  }

  private async importFenetre24(): Promise<boolean> {
    console.log("🏭 Import des données Fenetre24...")

    try {
      await Fenetre24DataImporter.importToSupabase()
      console.log("✅ Import Fenetre24 terminé avec succès")
      return true
    } catch (error) {
      console.error("❌ Erreur import Fenetre24:", error)
      return false
    }
  }

  private async importDataset(): Promise<boolean> {
    console.log("🖼️  Import du dataset d'images avec IA...")
    console.log("📋 Incluant le nouveau CSV DO-Fenetre-rez-de-chaussé")

    try {
      await ImageDatasetManager.importToSupabase()
      console.log("✅ Import dataset terminé avec succès")
      return true
    } catch (error) {
      console.error("❌ Erreur import dataset:", error)
      return false
    }
  }

  private async verifyData(): Promise<boolean> {
    console.log("🔍 Vérification finale des données...")

    const checks = [
      { table: "window_manufacturers", name: "Fabricants Fenetre24" },
      { table: "image_dataset", name: "Images Dataset" },
      { table: "import_logs", name: "Logs d'import" },
    ]

    let totalRecords = 0

    for (const check of checks) {
      try {
        const { count, error } = await supabase.from(check.table).select("*", { count: "exact", head: true })

        if (error) {
          console.log(`⚠️  ${check.name}: Table non accessible (${error.message})`)
        } else {
          console.log(`✅ ${check.name}: ${count || 0} enregistrements`)
          totalRecords += count || 0
        }
      } catch (error) {
        console.log(`⚠️  ${check.name}: Erreur de vérification`)
      }
    }

    // Vérification spéciale pour les statistiques
    try {
      const { data: stats, error } = await supabase
        .from("dataset_quick_stats")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .single()

      if (!error && stats) {
        console.log(`📊 Statistiques dataset:`)
        console.log(`   📸 Total images: ${stats.total_images}`)
        console.log(`   🎯 Prêt entraînement: ${stats.training_ready}`)
        console.log(`   ⭐ Qualité excellente: ${stats.excellent_quality}`)
        console.log(`   📈 Score moyen: ${stats.avg_quality_score}%`)
      }
    } catch (error) {
      console.log("⚠️  Statistiques non disponibles")
    }

    console.log(`\n📊 RÉSUMÉ FINAL:`)
    console.log(`📦 Total enregistrements: ${totalRecords}`)
    console.log("✅ Vérification terminée")

    return true
  }
}

// Fonction d'exécution
async function runAutoSetup() {
  const setup = new AutoSetup()
  await setup.runAutoSetup()
}

// Lancer si appelé directement
if (require.main === module) {
  runAutoSetup()
}

export { AutoSetup }
