# iMotors — Project Context & Guidelines

## Project Overview
iMotors is a Brazilian automotive consultant platform focused on Total Cost of Ownership (TCO). This repository contains the **ETL (Extract, Transform, Load)** pipelines responsible for building the proprietary vehicle dataset.

- **Objective**: Ingest and cross-reference vehicle prices (FIPE) and fuel efficiency (Inmetro) to enable data-driven recommendations.
- **Tech Stack**: TypeScript, Node.js, PostgreSQL (Supabase), Axios, xlsx, Jest.
- **Status**: Milestone 1 (Data Foundation) is in progress. FIPE and Inmetro ingestors are implemented; cross-referencing (FIPE ↔ Inmetro) is the next priority.

---

## Directory Structure
- `etl/`: Main source code for ETL pipelines.
  - `src/clients/`: API and download clients (Brasil API, Inmetro).
  - `src/db/`: Database schema, migrations, and connection pool.
  - `src/extractors/`: Data extraction from various sources.
  - `src/transformers/`: Normalization and transformation logic.
  - `src/loaders/`: Database persistence logic.
  - `src/pipeline/`: Orchestration of ETL flows.
  - `src/utils/`: Shared utilities (checkpoints, logging).
- `.specs/`: Documentation and project management.
  - `project/`: High-level vision (`PROJECT.md`), roadmap (`ROADMAP.md`), and state (`STATE.md`).
  - `features/`: Technical specifications for individual features.

---

## Key Commands (Run from `etl/` directory)

### Setup
- `npm install`: Install dependencies.
- `npm run build`: Compile TypeScript to JavaScript.
- `npm run db:migrate`: Apply database migrations to PostgreSQL.

### FIPE ETL Pipeline
- `npm run etl:run`: Run the full FIPE ingestor (Note: Rate limits apply).
- `npm run etl:run -- --sample`: Run in sample mode (subset of data).
- `npm run etl:run -- --batch`: Run in batch mode with checkpointing.
- `npm run etl:run -- --status`: Check checkpoint progress.
- `npm run etl:run -- --reset`: Reset checkpoint and start over.

### Inmetro ETL Pipeline
- **Status**: Logic implemented in `src/pipeline/inmetroPipeline.ts`, but script entry point is pending in `package.json`.
- Manual run: `npx ts-node src/pipeline/inmetroPipeline.ts --file data/inmetro/pbe-data.xlsx` (Assumed usage).

### Testing & Quality
- `npm test`: Run all Jest tests.
- `npm test -- --watch`: Run tests in watch mode.

---

## Development Conventions

### Coding Style
- **TypeScript First**: Strict typing is preferred. Use interfaces for all data structures (entries, transformed records, etc.).
- **Layered Architecture**: Keep extraction, transformation, and loading logic strictly separated in their respective directories.
- **Error Handling**: Use descriptive logging and try-catch blocks in pipelines to ensure failures are traced without crashing the entire process.

### Database
- **Migrations**: Always use `.sql` files in `src/db/migrations/` for schema changes.
- **Upserts**: Prefer `ON CONFLICT` patterns in loaders to ensure idempotency when re-running pipelines.

### Testing
- **Coverage**: Every extractor and transformer should have a corresponding `.test.ts` file.
- **Mocks**: Use Jest mocks for external API calls and filesystem operations in unit tests.
- **Integration**: Pipeline tests (`.test.ts` or `.e2e.test.ts`) should verify the flow from extraction to transformation.

---

## Roadmap Context (Milestone 1)
- **F-01 (Complete)**: FIPE data ingestion.
- **F-02 (Complete)**: Inmetro PBE data ingestion.
- **F-03 (Next)**: Vehicle catalog cross-reference. This involves matching normalized names between FIPE and Inmetro to populate the `fipe_code` foreign key in the `fuel_efficiency` table.

---

## Known Constraints
- **Rate Limits**: The FIPE API has strict rate limits; batch mode with delays is required for full ingestion.
- **Data Quality**: Inmetro spreadsheet formats can vary slightly by year; the parser must be robust.
- **Schema**: `fuel_efficiency` table currently requires `fipe_code` (NOT NULL). Cross-referencing logic must resolve this before production loading.
