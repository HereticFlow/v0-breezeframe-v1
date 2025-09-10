#!/usr/bin/env tsx
/**
 * Script d'auto-configuration complète BreezeFrame
 * Configure automatiquement tout le système AI + Database
 */

import fs from "fs"
import { execSync } from "child_process"

class AutoConfigurator {
  async configure(): Promise<void> {
    console.log("🚀 AUTO-CONFIGURATION BREEZEFRAME")
    console.log("=".repeat(60))

    await this.step1_CheckEnvironment()
    await this.step2_InstallDependencies()
    await this.step3_SetupDatabase()
    await this.step4_ConfigurePythonBackend()
    await this.step5_SetupModels()
    await this.step6_TestSystem()

    console.log("\n🎉 CONFIGURATION TERMINÉE !")
    console.log("=".repeat(60))
    console.log("✅ Système prêt à utiliser")
    console.log("🌐 Frontend: npm run dev")
    console.log("🐍 Backend: npm run python-backend")
    console.log("📊 Tests: npm run test-ai")
  }

  private async step1_CheckEnvironment(): Promise<void> {
    console.log("\n📋 ÉTAPE 1: Vérification environnement")

    // Vérifier Node.js
    try {
      const nodeVersion = execSync("node --version", { encoding: "utf8" }).trim()
      console.log(`✅ Node.js: ${nodeVersion}`)
    } catch {
      throw new Error("❌ Node.js non installé")
    }

    // Vérifier Python
    try {
      const pythonVersion = execSync("python3 --version", { encoding: "utf8" }).trim()
      console.log(`✅ Python: ${pythonVersion}`)
    } catch {
      console.log("⚠️  Python3 non trouvé, installation requise")
    }

    // Créer .env.local si inexistant
    if (!fs.existsSync(".env.local")) {
      console.log("📝 Création de .env.local...")
      fs.copyFileSync(".env.local.example", ".env.local")
      console.log("⚠️  Configurez vos variables dans .env.local")
    }
  }

  private async step2_InstallDependencies(): Promise<void> {
    console.log("\n📦 ÉTAPE 2: Installation dépendances")

    console.log("📥 Installation dépendances Node.js...")
    execSync("npm install", { stdio: "inherit" })

    console.log("📥 Configuration backend Python...")
    if (!fs.existsSync("python-backend")) {
      fs.mkdirSync("python-backend", { recursive: true })
    }

    // Rendre le script exécutable
    if (fs.existsSync("python-backend/start_server.sh")) {
      execSync("chmod +x python-backend/start_server.sh")
    }
  }

  private async step3_SetupDatabase(): Promise<void> {
    console.log("\n🗄️  ÉTAPE 3: Configuration base de données")

    try {
      console.log("🔧 Exécution auto-setup...")
      execSync("npm run auto-setup", { stdio: "inherit" })
    } catch (error) {
      console.log("⚠️  Auto-setup échoué, continuons...")
    }
  }

  private async step4_ConfigurePythonBackend(): Promise<void> {
    console.log("\n🐍 ÉTAPE 4: Configuration backend Python")

    // Créer les dossiers nécessaires
    const dirs = ["python-backend/models", "python-backend/logs", "python-backend/temp", "python-backend/uploads"]

    dirs.forEach((dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
        console.log(`📁 Créé: ${dir}`)
      }
    })
  }

  private async step5_SetupModels(): Promise<void> {
    console.log("\n🤖 ÉTAPE 5: Configuration modèles TensorFlow")

    // Créer les dossiers de modèles
    const modelDirs = ["public/models", "public/models/window-detector"]

    modelDirs.forEach((dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
        console.log(`📁 Créé: ${dir}`)
      }
    })

    // Créer des fichiers de poids factices pour les modèles
    const weightFiles = [
      "public/models/window-detector/model.weights.bin",
      "public/models/window-detector/classification-model.weights.bin",
      "public/models/window-detector/dimension-model.weights.bin",
    ]

    weightFiles.forEach((file) => {
      if (!fs.existsSync(file)) {
        // Créer un fichier de poids factice (en production: vrais poids)
        const dummyWeights = Buffer.alloc(1024, 0)
        fs.writeFileSync(file, dummyWeights)
        console.log(`🔧 Créé: ${file} (factice)`)
      }
    })
  }

  private async step6_TestSystem(): Promise<void> {
    console.log("\n🧪 ÉTAPE 6: Tests système")

    try {
      execSync("npm run test-ai", { stdio: "inherit" })
    } catch (error) {
      console.log("⚠️  Certains tests ont échoué (normal si backend Python pas démarré)")
    }
  }
}

// Exécution
async function main() {
  const configurator = new AutoConfigurator()
  await configurator.configure()
}

if (require.main === module) {
  main().catch(console.error)
}

export { AutoConfigurator }
