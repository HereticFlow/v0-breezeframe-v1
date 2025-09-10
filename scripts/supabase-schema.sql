-- Supabase Schema for AI Window Analysis
-- Run this to create the necessary tables

-- Window Analysis Results Table
CREATE TABLE IF NOT EXISTS window_analysis (
  id TEXT PRIMARY KEY,
  user_session TEXT,
  image_url TEXT NOT NULL,
  analysis_data JSONB NOT NULL,
  frontend_validation JSONB,
  processing_time_ms INTEGER,
  quality_score DECIMAL(3,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Window Photos Storage
CREATE TABLE IF NOT EXISTS window_photos (
  id TEXT PRIMARY KEY,
  analysis_id TEXT REFERENCES window_analysis(id),
  original_url TEXT NOT NULL,
  processed_url TEXT,
  thumbnail_url TEXT,
  file_size INTEGER,
  dimensions JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Model Performance Tracking
CREATE TABLE IF NOT EXISTS ai_model_performance (
  id SERIAL PRIMARY KEY,
  model_version TEXT NOT NULL,
  analysis_id TEXT REFERENCES window_analysis(id),
  confidence_score DECIMAL(3,2),
  processing_time_ms INTEGER,
  accuracy_feedback DECIMAL(3,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Sessions for Analytics
CREATE TABLE IF NOT EXISTS user_sessions (
  id TEXT PRIMARY KEY,
  session_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_end TIMESTAMP WITH TIME ZONE,
  photos_analyzed INTEGER DEFAULT 0,
  orders_completed INTEGER DEFAULT 0,
  device_info JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_window_analysis_created_at ON window_analysis(created_at);
CREATE INDEX IF NOT EXISTS idx_window_analysis_quality_score ON window_analysis(quality_score);
CREATE INDEX IF NOT EXISTS idx_ai_model_performance_model_version ON ai_model_performance(model_version);
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_start ON user_sessions(session_start);

-- Row Level Security (RLS)
ALTER TABLE window_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE window_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_model_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Policies for public access (adjust based on your needs)
CREATE POLICY "Allow public read access" ON window_analysis FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON window_analysis FOR INSERT WITH CHECK (true);
