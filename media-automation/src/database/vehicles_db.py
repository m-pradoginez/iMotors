"""Database manager for updating vehicles table with image URLs."""

import os
import psycopg2
from typing import Optional


class VehiclesDatabase:
    """Manages database updates for vehicle images."""
    
    def __init__(self):
        self.connection = None
        self._connect()
    
    def _connect(self):
        """Connect to the database."""
        db_url = os.getenv("SUPABASE_DB_URL")
        if not db_url:
            raise ValueError("SUPABASE_DB_URL must be set")
        
        self.connection = psycopg2.connect(db_url)
        self.connection.autocommit = True
    
    def update_vehicle_image(self, fipe_code: str, image_url_path: str, 
                            legal_attribution: str, image_source_url: str) -> bool:
        """
        Update a vehicle record with image information.
        
        Args:
            fipe_code: The FIPE code of the vehicle
            image_url_path: Storage path in Supabase Storage
            legal_attribution: Legal attribution text
            image_source_url: Original press room URL
            
        Returns:
            True if update successful, False otherwise
        """
        try:
            cursor = self.connection.cursor()
            
            query = """
                UPDATE vehicles 
                SET 
                    image_url_path = %s,
                    legal_attribution = %s,
                    image_source_url = %s,
                    updated_at = NOW()
                WHERE fipe_code = %s
            """
            
            cursor.execute(query, (image_url_path, legal_attribution, 
                                image_source_url, fipe_code))
            
            if cursor.rowcount > 0:
                print(f"    ✓ Updated {fipe_code}")
                return True
            else:
                print(f"    ⚠ Vehicle not found: {fipe_code}")
                return False
                
        except Exception as e:
            print(f"    ✗ Error updating {fipe_code}: {e}")
            return False
    
    def find_fipe_code_by_brand_model(self, brand: str, model: str, year: int) -> Optional[str]:
        """
        Find FIPE code by brand, model, and year.
        
        Args:
            brand: Vehicle brand
            model: Vehicle model
            year: Vehicle year
            
        Returns:
            FIPE code if found, None otherwise
        """
        try:
            cursor = self.connection.cursor()
            
            query = """
                SELECT fipe_code 
                FROM vehicles 
                WHERE brand = %s AND model = %s AND year = %s
                LIMIT 1
            """
            
            cursor.execute(query, (brand, model, year))
            result = cursor.fetchone()
            
            return result[0] if result else None
            
        except Exception as e:
            print(f"Error finding FIPE code: {e}")
            return None
    
    def close(self):
        """Close the database connection."""
        if self.connection:
            self.connection.close()
