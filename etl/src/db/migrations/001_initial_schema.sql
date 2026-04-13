-- Initial schema for FIPE ETL
-- Vehicles catalog from Brasil API

CREATE TABLE IF NOT EXISTS vehicles (
    fipe_code VARCHAR(20) PRIMARY KEY,
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(200) NOT NULL,
    vehicle_type VARCHAR(20) NOT NULL CHECK (vehicle_type IN ('carros', 'motos', 'caminhoes')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for filtering by vehicle type
CREATE INDEX IF NOT EXISTS idx_vehicles_type ON vehicles(vehicle_type);
-- Index for brand searches
CREATE INDEX IF NOT EXISTS idx_vehicles_brand ON vehicles(brand);

-- Price history/snapshots for each vehicle year+fuel combination
CREATE TABLE IF NOT EXISTS vehicle_prices (
    id SERIAL PRIMARY KEY,
    fipe_code VARCHAR(20) NOT NULL REFERENCES vehicles(fipe_code) ON DELETE CASCADE,
    model_year INTEGER NOT NULL,
    fuel_type VARCHAR(20) NOT NULL,
    price DECIMAL(15, 2) NOT NULL,
    reference_month VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(fipe_code, model_year, fuel_type)
);

-- Index for price lookups
CREATE INDEX IF NOT EXISTS idx_vehicle_prices_fipe_code ON vehicle_prices(fipe_code);
CREATE INDEX IF NOT EXISTS idx_vehicle_prices_year ON vehicle_prices(model_year);

-- Migration tracking table
CREATE TABLE IF NOT EXISTS schema_migrations (
    version VARCHAR(255) PRIMARY KEY,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
