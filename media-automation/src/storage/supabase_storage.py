"""Supabase Storage manager for uploading vehicle images."""

import os
import unicodedata
from pathlib import Path
from supabase import create_client, Client
from typing import Optional
import time


class SupabaseStorageManager:
    """Manages image uploads to Supabase Storage with retry logic."""
    
    def __init__(self):
        self.bucket_name = "vehicle-media"
        self.supabase: Optional[Client] = None
        self._initialize_client()
    
    def _initialize_client(self):
        """Initialize Supabase client."""
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        
        if not supabase_url or not supabase_key:
            raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set")
        
        self.supabase = create_client(supabase_url, supabase_key)
    
    def _sanitize_filename(self, brand: str, model: str, year: int) -> str:
        """
        Sanitize filename using pathlib to remove illegal characters and spaces.
        Normalizes Unicode characters to ASCII (e.g., Doblò -> Doblo).
        
        Args:
            brand: Vehicle brand (e.g., "FIAT", "VW")
            model: Vehicle model (e.g., "Toro", "Golf")
            year: Vehicle year (e.g., 2024)
            
        Returns:
            Sanitized storage path
        """
        # Normalize Unicode to ASCII (remove accents)
        safe_brand = unicodedata.normalize('NFKD', brand.lower()).encode('ascii', 'ignore').decode('ascii')
        safe_model = unicodedata.normalize('NFKD', model).encode('ascii', 'ignore').decode('ascii')
        
        # Use pathlib to sanitize the filename
        safe_brand = Path(safe_brand).name
        safe_model = Path(safe_model).name
        safe_model = safe_model.replace(" ", "-").replace("/", "-").replace("\\", "-")
        safe_model = ''.join(c for c in safe_model if c.isalnum() or c in '-_')
        
        return f"{safe_brand}/{safe_model}-{year}.jpg"
    
    def upload_image(self, brand: str, model: str, year: int, image_data: bytes, max_retries: int = 3) -> str:
        """
        Upload an image to Supabase Storage with retry logic and upsert support.
        
        Args:
            brand: Vehicle brand (e.g., "FIAT", "VW")
            model: Vehicle model (e.g., "Toro", "Golf")
            year: Vehicle year (e.g., 2024)
            image_data: Image bytes data
            max_retries: Maximum number of retry attempts
            
        Returns:
            Storage path for the uploaded image
        """
        filename = self._sanitize_filename(brand, model, year)
        
        for attempt in range(max_retries):
            try:
                # Upload to Supabase Storage with upsert option
                self.supabase.storage.from_(self.bucket_name).upload(
                    path=filename,
                    file=image_data,
                    file_options={
                        "content-type": "image/jpeg",
                        "upsert": "true"  # Enable upsert to prevent 409 errors
                    }
                )
                
                print(f"  ✓ Uploaded: {filename}")
                return filename
                
            except Exception as e:
                if attempt < max_retries - 1:
                    wait_time = 2 ** attempt  # Exponential backoff
                    print(f"  ⚠ Upload attempt {attempt + 1} failed for {filename}: {e}")
                    print(f"  Retrying in {wait_time} seconds...")
                    time.sleep(wait_time)
                else:
                    print(f"  ✗ Error uploading {filename} after {max_retries} attempts: {e}")
                    raise
    
    def get_public_url(self, storage_path: str) -> str:
        """Get public URL for a storage path."""
        return self.supabase.storage.from_(self.bucket_name).get_public_url(storage_path)
    
    def verify_bucket_connection(self) -> bool:
        """
        Verify connection to the vehicle-media bucket.
        
        Returns:
            True if connection successful, False otherwise
        """
        try:
            print(f"Verifying connection to bucket: {self.bucket_name}")
            
            # List buckets to check if our bucket exists
            buckets = self.supabase.storage.list_buckets()
            bucket_names = [b.name for b in buckets]
            
            if self.bucket_name not in bucket_names:
                print(f"  ✗ Bucket '{self.bucket_name}' not found")
                return False
            
            # Try to list files in the bucket to verify access
            files = self.supabase.storage.from_(self.bucket_name).list()
            print(f"  ✓ Bucket connection verified (found {len(files)} files)")
            return True
            
        except Exception as e:
            print(f"  ✗ Bucket connection failed: {e}")
            return False
    
    def create_bucket_if_not_exists(self):
        """Create the vehicle-media bucket if it doesn't exist."""
        try:
            # Check if bucket exists
            buckets = self.supabase.storage.list_buckets()
            bucket_names = [b.name for b in buckets]
            
            if self.bucket_name not in bucket_names:
                print(f"Creating bucket: {self.bucket_name}")
                self.supabase.storage.create_bucket(
                    id=self.bucket_name,
                    options={"public": True}
                )
                print(f"  ✓ Bucket created with public access")
            else:
                print(f"  ✓ Bucket already exists")
                
        except Exception as e:
            print(f"Error creating bucket: {e}")
