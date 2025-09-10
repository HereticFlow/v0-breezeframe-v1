@echo off
REM BreezeFrame Python Backend Start Script (Windows)
REM Version: 2.1.0

echo 🚀 Démarrage BreezeFrame Python Backend
echo ========================================

REM Vérifier Python
echo ℹ️  Vérification de Python...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    python3 --version >nul 2>&1
    if %errorlevel% neq 0 (
        echo ❌ Python non trouvé. Installez Python 3.8+
        pause
        exit /b 1
    )
    set PYTHON_CMD=python3
    echo ✅ Python3 trouvé
) else (
    set PYTHON_CMD=python
    echo ✅ Python trouvé
)

REM Aller dans le dossier backend
cd /d "%~dp0"
echo ℹ️  Dossier de travail: %CD%

REM Vérifier si l'environnement virtuel existe
if not exist "venv" (
    echo ⚠️  Environnement virtuel non trouvé
    echo ℹ️  Création de l'environnement virtuel...
    %PYTHON_CMD% -m venv venv
    if %errorlevel% neq 0 (
        echo ❌ Échec création environnement virtuel
        pause
        exit /b 1
    )
    echo ✅ Environnement virtuel créé
)

REM Activer l'environnement virtuel
echo ℹ️  Activation de l'environnement virtuel...
call venv\Scripts\activate.bat
if %errorlevel% neq 0 (
    echo ❌ Échec activation environnement virtuel
    pause
    exit /b 1
)
echo ✅ Environnement virtuel activé

REM Vérifier et installer les dépendances
if not exist "requirements_installed.flag" (
    echo ℹ️  Installation des dépendances...
    
    REM Mettre à jour pip
    pip install --upgrade pip
    
    REM Installer les dépendances
    pip install -r requirements.txt
    
    if %errorlevel% equ 0 (
        echo. > requirements_installed.flag
        echo ✅ Dépendances installées
    ) else (
        echo ❌ Échec installation dépendances
        echo ⚠️  Tentative de démarrage quand même...
    )
) else (
    echo ✅ Dépendances déjà installées
)

REM Vérifier les modules critiques
echo ℹ️  Vérification des modules...
python -c "import flask; print('✅ Flask OK')" 2>nul || echo ⚠️  Flask non disponible
python -c "import tensorflow as tf; print(f'✅ TensorFlow {tf.__version__} OK')" 2>nul || echo ⚠️  TensorFlow non disponible
python -c "import cv2; print(f'✅ OpenCV {cv2.__version__} OK')" 2>nul || echo ⚠️  OpenCV non disponible

REM Configuration des variables d'environnement
set FLASK_ENV=development
set PORT=5000
set DEBUG=true

echo ℹ️  Configuration:
echo   Port: %PORT%
echo   Debug: %DEBUG%
echo   Flask Env: %FLASK_ENV%

REM Démarrer le serveur
echo.
echo ✅ 🌐 Démarrage du serveur sur http://localhost:%PORT%
echo ℹ️  Appuyez sur Ctrl+C pour arrêter
echo ========================================

REM Lancer l'application
%PYTHON_CMD% app.py

REM Message de fin
echo.
echo ℹ️  🛑 Serveur arrêté
pause
