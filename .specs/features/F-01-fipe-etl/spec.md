# F-01: FIPE ETL Pipeline

## Feature

ETL Pipeline — FIPE ingestion

## Spec Status

Draft

---

## Context

**From PROJECT.md:**
- Data source: Brasil API (FIPE) — public, free, no auth required
- Target DB: PostgreSQL (Neon.tech or Supabase)
- Bootstrapping constraint: Zero-cost infrastructure

**From STATE.md:**
- Open questions pending:
  - Q-02: Final DB host (Neon vs Supabase) — needs decision before implementation
  - Q-04: FIPE ↔ Inmetro matching strategy — affects data model design

---

## Requirements

### Functional

| ID | Requirement | Priority |
|---|---|---|
| R-01 | Fetch all vehicle types (carros, motos, caminhoes) from Brasil API FIPE endpoints | Must |
| R-02 | Fetch reference tables (brands, models, years) for each vehicle type | Must |
| R-03 | Fetch FIPE price for each vehicle year-code combination | Must |
| R-04 | Normalize FIPE response into internal vehicle catalog schema | Must |
| R-05 | Persist normalized data to PostgreSQL with conflict handling (upsert) | Must |
| R-06 | Support incremental updates — fetch only changed prices since last run | Should |
| R-07 | Log ETL execution metrics (records fetched, inserted, updated, errors) | Should |

### Non-Functional

| ID | Requirement | Priority |
|---|---|---|
| NFR-01 | ETL script must be runnable locally and in CI/CD | Must |
| NFR-02 | Idempotent — multiple runs produce same end state | Must |
| NFR-03 | Handle Brasil API rate limits gracefully (backoff/retry) | Should |
| NFR-04 | Execution time < 5 minutes for full catalog (thousands of vehicles) | Should |

---

## Brasil API Reference

**Base URL:** `https://brasilapi.com.br/api/fipe`

**Endpoints:**
- `GET /marcas/v1/{tipoVeiculo}` — List brands
- `GET /marcas/v1/{tipoVeiculo}/{codigoMarca}/modelos` — List models for brand
- `GET /marcas/v1/{tipoVeiculo}/{codigoMarca}/anos` — List years for brand
- `GET /preco/v1/{codigoFipe}` — Get price history for a FIPE code
- `GET /preco/v1/{codigoFipe}?ano={ano}` — Get price for specific year

**Vehicle types:** `carros`, `motos`, `caminhoes`

---

## Acceptance Criteria

### Done when:

1. [ ] ETL script can be executed with a single command
2. [ ] Script fetches complete FIPE catalog (carros + motos + caminhoes) from Brasil API
3. [ ] Data is normalized and stored in PostgreSQL with proper schema
4. [ ] Duplicate runs handle conflicts gracefully (upsert, no duplicates)
5. [ ] At least 100 vehicle records exist in DB after first run
6. [ ] Script logs execution summary (fetched, inserted, updated counts)

---

## Dependencies

| Dependency | Feature | Status |
|---|---|---|
| DB host decision (Q-02) | STATE.md | Open — decide Neon vs Supabase |
| PostgreSQL connection | Infrastructure | Not set up yet |

---

## Out of Scope

- FIPE ↔ Inmetro cross-referencing (F-03 handles this)
- Live API serving FIPE data (F-06 handles this)
- TCO calculations (F-05 handles this)

---

## Notes

- Brasil API has no authentication — simpler ETL
- FIPE codes are unique identifiers (e.g., `011015-9`)
- Price history is available but v1 only needs current price
- Consider caching intermediate responses during development to avoid hammering the API
