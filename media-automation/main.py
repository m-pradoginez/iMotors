#!/usr/bin/env python3
"""
Brazilian Car Media Automation System
Sources high-quality vehicle images from official press rooms and uploads to Supabase Storage.
"""

import os
import sys
from dotenv import load_dotenv
from src.scrapers.stellantis import StellantisScraper
from src.scrapers.vw import VWScraper
from src.scrapers.gm import GMScraper
from src.storage.supabase_storage import SupabaseStorageManager
from src.database.vehicles_db import VehiclesDatabase

load_dotenv()

def main():
    """Main entry point for media automation."""
    print("Starting Brazilian Car Media Automation...")
    
    # Initialize components
    storage_manager = SupabaseStorageManager()
    db_manager = VehiclesDatabase()
    
    # Initialize scrapers
    scrapers = {
        'stellantis': StellantisScraper(),
        'vw': VWScraper(),
        'gm': GMScraper()
    }
    
    # Process each press room
    for brand, scraper in scrapers.items():
        print(f"\nProcessing {brand.upper()} press room...")
        try:
            vehicles = scraper.scrape_vehicles()
            print(f"Found {len(vehicles)} vehicles")
            
            for vehicle in vehicles:
                # Download image
                image_data = scraper.download_image(vehicle['image_url'])
                
                # Upload to Supabase Storage
                storage_path = storage_manager.upload_image(
                    brand=brand,
                    model=vehicle['model'],
                    year=vehicle['year'],
                    image_data=image_data
                )
                
                # Update database
                db_manager.update_vehicle_image(
                    fipe_code=vehicle['fipe_code'],
                    image_url_path=storage_path,
                    legal_attribution=vehicle['attribution'],
                    image_source_url=vehicle['image_url']
                )
                
                print(f"  ✓ {vehicle['brand']} {vehicle['model']} {vehicle['year']}")
                
        except Exception as e:
            print(f"  ✗ Error processing {brand}: {e}")
    
    print("\nMedia automation complete!")

if __name__ == "__main__":
    main()
