#!/usr/bin/env node

import { execSync } from "child_process"
import { existsSync, writeFileSync } from "fs"
import { join } from "path"

interface InstallationResult {
  success: boolean
  message: string
  details?: string[]
  errors?: string[]
}

class TensorFlowCLIInstaller {
  private logMessages: string[] = []
  private errorMessages: string[] = []

  private log(message: string) {
    console.log(message)
    this.logMessages.push(message)
  }

  private error(message: string) {
    console.error(message)
    this.errorMessages.push(message)
  }

  async checkPython(): Promise<boolean> {
    try {
      this.log("🐍 Vérification de Python...")
      const pythonVersion = execSync("python --version", { encoding: "utf8" }).trim()
      this.log(`✅ ${pythonVersion} trouvé`)
      return true
    } catch (error) {
      try {
        const python3Version = execSync("python3 --version", { encoding: "utf8" }).trim()
        this.log(`✅ ${python3Version} trouvé`)
        return true
      } catch (error3) {
        this.error("❌ Python non trouvé. Veuillez installer Python 3.8+")
        return false
      }
    }
  }

  async checkPip(): Promise<boolean> {
    try {
      this.log("📦 Vérification de pip...")
      const pipVersion = execSync("pip --version", { encoding: "utf8" }).trim()
      this.log(`✅ ${pipVersion}`)
      return true
    } catch (error) {
      try {
        const pip3Version = execSync("pip3 --version", { encoding: "utf8" }).trim()
        this.log(`✅ ${pip3Version}`)
        return true
      } catch (error3) {
        this.error("❌ pip non trouvé. Veuillez installer pip")
        return false
      }
    }
  }

  async createVirtualEnvironment(): Promise<boolean> {
    try {
      const venvPath = join(process.cwd(), "python-backend", "venv")

      if (existsSync(venvPath)) {
        this.log("📁 Environnement virtuel existant trouvé")
        return true
      }

      this.log("🏗️ Création de l'environnement virtuel...")

      // Création du dossier python-backend s'il n'existe pas
      const backendPath = join(process.cwd(), "python-backend")
      if (!existsSync(backendPath)) {
        execSync(`mkdir -p "${backendPath}"`)
      }

      // Création de l'environnement virtuel
      execSync("python -m venv python-backend/venv", { stdio: "inherit" })
      this.log("✅ Environnement virtuel créé")
      return true
    } catch (error) {
      try {
        execSync("python3 -m venv python-backend/venv", { stdio: "inherit" })
        this.log("✅ Environnement virtuel créé avec python3")
        return true
      } catch (error3) {
        this.error(`❌ Erreur création environnement virtuel: ${error}`)
        return false
      }
    }
  }

  async installTensorFlow(): Promise<boolean> {
    try {
      this.log("🤖 Installation de TensorFlow...")

      const isWindows = process.platform === "win32"
      const activateCmd = isWindows
        ? "python-backend\\venv\\Scripts\\activate.bat"
        : "source python-backend/venv/bin/activate"

      const installCmd = isWindows
        ? `${activateCmd} && pip install tensorflow==2.13.0`
        : `bash -c "${activateCmd} && pip install tensorflow==2.13.0"`

      execSync(installCmd, { stdio: "inherit" })
      this.log("✅ TensorFlow installé")
      return true
    } catch (error) {
      this.error(`❌ Erreur installation TensorFlow: ${error}`)
      return false
    }
  }

  async installOpenCV(): Promise<boolean> {
    try {
      this.log("🔧 Installation d'OpenCV...")

      const isWindows = process.platform === "win32"
      const activateCmd = isWindows
        ? "python-backend\\venv\\Scripts\\activate.bat"
        : "source python-backend/venv/bin/activate"

      const installCmd = isWindows
        ? `${activateCmd} && pip install opencv-python==4.8.1.78`
        : `bash -c "${activateCmd} && pip install opencv-python==4.8.1.78"`

      execSync(installCmd, { stdio: "inherit" })
      this.log("✅ OpenCV installé")
      return true
    } catch (error) {
      this.error(`❌ Erreur installation OpenCV: ${error}`)
      return false
    }
  }

  async installAllDependencies(): Promise<boolean> {
    try {
      this.log("📚 Installation de toutes les dépendances...")

      const isWindows = process.platform === "win32"
      const activateCmd = isWindows
        ? "python-backend\\venv\\Scripts\\activate.bat"
        : "source python-backend/venv/bin/activate"

      const installCmd = isWindows
        ? `${activateCmd} && pip install -r python-backend/requirements.txt`
        : `bash -c "${activateCmd} && pip install -r python-backend/requirements.txt"`

      execSync(installCmd, { stdio: "inherit" })
      this.log("✅ Toutes les dépendances installées")
      return true
    } catch (error) {
      this.error(`❌ Erreur installation dépendances: ${error}`)
      return false
    }
  }

  async testInstallation(): Promise<boolean> {
    try {
      this.log("🧪 Test de l'installation...")

      const isWindows = process.platform === "win32"
      const activateCmd = isWindows
        ? "python-backend\\venv\\Scripts\\activate.bat"
        : "source python-backend/venv/bin/activate"

      const testCmd = isWindows
        ? `${activateCmd} && python -c "import tensorflow as tf; import cv2; print(f'TensorFlow: {tf.__version__}'); print(f'OpenCV: {cv2.__version__}')"`
        : `bash -c "${activateCmd} && python -c \"import tensorflow as tf; import cv2; print(f'TensorFlow: {tf.__version__}'); print(f'OpenCV: {cv2.__version__}')\""`

      const output = execSync(testCmd, { encoding: "utf8" })
      this.log("✅ Test réussi:")
      this.log(output)
      return true
    } catch (error) {
      this.error(`❌ Test échoué: ${error}`)
      return false
    }
  }

  async installTensorFlowCLI(): Promise<boolean> {
    try {
      this.log("⚙️ Installation du TensorFlow CLI...")

      const isWindows = process.platform === "win32"
      const activateCmd = isWindows
        ? "python-backend\\venv\\Scripts\\activate.bat"
        : "source python-backend/venv/bin/activate"

      // Installation des outils TensorFlow
      const cliPackages = ["tensorboard", "tensorflow-datasets", "tensorflow-hub", "tensorflow-model-optimization"]

      for (const pkg of cliPackages) {
        this.log(`📦 Installation de ${pkg}...`)
        const installCmd = isWindows
          ? `${activateCmd} && pip install ${pkg}`
          : `bash -c "${activateCmd} && pip install ${pkg}"`

        execSync(installCmd, { stdio: "inherit" })
      }

      this.log("✅ TensorFlow CLI installé")
      return true
    } catch (error) {
      this.error(`❌ Erreur installation TensorFlow CLI: ${error}`)
      return false
    }
  }

  async createTensorFlowScripts(): Promise<void> {
    this.log("📝 Création des scripts TensorFlow...")

    // Script de test TensorFlow
    const testScript = `#!/usr/bin/env python3
"""
Test script for TensorFlow installation
"""
import tensorflow as tf
import cv2
import numpy as np
import sys

def test_tensorflow():
    print("🤖 Test TensorFlow...")
    print(f"Version: {tf.__version__}")
    print(f"GPU disponible: {tf.config.list_physical_devices('GPU')}")
    
    # Test simple
    x = tf.constant([[1.0, 2.0], [3.0, 4.0]])
    y = tf.constant([[1.0, 1.0], [0.0, 1.0]])
    z = tf.matmul(x, y)
    print(f"Test calcul: {z.numpy()}")
    print("✅ TensorFlow OK")

def test_opencv():
    print("🔧 Test OpenCV...")
    print(f"Version: {cv2.__version__}")
    
    # Test simple
    img = np.zeros((100, 100, 3), dtype=np.uint8)
    cv2.rectangle(img, (10, 10), (90, 90), (255, 255, 255), 2)
    print("✅ OpenCV OK")

if __name__ == "__main__":
    try:
        test_tensorflow()
        test_opencv()
        print("🎉 Tous les tests réussis!")
    except Exception as e:
        print(f"❌ Erreur: {e}")
        sys.exit(1)
`

    writeFileSync(join(process.cwd(), "python-backend", "test_installation.py"), testScript)

    // Script de démarrage TensorBoard
    const tensorboardScript = `#!/usr/bin/env python3
"""
TensorBoard launcher for BreezeFrame
"""
import subprocess
import sys
import os

def start_tensorboard(logdir="./logs", port=6006):
    print(f"🚀 Démarrage TensorBoard sur le port {port}")
    print(f"📁 Dossier logs: {logdir}")
    
    if not os.path.exists(logdir):
        os.makedirs(logdir)
        print(f"📁 Dossier {logdir} créé")
    
    try:
        subprocess.run([
            sys.executable, "-m", "tensorboard.main",
            "--logdir", logdir,
            "--port", str(port),
            "--host", "0.0.0.0"
        ])
    except KeyboardInterrupt:
        print("\\n🛑 TensorBoard arrêté")

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Démarrer TensorBoard")
    parser.add_argument("--logdir", default="./logs", help="Dossier des logs")
    parser.add_argument("--port", type=int, default=6006, help="Port TensorBoard")
    
    args = parser.parse_args()
    start_tensorboard(args.logdir, args.port)
`

    writeFileSync(join(process.cwd(), "python-backend", "start_tensorboard.py"), tensorboardScript)

    this.log("✅ Scripts TensorFlow créés")
  }

  async run(): Promise<InstallationResult> {
    this.log("🚀 Installation du TensorFlow CLI pour BreezeFrame")
    this.log("=".repeat(50))

    // Vérifications préalables
    if (!(await this.checkPython())) {
      return {
        success: false,
        message: "Python non trouvé",
        errors: this.errorMessages,
      }
    }

    if (!(await this.checkPip())) {
      return {
        success: false,
        message: "pip non trouvé",
        errors: this.errorMessages,
      }
    }

    // Installation
    const steps = [
      { name: "Environnement virtuel", fn: () => this.createVirtualEnvironment() },
      { name: "TensorFlow", fn: () => this.installTensorFlow() },
      { name: "OpenCV", fn: () => this.installOpenCV() },
      { name: "Dépendances complètes", fn: () => this.installAllDependencies() },
      { name: "TensorFlow CLI", fn: () => this.installTensorFlowCLI() },
      { name: "Test installation", fn: () => this.testInstallation() },
    ]

    for (const step of steps) {
      this.log(`\n📋 ${step.name}...`)
      if (!(await step.fn())) {
        return {
          success: false,
          message: `Échec: ${step.name}`,
          details: this.logMessages,
          errors: this.errorMessages,
        }
      }
    }

    // Création des scripts utilitaires
    await this.createTensorFlowScripts()

    this.log("\n🎉 Installation TensorFlow CLI terminée!")
    this.log("\n📋 Commandes disponibles:")
    this.log("  npm run python-backend     # Démarrer le serveur")
    this.log("  npm run test-tensorflow    # Tester l'installation")
    this.log("  npm run tensorboard        # Démarrer TensorBoard")

    return {
      success: true,
      message: "TensorFlow CLI installé avec succès",
      details: this.logMessages,
    }
  }
}

// Fonction principale
async function installTensorFlowCLI(): Promise<InstallationResult> {
  const installer = new TensorFlowCLIInstaller()
  return await installer.run()
}

// Exécution si appelé directement
if (require.main === module) {
  installTensorFlowCLI()
    .then((result) => {
      if (result.success) {
        console.log(`\n✅ ${result.message}`)
        process.exit(0)
      } else {
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

export { installTensorFlowCLI, TensorFlowCLIInstaller }
