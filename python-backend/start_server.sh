#!/bin/bash

# BreezeFrame Python Backend Startup Script
# Usage: ./start_server.sh [port] [debug]

echo "🚀 Démarrage du serveur BreezeFrame Window Analyzer"

# Configuration par défaut
PORT=${1:-5000}
DEBUG=${2:-false}
PYTHON_CMD="python3"

# Vérification de Python
if ! command -v $PYTHON_CMD &> /dev/null; then
    PYTHON_CMD="python"
    if ! command -v $PYTHON_CMD &> /dev/null; then
        echo "❌ Python non trouvé. Veuillez installer Python 3.8+"
        exit 1
    fi
fi

echo "🐍 Python: $($PYTHON_CMD --version)"

# Vérification du répertoire
if [ ! -f "app.py" ]; then
    echo "❌ Fichier app.py non trouvé. Exécutez depuis le dossier python-backend/"
    exit 1
fi

# Création de l'environnement virtuel si nécessaire
if [ ! -d "venv" ]; then
    echo "📦 Création de l'environnement virtuel..."
    $PYTHON_CMD -m venv venv
    if [ $? -ne 0 ]; then
        echo "❌ Erreur création environnement virtuel"
        exit 1
    fi
fi

# Activation de l'environnement virtuel
echo "🔧 Activation de l'environnement virtuel..."
source venv/bin/activate

# Mise à jour pip
echo "⬆️ Mise à jour pip..."
pip install --upgrade pip

# Installation des dépendances
echo "📚 Installation des dépendances..."
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "❌ Erreur installation dépendances"
    exit 1
fi

# Variables d'environnement
export PORT=$PORT
export DEBUG=$DEBUG
export FLASK_APP=app.py
export FLASK_ENV=development

# Vérification des modèles TensorFlow
echo "🤖 Vérification TensorFlow..."
$PYTHON_CMD -c "import tensorflow as tf; print(f'✅ TensorFlow {tf.__version__} OK')" 2>/dev/null || echo "⚠️ TensorFlow non disponible (fallback OpenCV)"

# Vérification OpenCV
echo "🔧 Vérification OpenCV..."
$PYTHON_CMD -c "import cv2; print(f'✅ OpenCV {cv2.__version__} OK')" 2>/dev/null || echo "❌ OpenCV non disponible"

# Test rapide de l'analyseur
echo "' OK')" 2>/dev/null || echo "❌ OpenCV non disponible"

# Test rapide de l'analyseur
echo "🧪 Test de l'analyseur..."
$PYTHON_CMD -c "from window_analyzer import get_analyzer_info; import json; print('📊 Info:', json.dumps(get_analyzer_info(), indent=2))" 2>/dev/null || echo "⚠️ Test analyseur échoué"

echo ""
echo "🌐 Démarrage du serveur sur le port $PORT..."
echo "🔗 URL: http://localhost:$PORT"
echo "❤️  Santé: http://localhost:$PORT/health"
echo "📊 Stats: http://localhost:$PORT/stats"
echo ""
echo "Pour arrêter le serveur: Ctrl+C"
echo "=========================================="

# Démarrage du serveur
if [ "$DEBUG" = "true" ]; then
    echo "🐛 Mode debug activé"
    $PYTHON_CMD app.py
else
    echo "🚀 Mode production"
    gunicorn --bind 0.0.0.0:$PORT --workers 2 --timeout 120 app:app
fi
