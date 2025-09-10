-- Create comprehensive image dataset tables for ML training

-- Main image dataset table
CREATE TABLE IF NOT EXISTS image_dataset (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    image_url TEXT NOT NULL,
    image_base64 TEXT,
    source_url TEXT,
    source_site TEXT,
    title TEXT,
    description TEXT,
    labels JSONB,
    ml_features JSONB,
    quality_score INTEGER,
    training_ready BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dataset summaries for analytics
CREATE TABLE IF NOT EXISTS dataset_summaries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    total_images INTEGER,
    labeled_images INTEGER,
    quality_distribution JSONB,
    label_distribution JSONB,
    source_distribution JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ML model training logs
CREATE TABLE IF NOT EXISTS ml_training_logs (
    id SERIAL PRIMARY KEY,
    model_name TEXT NOT NULL,
    dataset_version TEXT NOT NULL,
    training_config JSONB DEFAULT '{}',
    performance_metrics JSONB DEFAULT '{}',
    model_path TEXT,
    status TEXT DEFAULT 'training',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Image processing queue for async operations
CREATE TABLE IF NOT EXISTS image_processing_queue (
    id SERIAL PRIMARY KEY,
    image_dataset_id TEXT REFERENCES image_dataset(id),
    operation_type TEXT NOT NULL, -- 'download', 'resize', 'augment', 'validate'
    status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
    parameters JSONB DEFAULT '{}',
    result JSONB DEFAULT '{}',
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE
);

-- Table for dataset statistics
CREATE TABLE IF NOT EXISTS dataset_statistics (
    id SERIAL PRIMARY KEY,
    total_images INTEGER DEFAULT 0,
    training_ready INTEGER DEFAULT 0,
    label_distribution JSONB DEFAULT '{}',
    quality_distribution JSONB DEFAULT '{}',
    source_distribution JSONB DEFAULT '{}',
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for import logs (if it doesn't exist already)
CREATE TABLE IF NOT EXISTS import_logs (
    id SERIAL PRIMARY KEY,
    import_type TEXT NOT NULL,
    summary JSONB DEFAULT '{}',
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_image_dataset_labels ON image_dataset USING GIN(labels);
CREATE INDEX IF NOT EXISTS idx_image_dataset_features ON image_dataset USING GIN(ml_features);
CREATE INDEX IF NOT EXISTS idx_image_dataset_quality ON image_dataset(quality_score);
CREATE INDEX IF NOT EXISTS idx_image_dataset_training ON image_dataset(training_ready);
CREATE INDEX IF NOT EXISTS idx_image_dataset_source ON image_dataset(source_site);
CREATE INDEX IF NOT EXISTS idx_image_dataset_created ON image_dataset(created_at);

-- Enable Row Level Security
ALTER TABLE image_dataset ENABLE ROW LEVEL SECURITY;
ALTER TABLE dataset_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE ml_training_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE image_processing_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE dataset_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust as needed)
CREATE POLICY "Allow public read access on image_dataset" ON image_dataset FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on image_dataset" ON image_dataset FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access on dataset_summaries" ON dataset_summaries FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on dataset_summaries" ON dataset_summaries FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access on dataset_statistics" ON dataset_statistics FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on dataset_statistics" ON dataset_statistics FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access on import_logs" ON import_logs FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on import_logs" ON import_logs FOR INSERT WITH CHECK (true);

-- Functions for data quality analysis
CREATE OR REPLACE FUNCTION calculate_dataset_balance()
RETURNS TABLE(label TEXT, count BIGINT, percentage NUMERIC) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        unnest(labels) as label,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM image_dataset WHERE training_ready = true), 2) as percentage
    FROM image_dataset 
    WHERE training_ready = true
    GROUP BY unnest(labels)
    ORDER BY count DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get training-ready dataset statistics
CREATE OR REPLACE FUNCTION get_training_stats()
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'total_images', COUNT(*),
        'training_ready', COUNT(*) FILTER (WHERE training_ready = true),
        'avg_quality_score', ROUND(AVG(quality_score), 2),
        'unique_labels', (SELECT COUNT(DISTINCT unnest(labels)) FROM image_dataset),
        'sources', jsonb_object_agg(source_site, cnt)
    ) INTO result
    FROM image_dataset,
    LATERAL (
        SELECT source_site, COUNT(*) as cnt
        FROM image_dataset
        GROUP BY source_site
    ) source_counts;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to update dataset statistics automatically
CREATE OR REPLACE FUNCTION update_dataset_statistics()
RETURNS TRIGGER AS $$
BEGIN
    -- Update statistics after each modification
    INSERT INTO dataset_statistics (
        total_images,
        training_ready,
        label_distribution,
        quality_distribution,
        source_distribution,
        last_updated
    )
    SELECT 
        COUNT(*) as total_images,
        COUNT(*) FILTER (WHERE training_ready = true) as training_ready,
        jsonb_object_agg(label, label_count) as label_distribution,
        jsonb_build_object(
            'excellent', COUNT(*) FILTER (WHERE quality_score >= 80),
            'good', COUNT(*) FILTER (WHERE quality_score >= 60 AND quality_score < 80),
            'fair', COUNT(*) FILTER (WHERE quality_score >= 40 AND quality_score < 60),
            'poor', COUNT(*) FILTER (WHERE quality_score < 40)
        ) as quality_distribution,
        jsonb_object_agg(source_site, site_count) as source_distribution,
        NOW() as last_updated
    FROM (
        SELECT 
            source_site,
            quality_score,
            training_ready,
            unnest(labels) as label
        FROM image_dataset
    ) expanded
    CROSS JOIN (
        SELECT label, COUNT(*) as label_count
        FROM (
            SELECT unnest(labels) as label
            FROM image_dataset
        ) label_expanded
        GROUP BY label
    ) label_stats
    CROSS JOIN (
        SELECT source_site, COUNT(*) as site_count
        FROM image_dataset
        GROUP BY source_site
    ) site_stats
    GROUP BY source_site, site_count
    ON CONFLICT (id) DO UPDATE SET
        total_images = EXCLUDED.total_images,
        training_ready = EXCLUDED.training_ready,
        label_distribution = EXCLUDED.label_distribution,
        quality_distribution = EXCLUDED.quality_distribution,
        source_distribution = EXCLUDED.source_distribution,
        last_updated = EXCLUDED.last_updated;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update dataset statistics automatically
DROP TRIGGER IF EXISTS trigger_update_dataset_statistics ON image_dataset;
CREATE TRIGGER trigger_update_dataset_statistics
    AFTER INSERT OR UPDATE OR DELETE ON image_dataset
    FOR EACH STATEMENT
    EXECUTE FUNCTION update_dataset_statistics();

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_image_dataset_updated_at 
    BEFORE UPDATE ON image_dataset 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Views for training ready dataset and quick stats
CREATE OR REPLACE VIEW training_ready_dataset AS
SELECT 
    id,
    image_url,
    title,
    labels,
    ml_features,
    quality_score,
    source_site,
    created_at
FROM image_dataset
WHERE training_ready = true
ORDER BY quality_score DESC;

CREATE OR REPLACE VIEW dataset_quick_stats AS
SELECT 
    COUNT(*) as total_images,
    COUNT(*) FILTER (WHERE training_ready = true) as training_ready,
    COUNT(*) FILTER (WHERE quality_score >= 80) as excellent_quality,
    COUNT(*) FILTER (WHERE quality_score >= 60 AND quality_score < 80) as good_quality,
    COUNT(DISTINCT source_site) as unique_sources,
    ROUND(AVG(quality_score)) as avg_quality_score,
    MAX(created_at) as last_import
FROM image_dataset;

-- Function to update dataset quick stats automatically
CREATE OR REPLACE FUNCTION update_dataset_quick_stats()
RETURNS void AS $$
BEGIN
    INSERT INTO dataset_quick_stats (
        total_images, training_ready, excellent_quality, 
        good_quality, unique_sources, avg_quality_score, last_import
    )
    SELECT * FROM dataset_quick_stats
    ON CONFLICT (id) DO UPDATE SET
        total_images = EXCLUDED.total_images,
        training_ready = EXCLUDED.training_ready,
        excellent_quality = EXCLUDED.excellent_quality,
        good_quality = EXCLUDED.good_quality,
        unique_sources = EXCLUDED.unique_sources,
        avg_quality_score = EXCLUDED.avg_quality_score,
        last_import = EXCLUDED.last_import;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update dataset quick stats automatically
CREATE OR REPLACE FUNCTION trigger_update_stats()
RETURNS trigger AS $$
BEGIN
    PERFORM update_dataset_quick_stats();
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_stats_trigger
    AFTER INSERT OR UPDATE OR DELETE ON image_dataset
    FOR EACH STATEMENT
    EXECUTE FUNCTION trigger_update_stats();

-- Comments for documentation
COMMENT ON TABLE image_dataset IS 'Dataset principal d''images avec labellisation IA automatique';
COMMENT ON COLUMN image_dataset.labels IS 'Labels générés automatiquement par IA (type, matériau, couleur, etc.)';
COMMENT ON COLUMN image_dataset.ml_features IS 'Features extraites pour l''entraînement ML';
COMMENT ON COLUMN image_dataset.quality_score IS 'Score de qualité 0-100 pour sélection d''entraînement';
COMMENT ON COLUMN image_dataset.training_ready IS 'Indique si l''image est prête pour l''entraînement (score >= 60)';

COMMENT ON TABLE dataset_summaries IS 'Stores analytics and summaries of dataset imports';
COMMENT ON TABLE ml_training_logs IS 'Tracks ML model training sessions and performance';
COMMENT ON TABLE image_processing_queue IS 'Queue for async image processing operations';
COMMENT ON TABLE dataset_statistics IS 'Stores statistics about the dataset';
COMMENT ON TABLE import_logs IS 'Logs for dataset imports';
COMMENT ON VIEW dataset_quick_stats IS 'Statistiques rapides pour le dashboard (mise à jour automatique)';
