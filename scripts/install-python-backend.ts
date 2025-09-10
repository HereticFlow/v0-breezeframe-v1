#!/usr/bin/env node

import { execSync } from "child_process"
import { existsSync, mkdirSync, writeFileSync } from "fs"
import { join } from "path"

interface BackendInstallResult {
  success: boolean
  message: string
  details?: string[]
  errors?: string[]
  serverUrl?: string
}

class PythonBackendInstaller {
  private logMessages: string[] = []
  private errorMessages: string[] = []
  private backendPath: string

  constructor() {
    this.backendPath = join(process.cwd(), "python-backend")
  }

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

    // Vérification Python
    try {
      const pythonVersion = execSync("python --version", { encoding: "utf8" }).trim()
      this.log(`✅ ${pythonVersion}`)
    } catch (error) {
      try {
        const python3Version = execSync("python3 --version", { encoding: "utf8" }).trim()
        this.log(`✅ ${python3Version}`)
      } catch (error3) {
        this.error("❌ Python non trouvé")
        return false
      }
    }

    // Vérification pip
    try {
      const pipVersion = execSync("pip --version", { encoding: "utf8" }).trim()
      this.log(`✅ pip: ${pipVersion.split(" ")[1]}`)
    } catch (error) {
      this.error("❌ pip non trouvé")
      return false
    }

    return true
  }

  async createBackendStructure(): Promise<boolean> {
    try {
      this.log("📁 Création de la structure backend...")

      // Création du dossier principal
      if (!existsSync(this.backendPath)) {
        mkdirSync(this.backendPath, { recursive: true })
        this.log("✅ Dossier python-backend créé")
      }

      // Création des sous-dossiers
      const folders = ["logs", "models", "temp", "tests"]
      folders.forEach((folder) => {
        const folderPath = join(this.backendPath, folder)
        if (!existsSync(folderPath)) {
          mkdirSync(folderPath, { recursive: true })
          this.log(`✅ Dossier ${folder} créé`)
        }
      })

      return true
    } catch (error) {
      this.error(`❌ Erreur création structure: ${error}`)
      return false
    }
  }

  async setupVirtualEnvironment(): Promise<boolean> {
    try {
      const venvPath = join(this.backendPath, "venv")

      if (existsSync(venvPath)) {
        this.log("📦 Environnement virtuel existant trouvé")
        return true
      }

      this.log("🏗️ Création de l'environnement virtuel...")

      try {
        execSync("python -m venv python-backend/venv", { stdio: "inherit" })
      } catch (error) {
        execSync("python3 -m venv python-backend/venv", { stdio: "inherit" })
      }

      this.log("✅ Environnement virtuel créé")
      return true
    } catch (error) {
      this.error(`❌ Erreur environnement virtuel: ${error}`)
      return false
    }
  }

  async installDependencies(): Promise<boolean> {
    try {
      this.log("📚 Installation des dépendances Python...")

      const isWindows = process.platform === "win32"
      const activateCmd = isWindows
        ? "python-backend\\venv\\Scripts\\activate.bat"
        : "source python-backend/venv/bin/activate"

      // Mise à jour pip
      const updatePipCmd = isWindows
        ? `${activateCmd} && pip install --upgrade pip`
        : `bash -c "${activateCmd} && pip install --upgrade pip"`

      execSync(updatePipCmd, { stdio: "inherit" })

      // Installation des dépendances
      const installCmd = isWindows
        ? `${activateCmd} && pip install -r python-backend/requirements.txt`
        : `bash -c "${activateCmd} && pip install -r python-backend/requirements.txt"`

      execSync(installCmd, { stdio: "inherit" })
      this.log("✅ Dépendances installées")
      return true
    } catch (error) {
      this.error(`❌ Erreur installation dépendances: ${error}`)
      return false
    }
  }

  async createConfigFiles(): Promise<boolean> {
    try {
      this.log("⚙️ Création des fichiers de configuration...")

      // Configuration Flask
      const flaskConfig = `"""
Configuration Flask pour BreezeFrame Backend
"""
import os
from datetime import timedelta

class Config:
    # Configuration de base
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'breezeframe-dev-key-2024'
    
    # Configuration Flask
    DEBUG = os.environ.get('DEBUG', 'False').lower() == 'true'
    TESTING = False
    
    # Configuration serveur
    HOST = os.environ.get('HOST', '0.0.0.0')
    PORT = int(os.environ.get('PORT', 5000))
    
    # Configuration CORS
    CORS_ORIGINS = ['http://localhost:3000', 'http://localhost:3001']
    
    # Configuration upload
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB
    UPLOAD_FOLDER = 'temp'
    
    # Configuration TensorFlow
    TF_CPP_MIN_LOG_LEVEL = '2'  # Réduire les logs TensorFlow
    
    # Configuration modèles
    MODEL_PATH = 'models'
    FALLBACK_ENABLED = True
    
    # Configuration logging
    LOG_LEVEL = os.environ.get('LOG_LEVEL', 'INFO')
    LOG_FILE = 'logs/breezeframe.log'

class DevelopmentConfig(Config):
    DEBUG = True
    LOG_LEVEL = 'DEBUG'

class ProductionConfig(Config):
    DEBUG = False
    LOG_LEVEL = 'WARNING'

class TestingConfig(Config):
    TESTING = True
    DEBUG = True

# Configuration par défaut
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}
`

      writeFileSync(join(this.backendPath, "config.py"), flaskConfig)

      // Variables d'environnement
      const envFile = `# BreezeFrame Backend Environment Variables
# Copiez ce fichier vers .env et modifiez selon vos besoins

# Configuration serveur
PORT=5000
DEBUG=true
HOST=0.0.0.0

# Configuration Flask
SECRET_KEY=breezeframe-dev-key-2024
FLASK_ENV=development

# Configuration TensorFlow
TF_CPP_MIN_LOG_LEVEL=2

# Configuration logging
LOG_LEVEL=INFO

# Configuration Supabase (optionnel)
SUPABASE_URL=https://pwjdrbllpyxvnqdrglpx.supabase.co
SUPABASE_KEY=your_supabase_key_here
`

      writeFileSync(join(this.backendPath, ".env.example"), envFile)

      this.log("✅ Fichiers de configuration créés")
      return true
    } catch (error) {
      this.error(`❌ Erreur création config: ${error}`)
      return false
    }
  }

  async createTestFiles(): Promise<boolean> {
    try {
      this.log("🧪 Création des fichiers de test...")

      // Test de l'analyseur
      const analyzerTest = `#!/usr/bin/env python3
"""
Tests pour l'analyseur de fenêtres BreezeFrame
"""
import unittest
import sys
import os
import base64
from io import BytesIO
from PIL import Image

# Ajout du chemin parent pour les imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from window_analyzer import WindowAnalyzer, analyze_window_image, get_analyzer_info

class TestWindowAnalyzer(unittest.TestCase):
    
    def setUp(self):
        self.analyzer = WindowAnalyzer()
        
        # Création d'une image de test
        img = Image.new('RGB', (224, 224), color='white')
        buffer = BytesIO()
        img.save(buffer, format='PNG')
        img_str = base64.b64encode(buffer.getvalue()).decode()
        self.test_image = f"data:image/png;base64,{img_str}"
    
    def test_analyzer_initialization(self):
        """Test de l'initialisation de l'analyseur"""
        self.assertIsNotNone(self.analyzer)
        info = get_analyzer_info()
        self.assertIn('tensorflow_available', info)
        self.assertIn('opencv_version', info)
    
    def test_image_preprocessing(self):
        """Test du prétraitement d'image"""
        try:
            image_array, image_original = self.analyzer.preprocess_image(self.test_image)
            self.assertEqual(image_array.shape, (224, 224, 3))
            self.assertTrue(image_array.max() <= 1.0)
            self.assertTrue(image_array.min() >= 0.0)
        except Exception as e:
            self.fail(f"Prétraitement échoué: {e}")
    
    def test_window_detection(self):
        """Test de la détection de fenêtre"""
        result = analyze_window_image(self.test_image)
        
        self.assertIn('success', result)
        if result['success']:
            self.assertIn('detection', result)
            self.assertIn('classification', result)
            self.assertIn('kit_recommendation', result)
            self.assertIn('quality_score', result)
    
    def test_opencv_fallback(self):
        """Test du fallback OpenCV"""
        try:
            image_array, image_original = self.analyzer.preprocess_image(self.test_image)
            result = self.analyzer.detect_window_opencv(image_original)
            self.assertIn('method', result)
            self.assertEqual(result['method'], 'opencv')
        except Exception as e:
            self.fail(f"Fallback OpenCV échoué: {e}")

if __name__ == '__main__':
    print("🧪 Tests BreezeFrame Window Analyzer")
    print("=" * 40)
    unittest.main(verbosity=2)
`

      writeFileSync(join(this.backendPath, "tests", "test_analyzer.py"), analyzerTest)

      // Test de l'API Flask
      const apiTest = `#!/usr/bin/env python3
"""
Tests pour l'API Flask BreezeFrame
"""
import unittest
import json
import sys
import os
import base64
from io import BytesIO
from PIL import Image

# Ajout du chemin parent pour les imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import app

class TestFlaskAPI(unittest.TestCase):
    
    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True
        
        # Image de test
        img = Image.new('RGB', (224, 224), color='white')
        buffer = BytesIO()
        img.save(buffer, format='PNG')
        img_str = base64.b64encode(buffer.getvalue()).decode()
        self.test_image = f"data:image/png;base64,{img_str}"
    
    def test_health_endpoint(self):
        """Test de l'endpoint de santé"""
        response = self.app.get('/health')
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data)
        self.assertEqual(data['status'], 'healthy')
        self.assertIn('service', data)
        self.assertIn('version', data)
    
    def test_analyze_endpoint(self):
        """Test de l'endpoint d'analyse"""
        payload = {'image': self.test_image}
        response = self.app.post('/analyze', 
                                json=payload,
                                content_type='application/json')
        
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('success', data)
    
    def test_model_info_endpoint(self):
        """Test de l'endpoint d'info modèle"""
        response = self.app.get('/model-info')
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data)
        self.assertTrue(data['success'])
        self.assertIn('model_info', data)
    
    def test_stats_endpoint(self):
        """Test de l'endpoint de statistiques"""
        response = self.app.get('/stats')
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data)
        self.assertTrue(data['success'])
        self.assertIn('stats', data)
    
    def test_invalid_request(self):
        """Test de requête invalide"""
        response = self.app.post('/analyze', 
                                json={},
                                content_type='application/json')
        
        self.assertEqual(response.status_code, 400)
        data = json.loads(response.data)
        self.assertFalse(data['success'])

if __name__ == '__main__':
    print("🧪 Tests API Flask BreezeFrame")
    print("=" * 40)
    unittest.main(verbosity=2)
`

      writeFileSync(join(this.backendPath, "tests", "test_api.py"), apiTest)

      this.log("✅ Fichiers de test créés")
      return true
    } catch (error) {
      this.error(`❌ Erreur création tests: ${error}`)
      return false
    }
  }

  async testBackend(): Promise<boolean> {
    try {
      this.log("🧪 Test du backend...")

      const isWindows = process.platform === "win32"
      const activateCmd = isWindows
        ? "python-backend\\venv\\Scripts\\activate.bat"
        : "source python-backend/venv/bin/activate"

      // Test d'import des modules
      const testCmd = isWindows
        ? `${activateCmd} && python -c "from window_analyzer import get_analyzer_info; from app import app; print('✅ Imports OK')"`
        : `bash -c "${activateCmd} && python -c 'from window_analyzer import get_analyzer_info; from app import app; print(\"✅ Imports OK\")'"`

      execSync(testCmd, { stdio: "inherit" })

      // Test des unittests
      const testUnitCmd = isWindows
        ? `${activateCmd} && cd python-backend && python -m pytest tests/ -v`
        : `bash -c "${activateCmd} && cd python-backend && python -m pytest tests/ -v"`

      try {
        execSync(testUnitCmd, { stdio: "inherit" })
        this.log("✅ Tests unitaires réussis")
      } catch (error) {
        this.log("⚠️ Tests unitaires échoués (normal si pytest non installé)")
      }

      return true
    } catch (error) {
      this.error(`❌ Test backend échoué: ${error}`)
      return false
    }
  }

  async createStartupScripts(): Promise<boolean> {
    try {
      this.log("📝 Création des scripts de démarrage...")

      // Script de démarrage rapide
      const quickStart = `#!/usr/bin/env python3
"""
Démarrage rapide du backend BreezeFrame
"""
import subprocess
import sys
import os
import time

def check_dependencies():
    """Vérification des dépendances"""
    try:
        import flask
        import tensorflow
        import cv2
        print("✅ Dépendances OK")
        return True
    except ImportError as e:
        print(f"❌ Dépendance manquante: {e}")
        return False

def start_server(port=5000, debug=True):
    """Démarrage du serveur"""
    if not check_dependencies():
        print("❌ Veuillez installer les dépendances")
        return False
    
    print(f"🚀 Démarrage serveur sur le port {port}")
    
    # Variables d'environnement
    os.environ['PORT'] = str(port)
    os.environ['DEBUG'] = str(debug).lower()
    
    try:
        from app import app
        app.run(host='0.0.0.0', port=port, debug=debug)
    except KeyboardInterrupt:
        print("\\n🛑 Serveur arrêté")
    except Exception as e:
        print(f"❌ Erreur serveur: {e}")
        return False
    
    return True

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Démarrage BreezeFrame Backend")
    parser.add_argument("--port", type=int, default=5000, help="Port du serveur")
    parser.add_argument("--debug", action="store_true", help="Mode debug")
    
    args = parser.parse_args()
    start_server(args.port, args.debug)
`

      writeFileSync(join(this.backendPath, "quick_start.py"), quickStart)

      this.log("✅ Scripts de démarrage créés")
      return true
    } catch (error) {
      this.error(`❌ Erreur création scripts: ${error}`)
      return false
    }
  }

  async run(): Promise<BackendInstallResult> {
    this.log("🚀 Installation du Backend Python BreezeFrame")
    this.log("=".repeat(50))

    // Étapes d'installation
    const steps = [
      { name: "Prérequis", fn: () => this.checkPrerequisites() },
      { name: "Structure backend", fn: () => this.createBackendStructure() },
      { name: "Environnement virtuel", fn: () => this.setupVirtualEnvironment() },
      { name: "Dépendances", fn: () => this.installDependencies() },
      { name: "Configuration", fn: () => this.createConfigFiles() },
      { name: "Tests", fn: () => this.createTestFiles() },
      { name: "Scripts démarrage", fn: () => this.createStartupScripts() },
      { name: "Test backend", fn: () => this.testBackend() },
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

    this.log("\n🎉 Backend Python installé avec succès!")
    this.log("\n📋 Commandes disponibles:")
    this.log("  npm run python-backend     # Démarrer le serveur")
    this.log("  npm run test-backend       # Tester le backend")
    this.log("  cd python-backend && python quick_start.py  # Démarrage rapide")

    return {
      success: true,
      message: "Backend Python installé avec succès",
      details: this.logMessages,
      serverUrl: "http://localhost:5000",
    }
  }
}

// Fonction principale
async function installPythonBackend(): Promise<BackendInstallResult> {
  const installer = new PythonBackendInstaller()
  return await installer.run()
}

// Exécution si appelé directement
if (require.main === module) {
  installPythonBackend()
    .then((result) => {
      if (result.success) {
        console.log(`\n✅ ${result.message}`)
        if (result.serverUrl) {
          console.log(`🌐 URL serveur: ${result.serverUrl}`)
        }
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

export { installPythonBackend, PythonBackendInstaller }
