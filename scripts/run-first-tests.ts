#!/usr/bin/env node

import { execSync, spawn } from "child_process"
import { existsSync } from "fs"
import { join } from "path"
import fetch from "node-fetch"

interface TestResult {
  success: boolean
  message: string
  details?: string[]
  errors?: string[]
  results?: Record<string, any>
}

class BreezeFrameTestRunner {
  private logMessages: string[] = []
  private errorMessages: string[] = []
  private testResults: Record<string, any> = {}

  private log(message: string) {
    console.log(message)
    this.logMessages.push(message)
  }

  private error(message: string) {
    console.error(message)
    this.errorMessages.push(message)
  }

  async testNodeEnvironment(): Promise<boolean> {
    try {
      this.log("🟢 Test environnement Node.js...")

      const nodeVersion = execSync("node --version", { encoding: "utf8" }).trim()
      const npmVersion = execSync("npm --version", { encoding: "utf8" }).trim()

      this.log(`✅ Node.js: ${nodeVersion}`)
      this.log(`✅ npm: ${npmVersion}`)

      this.testResults.node = {
        version: nodeVersion,
        npm: npmVersion,
        status: "OK",
      }

      return true
    } catch (error) {
      this.error(`❌ Erreur environnement Node.js: ${error}`)
      this.testResults.node = { status: "FAILED", error: String(error) }
      return false
    }
  }

  async testPythonEnvironment(): Promise<boolean> {
    try {
      this.log("🐍 Test environnement Python...")

      let pythonVersion: string
      try {
        pythonVersion = execSync("python --version", { encoding: "utf8" }).trim()
      } catch (error) {
        pythonVersion = execSync("python3 --version", { encoding: "utf8" }).trim()
      }

      const pipVersion = execSync("pip --version", { encoding: "utf8" }).trim()

      this.log(`✅ ${pythonVersion}`)
      this.log(`✅ pip: ${pipVersion.split(" ")[1]}`)

      this.testResults.python = {
        version: pythonVersion,
        pip: pipVersion.split(" ")[1],
        status: "OK",
      }

      return true
    } catch (error) {
      this.error(`❌ Erreur environnement Python: ${error}`)
      this.testResults.python = { status: "FAILED", error: String(error) }
      return false
    }
  }

  async testSupabaseConnection(): Promise<boolean> {
    try {
      this.log("🗄️ Test connexion Supabase...")

      // Import dynamique pour éviter les erreurs si le module n'existe pas
      const { testSupabaseConnection } = await import("../lib/supabase-client")

      const isConnected = await testSupabaseConnection()

      if (isConnected) {
        this.log("✅ Connexion Supabase OK")
        this.testResults.supabase = { status: "OK", connected: true }
        return true
      } else {
        this.error("❌ Connexion Supabase échouée")
        this.testResults.supabase = { status: "FAILED", connected: false }
        return false
      }
    } catch (error) {
      this.error(`❌ Erreur test Supabase: ${error}`)
      this.testResults.supabase = { status: "FAILED", error: String(error) }
      return false
    }
  }

  async testTensorFlowInstallation(): Promise<boolean> {
    try {
      this.log("🤖 Test installation TensorFlow...")

      const backendPath = join(process.cwd(), "python-backend")
      if (!existsSync(backendPath)) {
        this.error("❌ Dossier python-backend non trouvé")
        this.testResults.tensorflow = { status: "FAILED", error: "Backend non installé" }
        return false
      }

      const isWindows = process.platform === "win32"
      const activateCmd = isWindows
        ? "python-backend\\venv\\Scripts\\activate.bat"
        : "source python-backend/venv/bin/activate"

      const testCmd = isWindows
        ? `${activateCmd} && python -c "import tensorflow as tf; import cv2; print(f'TensorFlow: {tf.__version__}'); print(f'OpenCV: {cv2.__version__}')"`
        : `bash -c "${activateCmd} && python -c \"import tensorflow as tf; import cv2; print(f'TensorFlow: {tf.__version__}'); print(f'OpenCV: {cv2.__version__}')\""`

      const output = execSync(testCmd, { encoding: "utf8" })
      this.log("✅ TensorFlow et OpenCV installés:")
      this.log(output)

      // Extraction des versions
      const tfMatch = output.match(/TensorFlow: ([\d.]+)/)
      const cvMatch = output.match(/OpenCV: ([\d.]+)/)

      this.testResults.tensorflow = {
        status: "OK",
        tensorflow_version: tfMatch ? tfMatch[1] : "unknown",
        opencv_version: cvMatch ? cvMatch[1] : "unknown",
      }

      return true
    } catch (error) {
      this.error(`❌ Test TensorFlow échoué: ${error}`)
      this.testResults.tensorflow = { status: "FAILED", error: String(error) }
      return false
    }
  }

  async testWindowAnalyzer(): Promise<boolean> {
    try {
      this.log("🔍 Test analyseur de fenêtres...")

      const isWindows = process.platform === "win32"
      const activateCmd = isWindows
        ? "python-backend\\venv\\Scripts\\activate.bat"
        : "source python-backend/venv/bin/activate"

      const testCmd = isWindows
        ? `${activateCmd} && cd python-backend && python -c "from window_analyzer import get_analyzer_info; import json; print(json.dumps(get_analyzer_info(), indent=2))"`
        : `bash -c "${activateCmd} && cd python-backend && python -c 'from window_analyzer import get_analyzer_info; import json; print(json.dumps(get_analyzer_info(), indent=2))'"`

      const output = execSync(testCmd, { encoding: "utf8" })
      const analyzerInfo = JSON.parse(output)

      this.log("✅ Analyseur de fenêtres:")
      this.log(`  TensorFlow disponible: ${analyzerInfo.tensorflow_available}`)
      this.log(`  Modèle chargé: ${analyzerInfo.model_loaded}`)
      this.log(`  Fallback disponible: ${analyzerInfo.fallback_available}`)

      this.testResults.window_analyzer = {
        status: "OK",
        ...analyzerInfo,
      }

      return true
    } catch (error) {
      this.error(`❌ Test analyseur échoué: ${error}`)
      this.testResults.window_analyzer = { status: "FAILED", error: String(error) }
      return false
    }
  }

  async testFlaskServer(): Promise<boolean> {
    try {
      this.log("🌐 Test serveur Flask...")

      // Démarrage du serveur en arrière-plan
      const isWindows = process.platform === "win32"
      const activateCmd = isWindows
        ? "python-backend\\venv\\Scripts\\activate.bat"
        : "source python-backend/venv/bin/activate"

      const serverCmd = isWindows
        ? `${activateCmd} && cd python-backend && python app.py`
        : `bash -c "${activateCmd} && cd python-backend && python app.py"`

      this.log("🚀 Démarrage du serveur Flask...")

      const serverProcess = spawn(isWindows ? "cmd" : "bash", isWindows ? ["/c", serverCmd] : ["-c", serverCmd], {
        detached: true,
        stdio: "pipe",
      })

      // Attendre que le serveur démarre
      await new Promise((resolve) => setTimeout(resolve, 5000))

      try {
        // Test de l'endpoint de santé
        const response = await fetch("http://localhost:5000/health")
        const data = await response.json()

        if (data.status === "healthy") {
          this.log("✅ Serveur Flask opérationnel")
          this.log(`  Service: ${data.service}`)
          this.log(`  Version: ${data.version}`)

          this.testResults.flask_server = {
            status: "OK",
            service: data.service,
            version: data.version,
            url: "http://localhost:5000",
          }

          // Arrêt du serveur
          serverProcess.kill()
          return true
        } else {
          throw new Error("Réponse serveur invalide")
        }
      } catch (fetchError) {
        this.error(`❌ Serveur Flask non accessible: ${fetchError}`)
        this.testResults.flask_server = { status: "FAILED", error: String(fetchError) }
        serverProcess.kill()
        return false
      }
    } catch (error) {
      this.error(`❌ Test serveur Flask échoué: ${error}`)
      this.testResults.flask_server = { status: "FAILED", error: String(error) }
      return false
    }
  }

  async testNextJSBuild(): Promise<boolean> {
    try {
      this.log("⚛️ Test build Next.js...")

      // Vérification des dépendances
      if (!existsSync(join(process.cwd(), "node_modules"))) {
        this.log("📦 Installation des dépendances Node.js...")
        execSync("npm install", { stdio: "inherit" })
      }

      // Test de build
      this.log("🏗️ Build Next.js...")
      execSync("npm run build", { stdio: "inherit" })

      this.log("✅ Build Next.js réussi")
      this.testResults.nextjs = { status: "OK", build: "SUCCESS" }

      return true
    } catch (error) {
      this.error(`❌ Build Next.js échoué: ${error}`)
      this.testResults.nextjs = { status: "FAILED", error: String(error) }
      return false
    }
  }

  async testDatabaseTables(): Promise<boolean> {
    try {
      this.log("🗃️ Test tables base de données...")

      const { dbUtils } = await import("../lib/supabase-client")

      const connectionTest = await dbUtils.testConnection()

      if (connectionTest.connected) {
        this.log("✅ Connexion base de données OK")

        if (connectionTest.tablesExist) {
          this.log("✅ Tables existantes")

          const tableCounts = await dbUtils.getTableCounts()
          this.log("📊 Nombre d'enregistrements:")
          Object.entries(tableCounts).forEach(([table, count]) => {
            if (count >= 0) {
              this.log(`  ${table}: ${count}`)
            } else {
              this.log(`  ${table}: Erreur`)
            }
          })

          this.testResults.database = {
            status: "OK",
            connected: true,
            tables_exist: true,
            table_counts: tableCounts,
          }
        } else {
          this.log("⚠️ Tables non créées")
          this.testResults.database = {
            status: "WARNING",
            connected: true,
            tables_exist: false,
            message: "Exécutez le script SQL pour créer les tables",
          }
        }

        return true
      } else {
        this.error(`❌ Connexion base de données échouée: ${connectionTest.error}`)
        this.testResults.database = {
          status: "FAILED",
          connected: false,
          error: connectionTest.error,
        }
        return false
      }
    } catch (error) {
      this.error(`❌ Test base de données échoué: ${error}`)
      this.testResults.database = { status: "FAILED", error: String(error) }
      return false
    }
  }

  async runAllTests(): Promise<TestResult> {
    this.log("🧪 Lancement des tests BreezeFrame")
    this.log("=".repeat(50))

    const tests = [
      { name: "Environnement Node.js", fn: () => this.testNodeEnvironment() },
      { name: "Environnement Python", fn: () => this.testPythonEnvironment() },
      { name: "Connexion Supabase", fn: () => this.testSupabaseConnection() },
      { name: "Installation TensorFlow", fn: () => this.testTensorFlowInstallation() },
      { name: "Analyseur de fenêtres", fn: () => this.testWindowAnalyzer() },
      { name: "Tables base de données", fn: () => this.testDatabaseTables() },
      { name: "Build Next.js", fn: () => this.testNextJSBuild() },
      { name: "Serveur Flask", fn: () => this.testFlaskServer() },
    ]

    let successCount = 0
    const totalTests = tests.length

    for (const test of tests) {
      this.log(`\n📋 ${test.name}...`)
      try {
        if (await test.fn()) {
          successCount++
        }
      } catch (error) {
        this.error(`💥 Erreur inattendue dans ${test.name}: ${error}`)
      }
    }

    // Résumé des tests
    this.log("\n📊 Résumé des tests:")
    this.log("=".repeat(30))
    this.log(`✅ Réussis: ${successCount}/${totalTests}`)
    this.log(`❌ Échoués: ${totalTests - successCount}/${totalTests}`)

    if (successCount === totalTests) {
      this.log("\n🎉 Tous les tests sont réussis!")
      this.log("🚀 BreezeFrame est prêt à être utilisé!")
    } else {
      this.log("\n⚠️ Certains tests ont échoué")
      this.log("📋 Vérifiez les erreurs ci-dessus")
    }

    return {
      success: successCount === totalTests,
      message: `${successCount}/${totalTests} tests réussis`,
      details: this.logMessages,
      errors: this.errorMessages,
      results: this.testResults,
    }
  }
}

// Fonction principale
async function runFirstTests(): Promise<TestResult> {
  const testRunner = new BreezeFrameTestRunner()
  return await testRunner.runAllTests()
}

// Exécution si appelé directement
if (require.main === module) {
  runFirstTests()
    .then((result) => {
      if (result.success) {
        console.log(`\n✅ ${result.message}`)
        console.log("\n🎯 Prochaines étapes:")
        console.log("1. npm run dev          # Démarrer le frontend")
        console.log("2. npm run python-backend  # Démarrer le backend")
        console.log("3. Ouvrir http://localhost:3000")
        process.exit(0)
      } else {
        console.error(`\n❌ ${result.message}`)
        console.log("\n🔧 Actions recommandées:")
        console.log("1. Vérifiez les erreurs ci-dessus")
        console.log("2. Exécutez npm run setup-all")
        console.log("3. Relancez les tests")
        process.exit(1)
      }
    })
    .catch((error) => {
      console.error(`\n💥 Erreur inattendue: ${error}`)
      process.exit(1)
    })
}

export { runFirstTests, BreezeFrameTestRunner }
