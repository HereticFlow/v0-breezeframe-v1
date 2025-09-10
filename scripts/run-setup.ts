import { dbUtils } from "../lib/supabase-client"
import { AutoSetup } from "./auto-setup"

async function runCompleteSetup() {
  console.log("🚀 LANCEMENT DE LA CONFIGURATION COMPLÈTE")
  console.log("=".repeat(50))
  console.log("📅 Date:", new Date().toLocaleString())
  console.log("=".repeat(50))

  // 1. Test de connexion
  console.log("\n🔍 ÉTAPE 1: Test de connexion Supabase")
  console.log("-".repeat(30))

  const connectionTest = await dbUtils.testConnection()

  if (!connectionTest.connected) {
    console.error("❌ Connexion Supabase échouée:", connectionTest.error)
    console.log("📋 Vérifiez vos variables d'environnement:")
    console.log("   - NEXT_PUBLIC_SUPABASE_URL")
    console.log("   - NEXT_PUBLIC_SUPABASE_ANON_KEY")
    return
  }

  console.log("✅ Connexion Supabase établie")

  if (!connectionTest.tablesExist) {
    console.log("⚠️  Tables non créées - création nécessaire")
    console.log("\n📋 INSTRUCTIONS POUR CRÉER LES TABLES:")
    console.log("1. Allez dans Supabase Dashboard > SQL Editor")
    console.log("2. Exécutez les scripts SQL suivants dans l'ordre:")
    console.log("   - scripts/supabase-schema.sql")
    console.log("   - scripts/create-manufacturers-tables.sql")
    console.log("   - scripts/create-image-dataset-tables.sql")
    console.log("3. Relancez ce script")
    return
  }

  console.log("✅ Tables existantes détectées")

  // 2. Vérification des tables
  console.log("\n📊 ÉTAPE 2: Vérification des tables")
  console.log("-".repeat(30))

  const tableCounts = await dbUtils.getTableCounts()

  for (const [table, count] of Object.entries(tableCounts)) {
    if (count === -1) {
      console.log(`❌ Table ${table}: Non accessible`)
    } else {
      console.log(`✅ Table ${table}: ${count} enregistrements`)
    }
  }

  // 3. Lancement de l'auto-setup
  console.log("\n🤖 ÉTAPE 3: Auto-configuration complète")
  console.log("-".repeat(30))

  try {
    const autoSetup = new AutoSetup()
    await autoSetup.runAutoSetup()
  } catch (error) {
    console.error("❌ Erreur auto-setup:", error)
    return
  }

  // 4. Vérification finale
  console.log("\n🔍 ÉTAPE 4: Vérification finale")
  console.log("-".repeat(30))

  const finalCounts = await dbUtils.getTableCounts()
  let totalRecords = 0

  for (const [table, count] of Object.entries(finalCounts)) {
    if (count >= 0) {
      console.log(`📊 ${table}: ${count} enregistrements`)
      totalRecords += count
    }
  }

  console.log("\n🎉 CONFIGURATION TERMINÉE!")
  console.log("=".repeat(50))
  console.log(`📦 Total enregistrements: ${totalRecords}`)
  console.log("🌐 App disponible: http://localhost:3000")
  console.log("📊 Dataset: http://localhost:3000/dataset")
  console.log("⚙️  Admin: http://localhost:3000/admin")
  console.log("🔧 Setup: http://localhost:3000/setup")
  console.log("=".repeat(50))
}

// Exécution
runCompleteSetup().catch(console.error)
