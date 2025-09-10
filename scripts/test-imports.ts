import { supabase } from "../lib/supabase-client"

interface TestResult {
  test: string
  status: "success" | "failed" | "warning"
  message: string
  details?: any
}

export class ImportTester {
  private static results: TestResult[] = []

  static async runAllTests(): Promise<void> {
    console.log("🧪 DÉMARRAGE DES TESTS D'IMPORT")
    console.log("=".repeat(50))

    this.results = []

    // Tests de base
    await this.testSupabaseConnection()
    await this.testTableAccess()
    await this.testCSVAccess()
    await this.testDataInsertion()

    // Affichage des résultats
    this.displayResults()
  }

  private static async testSupabaseConnection(): Promise<void> {
    console.log("\n🔍 Test 1: Connexion Supabase")

    try {
      const { data, error } = await supabase.from("window_analysis").select("count", { count: "exact", head: true })

      if (error && error.code === "42P01") {
        this.addResult("supabase_connection", "warning", "Tables non créées", { error: error.code })
      } else if (error) {
        this.addResult("supabase_connection", "failed", `Erreur: ${error.message}`, { error })
      } else {
        this.addResult("supabase_connection", "success", "Connexion établie")
      }
    } catch (error) {
      this.addResult("supabase_connection", "failed", `Erreur réseau: ${error}`)
    }
  }

  private static async testTableAccess(): Promise<void> {
    console.log("\n📋 Test 2: Accès aux tables")

    const tables = ["window_analysis", "window_manufacturers", "image_dataset", "import_logs"]

    for (const table of tables) {
      try {
        const { error } = await supabase.from(table).select("count", { count: "exact", head: true })

        if (error && error.code === "42P01") {
          this.addResult(`table_${table}`, "warning", `Table ${table} n'existe pas`)
        } else if (error) {
          this.addResult(`table_${table}`, "failed", `Erreur accès ${table}: ${error.message}`)
        } else {
          this.addResult(`table_${table}`, "success", `Table ${table} accessible`)
        }
      } catch (error) {
        this.addResult(`table_${table}`, "failed", `Erreur ${table}: ${error}`)
      }
    }
  }

  private static async testCSVAccess(): Promise<void> {
    console.log("\n📥 Test 3: Accès aux fichiers CSV")

    const csvUrls = [
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/google%20%287%29-cRTOh554W2adWby6awWzt6P5vzbdvM.csv",
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/google%20%286%29-W2ghVEUG3eCNvdFcqnLI6yffAJPW1L.csv",
    ]

    for (let i = 0; i < csvUrls.length; i++) {
      const csvUrl = csvUrls[i]
      try {
        console.log(`   Testant CSV ${i + 1}...`)
        const response = await fetch(csvUrl)

        if (!response.ok) {
          this.addResult(`csv_${i + 1}`, "failed", `HTTP ${response.status}: ${response.statusText}`)
          continue
        }

        const csvText = await response.text()
        const lines = csvText.split("\n").filter((line) => line.trim())

        this.addResult(`csv_${i + 1}`, "success", `CSV ${i + 1} accessible: ${lines.length} lignes`, {
          url: csvUrl,
          lines: lines.length,
          size: csvText.length,
        })
      } catch (error) {
        this.addResult(`csv_${i + 1}`, "failed", `Erreur CSV ${i + 1}: ${error}`)
      }
    }
  }

  private static async testDataInsertion(): Promise<void> {
    console.log("\n💾 Test 4: Insertion de données test")

    // Test insertion fabricant
    try {
      const testManufacturer = {
        name: "Test Fenêtre",
        brand: "Test Brand",
        product_type: "fenetre",
        material: "pvc",
        color: "blanc",
        dimensions: "100x100cm",
        price_range: "100-200€",
        features: { test: true },
        quality_score: 75,
        source_url: "https://test.com",
      }

      const { error: insertError } = await supabase.from("window_manufacturers").insert(testManufacturer)

      if (insertError) {
        this.addResult("data_insertion_manufacturer", "failed", `Erreur insertion: ${insertError.message}`)
      } else {
        this.addResult("data_insertion_manufacturer", "success", "Insertion fabricant réussie")

        // Nettoyage
        await supabase.from("window_manufacturers").delete().eq("name", "Test Fenêtre")
      }
    } catch (error) {
      this.addResult("data_insertion_manufacturer", "failed", `Erreur test insertion: ${error}`)
    }

    // Test insertion image dataset
    try {
      const testImage = {
        image_url: "https://test.com/image.jpg",
        source_site: "test",
        title: "Test Image",
        description: "Test Description",
        labels: { type: ["fenetre"] },
        ml_features: { test: true },
        quality_score: 80,
        training_ready: true,
      }

      const { error: insertError } = await supabase.from("image_dataset").insert(testImage)

      if (insertError) {
        this.addResult("data_insertion_image", "failed", `Erreur insertion: ${insertError.message}`)
      } else {
        this.addResult("data_insertion_image", "success", "Insertion image réussie")

        // Nettoyage
        await supabase.from("image_dataset").delete().eq("title", "Test Image")
      }
    } catch (error) {
      this.addResult("data_insertion_image", "failed", `Erreur test insertion: ${error}`)
    }
  }

  private static addResult(
    test: string,
    status: "success" | "failed" | "warning",
    message: string,
    details?: any,
  ): void {
    this.results.push({ test, status, message, details })

    const icon = status === "success" ? "✅" : status === "warning" ? "⚠️" : "❌"
    console.log(`   ${icon} ${message}`)
  }

  private static displayResults(): void {
    console.log("\n📊 RÉSUMÉ DES TESTS")
    console.log("=".repeat(50))

    const successCount = this.results.filter((r) => r.status === "success").length
    const warningCount = this.results.filter((r) => r.status === "warning").length
    const failedCount = this.results.filter((r) => r.status === "failed").length

    console.log(`✅ Succès: ${successCount}`)
    console.log(`⚠️  Avertissements: ${warningCount}`)
    console.log(`❌ Échecs: ${failedCount}`)

    if (failedCount === 0 && warningCount === 0) {
      console.log("\n🎉 Tous les tests sont passés ! Vous pouvez lancer l'import.")
    } else if (failedCount === 0) {
      console.log("\n⚠️  Quelques avertissements, mais l'import devrait fonctionner.")
    } else {
      console.log("\n❌ Des erreurs ont été détectées. Corrigez-les avant l'import.")
    }

    // Recommandations
    console.log("\n💡 RECOMMANDATIONS:")

    if (this.results.some((r) => r.test.startsWith("table_") && r.status === "warning")) {
      console.log("• Créez les tables manquantes dans Supabase Dashboard")
    }

    if (this.results.some((r) => r.test.startsWith("csv_") && r.status === "failed")) {
      console.log("• Vérifiez votre connexion internet pour accéder aux CSV")
    }

    if (this.results.some((r) => r.test.includes("insertion") && r.status === "failed")) {
      console.log("• Vérifiez les permissions de votre clé Supabase")
    }
  }

  static async quickTest(): Promise<boolean> {
    console.log("⚡ Test rapide de l'environnement...")

    try {
      // Test connexion Supabase
      const { error } = await supabase.from("window_analysis").select("count", { count: "exact", head: true })

      if (error && error.code !== "42P01") {
        console.log("❌ Problème de connexion Supabase")
        return false
      }

      // Test accès CSV
      const response = await fetch(
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/google%20%287%29-cRTOh554W2adWby6awWzt6P5vzbdvM.csv",
      )
      if (!response.ok) {
        console.log("❌ Impossible d'accéder aux CSV")
        return false
      }

      console.log("✅ Environnement prêt pour l'import")
      return true
    } catch (error) {
      console.log("❌ Erreur lors du test rapide:", error)
      return false
    }
  }
}

// Exécution si appelé directement
if (require.main === module) {
  ImportTester.runAllTests()
}
