# iMotors ETL — FIPE Pipeline

ETL pipeline for ingesting vehicle data from the Brasil API FIPE table into PostgreSQL.

## Quick Start

```bash
# Install dependencies
npm install

# Build
npm run build

# Run migrations
npm run db:migrate

# Run ETL (full)
npm run etl:run

# Or sample mode (1 brand × 1 model × 1 year)
ETL_SAMPLE_MODE=true npm run etl:run
```

## Environment Variables

Create a `.env` file:

```
# Neon.tech PostgreSQL connection
DATABASE_URL=postgresql://user:password@host/neondb?sslmode=require

# Optional: Brasil API base URL (default: https://brasilapi.com.br/api/fipe)
BRASIL_API_URL=https://brasilapi.com.br/api/fipe

# ETL config
ETL_SAMPLE_MODE=false
ETL_SKIP_LOAD=false
ETL_MAX_RETRIES=3
ETL_RETRY_DELAY_MS=1000
```

## Project Structure

```
etl/
├── src/
│   ├── clients/       # API clients (Brasil API)
│   ├── extractors/    # Data extraction
│   ├── transformers/ # Data transformation
│   ├── loaders/     # Database loading
│   ├── db/        # Database schema & migrations
│   └── pipeline/   # Pipeline orchestration
├── dist/          # Compiled JavaScript
└── package.json
```

## Testing

```bash
# Run all tests
npm test

# Run E2E integration test only
npm test -- fipePipeline.e2e.test.ts
```

## API Note

This ETL uses the free [Brasil API](https://brasilapi.com.br/api/fipe) public API which has rate limits. For production, consider:
- Running incrementally with delays between batches
- Caching results locally
- Using a paid API tier for higher limits