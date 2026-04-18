-- Migration: Initial Schema with UUID Primary Keys
-- This migration creates the baseline schema for iMotors with Supabase
-- Vehicles table renamed from vehicles_unified with UUID primary key and media fields

-- Enable UUID extension (Supabase uses pgcrypto by default)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Vehicles table (formerly vehicles_unified)
CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fipe_code VARCHAR(50) UNIQUE NOT NULL,
  brand VARCHAR(100) NOT NULL,
  model VARCHAR(200) NOT NULL,
  year INTEGER NOT NULL,
  fuel_type VARCHAR(20) NOT NULL,
  category VARCHAR(50),
  
  -- FIPE data
  price DECIMAL(12, 2),
  
  -- Inmetro data
  city_km_l DECIMAL(5, 2),
  highway_km_l DECIMAL(5, 2),
  efficiency_rating VARCHAR(1) CHECK (efficiency_rating IN ('A', 'B', 'C', 'D', 'E', 'G')),
  
  -- Media fields for Supabase Storage integration
  image_url_path TEXT,
  legal_attribution TEXT DEFAULT 'Foto: Divulgação/Fabricante',
  image_source_url TEXT,
  
  -- Metadata
  match_confidence VARCHAR(20) CHECK (match_confidence IN ('exact', 'fuzzy', 'manual')),
  match_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_vehicles_brand ON vehicles(brand);
CREATE INDEX idx_vehicles_year ON vehicles(year);
CREATE INDEX idx_vehicles_fuel_type ON vehicles(fuel_type);
CREATE INDEX idx_vehicles_category ON vehicles(category);
CREATE INDEX idx_vehicles_match_confidence ON vehicles(match_confidence);

-- Fuel efficiency table
CREATE TABLE fuel_efficiency (
  id SERIAL PRIMARY KEY,
  fipe_code VARCHAR(50) UNIQUE REFERENCES vehicles(fipe_code) ON DELETE SET NULL,
  brand VARCHAR(100) NOT NULL,
  model VARCHAR(200) NOT NULL,
  year INTEGER NOT NULL,
  fuel_type VARCHAR(20) NOT NULL,
  city_km_l DECIMAL(5, 2),
  highway_km_l DECIMAL(5, 2),
  efficiency_rating VARCHAR(1) CHECK (efficiency_rating IN ('A', 'B', 'C', 'D', 'E', 'G')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for fuel efficiency
CREATE INDEX idx_fuel_efficiency_brand ON fuel_efficiency(brand);
CREATE INDEX idx_fuel_efficiency_year ON fuel_efficiency(year);
CREATE INDEX idx_fuel_efficiency_fuel_type ON fuel_efficiency(fuel_type);

-- FIPE prices table
CREATE TABLE fipe_prices (
  id SERIAL PRIMARY KEY,
  fipe_code VARCHAR(50) NOT NULL REFERENCES vehicles(fipe_code) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  fuel_type VARCHAR(20) NOT NULL,
  price DECIMAL(12, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(fipe_code, year, fuel_type)
);

-- Indexes for FIPE prices
CREATE INDEX idx_fipe_prices_fipe_code ON fipe_prices(fipe_code);
CREATE INDEX idx_fipe_prices_year ON fipe_prices(year);

-- Enable Row Level Security
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuel_efficiency ENABLE ROW LEVEL SECURITY;
ALTER TABLE fipe_prices ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Public Read Access
CREATE POLICY "Public read access for vehicles" ON vehicles
  FOR SELECT USING (true);

CREATE POLICY "Public read access for fuel_efficiency" ON fuel_efficiency
  FOR SELECT USING (true);

CREATE POLICY "Public read access for fipe_prices" ON fipe_prices
  FOR SELECT USING (true);

-- No insert/update/delete policies for anonymous users
-- These will be handled by service role key in backend
