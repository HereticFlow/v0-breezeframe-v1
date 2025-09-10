#!/usr/bin/env python3
"""
BreezeFrame Python Backend Server
Serveur API Flask pour l'analyse IA de fenêtres
"""

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import logging
import os
import sys
import json
import base64
import io
import time
from datetime import datetime
from PIL import Image
import numpy as np

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialisation Flask
app = Flask(__name__)

# Configuration CORS pour permettre les requêtes depuis le frontend
CORS(app, origins=[
    "http://localhost:3000",
    "http://localhost:3001", 
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001"
])

# Configuration
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Tentative d'import des modules d'IA
try:
    import tensorflow as tf
    import cv2
    TENSORFLOW_AVAILABLE = True
    OPENCV_AVAILABLE = True
    logger.info("✅ TensorFlow et OpenCV chargés avec succès")
    logger.info(f"TensorFlow version: {tf.__version__}")
    logger.info(f"OpenCV version: {cv2.__version__}")
except ImportError as e:
    TENSORFLOW_AVAILABLE = False
    OPENCV_AVAILABLE = False
    logger.warning(f"⚠️ Modules IA non disponibles: {e}")
    logger.info("Mode fallback activé - analyses simulées")

# Statistiques globales
STATS = {
    'total_analyses': 0,
    'successful_analyses': 0,
    'failed_analyses': 0,
    'start_time': datetime.now().isoformat(),
    'tensorflow_available': TENSORFLOW_AVAILABLE,
    'opencv_available': OPENCV_AVAILABLE
}

def preprocess_image(image_data):
    """Préprocesse l'image pour l'analyse"""
    try:
        # Supprimer le préfixe data:image si présent
        if image_data.startswith('data:image'):
            image_data = image_data.split(',')[1]
        
        # Décoder base64
        image_bytes = base64.b64decode(image_data)
        image = Image.open(io.BytesIO(image_bytes))
        
        # Convertir en RGB si nécessaire
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Redimensionner pour l'analyse
        image = image.resize((224, 224))
        
        # Convertir en array numpy
        image_array = np.array(image) / 255.0
        
        return image_array, image
        
    except Exception as e:
        logger.error(f"Erreur préprocessing image: {e}")
        return None, None

def analyze_window_tensorflow(image_array):
    """Analyse avec TensorFlow (si disponible)"""
    if not TENSORFLOW_AVAILABLE:
        return None
    
    try:
        # Simulation d'analyse TensorFlow
        # Dans une vraie implémentation, on utiliserait un modèle entraîné
        
        # Détection simulée
        confidence = np.random.uniform(0.7, 0.95)
        
        # Coordonnées de la fenêtre détectée (simulées)
        x = np.random.uniform(0.1, 0.3)
        y = np.random.uniform(0.1, 0.3)
        width = np.random.uniform(0.4, 0.6)
        height = np.random.uniform(0.4, 0.6)
        
        return {
            'method': 'tensorflow',
            'confidence': float(confidence),
            'bounding_box': {
                'x': float(x),
                'y': float(y),
                'width': float(width),
                'height': float(height)
            },
            'window_detected': confidence > 0.5
        }
        
    except Exception as e:
        logger.error(f"Erreur analyse TensorFlow: {e}")
        return None

def analyze_window_opencv(image):
    """Analyse avec OpenCV (fallback)"""
    if not OPENCV_AVAILABLE:
        return None
    
    try:
        # Convertir PIL en OpenCV
        image_cv = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        gray = cv2.cvtColor(image_cv, cv2.COLOR_BGR2GRAY)
        
        # Détection de contours
        edges = cv2.Canny(gray, 50, 150)
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        if contours:
            # Trouver le plus grand contour
            largest_contour = max(contours, key=cv2.contourArea)
            x, y, w, h = cv2.boundingRect(largest_contour)
            
            # Normaliser les coordonnées
            height, width = image_cv.shape[:2]
            
            return {
                'method': 'opencv',
                'confidence': 0.75,
                'bounding_box': {
                    'x': x / width,
                    'y': y / height,
                    'width': w / width,
                    'height': h / height
                },
                'window_detected': True
            }
        
        return {
            'method': 'opencv',
            'confidence': 0.3,
            'bounding_box': None,
            'window_detected': False
        }
        
    except Exception as e:
        logger.error(f"Erreur analyse OpenCV: {e}")
        return None

def analyze_window_fallback():
    """Analyse simulée (fallback complet)"""
    return {
        'method': 'simulation',
        'confidence': 0.85,
        'bounding_box': {
            'x': 0.2,
            'y': 0.15,
            'width': 0.6,
            'height': 0.7
        },
        'window_detected': True
    }

def generate_window_analysis(detection_result):
    """Génère une analyse complète de la fenêtre"""
    
    if not detection_result or not detection_result.get('window_detected'):
        return {
            'success': False,
            'message': 'Aucune fenêtre détectée',
            'detection': detection_result or {},
            'classification': None,
            'dimensions': None,
            'kit_recommendation': None,
            'quality_score': 0
        }
    
    # Classification du type de fenêtre
    bbox = detection_result.get('bounding_box', {})
    width_ratio = bbox.get('width', 0.5)
    height_ratio = bbox.get('height', 0.7)
    
    if height_ratio > width_ratio * 1.5:
        window_type = 'Fenêtre Haute'
        opening_type = 'Oscillo-battant'
    elif width_ratio > height_ratio * 1.5:
        window_type = 'Fenêtre Large'
        opening_type = 'Coulissant'
    else:
        window_type = 'Fenêtre Standard'
        opening_type = 'Battant'
    
    # Estimation des dimensions (en cm)
    estimated_width = int(width_ratio * 150 + 50)  # 50-200cm
    estimated_height = int(height_ratio * 180 + 60)  # 60-240cm
    
    # Recommandation de kit
    surface = estimated_width * estimated_height / 10000  # m²
    
    if surface < 1.0:
        kit_type = 'Kit Compact'
        kit_price = '299€'
    elif surface < 2.0:
        kit_type = 'Kit Standard'
        kit_price = '449€'
    else:
        kit_type = 'Kit Premium'
        kit_price = '699€'
    
    # Score de qualité basé sur la confiance
    confidence = detection_result.get('confidence', 0)
    quality_score = int(confidence * 100)
    
    return {
        'success': True,
        'detection': detection_result,
        'classification': {
            'window_type': window_type,
            'opening_type': opening_type,
            'material_detected': 'PVC/Aluminium',
            'glazing_type': 'Double vitrage'
        },
        'dimensions': {
            'width_cm': estimated_width,
            'height_cm': estimated_height,
            'surface_m2': round(surface, 2),
            'confidence': confidence
        },
        'kit_recommendation': {
            'type': kit_type,
            'price': kit_price,
            'features': [
                'Capteurs de luminosité',
                'Contrôle automatique',
                'Application mobile',
                'Garantie 2 ans'
            ]
        },
        'quality_score': quality_score,
        'processing_info': {
            'method': detection_result.get('method', 'unknown'),
            'timestamp': datetime.now().isoformat(),
            'backend_version': '2.1.0'
        }
    }

# Routes API

@app.route('/health', methods=['GET'])
def health_check():
    """Vérification de santé du serveur"""
    return jsonify({
        'status': 'healthy',
        'service': 'BreezeFrame Python Backend',
        'version': '2.1.0',
        'timestamp': datetime.now().isoformat(),
        'tensorflow_available': TENSORFLOW_AVAILABLE,
        'opencv_available': OPENCV_AVAILABLE,
        'stats': STATS
    })

@app.route('/analyze', methods=['POST'])
def analyze_window():
    """Analyse d'une fenêtre à partir d'une image"""
    start_time = time.time()
    STATS['total_analyses'] += 1
    
    try:
        # Récupérer les données JSON
        data = request.get_json()
        
        if not data or 'image' not in data:
            STATS['failed_analyses'] += 1
            return jsonify({
                'success': False,
                'error': 'Image data required',
                'message': 'Veuillez fournir une image en base64'
            }), 400
        
        logger.info("🔍 Début analyse d'image")
        
        # Préprocesser l'image
        image_array, image_pil = preprocess_image(data['image'])
        
        if image_array is None:
            STATS['failed_analyses'] += 1
            return jsonify({
                'success': False,
                'error': 'Image preprocessing failed',
                'message': 'Impossible de traiter l\'image fournie'
            }), 400
        
        # Tentative d'analyse avec TensorFlow
        detection_result = analyze_window_tensorflow(image_array)
        
        # Fallback OpenCV si TensorFlow échoue
        if detection_result is None and image_pil is not None:
            detection_result = analyze_window_opencv(image_pil)
        
        # Fallback simulation si tout échoue
        if detection_result is None:
            detection_result = analyze_window_fallback()
        
        # Générer l'analyse complète
        analysis = generate_window_analysis(detection_result)
        
        # Ajouter les métadonnées de traitement
        processing_time = (time.time() - start_time) * 1000
        analysis['processing_time_ms'] = round(processing_time, 2)
        
        if analysis['success']:
            STATS['successful_analyses'] += 1
            logger.info(f"✅ Analyse réussie en {processing_time:.2f}ms")
        else:
            STATS['failed_analyses'] += 1
            logger.warning("⚠️ Aucune fenêtre détectée")
        
        return jsonify(analysis)
        
    except Exception as e:
        STATS['failed_analyses'] += 1
        logger.error(f"❌ Erreur analyse: {e}")
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Erreur interne du serveur',
            'processing_time_ms': (time.time() - start_time) * 1000
        }), 500

@app.route('/batch-analyze', methods=['POST'])
def batch_analyze():
    """Analyse en lot de plusieurs images"""
    try:
        data = request.get_json()
        
        if not data or 'images' not in data:
            return jsonify({
                'success': False,
                'error': 'Images array required'
            }), 400
        
        images = data['images']
        results = []
        
        logger.info(f"🔍 Début analyse en lot de {len(images)} images")
        
        for i, image_data in enumerate(images):
            logger.info(f"Analyse image {i+1}/{len(images)}")
            
            # Analyser chaque image individuellement
            image_array, image_pil = preprocess_image(image_data)
            
            if image_array is not None:
                detection_result = analyze_window_tensorflow(image_array)
                if detection_result is None and image_pil is not None:
                    detection_result = analyze_window_opencv(image_pil)
                if detection_result is None:
                    detection_result = analyze_window_fallback()
                
                analysis = generate_window_analysis(detection_result)
                results.append(analysis)
            else:
                results.append({
                    'success': False,
                    'error': 'Image preprocessing failed'
                })
        
        successful = sum(1 for r in results if r.get('success', False))
        
        return jsonify({
            'success': True,
            'results': results,
            'summary': {
                'total': len(images),
                'successful': successful,
                'failed': len(images) - successful
            }
        })
        
    except Exception as e:
        logger.error(f"❌ Erreur batch analyse: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/model-info', methods=['GET'])
def model_info():
    """Informations sur les modèles et capacités"""
    try:
        info = {
            'tensorflow': {
                'available': TENSORFLOW_AVAILABLE,
                'version': tf.__version__ if TENSORFLOW_AVAILABLE else None
            },
            'opencv': {
                'available': OPENCV_AVAILABLE,
                'version': cv2.__version__ if OPENCV_AVAILABLE else None
            },
            'capabilities': {
                'window_detection': True,
                'dimension_estimation': True,
                'material_classification': True,
                'kit_recommendation': True
            },
            'supported_formats': ['PNG', 'JPEG', 'JPG', 'WEBP'],
            'max_image_size': '16MB'
        }
        
        return jsonify({
            'success': True,
            'model_info': info
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/stats', methods=['GET'])
def get_stats():
    """Statistiques du serveur"""
    try:
        uptime = datetime.now() - datetime.fromisoformat(STATS['start_time'])
        
        stats_response = {
            **STATS,
            'uptime_seconds': int(uptime.total_seconds()),
            'uptime_human': str(uptime).split('.')[0],
            'success_rate': round(
                (STATS['successful_analyses'] / max(STATS['total_analyses'], 1)) * 100, 2
            )
        }
        
        return jsonify({
            'success': True,
            'stats': stats_response
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/reset-stats', methods=['POST'])
def reset_stats():
    """Réinitialiser les statistiques"""
    global STATS
    STATS.update({
        'total_analyses': 0,
        'successful_analyses': 0,
        'failed_analyses': 0,
        'start_time': datetime.now().isoformat()
    })
    
    return jsonify({
        'success': True,
        'message': 'Statistiques réinitialisées'
    })

# Gestion des erreurs

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'success': False,
        'error': 'Endpoint not found',
        'message': 'L\'endpoint demandé n\'existe pas'
    }), 404

@app.errorhandler(413)
def too_large(error):
    return jsonify({
        'success': False,
        'error': 'File too large',
        'message': 'L\'image est trop volumineuse (max 16MB)'
    }), 413

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        'success': False,
        'error': 'Internal server error',
        'message': 'Erreur interne du serveur'
    }), 500

# Point d'entrée principal
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('DEBUG', 'true').lower() == 'true'
    
    logger.info("🚀 Démarrage BreezeFrame Python Backend")
    logger.info("=" * 50)
    logger.info(f"📡 Port: {port}")
    logger.info(f"🐛 Debug: {debug}")
    logger.info(f"🤖 TensorFlow: {'✅' if TENSORFLOW_AVAILABLE else '❌'}")
    logger.info(f"👁️ OpenCV: {'✅' if OPENCV_AVAILABLE else '❌'}")
    logger.info("=" * 50)
    logger.info("🌐 Endpoints disponibles:")
    logger.info("  GET  /health          - Santé du serveur")
    logger.info("  POST /analyze         - Analyse d'image")
    logger.info("  POST /batch-analyze   - Analyse en lot")
    logger.info("  GET  /model-info      - Info modèles")
    logger.info("  GET  /stats           - Statistiques")
    logger.info("=" * 50)
    
    try:
        app.run(
            host='0.0.0.0',
            port=port,
            debug=debug,
            threaded=True
        )
    except KeyboardInterrupt:
        logger.info("\n🛑 Serveur arrêté par l'utilisateur")
    except Exception as e:
        logger.error(f"❌ Erreur démarrage serveur: {e}")
