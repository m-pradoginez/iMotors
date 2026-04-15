# iMotors — State & Persistent Memory

## Session Log

| Date | Activity |
|---|---|
| 2026-04-12 | Project initialized. PROJECT.md + ROADMAP.md created. |
| 2026-04-13 | F-01 spec created (FIPE ETL). Blocked on Q-02 (DB host decision). |
| 2026-04-13 | F-01 tasks created. Design complete. Ready for implementation. |
| 2026-04-13 | T1 complete: ETL project structure, package.json, tsconfig, build verified. |
| 2026-04-13 | T2 complete: Database schema (vehicles, vehicle_prices), migration system, connection module. |
| 2026-04-13 | T3 complete: Brasil API client with axios-retry, all endpoints typed, 8 tests passing. |
| 2026-04-13 | T4 complete: Catalog extractor with hierarchy crawl (type→brand→model→year→price), 7 tests passing. |
| 2026-04-13 | T5 complete: Vehicle transformer with FIPE code extraction, price parsing, 10 tests passing. |
| 2026-04-13 | T6 complete: PostgreSQL upsert loader with truncate/count helpers, 10 tests passing. |
| 2026-04-13 | T7 complete: Main ETL pipeline orchestrator with logging and metrics, 9 tests passing. |
| 2026-04-13 | T8 complete: E2E integration test with real DB option, README comprehensive with setup/usage/config. |
| 2026-04-13 | F-01 complete: FIPE ETL pipeline. |
| 2026-04-13 | F-02 started: Inmetro PBE ETL spec and tasks created. |
| 2026-04-13 | F-02 T1 complete: xlsx library added, .env.example created. |
| 2026-04-13 | F-02 T2 complete: fuel_efficiency table schema with indexes. |
| 2026-04-13 | F-02 T3 complete: spreadsheet downloader with HTTP client, 5 tests passing. |
| 2026-04-13 | F-02 T4 complete: Inmetro spreadsheet parser with xlsx library, 5 tests passing. |
| 2026-04-13 | F-02 T5 complete: fuel efficiency transformer with brand/model normalization, 5 tests passing. |
| 2026-04-13 | F-02 T6 complete: PostgreSQL upsert loader with batch inserts, 7 tests passing. |
| 2026-04-13 | F-02 T7 complete: Inmetro pipeline orchestrator with logging and metrics, 5 tests passing. |
| 2026-04-13 | F-02 T8 complete: README extended with Inmetro instructions. |
| 2026-04-13 | F-02 complete: Inmetro PBE ETL pipeline. |
| 2026-04-14 | F-03 started: Vehicle catalog cross-reference spec and tasks created. |
| 2026-04-14 | F-03 T1 complete: unified vehicles table schema with indexes. |
| 2026-04-14 | F-03 T2 complete: brand/model normalization utilities with 17 tests passing. |
| 2026-04-14 | F-03 T3 complete: exact matching logic with 10 tests passing. |
| 2026-04-14 | F-03 T4 complete: fuzzy matching logic with 10 tests passing. |
| 2026-04-14 | F-03 T5 complete: cross-reference transformer with 7 tests passing. |
| 2026-04-14 | F-03 T6 complete: cross-reference loader with 6 tests passing. |
| 2026-04-14 | F-03 T7 complete: execution logging and metrics with 4 tests passing. |
| 2026-04-14 | F-03 T8 complete: E2E validation and documentation with 5 tests passing. |
| 2026-04-14 | F-03 complete: Vehicle catalog cross-reference pipeline. |
| 2026-04-14 | F-04 started: OpenAPI spec design spec and tasks created. |
| 2026-04-14 | F-04 T1-T6 complete: OpenAPI YAML file with endpoints, schemas, errors, examples. |
| 2026-04-14 | F-04 T7-T8 complete: spec validated (manual) and verified. |
| 2026-04-14 | F-04 complete: OpenAPI spec design. |
| 2026-04-15 | F-05 started: TCO calculation engine spec and tasks created. |
| 2026-04-15 | F-05 T1-T8 complete: TCO calculator with all component calculations and config. |

---

## Decisions

| ID | Decision | Rationale | Date |
|---|---|---|---|
| D-01 | Start with F-01 (FIPE ETL) as first feature to specify | Critical path blocker; all other features depend on a seeded vehicle catalog | 2026-04-12 |
| D-02 | Zero-cost infra constraint for MVP | Bootstrapping model — free tier until lead-based revenue proves traction | 2026-04-12 |
| D-03 | No user auth in v1 | Reduces complexity; anonymous usage lowers friction and accelerates MVP | 2026-04-12 |
| D-04 | API-first design — OpenAPI spec before backend code | Enables parallel frontend/backend development and clear contract | 2026-04-12 |
| D-05 | ETL pre-populates DB offline — no live scraping | Legal/compliance constraint; FIPE + Inmetro are public datasets | 2026-04-12 |
| D-06 | Use Neon.tech for PostgreSQL hosting | Better branching for ETL workflows and serverless scaling | 2026-04-13 |

---

## Open Questions

| ID | Question | Context |
|---|---|---|
| Q-01 | Final backend language: .NET Core (C#) vs Node.js? | Both are valid. C# has stronger typing for domain-heavy TCO logic; Node.js has faster cold starts on free tier hosts. Needs decision before F-04 (OpenAPI spec). |
| Q-02 | Final DB host: Neon.tech vs Supabase? | Both offer PostgreSQL free tier. Supabase adds a built-in REST API; Neon has better branching for ETL workflows. |
| Q-03 | TCO formula: which cost components to include in v1? | Minimum: fuel, IPVA, DPVAT/insurance estimate. Optional: maintenance reserves, depreciation curve. Needs decision before F-05. |
| Q-04 | How to handle FIPE ↔ Inmetro model name mismatches? | FIPE and Inmetro use different naming conventions. Fuzzy matching? Manual curated mapping table? Needs strategy before F-03. |

---

## Blockers

*None yet.*

---

## Todos

| ID | Todo | Feature |
|---|---|---|
| T-01 | Decide backend language (Q-01) | Before F-04 |
| T-02 | [x] Decide DB host (Q-02) | Done |
| T-05 | [x] Create F-01 design.md | Done |
| T-06 | [x] Create F-01 tasks.md | Done |
| T-08 | [x] E2E validation + README | Done (partial - rate limited) |
| T-03 | Define TCO formula components (Q-03) | Before F-05 |
| T-04 | Define FIPE ↔ Inmetro matching strategy (Q-04) | Before F-03 |

---

## Deferred Ideas

| ID | Idea | Why Deferred |
|---|---|---|
| DI-01 | User saved profiles / comparison history | Requires auth — explicitly out of v1 scope |
| DI-02 | Live Webmotors/OLX inventory prices instead of FIPE | Legal/scraping constraint; also requires paid API |
| DI-03 | Olho no Carro vehicle history integration | Paid API — out of v1 scope |
| DI-04 | Native mobile app | Post-traction; v1 is responsive web only |
| DI-05 | Subscription / monetization model | Post-traction; v1 is lead referral only |
| DI-06 | Electric vehicle TCO modeling | FIPE + Inmetro coverage for EVs is limited in Brazil currently |

---

## Preferences

*Nothing recorded yet.*

---

## Lessons Learned

*Nothing recorded yet.*