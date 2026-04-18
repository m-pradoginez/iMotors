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
| 2026-04-15 | F-05 T9 complete: unit tests for each component with 35 tests passing. |
| 2026-04-15 | F-05 T10 complete: integration tests for TCO calculation with 37 tests passing. |
| 2026-04-15 | F-05 T11 complete: manual validation with 5 sample vehicles, all within ±10% tolerance. |
| 2026-04-15 | F-05 complete: TCO calculation engine with 42 tests passing. |
| 2026-04-15 | F-06 started: Recommendation API spec and tasks created. |
| 2026-04-15 | F-06 T1-T9 complete: recommendation service with validation, query, TCO integration, ranking, controller, and tests (64 tests passing). |
| 2026-04-15 | F-06 complete: Recommendation API with 64 tests passing. |
| 2026-04-15 | M2 complete: Backend API milestone (F-04, F-05, F-06). |
| 2026-04-15 | M3 started: Frontend implementation. |
| 2026-04-15 | F-07 complete: Constraint input form with all fields and validation. |
| 2026-04-15 | F-08 complete: TCO report page with Top 3 recommendations and cost breakdown. |
| 2026-04-15 | F-09 complete: Webmotors/OLX redirect with UTM-tagged URLs. |
| 2026-04-15 | M3 complete: Frontend milestone (F-07, F-08, F-09). |
| 2026-04-16 | Architectural decision: Refactored F-07 (Frontend Form) into a Multi-step Conversational Wizard (Light Mode) to reduce cognitive friction and improve conversion rates. |
| 2026-04-16 | UI Pivot & Design System: Created tailwind.config.js and refactored F-07 to a Multi-step Wizard (Light Mode) for better conversion. |
| 2026-04-16 | UI Fix: Simplified index.css and standardized BudgetStep layout to fix rendering issues. |
| 2026-04-16 | UI Pivot & Design System Refactor: Cleaned index.css, centered App.tsx, and rebuilt BudgetStep with opaque Light Mode and Slate/Emerald palette. |
| 2026-04-16 | M4 Stabilizer: Hardened DB SSL connection ({rejectUnauthorized: true}), created API entry point (index.ts), and standardized Design System components (Button, Card, Slider). |
| 2026-04-16 | Wizard Completion: Implemented UsageStep (Passo 2) and LocationStep (Passo 3), and orchestrated the full 3-step navigation flow in App.tsx. |
| 2026-04-16 | UI/UX Enhancements: Added Framer Motion directional transitions, educational tooltips, real-time TCO feedback, and micro-interactions across all wizard steps. |
| 2026-04-16 | F-10 complete: End-to-end validation. Playwright installed and configured. E2E tests for Happy Path, Edge Case (Empty vehicles), and Filters written. |
| 2026-04-17 | Major Architectural Pivot: Full migration from Neon.tech to Supabase to consolidate Auth, Database, and Storage. |
| 2026-04-17 | Feature Expansion: Automated media sourcing engine design and baseline schema refactor to UUIDs. |

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
| D-07 | Backend language: Node.js + TypeScript | Faster cold starts on free tier; single language across ETL and API reduces context switching | 2026-04-15 |
| D-08 | TCO formula includes all 5 components | Depreciation, fuel, IPVA, insurance, maintenance all included for comprehensive cost picture | 2026-04-15 |
| D-09 | FIPE ↔ Inmetro matching: hybrid approach | Exact matching for clear cases + fuzzy matching for variations + manual mapping as fallback | 2026-04-14 |
| D-10 | Full migration from Neon.tech to Supabase | Consolidate Auth, Database, and Storage into a single BaaS to support automated media sourcing. | 2026-04-17 |
| D-11 | Primary Keys converted from SERIAL to UUID | Modernize schema for global unique identification and Supabase compatibility. | 2026-04-17 |
| D-12 | Technical and Media tables unified into `vehicles` | Simplify schema and improve query efficiency for unified vehicle data. | 2026-04-17 |

---

## Open Questions

| ID | Question | Context | Status |
|---|---|---|---|
| Q-01 | ~~Final backend language: .NET Core (C#) vs Node.js?~~ | **Decision: Node.js + TypeScript** (see D-07). Rationale: Faster cold starts on free tier, single language across ETL and API. | ✅ Resolved 2026-04-15 |
| Q-02 | Final DB host: Neon.tech vs Supabase? | Both offer PostgreSQL free tier. Supabase adds a built-in REST API; Neon has better branching for ETL workflows. | ✅ Resolved 2026-04-17 - Supabase (Pivot from Neon) |
| Q-03 | ~~TCO formula: which cost components to include in v1?~~ | **Decision: All 5 components** (see D-08). Includes: depreciation, fuel cost, IPVA, insurance, maintenance. | ✅ Resolved 2026-04-15 |
| Q-04 | ~~How to handle FIPE ↔ Inmetro model name mismatches?~~ | **Decision: Hybrid approach** (see D-09). Exact matching + fuzzy matching + manual mapping capability. | ✅ Resolved 2026-04-14 |

---

## Blockers

*None yet.*

---

## Todos

| ID | Todo | Feature |
|---|---|---|
| T-01 | [x] Decide backend language (Q-01) | Done - Node.js + TypeScript (D-07) |
| T-02 | [x] Decide DB host (Q-02) | Done - Neon.tech (D-06) |
| T-03 | [x] Define TCO formula components (Q-03) | Done - All 5 components (D-08) |
| T-04 | [x] Define FIPE ↔ Inmetro matching strategy (Q-04) | Done - Hybrid approach (D-09) |
| T-05 | [x] Create F-01 design.md | Done |
| T-06 | [x] Create F-01 tasks.md | Done |
| T-08 | [x] E2E validation + README | Done (partial - rate limited) |

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