# F-03 Tasks: Vehicle Catalog Cross-Reference

**Spec**: `.specs/features/F-03-vehicle-cross-reference/spec.md`
**Status**: Ready for implementation

---

## Task List

| ID | Task | Est | Depends | Gate | Status |
|---|---|---|---|---|---|
| T1 | Create unified vehicles table schema | 1h | F-01, F-02 | build | `[x] Complete` |
| T2 | Implement brand/model normalization utilities | 1h | - | quick | `[x] Complete` |
| T3 | Implement exact matching logic | 1h | T2 | quick | `[x] Complete` |
| T4 | Implement fuzzy matching logic | 2h | T3 | quick | `[ ] Not started` |
| T5 | Implement cross-reference transformer | 2h | T4 | quick | `[ ] Not started` |
| T6 | Implement cross-reference loader | 1h | T1, T5 | quick | `[ ] Not started` |
| T7 | Add execution logging and metrics | 1h | T6 | build | `[ ] Not started` |
| T8 | End-to-end validation and documentation | 1h | T7 | build | `[ ] Not started` |

---

## T1: Create Unified Vehicles Table Schema

**Files**: `etl/src/db/migrations/003_vehicles_unified.sql`

**Description**: Create PostgreSQL schema for unified vehicles table combining FIPE and Inmetro data.

**Done when**:
- [ ] Migration file creates `vehicles_unified` table
- [ ] Table includes: fipe_code, brand, model, year, fuel_type, price, city_km_l, highway_km_l, efficiency_rating
- [ ] Table includes: match_confidence, match_notes, created_at, updated_at
- [ ] Indexes on brand, year, fuel_type
- [ ] Migration runs successfully against Neon.tech

**Gate check**: `npm run db:migrate`

---

## T2: Implement Brand/Model Normalization Utilities

**Files**: `etl/src/utils/normalizer.ts`, `etl/src/utils/normalizer.test.ts`

**Description**: Reusable utilities for normalizing brand and model names for matching.

**Done when**:
- [ ] Normalizes brand names (case, abbreviations, special chars)
- [ ] Normalizes model names (trim, remove suffixes, normalize spacing)
- [ ] Reuses logic from F-02 where applicable
- [ ] Unit tests verify normalization accuracy

**Gate check**: `npm test -- normalizer`

---

## T3: Implement Exact Matching Logic

**Files**: `etl/src/matchers/exactMatcher.ts`, `etl/src/matchers/exactMatcher.test.ts`

**Description**: Match FIPE vehicles with Inmetro data using exact criteria.

**Done when**:
- [ ] Matches on exact brand, model, year, fuel_type
- [ ] Returns match confidence score
- [ ] Handles multiple matches (rare but possible)
- [ ] Tests verify exact match behavior

**Gate check**: `npm test -- exactMatcher`

---

## T4: Implement Fuzzy Matching Logic

**Files**: `etl/src/matchers/fuzzyMatcher.ts`, `etl/src/matchers/fuzzyMatcher.test.ts`

**Description**: Match vehicles using fuzzy matching for name variations.

**Done when**:
- [ ] Handles brand abbreviations (VW→VOLKSWAGEN, etc.)
- [ ] Handles model variations (trim levels, suffixes)
- [ ] Uses string similarity scoring (Levenshtein or similar)
- [ ] Configurable confidence threshold
- [ ] Tests verify fuzzy match accuracy

**Gate check**: `npm test -- fuzzyMatcher`

---

## T5: Implement Cross-Reference Transformer

**Files**: `etl/src/transformers/crossReferenceTransformer.ts`, `etl/src/transformers/crossReferenceTransformer.test.ts`

**Description**: Transform matched FIPE and Inmetro records into unified format.

**Done when**:
- [ ] Combines FIPE price data with Inmetro efficiency data
- [ ] Sets match_confidence based on match type
- [ ] Handles unmatched records (FIPE-only, Inmetro-only)
- [ ] Validates required fields
- [ ] Tests cover match and non-match scenarios

**Gate check**: `npm test -- crossReferenceTransformer`

---

## T6: Implement Cross-Reference Loader

**Files**: `etl/src/loaders/crossReferenceLoader.ts`, `etl/src/loaders/crossReferenceLoader.test.ts`

**Description**: Load unified vehicles data to PostgreSQL and update fuel_efficiency.fipe_code.

**Done when**:
- [ ] Upserts to `vehicles_unified` table
- [ ] Updates `fuel_efficiency.fipe_code` for matched records
- [ ] Returns statistics (matched, unmatched counts)
- [ ] Batch inserts for performance
- [ ] Tests verify load behavior

**Gate check**: `npm test -- crossReferenceLoader`

---

## T7: Add Execution Logging and Metrics

**Files**: `etl/src/pipeline/crossReferencePipeline.ts`, `etl/src/pipeline/crossReferencePipeline.test.ts`

**Description**: Structured logging and execution summary for cross-reference pipeline.

**Done when**:
- [ ] Logs each phase (matching, transforming, loading)
- [ ] Final summary: matched count, unmatched FIPE, unmatched Inmetro, duration
- [ ] Match accuracy percentage
- [ ] Exit code 0 on success, 1 on failure
- [ ] Tests verify logging behavior

**Gate check**: Pipeline run produces logged output

---

## T8: End-to-End Validation and Documentation

**Files**: `etl/README.md` (extend for cross-reference), `etl/src/pipeline/crossReferencePipeline.e2e.test.ts`

**Description**: Full E2E test, README extension with cross-reference instructions.

**Done when**:
- [ ] E2E test runs full cross-reference pipeline
- [ ] README documents cross-reference setup, usage, and configuration
- [ ] At least 90% of Inmetro records have FIPE match
- [ ] Unmatched records are logged appropriately
- [ ] All previous tasks complete

**Gate check**: Cross-reference pipeline runs and produces unified data

---

## Execution Order

```
T2 (normalizer) ─→ T3 (exact matcher) ─→ T4 (fuzzy matcher) ─→ T5 (transformer)
                      │                                           ↓
T1 (schema) ────────┘                                           ↓
                      └─────────────────────────────────────────┘
                                                             ↓
                                                         T6 (loader)
                                                             ↓
                                                         T7 (logging)
                                                             ↓
                                                         T8 (e2e)
```

---

## Notes

- T1 and T2 can be done in parallel (no dependencies)
- T3 and T4 form the matching logic core
- T5 combines matched data into unified format
- T6 and T7 integrate everything
- T8 validates the complete feature meets spec acceptance criteria
- This feature depends on F-01 and F-02 being complete and data being present
