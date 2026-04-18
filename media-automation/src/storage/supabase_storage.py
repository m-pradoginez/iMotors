"""Supabase Storage manager for uploading vehicle images."""

import os
from supabase import create_client, Client
from typing import Optional


class SupabaseStorageManager:
    """Manages image uploads to Supabase Storage."""
    
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
    
    def upload_image(self, brand: str, model: str, year: int, image_data: bytes) -> str:
        """
        Upload an image to Supabase Storage.
        
        Args:
            brand: Vehicle brand (e.g., "FIAT", "VW")
            model: Vehicle model (e.g., "Toro", "Golf")
            year: Vehicle year (e.g., 2024)
            image_data: Image bytes data
            
        Returns:
            Storage path for the uploaded image
        """
        # Sanitize model name for filename
        safe_model = model.replace(" ", "-").replace("/", "-")
        filename = f"{brand.lower()}/{safe_model}-{year}.jpg"
        
        try:
            # Upload to Supabase Storage
            self.supabase.storage.from_(self.bucket_name).upload(
                path=filename,
                file=image_data,
                file_options={"content-type": "image/jpeg"}
            )
            
            # Get public URL
            public_url = self.supabase.storage.from_(self.bucket_name).get_public_url(filename)
            
            print(f"  Uploaded: {filename}")
            return filename
            
        except Exception as e:
            print(f"  Error uploading {filename}: {e}")
            raise
    
    def get_public_url(self, storage_path: str) -> str:
        """Get public URL for a storage path."""
        return self.supabase.storage.from_(self.bucket_name).get_public_url(storage_path)
    
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
