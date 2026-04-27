"""Integration tests for Supabase Storage manager."""

import pytest
import os
from src.storage.supabase_storage import SupabaseStorageManager


@pytest.mark.integration
class TestSupabaseStorageIntegration:
    """Integration tests for Supabase Storage (requires real Supabase credentials)."""
    
    @pytest.fixture
    def storage_manager(self):
        """Create a real storage manager instance."""
        # Skip if environment variables not set
        if not all([os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_ROLE_KEY")]):
            pytest.skip("Supabase credentials not set")
        
        return SupabaseStorageManager()
    
    def test_bucket_connection(self, storage_manager):
        """Test that we can connect to the vehicle-media bucket."""
        result = storage_manager.verify_bucket_connection()
        assert result is True
    
    def test_upload_and_delete_test_image(self, storage_manager):
        """Test uploading and deleting a test image."""
        # Create a small test image
        test_data = b"fake_image_data_for_testing"
        
        # Upload
        storage_path = storage_manager.upload_image(
            brand="TEST",
            model="TestModel",
            year=2024,
            image_data=test_data,
            max_retries=3
        )
        
        assert storage_path == "test/testmodel-2024.jpg"
        
        # Get public URL
        public_url = storage_manager.get_public_url(storage_path)
        assert public_url is not None
        assert "vehicle-media" in public_url
        assert "test/testmodel-2024.jpg" in public_url
        
        # Clean up - delete the test file
        try:
            storage_manager.supabase.storage.from_(storage_manager.bucket_name).remove([storage_path])
        except Exception as e:
            # If deletion fails, log but don't fail the test
            print(f"Warning: Could not delete test file: {e}")
    
    def test_unicode_filename_upload(self, storage_manager):
        """Test uploading with Unicode characters in model name."""
        test_data = b"fake_image_data"
        
        # Upload with accented character
        storage_path = storage_manager.upload_image(
            brand="TEST",
            model="Doblò",
            year=2020,
            image_data=test_data,
            max_retries=3
        )
        
        # Should be normalized to ASCII
        assert storage_path == "test/doblo-2020.jpg"
        
        # Clean up
        try:
            storage_manager.supabase.storage.from_(storage_manager.bucket_name).remove([storage_path])
        except Exception as e:
            print(f"Warning: Could not delete test file: {e}")
    
    def test_upsert_existing_file(self, storage_manager):
        """Test that upsert allows re-uploading the same file."""
        test_data = b"fake_image_data"
        
        # Upload first time
        storage_path = storage_manager.upload_image(
            brand="TEST",
            model="UpsertTest",
            year=2024,
            image_data=test_data,
            max_retries=3
        )
        
        # Upload again with different data (should succeed with upsert)
        test_data_v2 = b"fake_image_data_v2"
        storage_path_v2 = storage_manager.upload_image(
            brand="TEST",
            model="UpsertTest",
            year=2024,
            image_data=test_data_v2,
            max_retries=3
        )
        
        assert storage_path == storage_path_v2
        
        # Clean up
        try:
            storage_manager.supabase.storage.from_(storage_manager.bucket_name).remove([storage_path])
        except Exception as e:
            print(f"Warning: Could not delete test file: {e}")


@pytest.mark.integration
class TestScraperIntegration:
    """Integration tests for scrapers (requires network access)."""
    
    def test_stellantis_scraper_fetch(self):
        """Test that Stellantis scraper can fetch a page."""
        from src.scrapers.stellantis import StellantisScraper
        
        scraper = StellantisScraper()
        soup = scraper.get_page("https://media.stellantis.com/br-pt/fiat/")
        
        assert soup is not None
        assert len(soup.find_all('img')) > 0
        
        scraper.close()
    
    def test_vw_scraper_fetch(self):
        """Test that VW scraper can fetch a page."""
        from src.scrapers.vw import VWScraper
        
        scraper = VWScraper()
        soup = scraper.get_page("https://vwnews.com.br/modelos/")
        
        assert soup is not None
        
        scraper.close()
    
    def test_image_extraction(self):
        """Test image extraction from a page."""
        from src.scrapers.stellantis import StellantisScraper
        
        scraper = StellantisScraper()
        soup = scraper.get_page("https://media.stellantis.com/br-pt/fiat/")
        
        images = scraper._extract_images(soup)
        
        # Should find some images
        assert len(images) > 0
        
        # Images should be valid URLs
        for img in images:
            assert img.startswith("http")
        
        scraper.close()
