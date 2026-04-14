# iMotors ETL — FIPE & Inmetro Pipelines

ETL pipelines for ingesting vehicle data from Brasil API FIPE table and Inmetro PBE fuel efficiency spreadsheets into PostgreSQL.

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

## Inmetro PBE Fuel Efficiency ETL

The Inmetro PBE pipeline ingests fuel efficiency data from Excel spreadsheets published by Inmetro.

### Quick Start

```bash
# Run Inmetro pipeline with a spreadsheet file
npm run etl:inmetro -- --file data/inmetro/pbe-data.xlsx

# Skip database load (parse and transform only)
npm run etl:inmetro -- --file data/inmetro/pbe-data.xlsx --skip-load
```

### Environment Variables

Add to `.env` file:

```
# Inmetro PBE config
INMETRO_SPREADSHEET_URL=http://www.inmetro.gov.br/consumidor/pbe/
INMETRO_DATA_DIR=./data/inmetro
```

### Components

- **InmetroDownloader**: Downloads spreadsheets from Inmetro PBE website
- **InmetroParser**: Parses Excel files with xlsx library
- **FuelEfficiencyTransformer**: Normalizes brand/model names to match FIPE conventions
- **FuelEfficiencyLoader**: Upserts fuel efficiency data to PostgreSQL

### Schema

The `fuel_efficiency` table stores:
- `fipe_code`: Cross-reference to FIPE vehicle (nullable, set in F-03)
- `brand`: Vehicle brand (normalized)
- `model`: Vehicle model (normalized)
- `year`: Model year
- `fuel_type`: gasolina, etanol, flex, diesel, hibrido
- `city_km_l`: City fuel efficiency (km/l)
- `highway_km_l`: Highway fuel efficiency (km/l)
- `efficiency_rating`: Inmetro efficiency rating (A, B, C, etc.)

### Notes

- Full E2E testing requires actual Inmetro spreadsheet data
- The download phase is implemented but requires specific spreadsheet filenames from Inmetro PBE
- For testing with local files, use the `--file` option