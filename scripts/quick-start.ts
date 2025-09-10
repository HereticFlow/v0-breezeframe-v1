#!/usr/bin/env node

import { execSync, spawn, type ChildProcess } from "child_process"
import { existsSync } from "fs"
import { join } from "path"

interface QuickStartResult {
  success: boolean
  message: string
  details?: string[]
  errors?: string[]
  services?: Record<string, any>
}

class BreezeFrameQuickStart {
  private logMessages: string[] = []
  private errorMessages: string[] = []
  private runningProcesses: ChildProcess[] = []

  private log(message: string) {
    console.log(message)
    this.logMessages.push(message)
  }

  private error(message: string) {
    console.error(message)
    this.errorMessages.push(message)
  }

  async checkPrerequisites(): Promise<boolean> {
    this.log("🔍 Vérification des prérequis...")

    // Vérification Node.js
    try {
      const nodeVersion = execSync("node --version", { encoding: "utf8" }).trim()
      this.log(`✅ Node.js: ${nodeVersion}`)
    } catch (error) {
      this.error("❌ Node.js non trouvé")
      return false
    }

    // Vérification Python
    try {
      let pythonVersion: string
      try {
        pythonVersion = execSync("python --version", { encoding: "utf8" }).trim()
      } catch (error) {
        pythonVersion = execSync("python3 --version", { encoding: "utf8" }).trim()
      }
      this.log(`✅ ${pythonVersion}`)
    } catch (error) {
      this.error("❌ Python non trouvé")
      return false
    }

    // Vérification des dossiers
    const requiredPaths = ["python-backend", "python-backend/venv", "python-backend/app.py", "lib/supabase-client.ts"]

    for (const path of requiredPaths) {
      if (!existsSync(join(process.cwd(), path))) {
        this.error(`❌ ${path} non trouvé`)
        return false
      }
    }

    this.log("✅ Tous les prérequis sont satisfaits")
    return true
  }

  async installDependencies(): Promise<boolean> {
    try {
      this.log("📦 Installation des dépendances...")

      // Dépendances Node.js
      if (!existsSync(join(process.cwd(), "node_modules"))) {
        this.log("📦 Installation dépendances Node.js...")
        execSync("npm install", { stdio: "inherit" })
      }

      // Dépendances Python
      const isWindows = process.platform === "win32"
      const activateCmd = isWindows
        ? "python-backend\\venv\\Scripts\\activate.bat"
        : "source python-backend/venv/bin/activate"

      const checkPythonDeps = isWindows
        ? `${activateCmd} && python -c "import flask, tensorflow, cv2; print('OK')"`
        : `bash -c "${activateCmd} && python -c 'import flask, tensorflow, cv2; print(\"OK\")'"`

      try {
        execSync(checkPythonDeps, { stdio: "pipe" })
        this.log("✅ Dépendances Python OK")
      } catch (error) {
        this.log("📦 Installation dépendances Python...")
        const installCmd = isWindows
          ? `${activateCmd} && pip install -r python-backend/requirements.txt`
          : `bash -c "${activateCmd} && pip install -r python-backend/requirements.txt"`

        execSync(installCmd, { stdio: "inherit" })
      }

      return true
    } catch (error) {
      this.error(`❌ Erreur installation dépendances: ${error}`)
      return false
    }
  }

  async startPythonBackend(): Promise<ChildProcess | null> {
    try {
      this.log("🐍 Démarrage du backend Python...")

      const isWindows = process.platform === "win32"
      const activateCmd = isWindows
        ? "python-backend\\venv\\Scripts\\activate.bat"
        : "source python-backend/venv/bin/activate"

      const serverCmd = isWindows
        ? `${activateCmd} && cd python-backend && python app.py`
        : `bash -c "${activateCmd} && cd python-backend && python app.py"`

      const serverProcess = spawn(isWindows ? "cmd" : "bash", isWindows ? ["/c", serverCmd] : ["-c", serverCmd], {
        stdio: ["ignore", "pipe", "pipe"],
        detached: false,
      })

      // Gestion des logs du serveur
      serverProcess.stdout?.on("data", (data) => {
        const output = data.toString().trim()
        if (output) {
          console.log(`[Backend] ${output}`)
        }
      })

      serverProcess.stderr?.on("data", (data) => {
        const output = data.toString().trim()
        if (output && !output.includes("WARNING")) {
          console.error(`[Backend] ${output}`)
        }
      })

      // Attendre que le serveur démarre
      await new Promise((resolve) => setTimeout(resolve, 3000))

      // Vérification que le serveur fonctionne
      try {
        const fetch = (await import("node-fetch")).default
        const response = await fetch("http://localhost:5000/health")
        const data = await response.json()

        if (data.status === "healthy") {
          this.log("✅ Backend Python démarré sur http://localhost:5000")
          this.runningProcesses.push(serverProcess)
          return serverProcess
        } else {
          throw new Error("Serveur non opérationnel")
        }
      } catch (fetchError) {
        this.error(`❌ Backend Python non accessible: ${fetchError}`)
        serverProcess.kill()
        return null
      }
    } catch (error) {
      this.error(`❌ Erreur démarrage backend: ${error}`)
      return null
    }
  }

  async startNextJSFrontend(): Promise<ChildProcess | null> {
    try {
      this.log("⚛️ Démarrage du frontend Next.js...")

      const frontendProcess = spawn("npm", ["run", "dev"], {
        stdio: ["ignore", "pipe", "pipe"],
        detached: false,
      })

      // Gestion des logs du frontend
      frontendProcess.stdout?.on("data", (data) => {
        const output = data.toString().trim()
        if (output) {
          console.log(`[Frontend] ${output}`)
        }
      })

      frontendProcess.stderr?.on("data", (data) => {
        const output = data.toString().trim()
        if (output && !output.includes("warn")) {
          console.error(`[Frontend] ${output}`)
        }
      })

      // Attendre que le serveur démarre
      await new Promise((resolve) => setTimeout(resolve, 5000))

      // Vérification que le serveur fonctionne
      try {
        const fetch = (await import("node-fetch")).default
        const response = await fetch("http://localhost:3000")

        if (response.ok) {
          this.log("✅ Frontend Next.js démarré sur http://localhost:3000")
          this.runningProcesses.push(frontendProcess)
          return frontendProcess
        } else {
          throw new Error("Frontend non accessible")
        }
      } catch (fetchError) {
        this.error(`❌ Frontend Next.js non accessible: ${fetchError}`)
        frontendProcess.kill()
        return null
      }
    } catch (error) {
      this.error(`❌ Erreur démarrage frontend: ${error}`)
      return null
    }
  }

  async testFullStack(): Promise<boolean> {
    try {
      this.log("🧪 Test de l'application complète...")

      const fetch = (await import("node-fetch")).default

      // Test du frontend
      const frontendResponse = await fetch("http://localhost:3000")
      if (!frontendResponse.ok) {
        throw new Error("Frontend non accessible")
      }

      // Test du backend
      const backendResponse = await fetch("http://localhost:5000/health")
      const backendData = await backendResponse.json()
      if (backendData.status !== "healthy") {
        throw new Error("Backend non opérationnel")
      }

      // Test de l'analyseur
      const analyzerResponse = await fetch("http://localhost:5000/model-info")
      const analyzerData = await analyzerResponse.json()
      if (!analyzerData.success) {
        throw new Error("Analyseur non opérationnel")
      }

      this.log("✅ Application complète opérationnelle")
      this.log(`  Frontend: http://localhost:3000`)
      this.log(`  Backend: http://localhost:5000`)
      this.log(`  Analyseur: ${analyzerData.model_info.tensorflow_available ? "TensorFlow" : "OpenCV fallback"}`)

      return true
    } catch (error) {
      this.error(`❌ Test application échoué: ${error}`)
      return false
    }
  }

  async setupGracefulShutdown(): Promise<void> {
    const shutdown = () => {
      this.log("\n🛑 Arrêt de BreezeFrame...")

      this.runningProcesses.forEach((process, index) => {
        if (process && !process.killed) {
          this.log(`🔄 Arrêt du processus ${index + 1}...`)
          process.kill("SIGTERM")

          // Force kill après 5 secondes
          setTimeout(() => {
            if (!process.killed) {
              process.kill("SIGKILL")
            }
          }, 5000)
        }
      })

      setTimeout(() => {
        this.log("👋 BreezeFrame arrêté")
        process.exit(0)
      }, 1000)
    }

    process.on("SIGINT", shutdown)
    process.on("SIGTERM", shutdown)
    process.on("exit", shutdown)
  }

  async run(): Promise<QuickStartResult> {
    this.log("🚀 Démarrage rapide BreezeFrame")
    this.log("=".repeat(50))

    // Configuration de l'arrêt propre
    await this.setupGracefulShutdown()

    // Vérifications préalables
    if (!(await this.checkPrerequisites())) {
      return {
        success: false,
        message: "Prérequis non satisfaits",
        errors: this.errorMessages,
      }
    }

    // Installation des dépendances
    if (!(await this.installDependencies())) {
      return {
        success: false,
        message: "Erreur installation dépendances",
        errors: this.errorMessages,
      }
    }

    // Démarrage du backend
    const backendProcess = await this.startPythonBackend()
    if (!backendProcess) {
      return {
        success: false,
        message: "Erreur démarrage backend",
        errors: this.errorMessages,
      }
    }

    // Démarrage du frontend
    const frontendProcess = await this.startNextJSFrontend()
    if (!frontendProcess) {
      return {
        success: false,
        message: "Erreur démarrage frontend",
        errors: this.errorMessages,
      }
    }

    // Test de l'application complète
    if (!(await this.testFullStack())) {
      return {
        success: false,
        message: "Test application échoué",
        errors: this.errorMessages,
      }
    }

    this.log("\n🎉 BreezeFrame démarré avec succès!")
    this.log("\n🌐 URLs disponibles:")
    this.log("  Frontend: http://localhost:3000")
    this.log("  Backend API: http://localhost:5000")
    this.log("  Santé Backend: http://localhost:5000/health")
    this.log("  Stats Backend: http://localhost:5000/stats")
    this.log("\n⌨️  Appuyez sur Ctrl+C pour arrêter")

    // Maintenir les processus en vie
    return new Promise((resolve) => {
      // Cette promesse ne se résout jamais, gardant l'application en vie
      // Elle sera interrompue par le signal SIGINT (Ctrl+C)
    })
  }
}

// Fonction principale
async function quickStart(): Promise<QuickStartResult> {
  const starter = new BreezeFrameQuickStart()
  return await starter.run()
}

// Exécution si appelé directement
if (require.main === module) {
  quickStart()
    .then((result) => {
      if (!result.success) {
        console.error(`\n❌ ${result.message}`)
        if (result.errors) {
          result.errors.forEach((error) => console.error(`   ${error}`))
        }
        process.exit(1)
      }
    })
    .catch((error) => {
      console.error(`\n💥 Erreur inattendue: ${error}`)
      process.exit(1)
    })
}

export { quickStart, BreezeFrameQuickStart }
