# iMotors — Project Vision & Goals

## Elevator Pitch

iMotors is a B2C car recommendation and Total Cost of Ownership (TCO) calculation platform. Rather than a standard classifieds board, it acts as an impartial, data-driven virtual automotive consultant that helps users in Brazil discover the best vehicle for their lifestyle and budget.

---

## Problem Statement

Brazilian car buyers face fragmented, biased information. Classifieds show sticker prices but hide the real cost of ownership — fuel, insurance, IPVA, maintenance. Users end up choosing vehicles emotionally rather than financially. iMotors solves this by making the full picture visible before the purchase decision.

---

## Target Users

- **Primary:** Brazilian individuals actively researching or about to buy a car (B2C)
- **Secondary:** Users with a set budget and monthly mileage who want a ranked shortlist, not a search engine

---

## Core Value Proposition

1. **Impartial** — no inventory to sell, no dealership bias
2. **TCO-first** — surfaces real monthly cost, not just FIPE price
3. **Data-driven** — FIPE × Inmetro cross-referenced proprietary dataset
4. **Zero-friction** — anonymous, no registration, instant results

---

## Tech Stack

| Layer | Technology | Hosting |
|---|---|---|
| Frontend | React (TypeScript) | Vercel or Netlify (Free Tier) |
| Backend / API | .NET Core (C#) or Node.js — Clean Architecture | Render or Fly.io (Free Tier) |
| Database | PostgreSQL (Serverless) | Neon.tech or Supabase (Free Tier) |
| API Design | OpenAPI Specification (API-first) | — |
| Data / ETL | Custom scripts — Brasil API (FIPE) + Inmetro PBE spreadsheets | — |

**Bootstrapping constraint:** Infrastructure must stay within free tiers until lead-based revenue proves traction.

---

## Architecture Principles

- **API-first:** Backend exposes a fully documented OpenAPI spec before any frontend work begins
- **Clean Architecture:** Domain logic is framework-agnostic; UI and DB are implementation details
- **ETL-first:** Proprietary dataset (FIPE × Inmetro) is pre-populated offline; no live scraping
- **Stateless for MVP:** No user sessions, no auth — anonymous by design

---

## MVP Scope (v1)

### In Scope ✅

- Dynamic input form: budget, monthly mileage, city/highway ratio, state of residence, category preference
- TCO calculation engine (backend)
- Pre-populated vehicle database crossing FIPE pricing with Inmetro efficiency data
- Comparative report: Top 3 recommended vehicles with monthly cost breakdown
- Redirection links to Webmotors/OLX via URL parameters

### Out of Scope ❌

- Live web scraping (OLX, Facebook Marketplace, Webmotors)
- Paid API integrations (e.g., Olho no Carro vehicle history)
- User authentication / saved profiles
- Native mobile app (iOS/Android)
- Payment gateways or subscription billing

---

## Constraints & Non-Negotiables

| Constraint | Detail |
|---|---|
| **Budget** | Zero infrastructure cost — free tiers only until traction |
| **Legal / Compliance** | No scraping of competitor platforms; rely solely on FIPE (Brasil API) and Inmetro PBE public datasets |
| **Data sourcing** | ETL scripts must be reproducible and re-runnable as FIPE prices update |

---

## Success Metrics (MVP)

- User completes form → receives Top 3 report (full funnel)
- TCO calculation accuracy validated against manual reference cases
- Report renders and redirects work correctly for all recommended vehicles
- Dataset covers sufficient vehicle catalog to produce meaningful recommendations across budget ranges

---

## Project Status

- **Phase:** M1 — Data Foundation (F-01 complete)
- **Next:** F-02 — Inmetro PBE ingestion