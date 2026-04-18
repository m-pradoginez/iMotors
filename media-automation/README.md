# Brazilian Car Media Automation

Automated system for sourcing high-quality vehicle images from Brazilian press rooms and uploading to Supabase Storage.

## Overview

This Python-based automation system scrapes vehicle images from official Brazilian press rooms (Stellantis, VW, GM) and uploads them to Supabase Storage for use in the iMotors application.

## Features

- **Multi-brand Support**: Scrapes from Stellantis (Fiat/Jeep), Volkswagen, and Chevrolet press rooms
- **High-Quality Images**: Prioritizes studio shots and high-resolution press assets
- **Supabase Integration**: Uploads directly to Supabase Storage with public access
- **Database Updates**: Automatically updates the vehicles table with image references
- **Legal Compliance**: Maintains proper attribution for all sourced images

## Setup

### Prerequisites

- Python 3.9+
- Supabase project with Storage enabled
- Environment variables configured

### Installation

```bash
cd media-automation
pip install -r requirements.txt
```

### Environment Variables

Create a `.env` file in the project root:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_DB_URL=your_database_connection_string
```

### Supabase Setup

1. Create a Storage bucket named `vehicle-media` with public access enabled
2. Ensure your service role key has Storage permissions

## Usage

### Run Full Automation

```bash
python main.py
```

This will:
1. Scrape all press rooms for vehicle images
2. Download high-quality images
3. Upload to Supabase Storage
4. Update the vehicles table with image references

### Individual Brand Scraping

You can also run scrapers individually by importing them in Python:

```python
from src.scrapers.stellantis import StellantisScraper

scraper = StellantisScraper()
vehicles = scraper.scrape_vehicles()
```

## Architecture

### Scrapers

- `BaseScraper`: Abstract base class with common scraping functionality
- `StellantisScraper`: Scrapes media.stellantis.com/br-pt/
- `VWScraper`: Scrapes vwnews.com.br
- `GMScraper`: Scrapes media.chevrolet.com.br

### Storage

- `SupabaseStorageManager`: Handles image uploads to Supabase Storage

### Database

- `VehiclesDatabase`: Updates the vehicles table with image references

## Image Quality

The system prioritizes:
- Studio shots (labeled as "studio" or similar)
- High-resolution images (marked as "high-res", "original", or "full")
- Official press assets from manufacturer press rooms

## Legal Compliance

All images are sourced with proper attribution:
- Stellantis: "Foto: Divulgação/Stellantis"
- VW: "Foto: Divulgação/Volkswagen"
- Chevrolet: "Foto: Divulgação/Chevrolet"

## Rate Limiting

The system includes rate limiting to avoid overwhelming press room servers:
- 0.5 second delay between page requests
- Respects robots.txt (to be implemented)

## Troubleshooting

### Connection Errors

Ensure your environment variables are set correctly:
```bash
echo $SUPABASE_URL
echo $SUPABASE_SERVICE_ROLE_KEY
echo $SUPABASE_DB_URL
```

### Bucket Not Found

Run the bucket creation script:
```python
from src.storage.supabase_storage import SupabaseStorageManager

manager = SupabaseStorageManager()
manager.create_bucket_if_not_exists()
```

### Scraper Failures

Press room websites may change structure. Update the selectors in the respective scraper files if scraping fails.

## Future Enhancements

- [ ] Add Selenium for dynamic content scraping
- [ ] Implement robots.txt checking
- [ ] Add retry logic for failed requests
- [ ] Support for additional brands (Toyota, Honda, etc.)
- [ ] Image deduplication
- [ ] Scheduled runs via cron or GitHub Actions
