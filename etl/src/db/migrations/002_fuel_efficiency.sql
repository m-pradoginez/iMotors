-- Fuel efficiency data from Inmetro PBE
-- Stores km/l efficiency metrics for vehicles

CREATE TABLE IF NOT EXISTS fuel_efficiency (
    id SERIAL PRIMARY KEY,
    fipe_code VARCHAR(20) NOT NULL REFERENCES vehicles(fipe_code) ON DELETE CASCADE,
    fuel_type VARCHAR(20) NOT NULL CHECK (fuel_type IN ('gasolina', 'etanol', 'flex', 'diesel', 'hibrido')),
    city_km_l DECIMAL(5, 2) NOT NULL,
    highway_km_l DECIMAL(5, 2) NOT NULL,
    efficiency_rating VARCHAR(1) CHECK (efficiency_rating IN ('A', 'B', 'C', 'D', 'E', 'G')),
    model_year INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(fipe_code, fuel_type, model_year)
);

-- Index for vehicle lookups
CREATE INDEX IF NOT EXISTS idx_fuel_efficiency_fipe_code ON fuel_efficiency(fipe_code);
-- Index for fuel type filtering
CREATE INDEX IF NOT EXISTS idx_fuel_efficiency_fuel_type ON fuel_efficiency(fuel_type);
-- Index for efficiency rating filtering
CREATE INDEX IF NOT EXISTS idx_fuel_efficiency_rating ON fuel_efficiency(efficiency_rating);
