-- BreezeFrame Database Schema
-- Création automatique des tables Supabase

-- Extension pour UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table pour les analyses de fenêtres
CREATE TABLE IF NOT EXISTS window_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_session TEXT,
    image_url TEXT,
    analysis_data JSONB,
    frontend_validation JSONB,
    processing_time_ms INTEGER,
    quality_score DECIMAL(3,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_window_analysis_created_at ON window_analysis(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_window_analysis_user_session ON window_analysis(user_session);
CREATE INDEX IF NOT EXISTS idx_window_analysis_quality_score ON window_analysis(quality_score DESC);

-- Table pour les fabricants de fenêtres
CREATE TABLE IF NOT EXISTS window_manufacturers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    brand TEXT,
    product_type TEXT,
    material TEXT,
    color TEXT,
    dimensions TEXT,
    price_range TEXT,
    features JSONB,
    quality_score DECIMAL(3,2),
    source_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les fabricants
CREATE INDEX IF NOT EXISTS idx_manufacturers_product_type ON window_manufacturers(product_type);
CREATE INDEX IF NOT EXISTS idx_manufacturers_material ON window_manufacturers(material);
CREATE INDEX IF NOT EXISTS idx_manufacturers_brand ON window_manufacturers(brand);
CREATE INDEX IF NOT EXISTS idx_manufacturers_quality_score ON window_manufacturers(quality_score DESC);

-- Table pour le dataset d'images
CREATE TABLE IF NOT EXISTS image_dataset (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    image_url TEXT NOT NULL,
    image_base64 TEXT,
    source_url TEXT,
    source_site TEXT,
    title TEXT,
    description TEXT,
    labels JSONB,
    ml_features JSONB,
    quality_score DECIMAL(3,2),
    training_ready BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour le dataset
CREATE INDEX IF NOT EXISTS idx_image_dataset_training_ready ON image_dataset(training_ready);
CREATE INDEX IF NOT EXISTS idx_image_dataset_quality_score ON image_dataset(quality_score DESC);
CREATE INDEX IF NOT EXISTS idx_image_dataset_source_site ON image_dataset(source_site);
CREATE INDEX IF NOT EXISTS idx_image_dataset_created_at ON image_dataset(created_at DESC);

-- Table pour les statistiques rapides du dataset
CREATE TABLE IF NOT EXISTS dataset_quick_stats (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    total_images INTEGER DEFAULT 0,
    labeled_images INTEGER DEFAULT 0,
    training_ready INTEGER DEFAULT 0,
    excellent_quality INTEGER DEFAULT 0,
    good_quality INTEGER DEFAULT 0,
    unique_sources INTEGER DEFAULT 0,
    avg_quality_score FLOAT DEFAULT 0,
    quality_distribution JSONB,
    label_distribution JSONB,
    source_distribution JSONB,
    last_import TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les statistiques
CREATE INDEX IF NOT EXISTS idx_dataset_stats_created_at ON dataset_quick_stats(created_at);

-- Table pour les logs d'import
CREATE TABLE IF NOT EXISTS import_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    import_type TEXT,
    status TEXT CHECK (status IN ('started', 'running', 'completed', 'failed')),
    records_processed INTEGER DEFAULT 0,
    records_success INTEGER DEFAULT 0,
    records_failed INTEGER DEFAULT 0,
    error_details JSONB,
    duration_ms INTEGER,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les logs
CREATE INDEX IF NOT EXISTS idx_import_logs_import_type ON import_logs(import_type);
CREATE INDEX IF NOT EXISTS idx_import_logs_status ON import_logs(status);
CREATE INDEX IF NOT EXISTS idx_import_logs_created_at ON import_logs(created_at DESC);

-- Table pour les modèles TensorFlow
CREATE TABLE IF NOT EXISTS tensorflow_models (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    version TEXT NOT NULL,
    model_type TEXT CHECK (model_type IN ('detection', 'classification', 'segmentation')),
    model_path TEXT,
    model_config JSONB,
    training_data_id UUID REFERENCES image_dataset(id),
    accuracy FLOAT CHECK (accuracy >= 0 AND accuracy <= 1),
    loss FLOAT,
    epochs INTEGER,
    batch_size INTEGER,
    learning_rate FLOAT,
    status TEXT CHECK (status IN ('training', 'completed', 'failed', 'deployed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les modèles
CREATE INDEX IF NOT EXISTS idx_tensorflow_models_status ON tensorflow_models(status);
CREATE INDEX IF NOT EXISTS idx_tensorflow_models_model_type ON tensorflow_models(model_type);
CREATE INDEX IF NOT EXISTS idx_tensorflow_models_created_at ON tensorflow_models(created_at);

-- Vue pour les statistiques rapides
CREATE OR REPLACE VIEW dataset_overview AS
SELECT 
    COUNT(*) as total_images,
    COUNT(*) FILTER (WHERE training_ready = true) as training_ready_count,
    COUNT(*) FILTER (WHERE quality_score >= 80) as excellent_quality_count,
    COUNT(*) FILTER (WHERE quality_score >= 60 AND quality_score < 80) as good_quality_count,
    COUNT(*) FILTER (WHERE quality_score < 60) as poor_quality_count,
    COUNT(DISTINCT source_site) as unique_sources_count,
    ROUND(AVG(quality_score), 1) as avg_quality_score,
    MAX(created_at) as last_import_date
FROM image_dataset;

-- Vue pour les statistiques des fabricants
CREATE OR REPLACE VIEW manufacturer_overview AS
SELECT 
    COUNT(*) as total_manufacturers,
    COUNT(DISTINCT brand) as unique_brands,
    COUNT(DISTINCT product_type) as product_types_count,
    COUNT(DISTINCT material) as materials_count,
    ROUND(AVG(quality_score), 1) as avg_quality_score,
    MAX(created_at) as last_update
FROM window_manufacturers;

-- Vue pour les analyses récentes
CREATE OR REPLACE VIEW recent_analyses AS
SELECT 
    id,
    user_session,
    analysis_data->>'windowType' as window_type,
    quality_score,
    processing_time_ms,
    created_at
FROM window_analysis
ORDER BY created_at DESC
LIMIT 100;

-- Fonction pour mettre à jour les statistiques
CREATE OR REPLACE FUNCTION update_dataset_stats()
RETURNS VOID AS $$
BEGIN
    INSERT INTO dataset_quick_stats (
        total_images,
        labeled_images,
        training_ready,
        excellent_quality,
        good_quality,
        unique_sources,
        avg_quality_score,
        last_import
    )
    SELECT 
        COUNT(*),
        COUNT(*) FILTER (WHERE labels IS NOT NULL),
        COUNT(*) FILTER (WHERE training_ready = true),
        COUNT(*) FILTER (WHERE quality_score >= 80),
        COUNT(*) FILTER (WHERE quality_score >= 60),
        COUNT(DISTINCT source_site),
        ROUND(AVG(quality_score), 1),
        MAX(created_at)
    FROM image_dataset;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer le trigger à toutes les tables
CREATE TRIGGER update_window_analysis_updated_at
    BEFORE UPDATE ON window_analysis
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_window_manufacturers_updated_at
    BEFORE UPDATE ON window_manufacturers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_image_dataset_updated_at
    BEFORE UPDATE ON image_dataset
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dataset_quick_stats_updated_at
    BEFORE UPDATE ON dataset_quick_stats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_import_logs_updated_at
    BEFORE UPDATE ON import_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tensorflow_models_updated_at
    BEFORE UPDATE ON tensorflow_models
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insérer des données de test
INSERT INTO window_analysis (user_session, image_url, analysis_data, frontend_validation, processing_time_ms, quality_score)
VALUES 
    ('demo_session_1', '/placeholder.svg?height=300&width=400&text=Fenêtre+Salon', 
     '{"dimensions": {"width": 120, "height": 150, "confidence": 0.95}, "windowType": "Standard Rectangle", "kitRecommendation": {"primary": "solo"}}',
     '{"windowDetected": true, "confidence": 0.87, "lighting": "good"}',
     2300, 0.94),
    ('demo_session_1', '/placeholder.svg?height=300&width=400&text=Fenêtre+Chambre',
     '{"dimensions": {"width": 100, "height": 130, "confidence": 0.91}, "windowType": "Standard Rectangle", "kitRecommendation": {"primary": "solo"}}',
     '{"windowDetected": true, "confidence": 0.83, "lighting": "moderate"}',
     1800, 0.91),
    ('demo_session_2', '/placeholder.svg?height=300&width=400&text=Fenêtre+Bureau',
     '{"dimensions": {"width": 140, "height": 160, "confidence": 0.96}, "windowType": "Standard Rectangle", "kitRecommendation": {"primary": "floor"}}',
     '{"windowDetected": true, "confidence": 0.89, "lighting": "excellent"}',
     2100, 0.96);

INSERT INTO window_manufacturers (name, brand, product_type, material, color, dimensions, price_range, features, quality_score, source_url)
VALUES 
    ('Fenêtre PVC Blanc Standard', 'BreezeFrame', 'Fenêtre', 'PVC', 'Blanc', '120x150cm', '200-400€', 
     '{"double_vitrage": true, "isolation_thermique": "A+", "garantie": "10 ans"}', 0.95, 'https://breezeframe.com/pvc-blanc'),
    ('Fenêtre Alu Anthracite Premium', 'BreezeFrame', 'Fenêtre', 'Aluminium', 'Anthracite', '140x160cm', '400-600€',
     '{"triple_vitrage": true, "isolation_thermique": "A++", "garantie": "15 ans"}', 0.98, 'https://breezeframe.com/alu-anthracite'),
    ('Fenêtre Bois Chêne Traditionnel', 'BreezeFrame', 'Fenêtre', 'Bois', 'Chêne naturel', '100x130cm', '500-800€',
     '{"double_vitrage": true, "isolation_thermique": "A", "garantie": "20 ans", "traitement_anti_insectes": true}', 0.92, 'https://breezeframe.com/bois-chene');

INSERT INTO image_dataset (image_url, source_site, title, description, labels, quality_score, training_ready)
VALUES 
    ('/placeholder.svg?height=400&width=600&text=Fenêtre+PVC+Blanc', 'demo', 'Fenêtre PVC Blanc', 'Fenêtre standard en PVC blanc avec double vitrage',
     '{"window_type": "standard", "material": "pvc", "color": "white", "features": ["double_glazing"]}', 0.95, true),
    ('/placeholder.svg?height=400&width=600&text=Fenêtre+Alu+Anthracite', 'demo', 'Fenêtre Aluminium Anthracite', 'Fenêtre moderne en aluminium anthracite',
     '{"window_type": "modern", "material": "aluminum", "color": "anthracite", "features": ["triple_glazing"]}', 0.98, true),
    ('/placeholder.svg?height=400&width=600&text=Fenêtre+Bois+Chêne', 'demo', 'Fenêtre Bois Chêne', 'Fenêtre traditionnelle en bois de chêne',
     '{"window_type": "traditional", "material": "wood", "color": "oak", "features": ["natural_wood"]}', 0.92, true);

INSERT INTO import_logs (import_type, status, records_processed, records_success, records_failed, duration_ms, details)
VALUES 
    ('initial_setup', 'success', 9, 9, 0, 1500, '{"message": "Installation initiale réussie", "tables_created": 4}');

-- Permissions (si nécessaire)
-- ALTER TABLE window_analysis ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE window_manufacturers ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE image_dataset ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE import_logs ENABLE ROW LEVEL SECURITY;

-- Commentaires sur les tables
COMMENT ON TABLE window_analysis IS 'Stockage des analyses de fenêtres effectuées par l''IA';
COMMENT ON TABLE window_manufacturers IS 'Base de données des fabricants et produits de fenêtres';
COMMENT ON TABLE image_dataset IS 'Dataset d''images pour l''entraînement des modèles IA';
COMMENT ON TABLE import_logs IS 'Logs des imports et opérations de maintenance';

-- Afficher un résumé
SELECT 'BreezeFrame Database Schema créé avec succès!' as status;
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('window_analysis', 'window_manufacturers', 'image_dataset', 'dataset_quick_stats', 'import_logs', 'tensorflow_models');
