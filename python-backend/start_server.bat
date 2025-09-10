@echo off
REM BreezeFrame Python Backend Startup Script (Windows)
REM Usage: start_server.bat [port] [debug]

echo 🚀 Démarrage du serveur BreezeFrame Window Analyzer

REM Configuration par défaut
set PORT=%1
if "%PORT%"=="" set PORT=5000

set DEBUG=%2
if "%DEBUG%"=="" set DEBUG=false

set PYTHON_CMD=python

REM Vérification de Python
%PYTHON_CMD% --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python non trouvé. Veuillez installer Python 3.8+
    pause
    exit /b 1
)

echo 🐍 Python: 
%PYTHON_CMD% --version

REM Vérification du répertoire
if not exist "app.py" (
    echo ❌ Fichier app.py non trouvé. Exécutez depuis le dossier python-backend\
    pause
    exit /b 1
)

REM Création de l'environnement virtuel si nécessaire
if not exist "venv" (
    echo 📦 Création de l'environnement virtuel...
    %PYTHON_CMD% -m venv venv
    if errorlevel 1 (
        echo ❌ Erreur création environnement virtuel
        pause
        exit /b 1
    )
)

REM Activation de l'environnement virtuel
echo 🔧 Activation de l'environnement virtuel...
call venv\Scripts\activate.bat

REM Mise à jour pip
echo ⬆️ Mise à jour pip...
pip install --upgrade pip

REM Installation des dépendances
echo 📚 Installation des dépendances...
pip install -r requirements.txt
if errorlevel 1 (
    echo ❌ Erreur installation dépendances
    pause
    exit /b 1
)

REM Variables d'environnement
set PORT=%PORT%
set DEBUG=%DEBUG%
set FLASK_APP=app.py
set FLASK_ENV=development

REM Vérification des modèles TensorFlow
echo 🤖 Vérification TensorFlow...
%PYTHON_CMD% -c "import tensorflow as tf; print(f'✅ TensorFlow {tf.__version__} OK')" 2>nul || echo ⚠️ TensorFlow non disponible (fallback OpenCV)

REM Vérification OpenCV
echo 🔧 Vérification OpenCV...
%PYTHON_CMD% -c "import cv2; print(f'✅ OpenCV {cv2.__version__} OK')" 2>nul || echo ❌ OpenCV non disponible

REM Test rapide de l'analyseur
echo 🧪 Test de l'analyseur...
%PYTHON_CMD% -c "from window_analyzer import get_analyzer_info; import json; print('📊 Info:', json.dumps(get_analyzer_info(), indent=2))" 2>nul || echo ⚠️ Test analyseur échoué

echo.
echo 🌐 Démarrage du serveur sur le port %PORT%...
echo 🔗 URL: http://localhost:%PORT%
echo ❤️  Santé: http://localhost:%PORT%/health
echo 📊 Stats: http://localhost:%PORT%/stats
echo.
echo Pour arrêter le serveur: Ctrl+C
echo ==========================================

REM Démarrage du serveur
if "%DEBUG%"=="true" (
    echo 🐛 Mode debug activé
    %PYTHON_CMD% app.py
) else (
    echo 🚀 Mode production
    waitress-serve --host=0.0.0.0 --port=%PORT% app:app
)

pause
