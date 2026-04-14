# F-01 Tasks: FIPE ETL Pipeline

**Spec**: `.specs/features/F-01-fipe-etl/spec.md`  
**Status**: Ready for implementation

---

## Task List

| ID | Task | Est | Depends | Gate | Status |
|---|---|---|---|---|---|
| T1 | Setup ETL project structure and dependencies | 1h | - | build | `[x] Complete` |
| T2 | Create database schema and migration | 2h | - | build | `[x] Complete` |
| T3 | Implement Brasil API client with retry logic | 2h | T1 | quick | `[x] Complete` |
| T4 | Implement vehicle catalog extraction (hierarchy crawl) | 3h | T3 | quick | `[x] Complete` |
| T5 | Implement data transformation and normalization | 2h | T4 | quick | `[x] Complete` |
| T6 | Implement PostgreSQL upsert loader | 2h | T2, T5 | quick | `[x] Complete` |
| T7 | Add execution logging and metrics | 1h | T6 | build | `[x] Complete` |
| T8 | End-to-end validation and documentation | 2h | T7 | build | `[ ] Not started` |

---

## T1: Setup ETL Project Structure and Dependencies

**Files**: `etl/package.json`, `etl/tsconfig.json`, `etl/.env.example`

**Description**: Initialize ETL as a standalone Node.js/TypeScript project with required dependencies (pg, axios, axios-retry, dotenv).

**Done when**:
- [ ] `package.json` with all dependencies
- [ ] `tsconfig.json` configured
- [ ] `.env.example` documents required env vars
- [ ] Build passes (`npm run build`)

**Gate check**: `npm run build`

---

## T2: Create Database Schema and Migration

**Files**: `etl/db/migrations/001_initial_schema.sql`, `etl/db/connection.ts`

**Description**: Create PostgreSQL schema for vehicles and vehicle_prices tables with proper indexes and connection handling.

**Done when**:
- [ ] Migration file creates `vehicles` and `vehicle_prices` tables
- [ ] Indexes on fipe_code, brand, vehicle_type
- [ ] Connection module with error handling
- [ ] Migration runs successfully against Neon.tech

**Gate check**: `npm run db:migrate`

---

## T3: Implement Brasil API Client with Retry Logic

**Files**: `etl/src/clients/brasilApi.ts`, `etl/src/clients/brasilApi.test.ts`

**Description**: HTTP client for Brasil API FIPE endpoints with axios-retry for rate limit handling.

**Done when**:
- [ ] Client fetches vehicle types, brands, models, years, prices
- [ ] Retry logic handles 429/5xx errors with exponential backoff
- [ ] Unit tests verify retry behavior
- [ ] All endpoints return typed responses

**Gate check**: `npm test -- brasilApi`

---

## T4: Implement Vehicle Catalog Extraction

**Files**: `etl/src/extractors/catalogExtractor.ts`, `etl/src/extractors/catalogExtractor.test.ts`

**Description**: Hierarchical crawl: vehicle type → brands → models → years → prices. Handles pagination and partial failures.

**Done when**:
- [ ] Extractor crawls full catalog for carros, motos, caminhoes
- [ ] Handles API failures gracefully (logs, continues)
- [ ] Returns normalized raw data structure
- [ ] Tests mock API responses

**Gate check**: `npm test -- catalogExtractor`

---

## T5: Implement Data Transformation and Normalization

**Files**: `etl/src/transformers/vehicleTransformer.ts`, `etl/src/transformers/vehicleTransformer.test.ts`

**Description**: Transform raw Brasil API responses into database-ready format. Handle data cleaning and validation.

**Done when**:
- [ ] Transforms brand/model/year/price into vehicles + vehicle_prices rows
- [ ] Validates required fields (fipe_code, price, year)
- [ ] Handles missing/invalid data gracefully
- [ ] Tests cover edge cases

**Gate check**: `npm test -- vehicleTransformer`

---

## T6: Implement PostgreSQL Upsert Loader

**Files**: `etl/src/loaders/postgresLoader.ts`, `etl/src/loaders/postgresLoader.test.ts`

**Description**: Load transformed data into PostgreSQL with upsert logic (INSERT ... ON CONFLICT UPDATE).

**Done when**:
- [ ] Upserts vehicles (conflict on fipe_code)
- [ ] Upserts vehicle_prices (conflict on fipe_code + year + fuel_type)
- [ ] Batch inserts for performance
- [ ] Returns insert/update counts
- [ ] Tests with in-memory or test DB

**Gate check**: `npm test -- postgresLoader`

---

## T7: Add Execution Logging and Metrics

**Files**: `etl/src/utils/logger.ts`, `etl/src/index.ts`

**Description**: Structured logging and execution summary (records fetched, inserted, updated, errors, duration).

**Done when**:
- [ ] Logger utility with timestamped output
- [ ] Main script logs each phase (extract, transform, load)
- [ ] Final summary: vehicles fetched, prices inserted/updated, errors, duration
- [ ] Exit code 0 on success, 1 on failure

**Gate check**: `npm run etl:run` produces logged output

---

## T8: End-to-end validation and documentation
**Estimate:** 1-2 hours
**Dependencies:** T7
**Gate Check:** E2E test passes, README is comprehensive
**Status:** Completed

**Description:**
Create an E2E integration test for the FIPE ETL pipeline to validate the full extract-transform-load flow with real API data (in sample mode). Create a comprehensive README for the ETL project with setup instructions, usage examples, and configuration options. Finalize the feature state and tasks in documentation.

**Done Criteria:**
- [x] E2E integration test created and passing
- [x] README.md is comprehensive with setup, usage, and configuration
- [x] Feature state in STATE.md updated to "Completed"
- [x] Tasks in tasks.md marked as completed

**Gate check**: `npm run etl:run && npm run db:count:vehicles` returns >= 100

---

## Execution Order

```
T1 (setup) ─┬─→ T3 (api client) ─→ T4 (extractor)
            │                        ↓
T2 (schema) ┘                     T5 (transform)
            │                        ↓
            └──────────────────── T6 (loader) ─→ T7 (logging) ─→ T8 (e2e)
```

---

## Notes

- Start with T1 and T2 in parallel (no dependencies)
- T3, T4, T5 form the core pipeline logic
- T6 and T7 integrate everything
- T8 validates the complete feature meets spec acceptance criteria
