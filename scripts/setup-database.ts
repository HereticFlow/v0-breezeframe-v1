#!/usr/bin/env node

import { supabase, dbUtils } from "../lib/supabase-client"
import { readFileSync } from "fs"
import { join } from "path"

async function setupDatabase() {
  console.log("🚀 Configuration de la base de données BreezeFrame...")

  try {
    // Test de connexion
    console.log("📡 Test de connexion Supabase...")
    const connectionTest = await dbUtils.testConnection()

    if (!connectionTest.connected) {
      console.error("❌ Impossible de se connecter à Supabase:", connectionTest.error)
      process.exit(1)
    }

    console.log("✅ Connexion Supabase réussie")

    // Si les tables n'existent pas, les créer
    if (!connectionTest.tablesExist) {
      console.log("📋 Création des tables...")

      // Lire le script SQL
      const sqlScript = readFileSync(join(process.cwd(), "scripts/create-supabase-tables.sql"), "utf8")

      // Exécuter le script SQL (note: Supabase client ne supporte pas l'exécution directe de scripts SQL complexes)
      // En production, vous devriez exécuter ce script via l'interface Supabase ou psql
      console.log("⚠️  Veuillez exécuter le script SQL suivant dans votre interface Supabase:")
      console.log("📁 Fichier: scripts/create-supabase-tables.sql")
      console.log("🔗 Interface: https://supabase.com/dashboard/project/pwjdrbllpyxvnqdrglpx/sql")

      // Tentative de création des données d'exemple
      try {
        console.log("📊 Création des données d'exemple...")
        await dbUtils.createSampleData()
        console.log("✅ Données d'exemple créées")
      } catch (error) {
        console.log("⚠️  Les données d'exemple n'ont pas pu être créées (normal si les tables n'existent pas encore)")
      }
    } else {
      console.log("✅ Tables déjà existantes")
    }

    // Vérification des tables
    console.log("🔍 Vérification des tables...")
    const tableCounts = await dbUtils.getTableCounts()

    console.log("📊 État des tables:")
    Object.entries(tableCounts).forEach(([table, count]) => {
      if (count >= 0) {
        console.log(`  ✅ ${table}: ${count} enregistrements`)
      } else {
        console.log(`  ❌ ${table}: Table non trouvée ou erreur`)
      }
    })

    console.log("\n🎉 Configuration de la base de données terminée!")
    console.log("\n📋 Prochaines étapes:")
    console.log("1. Si les tables n'existent pas, exécutez le script SQL dans Supabase")
    console.log("2. Lancez npm run dev pour démarrer l'application")
    console.log("3. Testez l'analyse de fenêtres sur la page principale")
  } catch (error) {
    console.error("❌ Erreur lors de la configuration:", error)
    process.exit(1)
  }
}

// Fonction pour créer les tables via l'API (alternative)
async function createTablesViaAPI() {
  console.log("🔧 Tentative de création des tables via l'API...")

  const tables = [
    {
      name: "window_analysis",
      sql: `
        CREATE TABLE IF NOT EXISTS window_analysis (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_session TEXT,
          image_url TEXT,
          analysis_data JSONB,
          frontend_validation JSONB,
          processing_time_ms INTEGER,
          quality_score DECIMAL(3,2),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `,
    },
    {
      name: "window_manufacturers",
      sql: `
        CREATE TABLE IF NOT EXISTS window_manufacturers (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT NOT NULL,
          brand TEXT,
          product_type TEXT,
          material TEXT,
          color TEXT,
          dimensions TEXT,
          price_range TEXT,
          features JSONB,
          quality_score DECIMAL(3,2),
          source_url TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `,
    },
    {
      name: "image_dataset",
      sql: `
        CREATE TABLE IF NOT EXISTS image_dataset (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          image_url TEXT NOT NULL,
          image_base64 TEXT,
          source_url TEXT,
          source_site TEXT,
          title TEXT,
          description TEXT,
          labels JSONB,
          ml_features JSONB,
          quality_score DECIMAL(3,2),
          training_ready BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `,
    },
    {
      name: "import_logs",
      sql: `
        CREATE TABLE IF NOT EXISTS import_logs (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
      `,
    },
  ]

  for (const table of tables) {
    try {
      console.log(`📋 Création de la table ${table.name}...`)
      // Note: Cette méthode ne fonctionne que si vous avez les permissions appropriées
      // En production, utilisez l'interface Supabase ou psql
      const { error } = await supabase.rpc("exec_sql", { sql: table.sql })

      if (error) {
        console.log(`⚠️  Table ${table.name}: ${error.message}`)
      } else {
        console.log(`✅ Table ${table.name} créée`)
      }
    } catch (error) {
      console.log(`⚠️  Erreur table ${table.name}:`, error)
    }
  }
}

// Fonction principale
async function main() {
  const args = process.argv.slice(2)

  if (args.includes("--create-tables")) {
    await createTablesViaAPI()
  } else {
    await setupDatabase()
  }
}

// Exécution si appelé directement
if (require.main === module) {
  main().catch(console.error)
}

export { setupDatabase, createTablesViaAPI }
