-- Create tables for fenetre24 manufacturer data

-- Window Manufacturers Table
CREATE TABLE IF NOT EXISTS window_manufacturers (
  id TEXT PRIMARY KEY,
  manufacturer_name TEXT NOT NULL,
  manufacturer_url TEXT,
  product_category TEXT,
  data_source TEXT DEFAULT 'fenetre24.com',
  imported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Import Logs Table
CREATE TABLE IF NOT EXISTS import_logs (
  id SERIAL PRIMARY KEY,
  import_type TEXT NOT NULL,
  summary JSONB,
  status TEXT DEFAULT 'pending',
  error_details TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Manufacturer Products Table (for detailed product info)
CREATE TABLE IF NOT EXISTS manufacturer_products (
  id SERIAL PRIMARY KEY,
  manufacturer_id TEXT REFERENCES window_manufacturers(id),
  product_name TEXT NOT NULL,
  product_type TEXT,
  dimensions JSONB,
  price_range TEXT,
  features JSONB,
  compatibility_score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Window Analysis to Manufacturer Mapping
CREATE TABLE IF NOT EXISTS analysis_manufacturer_matches (
  id SERIAL PRIMARY KEY,
  analysis_id TEXT REFERENCES window_analysis(id),
  manufacturer_id TEXT REFERENCES window_manufacturers(id),
  compatibility_score DECIMAL(3,2),
  match_reasons JSONB,
  recommended_products JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_window_manufacturers_name ON window_manufacturers(manufacturer_name);
CREATE INDEX IF NOT EXISTS idx_window_manufacturers_category ON window_manufacturers(product_category);
CREATE INDEX IF NOT EXISTS idx_window_manufacturers_active ON window_manufacturers(is_active);
CREATE INDEX IF NOT EXISTS idx_manufacturer_products_manufacturer_id ON manufacturer_products(manufacturer_id);
CREATE INDEX IF NOT EXISTS idx_analysis_manufacturer_matches_analysis_id ON analysis_manufacturer_matches(analysis_id);

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_window_manufacturers_search 
ON window_manufacturers USING gin(to_tsvector('french', manufacturer_name || ' ' || COALESCE(product_category, '')));

-- Row Level Security
ALTER TABLE window_manufacturers ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE manufacturer_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_manufacturer_matches ENABLE ROW LEVEL SECURITY;

-- Policies for public read access
CREATE POLICY "Allow public read access" ON window_manufacturers FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON manufacturer_products FOR SELECT USING (true);
