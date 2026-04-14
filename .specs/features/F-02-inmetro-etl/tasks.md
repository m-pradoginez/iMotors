# F-02 Tasks: Inmetro PBE ETL Pipeline

**Spec**: `.specs/features/F-02-inmetro-etl/spec.md`  
**Status**: Ready for implementation

---

## Task List

| ID | Task | Est | Depends | Gate | Status |
|---|---|---|---|---|---|
| T1 | Setup spreadsheet parsing dependencies | 1h | - | build | `[x] Complete` |
| T2 | Design fuel efficiency database schema | 1h | F-01 | build | `[x] Complete` |
| T3 | Implement spreadsheet downloader | 1h | T1 | quick | `[x] Complete` |
| T4 | Implement Inmetro spreadsheet parser | 2h | T1, T3 | quick | `[x] Complete` |
| T5 | Implement data normalization and mapping | 2h | T4 | quick | `[x] Complete` |
| T6 | Implement PostgreSQL upsert loader | 1h | T2, T5 | quick | `[x] Complete` |
| T7 | Add execution logging and metrics | 1h | T6 | build | `[ ] Not started` |
| T8 | End-to-end validation and documentation | 1h | T7 | build | `[ ] Not started` |

---

## T1: Setup Spreadsheet Parsing Dependencies

**Files**: `etl/package.json`, `etl/.env.example`

**Description**: Add dependencies for Excel spreadsheet parsing (xlsx or similar library).

**Done when**:
- [ ] `package.json` includes spreadsheet parsing library (e.g., xlsx)
- [ ] Build passes (`npm run build`)
- [ ] `.env.example` documents any new env vars

**Gate check**: `npm run build`

---

## T2: Design Fuel Efficiency Database Schema

**Files**: `etl/db/migrations/002_fuel_efficiency.sql`

**Description**: Create PostgreSQL schema for fuel efficiency data with proper indexes.

**Done when**:
- [ ] Migration file creates `fuel_efficiency` table
- [ ] Table includes: vehicle_id (FK to vehicles), fuel_type, city_km_l, highway_km_l, efficiency_rating
- [ ] Indexes on vehicle_id, fuel_type
- [ ] Migration runs successfully against Neon.tech

**Gate check**: `npm run db:migrate`

---

## T3: Implement Spreadsheet Downloader

**Files**: `etl/src/clients/inmetroDownloader.ts`, `etl/src/clients/inmetroDownloader.test.ts`

**Description**: HTTP client to download Inmetro PBE spreadsheets from official source.

**Done when**:
- [ ] Client downloads spreadsheets from Inmetro PBE URL
- [ ] Handles multiple spreadsheet versions/years
- [ ] Saves to local file system
- [ ] Unit tests verify download behavior

**Gate check**: `npm test -- inmetroDownloader`

---

## T4: Implement Inmetro Spreadsheet Parser

**Files**: `etl/src/extractors/inmetroParser.ts`, `etl/src/extractors/inmetroParser.test.ts`

**Description**: Parse Excel spreadsheets to extract vehicle fuel efficiency data.

**Done when**:
- [ ] Parser reads XLS/XLSX format
- [ ] Extracts brand, model, year, fuel type, city km/l, highway km/l, efficiency rating
- [ ] Handles multiple fuel types (flex vehicles)
- [ ] Handles malformed data gracefully
- [ ] Tests mock spreadsheet data

**Gate check**: `npm test -- inmetroParser`

---

## T5: Implement Data Normalization and Mapping

**Files**: `etl/src/transformers/fuelEfficiencyTransformer.ts`, `etl/src/transformers/fuelEfficiencyTransformer.test.ts`

**Description**: Transform raw spreadsheet data into database-ready format with normalized identifiers.

**Done when**:
- [ ] Normalizes brand/model names to match FIPE conventions
- [ ] Validates required fields (fuel type, efficiency values)
- [ ] Handles missing/invalid data gracefully
- [ ] Tests cover edge cases

**Gate check**: `npm test -- fuelEfficiencyTransformer`

---

## T6: Implement PostgreSQL Upsert Loader

**Files**: `etl/src/loaders/fuelEfficiencyLoader.ts`, `etl/src/loaders/fuelEfficiencyLoader.test.ts`

**Description**: Load transformed fuel efficiency data into PostgreSQL with upsert logic.

**Done when**:
- [ ] Upserts fuel efficiency records (conflict on vehicle_id + fuel_type)
- [ ] Batch inserts for performance
- [ ] Returns insert/update counts
- [ ] Tests with in-memory or test DB

**Gate check**: `npm test -- fuelEfficiencyLoader`

---

## T7: Add Execution Logging and Metrics

**Files**: `etl/src/utils/logger.ts`, `etl/src/index.ts` (extend for Inmetro)

**Description**: Structured logging and execution summary for Inmetro ETL.

**Done when**:
- [ ] Logger utility with timestamped output (reuse from F-01)
- [ ] Main script logs each phase (download, parse, transform, load)
- [ ] Final summary: records parsed, inserted, updated, errors, duration
- [ ] Exit code 0 on success, 1 on failure

**Gate check**: ETL run produces logged output

---

## T8: End-to-End Validation and Documentation

**Files**: `etl/README.md` (extend for Inmetro), `etl/src/pipeline/inmetroPipeline.e2e.test.ts`

**Description**: Full E2E test, README extension with Inmetro instructions.

**Done when**:
- [ ] E2E test runs full Inmetro pipeline
- [ ] README documents Inmetro setup, usage, and configuration
- [ ] At least 100 fuel efficiency records in DB after run
- [ ] All previous tasks complete

**Gate check**: Inmetro ETL runs and inserts data

---

## Execution Order

```
T1 (deps) ─┬─→ T3 (downloader) ─→ T4 (parser)
           │                      ↓
T2 (schema) ┘                   T5 (transform)
           │                      ↓
           └──────────────────── T6 (loader) ─→ T7 (logging) ─→ T8 (e2e)
```

---

## Notes

- T1 and T2 can be done in parallel (no dependencies)
- T3, T4, T5 form the core parsing logic
- T6 and T7 integrate everything
- T8 validates the complete feature meets spec acceptance criteria
- This feature runs independently of F-01 (no API rate limits)
