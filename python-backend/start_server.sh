#!/bin/bash
# BreezeFrame Python Backend Start Script
# Version: 2.1.0

echo "🚀 Démarrage BreezeFrame Python Backend"
echo "========================================"

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages colorés
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Vérifier Python
log_info "Vérification de Python..."
if command -v python3 &> /dev/null; then
    PYTHON_CMD=python3
    log_success "Python3 trouvé: $(python3 --version)"
elif command -v python &> /dev/null; then
    PYTHON_CMD=python
    log_success "Python trouvé: $(python --version)"
else
    log_error "Python non trouvé. Installez Python 3.8+"
    exit 1
fi

# Aller dans le dossier backend
cd "$(dirname "$0")"
log_info "Dossier de travail: $(pwd)"

# Vérifier si l'environnement virtuel existe
if [ ! -d "venv" ]; then
    log_warning "Environnement virtuel non trouvé"
    log_info "Création de l'environnement virtuel..."
    $PYTHON_CMD -m venv venv
    if [ $? -eq 0 ]; then
        log_success "Environnement virtuel créé"
    else
        log_error "Échec création environnement virtuel"
        exit 1
    fi
fi

# Activer l'environnement virtuel
log_info "Activation de l'environnement virtuel..."
source venv/bin/activate
if [ $? -eq 0 ]; then
    log_success "Environnement virtuel activé"
else
    log_error "Échec activation environnement virtuel"
    exit 1
fi

# Vérifier et installer les dépendances
if [ ! -f "requirements_installed.flag" ] || [ "requirements.txt" -nt "requirements_installed.flag" ]; then
    log_info "Installation/Mise à jour des dépendances..."
    
    # Mettre à jour pip
    pip install --upgrade pip
    
    # Installer les dépendances
    pip install -r requirements.txt
    
    if [ $? -eq 0 ]; then
        touch requirements_installed.flag
        log_success "Dépendances installées"
    else
        log_error "Échec installation dépendances"
        log_warning "Tentative de démarrage quand même..."
    fi
else
    log_success "Dépendances déjà installées"
fi

# Vérifier les modules critiques
log_info "Vérification des modules..."
python -c "import flask; print('✅ Flask OK')" 2>/dev/null || log_warning "Flask non disponible"
python -c "import tensorflow as tf; print(f'✅ TensorFlow {tf.__version__} OK')" 2>/dev/null || log_warning "TensorFlow non disponible"
python -c "import cv2; print(f'✅ OpenCV {cv2.__version__} OK')" 2>/dev/null || log_warning "OpenCV non disponible"

# Configuration des variables d'environnement
export FLASK_ENV=development
export PORT=5000
export DEBUG=true

log_info "Configuration:"
log_info "  Port: $PORT"
log_info "  Debug: $DEBUG"
log_info "  Flask Env: $FLASK_ENV"

# Démarrer le serveur
echo ""
log_success "🌐 Démarrage du serveur sur http://localhost:$PORT"
log_info "Appuyez sur Ctrl+C pour arrêter"
echo "========================================"

# Lancer l'application
$PYTHON_CMD app.py

# Message de fin
echo ""
log_info "🛑 Serveur arrêté"
