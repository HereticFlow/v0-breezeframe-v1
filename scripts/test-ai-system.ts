#!/usr/bin/env tsx
import fs from "fs"

class AISystemTester {
  async runTests(): Promise<void> {
    console.log("🧪 TESTS SYSTÈME AI BREEZEFRAME")
    console.log("=".repeat(50))

    await this.test1_TensorFlowJS()
    await this.test2_PythonBackend()
    await this.test3_ModelLoading()
    await this.test4_ImageProcessing()
    await this.test5_DatabaseIntegration()

    console.log("\n✅ TESTS TERMINÉS")
  }

  private async test1_TensorFlowJS(): Promise<void> {
    console.log("\n🤖 TEST 1: TensorFlow.js")

    try {
      // Vérifier que TensorFlow.js est installé
      const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"))
      const hasTensorFlow = packageJson.dependencies["@tensorflow/tfjs"]

      if (hasTensorFlow) {
        console.log("✅ TensorFlow.js installé:", hasTensorFlow)
      } else {
        console.log("❌ TensorFlow.js manquant")
      }

      // Vérifier les modèles
      const modelPaths = [
        "public/models/window-detector/model.json",
        "public/models/window-detector/classification-model.json",
        "public/models/window-detector/dimension-model.json",
      ]

      modelPaths.forEach((path) => {
        if (fs.existsSync(path)) {
          console.log(`✅ Modèle trouvé: ${path}`)
        } else {
          console.log(`❌ Modèle manquant: ${path}`)
        }
      })
    } catch (error) {
      console.log("❌ Erreur test TensorFlow.js:", error)
    }
  }

  private async test2_PythonBackend(): Promise<void> {
    console.log("\n🐍 TEST 2: Backend Python")

    try {
      // Vérifier les fichiers Python
      const pythonFiles = [
        "python-backend/window_analyzer.py",
        "python-backend/requirements.txt",
        "python-backend/start_server.sh",
      ]

      pythonFiles.forEach((file) => {
        if (fs.existsSync(file)) {
          console.log(`✅ Fichier Python: ${file}`)
        } else {
          console.log(`❌ Fichier manquant: ${file}`)
        }
      })

      // Test de connectivité (si serveur démarré)
      try {
        const response = await fetch("http://localhost:5000/health")
        if (response.ok) {
          const data = await response.json()
          console.log("✅ Backend Python actif:", data.status)
        }
      } catch {
        console.log("⚠️  Backend Python non démarré (normal)")
      }
    } catch (error) {
      console.log("❌ Erreur test Python:", error)
    }
  }

  private async test3_ModelLoading(): Promise<void> {
    console.log("\n📊 TEST 3: Chargement modèles")

    try {
      // Vérifier la structure des modèles JSON
      const modelFile = "public/models/window-detector/model.json"

      if (fs.existsSync(modelFile)) {
        const modelData = JSON.parse(fs.readFileSync(modelFile, "utf8"))

        if (modelData.modelTopology && modelData.weightsManifest) {
          console.log("✅ Structure modèle valide")
          console.log(`   - Couches: ${modelData.modelTopology.model_config.config.layers.length}`)
          console.log(`   - Poids: ${modelData.weightsManifest[0].weights.length}`)
        } else {
          console.log("❌ Structure modèle invalide")
        }
      }
    } catch (error) {
      console.log("❌ Erreur chargement modèles:", error)
    }
  }

  private async test4_ImageProcessing(): Promise<void> {
    console.log("\n🖼️  TEST 4: Traitement d'images")

    try {
      // Vérifier les images de test
      const testImages = [
        "public/images/window-system-1.jpeg",
        "public/images/window-system-2.jpeg",
        "public/images/window-system-3.jpeg",
      ]

      let imagesFound = 0
      testImages.forEach((image) => {
        if (fs.existsSync(image)) {
          console.log(`✅ Image test: ${image}`)
          imagesFound++
        }
      })

      console.log(`📊 Images de test disponibles: ${imagesFound}/${testImages.length}`)
    } catch (error) {
      console.log("❌ Erreur test images:", error)
    }
  }

  private async test5_DatabaseIntegration(): Promise<void> {
    console.log("\n🗄️  TEST 5: Intégration base de données")

    try {
      // Vérifier la configuration Supabase
      if (fs.existsSync(".env.local")) {
        const envContent = fs.readFileSync(".env.local", "utf8")

        const hasSupabaseUrl = envContent.includes("NEXT_PUBLIC_SUPABASE_URL")
        const hasSupabaseKey = envContent.includes("NEXT_PUBLIC_SUPABASE_ANON_KEY")
        const hasNeonUrl = envContent.includes("DATABASE_URL")

        console.log(`✅ Configuration Supabase URL: ${hasSupabaseUrl}`)
        console.log(`✅ Configuration Supabase Key: ${hasSupabaseKey}`)
        console.log(`✅ Configuration Neon DB: ${hasNeonUrl}`)
      } else {
        console.log("⚠️  Fichier .env.local manquant")
      }

      // Vérifier les scripts de base de données
      const dbScripts = ["scripts/supabase-schema.sql", "scripts/create-supabase-tables.sql"]

      dbScripts.forEach((script) => {
        if (fs.existsSync(script)) {
          console.log(`✅ Script DB: ${script}`)
        }
      })
    } catch (error) {
      console.log("❌ Erreur test database:", error)
    }
  }
}

// Exécution
async function main() {
  const tester = new AISystemTester()
  await tester.runTests()
}

if (require.main === module) {
  main().catch(console.error)
}

export { AISystemTester }
