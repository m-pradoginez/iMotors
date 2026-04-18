# F-03: Vehicle Catalog Cross-Reference

## Feature

Vehicle catalog cross-reference — Join FIPE × Inmetro data into unified table

## Spec Status

Draft

---

## Context

**From PROJECT.md:**
- Data sources: Brasil API FIPE (vehicles + prices) and Inmetro PBE (fuel efficiency)
- Target DB: PostgreSQL (Supabase)
- Bootstrapping constraint: Zero-cost infrastructure

**From ROADMAP.md:**
- F-03 joins FIPE × Inmetro data into unified `vehicles` table
- Handles unmatched records
- Part of M1 Data Foundation milestone
- Depends on F-01 and F-02 being complete

---

## Requirements

### Functional

| ID | Requirement | Priority |
|---|---|---|
| R-01 | Match FIPE vehicles with Inmetro fuel efficiency data using brand, model, and year | Must |
| R-02 | Create unified `vehicles` table combining FIPE price data and Inmetro efficiency data | Must |
| R-03 | Handle unmatched records (vehicles in FIPE but not Inmetro, or vice versa) | Must |
| R-04 | Set `fipe_code` field in `fuel_efficiency` table for matched records | Must |
| R-05 | Support fuzzy matching for brand and model name variations | Should |
| R-06 | Log cross-reference statistics (matched, unmatched FIPE, unmatched Inmetro) | Should |
| R-07 | Provide manual override mechanism for difficult matches | Should |

### Non-Functional

| ID | Requirement | Priority |
|---|---|---|
| NFR-01 | Cross-reference script must be runnable after F-01 and F-02 ETL runs | Must |
| NFR-02 | Idempotent — multiple runs produce same end state | Must |
| NFR-03 | Cross-reference execution time < 5 minutes for full dataset | Should |
| NFR-04 | Matching accuracy > 90% for common vehicle models | Should |

---

## Data Sources

**FIPE Data (from F-01):**
- Table: `vehicles`
- Key fields: fipe_code, brand, model, year, fuel_type, price
- ~10,000+ vehicle records

**Inmetro Data (from F-02):**
- Table: `fuel_efficiency`
- Key fields: brand, model, year, fuel_type, city_km_l, highway_km_l, efficiency_rating, fipe_code (nullable)
- ~1,000+ fuel efficiency records

---

## Matching Strategy

**Primary Match Criteria:**
1. Exact brand match (normalized)
2. Exact model match (normalized)
3. Exact year match
4. Exact fuel type match

**Fuzzy Matching (for variations):**
- Brand: Case-insensitive, common abbreviations (VW→VOLKSWAGEN, GM→CHEVROLET)
- Model: Remove special characters, normalize spacing, trim suffixes
- Year: Exact match only

**Unmatched Handling:**
- FIPE-only: vehicles with price data but no efficiency (fipe_code remains null in fuel_efficiency)
- Inmetro-only: efficiency data without price match (fipe_code remains null)
- Manual review: Flag low-confidence matches for review

---

## Unified Schema

**New Table: `vehicles`**
```sql
CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fipe_code VARCHAR(50) UNIQUE NOT NULL,
  brand VARCHAR(100) NOT NULL,
  model VARCHAR(200) NOT NULL,
  year INTEGER NOT NULL,
  fuel_type VARCHAR(20) NOT NULL,
  
  -- FIPE data
  price DECIMAL(12, 2),
  
  -- Media fields for Supabase Storage integration
  image_url_path TEXT,
  legal_attribution TEXT DEFAULT 'Foto: Divulgação/Fabricante',
  image_source_url TEXT,

  -- Inmetro data
  city_km_l DECIMAL(5, 2),
  highway_km_l DECIMAL(5, 2),
  efficiency_rating VARCHAR(1),
  
  -- Metadata
  match_confidence VARCHAR(20), -- 'exact', 'fuzzy', 'manual'
  match_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_vehicles_brand ON vehicles(brand);
CREATE INDEX idx_vehicles_year ON vehicles(year);
CREATE INDEX idx_vehicles_fuel_type ON vehicles(fuel_type);
```

**Update Existing Table:**
```sql
-- Update fuel_efficiency.fipe_code for matched records
UPDATE fuel_efficiency fe
SET fipe_code = v.fipe_code
FROM vehicles v
WHERE fe.brand = v.brand
  AND fe.model = v.model
  AND fe.model_year = v.year
  AND fe.fuel_type = v.fuel_type
  AND fe.fipe_code IS NULL;
```

---

## Acceptance Criteria

### Done when:

1. [ ] Cross-reference script can be executed with a single command
2. [ ] Script matches FIPE vehicles with Inmetro data using defined strategy
3. [ ] Unified `vehicles` table is populated with matched records
4. [ ] `fuel_efficiency.fipe_code` is updated for matched records
5. [ ] Unmatched records are logged and handled appropriately
6. [ ] At least 90% of Inmetro records have a FIPE match
7. [ ] Script logs cross-reference statistics (matched, unmatched counts)
8. [ ] Duplicate runs handle conflicts gracefully (idempotent)

---

## Dependencies

| Dependency | Feature | Status |
|---|---|---|
| FIPE ETL pipeline | F-01 | Complete |
| Inmetro ETL pipeline | F-02 | Complete |
| PostgreSQL connection | F-01 | Complete |
| Database schema | F-01, F-02 | Complete |

---

## Out of Scope

- Live API serving unified vehicle data (F-06 handles this)
- TCO calculations (F-05 handles this)
- Real-time cross-reference updates (run as batch job)

---

## Notes

- Brand and model name normalization from F-02 will be reused
- Some vehicles may have multiple fuel types (flex vehicles)
- Matching accuracy depends on data quality from both sources
- Consider storing match confidence scores for future improvement
- Manual review process may be needed for edge cases
