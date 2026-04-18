"""Base scraper class for Brazilian car press rooms."""

import requests
from bs4 import BeautifulSoup
from typing import List, Dict, Optional
import time


class BaseScraper:
    """Base class for press room scrapers."""
    
    def __init__(self, base_url: str):
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
    
    def get_page(self, url: str) -> Optional[BeautifulSoup]:
        """Fetch and parse a page."""
        try:
            response = self.session.get(url, timeout=10)
            response.raise_for_status()
            return BeautifulSoup(response.content, 'lxml')
        except Exception as e:
            print(f"Error fetching {url}: {e}")
            return None
    
    def scrape_vehicles(self) -> List[Dict]:
        """Scrape vehicles from the press room. Override in subclasses."""
        raise NotImplementedError("Subclasses must implement scrape_vehicles")
    
    def download_image(self, image_url: str) -> Optional[bytes]:
        """Download an image from the given URL."""
        try:
            response = self.session.get(image_url, timeout=10)
            response.raise_for_status()
            return response.content
        except Exception as e:
            print(f"Error downloading image {image_url}: {e}")
            return None
    
    def extract_studio_image(self, images: List[str]) -> Optional[str]:
        """Extract the highest quality studio image from a list of image URLs."""
        if not images:
            return None
        
        # Prioritize images with 'studio', 'high-res', or similar keywords
        studio_keywords = ['studio', 'studio_', 'high-res', 'highres', 'press']
        
        for img in images:
            img_lower = img.lower()
            if any(keyword in img_lower for keyword in studio_keywords):
                return img
        
        # Return the first image if no studio image found
        return images[0]
    
    def normalize_brand(self, brand: str) -> str:
        """Normalize brand name to match database format."""
        brand_map = {
            'fiat': 'FIAT',
            'jeep': 'JEEP',
            'volkswagen': 'VW',
            'vw': 'VW',
            'chevrolet': 'CHEVROLET',
            'gm': 'CHEVROLET'
        }
        return brand_map.get(brand.lower(), brand.upper())
