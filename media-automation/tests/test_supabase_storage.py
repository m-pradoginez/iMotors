"""Unit tests for Supabase Storage manager."""

import pytest
from unittest.mock import Mock, patch, MagicMock
from src.storage.supabase_storage import SupabaseStorageManager


class TestFilenameSanitization:
    """Tests for filename sanitization with Unicode characters."""
    
    @pytest.fixture
    def storage_manager(self):
        """Create a storage manager instance with mocked Supabase client."""
        manager = SupabaseStorageManager.__new__(SupabaseStorageManager)
        manager.supabase = Mock()
        manager.bucket_name = "vehicle-media"
        return manager
    
    def test_sanitize_basic_filename(self, storage_manager):
        """Test basic filename sanitization."""
        result = storage_manager._sanitize_filename("FIAT", "Toro", 2024)
        assert result == "fiat/Toro-2024.jpg"
    
    def test_sanitize_with_spaces(self, storage_manager):
        """Test sanitization with spaces."""
        result = storage_manager._sanitize_filename("FIAT", "Fiat Toro", 2024)
        assert result == "fiat/Fiat-Toro-2024.jpg"
    
    def test_sanitize_with_slashes(self, storage_manager):
        """Test sanitization with slashes."""
        result = storage_manager._sanitize_filename("FIAT", "Toro/2024", 2024)
        assert result == "fiat/2024-2024.jpg"
    
    def test_sanitize_with_backslashes(self, storage_manager):
        """Test sanitization with backslashes."""
        result = storage_manager._sanitize_filename("FIAT", "Toro\\2024", 2024)
        assert result == "fiat/2024-2024.jpg"
    
    def test_sanitize_unicode_accented(self, storage_manager):
        """Test Unicode normalization for accented characters."""
        result = storage_manager._sanitize_filename("FIAT", "Doblò", 2020)
        assert result == "fiat/Doblo-2020.jpg"
    
    def test_sanitize_unicode_cedilla(self, storage_manager):
        """Test Unicode normalization for cedilla."""
        result = storage_manager._sanitize_filename("FIAT", "Fiorino", 2024)
        assert result == "fiat/Fiorino-2024.jpg"
    
    def test_sanitize_unicode_multiple_accents(self, storage_manager):
        """Test Unicode normalization with multiple accented characters."""
        result = storage_manager._sanitize_filename("FIAT", "Novo Stradá", 2025)
        assert result == "fiat/Novo-Strada-2025.jpg"
    
    def test_sanitize_special_characters(self, storage_manager):
        """Test sanitization removes special characters."""
        result = storage_manager._sanitize_filename("FIAT", "Toro@#$%", 2024)
        assert result == "fiat/Toro-2024.jpg"
    
    def test_sanitize_preserves_hyphens_and_underscores(self, storage_manager):
        """Test that hyphens and underscores are preserved."""
        result = storage_manager._sanitize_filename("FIAT", "Toro-2024_MY", 2024)
        assert result == "fiat/Toro-2024_MY-2024.jpg"
    
    def test_sanitize_brand_lowercase(self, storage_manager):
        """Test that brand is converted to lowercase."""
        result = storage_manager._sanitize_filename("VOLKSWAGEN", "Golf", 2024)
        assert result == "volkswagen/Golf-2024.jpg"


class TestUploadRetryLogic:
    """Tests for Supabase upload retry logic with mocks."""
    
    @pytest.fixture
    def storage_manager(self):
        """Create a storage manager with mocked Supabase client."""
        manager = SupabaseStorageManager.__new__(SupabaseStorageManager)
        manager.supabase = Mock()
        manager.bucket_name = "vehicle-media"
        return manager
    
    def test_upload_success_on_first_attempt(self, storage_manager):
        """Test successful upload on first attempt."""
        mock_storage = Mock()
        mock_storage.upload.return_value = None
        storage_manager.supabase.storage.from_.return_value = mock_storage
        
        result = storage_manager.upload_image("FIAT", "Toro", 2024, b"fake_image_data")
        
        assert result == "fiat/Toro-2024.jpg"
        assert mock_storage.upload.call_count == 1
    
    def test_upload_retry_on_failure(self, storage_manager):
        """Test retry logic on upload failure."""
        mock_storage = Mock()
        mock_storage.upload.side_effect = [Exception("Network error"), None]
        storage_manager.supabase.storage.from_.return_value = mock_storage
        
        result = storage_manager.upload_image("FIAT", "Toro", 2024, b"fake_image_data", max_retries=2)
        
        assert result == "fiat/Toro-2024.jpg"
        assert mock_storage.upload.call_count == 2
    
    def test_upload_exhausts_retries(self, storage_manager):
        """Test that upload fails after exhausting retries."""
        mock_storage = Mock()
        mock_storage.upload.side_effect = Exception("Network error")
        storage_manager.supabase.storage.from_.return_value = mock_storage
        
        with pytest.raises(Exception, match="Network error"):
            storage_manager.upload_image("FIAT", "Toro", 2024, b"fake_image_data", max_retries=3)
        
        assert mock_storage.upload.call_count == 3
    
    def test_upload_with_upsert_option(self, storage_manager):
        """Test that upload includes upsert option."""
        mock_storage = Mock()
        mock_storage.upload.return_value = None
        storage_manager.supabase.storage.from_.return_value = mock_storage
        
        storage_manager.upload_image("FIAT", "Toro", 2024, b"fake_image_data")
        
        call_args = mock_storage.upload.call_args
        assert call_args[1]['file_options']['upsert'] == "true"
        assert call_args[1]['file_options']['content-type'] == "image/jpeg"
    
    def test_upload_exponential_backoff(self, storage_manager):
        """Test exponential backoff between retries."""
        mock_storage = Mock()
        mock_storage.upload.side_effect = [Exception("Error 1"), Exception("Error 2"), None]
        storage_manager.supabase.storage.from_.return_value = mock_storage
        
        with patch('time.sleep') as mock_sleep:
            storage_manager.upload_image("FIAT", "Toro", 2024, b"fake_image_data", max_retries=3)
            
            # Check exponential backoff: 2^0 = 1, 2^1 = 2
            assert mock_sleep.call_args_list[0][0][0] == 1
            assert mock_sleep.call_args_list[1][0][0] == 2


class TestBucketVerification:
    """Tests for bucket connection verification."""
    
    @pytest.fixture
    def storage_manager(self):
        """Create a storage manager with mocked Supabase client."""
        manager = SupabaseStorageManager.__new__(SupabaseStorageManager)
        manager.supabase = Mock()
        manager.bucket_name = "vehicle-media"
        return manager
    
    def test_verify_bucket_success(self, storage_manager):
        """Test successful bucket verification."""
        mock_bucket = Mock()
        mock_bucket.name = "vehicle-media"
        storage_manager.supabase.storage.list_buckets.return_value = [mock_bucket]
        storage_manager.supabase.storage.from_.return_value.list.return_value = []
        
        result = storage_manager.verify_bucket_connection()
        
        assert result is True
    
    def test_verify_bucket_not_found(self, storage_manager):
        """Test bucket verification when bucket doesn't exist."""
        storage_manager.supabase.storage.list_buckets.return_value = [
            Mock(name="other-bucket")
        ]
        
        result = storage_manager.verify_bucket_connection()
        
        assert result is False
    
    def test_verify_bucket_connection_error(self, storage_manager):
        """Test bucket verification on connection error."""
        storage_manager.supabase.storage.list_buckets.side_effect = Exception("Connection error")
        
        result = storage_manager.verify_bucket_connection()
        
        assert result is False
