"""
BreezeFrame Python Backend
Serveur Flask pour l'analyse IA de fenêtres
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import logging
import time
from typing import Dict, List
import os
import sys

# Import de notre analyseur
from window_analyzer import analyze_window_image, get_analyzer_info, batch_analyze_images

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Création de l'application Flask
app = Flask(__name__)
CORS(app)  # Activation CORS pour les requêtes frontend

# Configuration
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Statistiques du serveur
server_stats = {
    'start_time': time.time(),
    'requests_count': 0,
    'successful_analyses': 0,
    'failed_analyses': 0,
    'total_processing_time': 0
}

@app.route('/health', methods=['GET'])
def health_check():
    """Vérification de santé du serveur"""
    uptime = time.time() - server_stats['start_time']
    
    return jsonify({
        'status': 'healthy',
        'service': 'BreezeFrame Window Analyzer',
        'version': '2.1.0',
        'uptime_seconds': int(uptime),
        'uptime_formatted': f"{int(uptime//3600)}h {int((uptime%3600)//60)}m {int(uptime%60)}s",
        'stats': server_stats,
        'analyzer_info': get_analyzer_info()
    })

@app.route('/analyze', methods=['POST'])
def analyze_window():
    """Endpoint principal pour l'analyse de fenêtres"""
    start_time = time.time()
    server_stats['requests_count'] += 1
    
    try:
        # Validation de la requête
        if not request.json:
            return jsonify({
                'success': False,
                'error': 'Aucune donnée JSON fournie'
            }), 400
        
        image_data = request.json.get('image')
        if not image_data:
            return jsonify({
                'success': False,
                'error': 'Aucune image fournie'
            }), 400
        
        logger.info("🔍 Nouvelle demande d'analyse reçue")
        
        # Analyse de l'image
        result = analyze_window_image(image_data)
        
        # Mise à jour des statistiques
        processing_time = int((time.time() - start_time) * 1000)
        server_stats['total_processing_time'] += processing_time
        
        if result.get('success', False):
            server_stats['successful_analyses'] += 1
            logger.info(f"✅ Analyse réussie en {processing_time}ms")
        else:
            server_stats['failed_analyses'] += 1
            logger.error(f"❌ Analyse échouée: {result.get('error', 'Erreur inconnue')}")
        
        # Ajout des métadonnées de requête
        result['request_id'] = f"req_{int(time.time())}_{server_stats['requests_count']}"
        result['server_processing_time_ms'] = processing_time
        
        return jsonify(result)
        
    except Exception as e:
        processing_time = int((time.time() - start_time) * 1000)
        server_stats['failed_analyses'] += 1
        server_stats['total_processing_time'] += processing_time
        
        logger.error(f"❌ Erreur serveur: {e}")
        
        return jsonify({
            'success': False,
            'error': f'Erreur serveur: {str(e)}',
            'server_processing_time_ms': processing_time
        }), 500

@app.route('/batch-analyze', methods=['POST'])
def batch_analyze():
    """Analyse en lot de plusieurs images"""
    start_time = time.time()
    server_stats['requests_count'] += 1
    
    try:
        if not request.json:
            return jsonify({
                'success': False,
                'error': 'Aucune donnée JSON fournie'
            }), 400
        
        images = request.json.get('images', [])
        if not images or not isinstance(images, list):
            return jsonify({
                'success': False,
                'error': 'Liste d\'images invalide'
            }), 400
        
        if len(images) > 10:  # Limite pour éviter la surcharge
            return jsonify({
                'success': False,
                'error': 'Maximum 10 images par lot'
            }), 400
        
        logger.info(f"📊 Analyse en lot de {len(images)} images")
        
        # Analyse des images
        results = batch_analyze_images(images)
        
        # Statistiques du lot
        successful = sum(1 for r in results if r.get('success', False))
        failed = len(results) - successful
        
        server_stats['successful_analyses'] += successful
        server_stats['failed_analyses'] += failed
        
        processing_time = int((time.time() - start_time) * 1000)
        server_stats['total_processing_time'] += processing_time
        
        logger.info(f"✅ Lot terminé: {successful} réussies, {failed} échouées en {processing_time}ms")
        
        return jsonify({
            'success': True,
            'results': results,
            'batch_stats': {
                'total_images': len(images),
                'successful': successful,
                'failed': failed,
                'processing_time_ms': processing_time
            }
        })
        
    except Exception as e:
        processing_time = int((time.time() - start_time) * 1000)
        server_stats['failed_analyses'] += 1
        server_stats['total_processing_time'] += processing_time
        
        logger.error(f"❌ Erreur analyse lot: {e}")
        
        return jsonify({
            'success': False,
            'error': f'Erreur analyse lot: {str(e)}',
            'processing_time_ms': processing_time
        }), 500

@app.route('/model-info', methods=['GET'])
def model_info():
    """Informations détaillées sur les modèles"""
    return jsonify({
        'success': True,
        'model_info': get_analyzer_info(),
        'server_info': {
            'python_version': sys.version,
            'flask_version': Flask.__version__,
            'platform': sys.platform
        }
    })

@app.route('/stats', methods=['GET'])
def get_stats():
    """Statistiques détaillées du serveur"""
    uptime = time.time() - server_stats['start_time']
    
    avg_processing_time = 0
    if server_stats['requests_count'] > 0:
        avg_processing_time = server_stats['total_processing_time'] / server_stats['requests_count']
    
    success_rate = 0
    if server_stats['requests_count'] > 0:
        success_rate = (server_stats['successful_analyses'] / server_stats['requests_count']) * 100
    
    return jsonify({
        'success': True,
        'stats': {
            **server_stats,
            'uptime_seconds': int(uptime),
            'uptime_formatted': f"{int(uptime//3600)}h {int((uptime%3600)//60)}m {int(uptime%60)}s",
            'average_processing_time_ms': round(avg_processing_time, 2),
            'success_rate_percent': round(success_rate, 2),
            'requests_per_minute': round((server_stats['requests_count'] / (uptime / 60)), 2) if uptime > 0 else 0
        },
        'analyzer_info': get_analyzer_info()
    })

@app.route('/reset-stats', methods=['POST'])
def reset_stats():
    """Réinitialisation des statistiques (pour les tests)"""
    global server_stats
    server_stats = {
        'start_time': time.time(),
        'requests_count': 0,
        'successful_analyses': 0,
        'failed_analyses': 0,
        'total_processing_time': 0
    }
    
    logger.info("📊 Statistiques réinitialisées")
    
    return jsonify({
        'success': True,
        'message': 'Statistiques réinitialisées'
    })

@app.errorhandler(413)
def too_large(e):
    """Gestion des fichiers trop volumineux"""
    return jsonify({
        'success': False,
        'error': 'Fichier trop volumineux (max 16MB)'
    }), 413

@app.errorhandler(404)
def not_found(e):
    """Gestion des routes non trouvées"""
    return jsonify({
        'success': False,
        'error': 'Endpoint non trouvé',
        'available_endpoints': [
            'GET /health',
            'POST /analyze',
            'POST /batch-analyze',
            'GET /model-info',
            'GET /stats',
            'POST /reset-stats'
        ]
    }), 404

@app.errorhandler(500)
def internal_error(e):
    """Gestion des erreurs internes"""
    logger.error(f"❌ Erreur interne: {e}")
    return jsonify({
        'success': False,
        'error': 'Erreur interne du serveur'
    }), 500

if __name__ == '__main__':
    # Configuration du serveur
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('DEBUG', 'False').lower() == 'true'
    
    logger.info("🚀 Démarrage du serveur BreezeFrame Window Analyzer")
    logger.info(f"🌐 Port: {port}")
    logger.info(f"🐛 Debug: {debug}")
    logger.info(f"📊 Analyseur: {get_analyzer_info()}")
    
    # Démarrage du serveur
    app.run(
        host='0.0.0.0',
        port=port,
        debug=debug,
        threaded=True
    )
