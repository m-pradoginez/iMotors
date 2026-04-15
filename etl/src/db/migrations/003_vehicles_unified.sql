-- Migration 003: Create unified vehicles table
-- Combines FIPE price data with Inmetro fuel efficiency data

CREATE TABLE IF NOT EXISTS vehicles_unified (
  id SERIAL PRIMARY KEY,
  fipe_code VARCHAR(50) UNIQUE NOT NULL,
  brand VARCHAR(100) NOT NULL,
  model VARCHAR(200) NOT NULL,
  year INTEGER NOT NULL,
  fuel_type VARCHAR(20) NOT NULL,
  
  -- FIPE data
  price DECIMAL(12, 2),
  
  -- Inmetro data
  city_km_l DECIMAL(5, 2),
  highway_km_l DECIMAL(5, 2),
  efficiency_rating VARCHAR(1) CHECK (efficiency_rating IN ('A', 'B', 'C', 'D', 'E', 'G')),
  
  -- Metadata
  match_confidence VARCHAR(20) CHECK (match_confidence IN ('exact', 'fuzzy', 'manual')),
  match_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_vehicles_unified_brand ON vehicles_unified(brand);
CREATE INDEX IF NOT EXISTS idx_vehicles_unified_year ON vehicles_unified(year);
CREATE INDEX IF NOT EXISTS idx_vehicles_unified_fuel_type ON vehicles_unified(fuel_type);
CREATE INDEX IF NOT EXISTS idx_vehicles_unified_match_confidence ON vehicles_unified(match_confidence);

-- Update fuel_efficiency table to set fipe_code for matched records
-- This will be done after the cross-reference process
-- UPDATE fuel_efficiency fe
-- SET fipe_code = v.fipe_code
-- FROM vehicles_unified v
-- WHERE fe.brand = v.brand
--   AND fe.model = v.model
--   AND fe.model_year = v.year
--   AND fe.fuel_type = v.fuel_type
--   AND fe.fipe_code IS NULL;
