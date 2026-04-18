# F-02: Inmetro PBE ETL Pipeline

## Feature

ETL Pipeline — Inmetro PBE ingestion

## Spec Status

Draft

---

## Context

**From PROJECT.md:**
- Data source: Inmetro PBE spreadsheets (public, downloadable)
- Target DB: PostgreSQL (Supabase)
- Bootstrapping constraint: Zero-cost infrastructure

**From ROADMAP.md:**
- F-02 parses Inmetro spreadsheets to extract fuel efficiency (km/l city + highway) per model
- Part of M1 Data Foundation milestone
- Can run in parallel with F-01 (FIPE ETL)

---

## Requirements

### Functional

| ID | Requirement | Priority |
|---|---|---|
| R-01 | Download Inmetro PBE spreadsheets from official source | Must |
| R-02 | Parse spreadsheet format (XLS/XLSX) to extract vehicle data | Must |
| R-03 | Extract fuel efficiency metrics: city km/l, highway km/l | Must |
| R-04 | Map vehicle identifiers (brand, model, year) to match FIPE data | Must |
| R-05 | Normalize data into internal fuel efficiency schema | Must |
| R-06 | Persist normalized data to PostgreSQL with conflict handling (upsert) | Must |
| R-07 | Handle multiple spreadsheet versions/years | Should |
| R-08 | Log ETL execution metrics (records parsed, inserted, updated, errors) | Should |

### Non-Functional

| ID | Requirement | Priority |
|---|---|---|
| NFR-01 | ETL script must be runnable locally and in CI/CD | Must |
| NFR-02 | Idempotent — multiple runs produce same end state | Must |
| NFR-03 | Handle malformed spreadsheet data gracefully | Should |
| NFR-04 | Execution time < 2 minutes for full spreadsheet parsing | Should |

---

## Inmetro PBE Reference

**Official Source:** http://www.inmetro.gov.br/consumidor/pbe/

**Data Format:** Excel spreadsheets (.xls/.xlsx)

**Spreadsheet Structure (typical):**
- Vehicle category (carros, motos, etc.)
- Brand name
- Model name
- Year
- Fuel type (gasolina, etanol, flex, diesel)
- City fuel efficiency (km/l)
- Highway fuel efficiency (km/l)
- Energy efficiency rating (A, B, C, D, E, G)

**Key Fields to Extract:**
- Brand
- Model
- Year
- Fuel type
- City km/l
- Highway km/l
- Efficiency rating

---

## Acceptance Criteria

### Done when:

1. [ ] ETL script can be executed with a single command
2. [ ] Script downloads and parses Inmetro PBE spreadsheets
3. [ ] Data is normalized and stored in PostgreSQL with proper schema
4. [ ] Duplicate runs handle conflicts gracefully (upsert, no duplicates)
5. [ ] At least 100 vehicle fuel efficiency records exist in DB after first run
6. [ ] Script logs execution summary (parsed, inserted, updated counts)

---

## Dependencies

| Dependency | Feature | Status |
|---|---|---|
| DB host decision | STATE.md | ✅ Resolved (Supabase) |
| PostgreSQL connection | F-01 | Complete |
| Database schema | F-01 | Complete (may need extension for fuel efficiency) |

---

## Out of Scope

- FIPE ↔ Inmetro cross-referencing (F-03 handles this)
- Live API serving fuel efficiency data (F-06 handles this)
- TCO calculations (F-05 handles this)

---

## Notes

- Inmetro PBE data is public and requires no authentication
- Spreadsheets are updated periodically (monthly/quarterly)
- Vehicle naming may differ from FIPE — fuzzy matching may be needed in F-03
- Consider storing raw spreadsheet data for audit/re-processing
- Some models may have multiple fuel types (flex vehicles show both gasolina and etanol values)
