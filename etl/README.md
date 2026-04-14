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

# Or sample mode (2 brands × 2 models × 1 year each)
npm run etl:run -- --sample
```

## Batch Mode (recommended for rate-limited APIs)

Process data in batches to avoid rate limits:

```bash
# Run a batch (10 brands, saves checkpoint)
npm run etl:run -- --batch

# Check status
npm run etl:run -- --status

# Continue from checkpoint (auto-resumes)
npm run etl:run -- --batch

# Start over
npm run etl:run -- --batch --reset
```

**Run multiple times to build full dataset:**
```bash
# Run ~10-15 batches to process all ~106 car brands
for i in {1..15}; do echo "=== Batch $i ===" && npm run etl:run -- --batch && sleep 30; done
```

## CLI Options

| Option | Description |
|--------|-------------|
| `--batch` | Run in batch mode with checkpointing |
| `--status` | Show checkpoint status |
| `--reset` | Reset checkpoint and start over |
| `--sample` | Run sample mode (2 brands) |
| `--skip-load` | Skip database load (extract only) |
```

## Environment Variables

Create a `.env` file:

```
# Neon.tech PostgreSQL connection
DATABASE_URL=postgresql://user:password@host/neondb?sslmode=require

# Optional: Brasil API base URL
BRASIL_API_URL=https://fipe.parallelum.com.br/api/v2

# ETL config
ETL_BATCH_SIZE=100
ETL_SAMPLE_MODE=false
ETL_SKIP_LOAD=false
ETL_MAX_RETRIES=5
ETL_RETRY_DELAY_MS=2000
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
npm test
```

## API Note

This ETL uses the free [fipe.parallelum.com.br](https://fipe.parallelum.com.br) public API which has rate limits. For production, consider:
- Running incrementally with delays between batches
- Caching results locally
- Using a paid API tier for higher limits