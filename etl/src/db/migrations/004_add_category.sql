-- Migration 004: Add category column to vehicles_unified
ALTER TABLE vehicles_unified ADD COLUMN IF NOT EXISTS category VARCHAR(50);
CREATE INDEX IF NOT EXISTS idx_vehicles_unified_category ON vehicles_unified(category);
