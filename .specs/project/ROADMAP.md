# iMotors — Roadmap

## Strategy

Build bottom-up: data first, logic second, UI last. A beautiful form is worthless without a dataset behind it. Each milestone produces a testable, deployable artifact.

---

## Milestones

### M1 — Data Foundation `[x]`
*The proprietary dataset is the moat. Everything else depends on it.*

| # | Feature | Scope | Status |
|---|---|---|---|
| F-01 | ETL Pipeline — FIPE ingestion | Fetch vehicle list + prices from Brasil API; normalize and persist to PostgreSQL | `[x] Complete` |
| F-02 | ETL Pipeline — Inmetro PBE ingestion | Parse Inmetro spreadsheets; extract fuel efficiency (km/l city + highway) per model | `[x] Complete` |
| F-03 | Vehicle catalog cross-reference | Join FIPE × Inmetro data into unified `vehicles` table; handle unmatched records | `[x] Complete` |

**Milestone done when:** A seeded PostgreSQL instance contains a queryable vehicle catalog with FIPE price + fuel efficiency for a meaningful set of models (target: 100+ vehicles across categories).

---

### M2 — Backend API `[x]`
*The calculation engine and API contract.*

| # | Feature | Scope | Status |
|---|---|---|---|
| F-04 | OpenAPI spec design | Define all endpoints, request/response schemas, error contracts — before any code | `[x] Complete` |
| F-05 | TCO calculation engine | Core domain logic: depreciation, fuel cost, IPVA, insurance estimate, maintenance estimate | `[x] Complete` |
| F-06 | Recommendation API | Accept user constraints → query vehicle catalog → rank by TCO → return Top 3 with breakdown | `[x] Complete` |

**Milestone done when:** `POST /recommendations` accepts a valid user profile and returns a ranked list of 3 vehicles with monthly cost breakdown. Validated against manual reference calculations.

---

### M3 — Frontend `[x]`
*The user-facing experience.*

| # | Feature | Scope | Status |
|---|---|---|---|
| F-07 | Constraint input form | Multi-step Conversational Wizard with Framer Motion transitions, educational tooltips, and real-time TCO feedback | `[x] Complete` |
| F-08 | TCO report page | Display Top 3 recommendations with cost breakdown, visual comparison, and redirection links | `[x] Complete` |
| F-09 | Webmotors/OLX redirect | Generate UTM-tagged or search URLs for each recommended vehicle | `[x] Complete` |

**Milestone done when:** A user can complete the form, receive a rendered report with Top 3 vehicles, and click through to an external search.

---

### M4 — Polish & Deploy `[~] In progress`
*Production-ready on free tier.*

| # | Feature | Scope | Status |
|---|---|---|---|
| F-10.1 | Design System & UI Refactor | Implement Multi-step Wizard and clean Light Mode visual identity (Stabilized) | `[x] Complete` |
| F-10 | End-to-end validation | Full funnel test across budget/mileage/category combinations; edge cases | `[x] Complete` |
| F-11 | Deployment & CI | Frontend on Vercel/Netlify + Backend on Render/Fly.io + DB on Neon/Supabase; basic CI pipeline | `[ ] Not started` |
| F-12 | SEO & sharing | Open Graph tags, share-friendly report URLs, basic meta for discoverability | `[ ] Not started` |

**Milestone done when:** iMotors is live, publicly accessible, zero-cost infrastructure, with a shareable report URL.

---

### M5 — Supabase Transition & Media Engine `[x] Complete`
*The architectural shift for long-term scalability and rich media assets.*

| # | Feature | Scope | Status |
|---|---|---|---|
| M5.1 | Infrastructure Reset | Supabase CLI Initialization; Baseline migration (UUID-based schema); Data migration via pg_dump | `[x] Complete` |
| M5.2 | Media Sourcing Automation | Python scraper for Stellantis, VW, and GM; Integration with Supabase Storage `vehicle-media` bucket | `[x] Complete` |
| M5.3 | Security & Access | RLS Policies: `anon` select access for `vehicles` and `storage`; service role full access for ETL/scraper | `[x] Complete` |

**Milestone done when:** iMotors is running on Supabase with UUID primary keys and high-res press images served via Supabase Storage.

**Implementation Details:**
- **Infrastructure Migration**: Migrated from Neon to Supabase with global find/replace of all Neon references. Updated environment variables to use SUPABASE_DB_URL, SUPABASE_URL, SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY. Supabase CLI linked to remote project.
- **Database Schema**: Created baseline migration with UUID primary keys using `gen_random_uuid()` for vehicles table. Added media fields: `image_url_path`, `legal_attribution` (default: 'Foto: Divulgação/Fabricante'), and `image_source_url`. Renamed `vehicles_unified` to `vehicles`.
- **Media Automation**: Implemented Python-based scraping system in `media-automation/` directory with:
  - Base scraper class using BeautifulSoup for static content
  - Stellantis scraper for Fiat/Jeep brands (media.stellantis.com/br-pt/)
  - VW scraper for Volkswagen (vwnews.com.br)
  - GM scraper for Chevrolet (media.chevrolet.com.br)
  - Supabase Storage integration for uploading images to `vehicle-media` bucket
  - Database manager for updating vehicles table with image references using `fipe_code` + `model_year` as unique key
  - Prioritizes high-quality studio shots and press assets
  - Includes rate limiting and legal attribution compliance
- **Security**: Implemented RLS policies for public read access on vehicles, fuel_efficiency, and fipe_prices tables. Added service role policies for full access (INSERT, UPDATE, DELETE) to enable ETL/scraper write operations.

---

## Feature Dependency Graph

```
F-01 (FIPE ETL)
F-02 (Inmetro ETL)
      ↓
F-03 (Cross-reference DB)
      ↓
F-04 (OpenAPI spec)
      ↓
F-05 (TCO engine)
      ↓
F-06 (Recommendation API)
      ↓         ↓
F-07 (Form)   F-08 (Report)
      ↓         ↓
F-09 (Redirects)
      ↓
F-10 → F-11 → F-12
```

---

## Recommended Start Sequence

1. **Start here:** `F-01` — FIPE ETL Pipeline. It's the critical path blocker for everything else.
2. Run `F-02` in parallel once `F-01` is underway.
3. `F-04` (OpenAPI spec) can be drafted in parallel with ETL — it's a design artifact, not code.
4. Never start `F-05` before `F-03` is seeded and queryable.

---

## Status Legend

| Symbol | Meaning |
|---|---|
| `[ ] Not started` | Not yet begun |
| `[~] In progress` | Active work |
| `[x] Complete` | Done and verified |
| `[!] Blocked` | Waiting on dependency or decision |

---

## Future Versions & Strategic Integrations

| ID | Feature | Description | Status |
|---|---|---|---|
| F-13 | Moto Support (V2) | Full TCO integration for motorcycles using FIPE/INMETRO data. Priority for V2. | `[ ] Planned` |
| F-14 | iMotors Concierge (AI) | LLM-powered assistant (Gemini) with Function Calling to guide users via chat. | `[ ] Planned` |
| F-15 | Multi-Source Pricing | Integration with Localiza Seminovos, Webmotors, and KBB. | `[ ] Planned` |
| F-16 | Personal Fleet Tracker | Dashboard for tracking expenses of the user's current vehicle. | `[ ] Planned` |