"""
BreezeFrame Window Analyzer
Analyseur IA pour la détection et l'analyse de fenêtres
"""

import cv2
import numpy as np
import tensorflow as tf
from tensorflow import keras
import json
import logging
from typing import Dict, List, Tuple, Optional
import base64
from io import BytesIO
from PIL import Image
import time

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class WindowAnalyzer:
    """Analyseur principal pour la détection de fenêtres"""
    
    def __init__(self):
        self.model = None
        self.backup_cascade = None
        self.is_tensorflow_available = False
        self.initialize_models()
    
    def initialize_models(self):
        """Initialise les modèles TensorFlow et OpenCV"""
        try:
            # Tentative d'initialisation TensorFlow
            logger.info("🤖 Initialisation TensorFlow...")
            self.initialize_tensorflow_model()
            self.is_tensorflow_available = True
            logger.info("✅ TensorFlow initialisé avec succès")
        except Exception as e:
            logger.warning(f"⚠️ TensorFlow non disponible: {e}")
            self.is_tensorflow_available = False
        
        # Initialisation du fallback OpenCV
        try:
            logger.info("🔧 Initialisation OpenCV fallback...")
            self.initialize_opencv_fallback()
            logger.info("✅ OpenCV fallback initialisé")
        except Exception as e:
            logger.error(f"❌ Erreur OpenCV fallback: {e}")
    
    def initialize_tensorflow_model(self):
        """Initialise le modèle TensorFlow pour la détection de fenêtres"""
        try:
            # Modèle simple CNN pour la détection d'objets rectangulaires
            self.model = keras.Sequential([
                keras.layers.Conv2D(32, (3, 3), activation='relu', input_shape=(224, 224, 3)),
                keras.layers.MaxPooling2D((2, 2)),
                keras.layers.Conv2D(64, (3, 3), activation='relu'),
                keras.layers.MaxPooling2D((2, 2)),
                keras.layers.Conv2D(64, (3, 3), activation='relu'),
                keras.layers.Flatten(),
                keras.layers.Dense(64, activation='relu'),
                keras.layers.Dense(4, activation='sigmoid')  # x, y, width, height
            ])
            
            self.model.compile(
                optimizer='adam',
                loss='mse',
                metrics=['mae']
            )
            
            logger.info("🧠 Modèle TensorFlow créé")
            
        except Exception as e:
            logger.error(f"❌ Erreur création modèle TensorFlow: {e}")
            raise
    
    def initialize_opencv_fallback(self):
        """Initialise le système de fallback OpenCV"""
        try:
            # Utilisation des cascades Haar pour la détection d'objets
            # En l'absence de cascade spécifique pour les fenêtres, on utilise des techniques de contours
            self.backup_cascade = cv2.CascadeClassifier()
            logger.info("🔧 OpenCV fallback configuré")
        except Exception as e:
            logger.error(f"❌ Erreur OpenCV fallback: {e}")
            raise
    
    def preprocess_image(self, image_data: str) -> np.ndarray:
        """Prétraite l'image pour l'analyse"""
        try:
            # Décodage base64
            if image_data.startswith('data:image'):
                image_data = image_data.split(',')[1]
            
            image_bytes = base64.b64decode(image_data)
            image = Image.open(BytesIO(image_bytes))
            
            # Conversion en RGB si nécessaire
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Redimensionnement pour TensorFlow
            image_resized = image.resize((224, 224))
            image_array = np.array(image_resized) / 255.0
            
            return image_array, np.array(image)
        
        except Exception as e:
            logger.error(f"❌ Erreur prétraitement image: {e}")
            raise
    
    def detect_window_tensorflow(self, image_array: np.ndarray) -> Dict:
        """Détection de fenêtre avec TensorFlow"""
        try:
            if not self.is_tensorflow_available or self.model is None:
                raise Exception("TensorFlow non disponible")
            
            # Prédiction avec le modèle
            image_batch = np.expand_dims(image_array, axis=0)
            prediction = self.model.predict(image_batch, verbose=0)
            
            # Extraction des coordonnées
            x, y, width, height = prediction[0]
            
            # Simulation d'une détection réussie (à remplacer par un vrai modèle entraîné)
            confidence = 0.85 + np.random.random() * 0.1  # Simulation
            
            return {
                'method': 'tensorflow',
                'detected': True,
                'confidence': float(confidence),
                'bbox': {
                    'x': float(x * 224),
                    'y': float(y * 224),
                    'width': float(width * 224),
                    'height': float(height * 224)
                },
                'dimensions': {
                    'width_cm': int(100 + width * 100),  # Simulation
                    'height_cm': int(120 + height * 80),
                    'confidence': float(confidence)
                }
            }
            
        except Exception as e:
            logger.error(f"❌ Erreur détection TensorFlow: {e}")
            raise
    
    def detect_window_opencv(self, image_original: np.ndarray) -> Dict:
        """Détection de fenêtre avec OpenCV (fallback)"""
        try:
            # Conversion en niveaux de gris
            gray = cv2.cvtColor(image_original, cv2.COLOR_RGB2GRAY)
            
            # Détection de contours
            edges = cv2.Canny(gray, 50, 150)
            contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            # Recherche du plus grand contour rectangulaire
            best_contour = None
            best_area = 0
            
            for contour in contours:
                # Approximation polygonale
                epsilon = 0.02 * cv2.arcLength(contour, True)
                approx = cv2.approxPolyDP(contour, epsilon, True)
                
                # Vérification si c'est un rectangle (4 points)
                if len(approx) == 4:
                    area = cv2.contourArea(contour)
                    if area > best_area and area > 1000:  # Seuil minimum
                        best_area = area
                        best_contour = approx
            
            if best_contour is not None:
                # Calcul de la bounding box
                x, y, w, h = cv2.boundingRect(best_contour)
                
                # Estimation des dimensions réelles (simulation)
                scale_factor = 0.1  # 1 pixel = 0.1 cm (à calibrer)
                width_cm = int(w * scale_factor)
                height_cm = int(h * scale_factor)
                
                confidence = min(0.9, best_area / (image_original.shape[0] * image_original.shape[1]))
                
                return {
                    'method': 'opencv',
                    'detected': True,
                    'confidence': float(confidence),
                    'bbox': {
                        'x': int(x),
                        'y': int(y),
                        'width': int(w),
                        'height': int(h)
                    },
                    'dimensions': {
                        'width_cm': width_cm,
                        'height_cm': height_cm,
                        'confidence': float(confidence)
                    }
                }
            else:
                return {
                    'method': 'opencv',
                    'detected': False,
                    'confidence': 0.0,
                    'error': 'Aucune fenêtre détectée'
                }
                
        except Exception as e:
            logger.error(f"❌ Erreur détection OpenCV: {e}")
            return {
                'method': 'opencv',
                'detected': False,
                'confidence': 0.0,
                'error': str(e)
            }
    
    def classify_window_type(self, detection_result: Dict) -> Dict:
        """Classification du type de fenêtre"""
        if not detection_result.get('detected', False):
            return {'window_type': 'unknown', 'confidence': 0.0}
        
        dimensions = detection_result.get('dimensions', {})
        width = dimensions.get('width_cm', 0)
        height = dimensions.get('height_cm', 0)
        
        # Classification basée sur les dimensions
        if width > 0 and height > 0:
            ratio = width / height
            
            if 0.8 <= ratio <= 1.2:
                window_type = 'Square Window'
            elif ratio > 1.2:
                window_type = 'Wide Window'
            else:
                window_type = 'Tall Window'
            
            # Classification plus détaillée
            if width < 80 and height < 100:
                window_type = 'Small ' + window_type
            elif width > 150 or height > 180:
                window_type = 'Large ' + window_type
            else:
                window_type = 'Standard ' + window_type
        else:
            window_type = 'Standard Rectangle'
        
        return {
            'window_type': window_type,
            'confidence': detection_result.get('confidence', 0.0),
            'dimensions_ratio': width / height if height > 0 else 1.0
        }
    
    def recommend_kit(self, detection_result: Dict, classification: Dict) -> Dict:
        """Recommandation de kit BreezeFrame"""
        if not detection_result.get('detected', False):
            return {'primary': 'unknown', 'alternatives': [], 'confidence': 0.0}
        
        dimensions = detection_result.get('dimensions', {})
        width = dimensions.get('width_cm', 0)
        height = dimensions.get('height_cm', 0)
        window_type = classification.get('window_type', '')
        
        # Logique de recommandation
        if 'Small' in window_type or (width < 100 and height < 120):
            primary = 'solo'
            alternatives = ['floor']
        elif 'Large' in window_type or (width > 150 or height > 180):
            primary = 'building'
            alternatives = ['floor', 'solo']
        else:
            primary = 'floor'
            alternatives = ['solo', 'building']
        
        return {
            'primary': primary,
            'alternatives': alternatives,
            'confidence': classification.get('confidence', 0.0),
            'reasoning': f'Basé sur les dimensions {width}x{height}cm et le type {window_type}'
        }
    
    def analyze_image(self, image_data: str) -> Dict:
        """Analyse complète d'une image de fenêtre"""
        start_time = time.time()
        
        try:
            logger.info("🔍 Début de l'analyse d'image")
            
            # Prétraitement
            image_array, image_original = self.preprocess_image(image_data)
            
            # Tentative de détection avec TensorFlow
            detection_result = None
            if self.is_tensorflow_available:
                try:
                    logger.info("🤖 Tentative détection TensorFlow...")
                    detection_result = self.detect_window_tensorflow(image_array)
                except Exception as e:
                    logger.warning(f"⚠️ TensorFlow échoué, fallback OpenCV: {e}")
            
            # Fallback OpenCV si nécessaire
            if detection_result is None or not detection_result.get('detected', False):
                logger.info("🔧 Utilisation fallback OpenCV...")
                detection_result = self.detect_window_opencv(image_original)
            
            # Classification du type de fenêtre
            classification = self.classify_window_type(detection_result)
            
            # Recommandation de kit
            kit_recommendation = self.recommend_kit(detection_result, classification)
            
            # Calcul du score de qualité global
            quality_score = self.calculate_quality_score(detection_result, classification)
            
            processing_time = int((time.time() - start_time) * 1000)
            
            result = {
                'success': True,
                'detection': detection_result,
                'classification': classification,
                'kit_recommendation': kit_recommendation,
                'quality_score': quality_score,
                'processing_time_ms': processing_time,
                'timestamp': time.time()
            }
            
            logger.info(f"✅ Analyse terminée en {processing_time}ms")
            return result
            
        except Exception as e:
            processing_time = int((time.time() - start_time) * 1000)
            logger.error(f"❌ Erreur analyse: {e}")
            
            return {
                'success': False,
                'error': str(e),
                'processing_time_ms': processing_time,
                'timestamp': time.time()
            }
    
    def calculate_quality_score(self, detection: Dict, classification: Dict) -> float:
        """Calcule un score de qualité global"""
        if not detection.get('detected', False):
            return 0.0
        
        detection_confidence = detection.get('confidence', 0.0)
        classification_confidence = classification.get('confidence', 0.0)
        
        # Facteurs de qualité
        confidence_score = (detection_confidence + classification_confidence) / 2
        
        # Bonus pour les dimensions cohérentes
        dimensions = detection.get('dimensions', {})
        width = dimensions.get('width_cm', 0)
        height = dimensions.get('height_cm', 0)
        
        dimension_bonus = 0.0
        if 50 <= width <= 200 and 60 <= height <= 250:  # Dimensions réalistes
            dimension_bonus = 0.1
        
        quality_score = min(1.0, confidence_score + dimension_bonus)
        return round(quality_score, 2)
    
    def get_model_info(self) -> Dict:
        """Informations sur les modèles chargés"""
        return {
            'tensorflow_available': self.is_tensorflow_available,
            'tensorflow_version': tf.__version__ if self.is_tensorflow_available else None,
            'opencv_version': cv2.__version__,
            'model_loaded': self.model is not None,
            'fallback_available': self.backup_cascade is not None
        }
    
    def batch_analyze(self, images: List[str]) -> List[Dict]:
        """Analyse en lot de plusieurs images"""
        results = []
        
        for i, image_data in enumerate(images):
            logger.info(f"📊 Analyse image {i+1}/{len(images)}")
            result = self.analyze_image(image_data)
            result['batch_index'] = i
            results.append(result)
        
        return results

# Instance globale de l'analyseur
analyzer = WindowAnalyzer()

def analyze_window_image(image_data: str) -> Dict:
    """Fonction principale d'analyse"""
    return analyzer.analyze_image(image_data)

def get_analyzer_info() -> Dict:
    """Informations sur l'analyseur"""
    return analyzer.get_model_info()

def batch_analyze_images(images: List[str]) -> List[Dict]:
    """Analyse en lot"""
    return analyzer.batch_analyze(images)

if __name__ == "__main__":
    # Test de l'analyseur
    print("🧪 Test de l'analyseur BreezeFrame")
    info = get_analyzer_info()
    print(f"📊 Informations: {json.dumps(info, indent=2)}")
    
    # Test avec une image factice
    test_image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
    result = analyze_window_image(test_image)
    print(f"🔍 Résultat test: {json.dumps(result, indent=2)}")
