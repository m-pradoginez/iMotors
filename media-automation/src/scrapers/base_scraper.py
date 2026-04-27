"""Base scraper class for Brazilian car press rooms."""

import requests
from bs4 import BeautifulSoup
from typing import List, Dict, Optional
import time
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager


class BaseScraper:
    """Base class for press room scrapers with Selenium support."""
    
    def __init__(self, base_url: str, use_selenium: bool = True):
        self.base_url = base_url
        self.use_selenium = use_selenium
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        self.driver = None
        
        if self.use_selenium:
            self._init_selenium()
    
    def _init_selenium(self):
        """Initialize Selenium WebDriver in headless mode."""
        chrome_options = Options()
        chrome_options.add_argument('--headless')
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument('--disable-gpu')
        chrome_options.add_argument('--window-size=1920,1080')
        chrome_options.add_argument('user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36')
        
        service = Service(ChromeDriverManager().install())
        self.driver = webdriver.Chrome(service=service, options=chrome_options)
        self.driver.set_page_load_timeout(30)
    
    def get_page(self, url: str) -> Optional[BeautifulSoup]:
        """Fetch and parse a page using Selenium if enabled, otherwise requests."""
        try:
            if self.use_selenium and self.driver:
                return self._get_page_selenium(url)
            else:
                return self._get_page_requests(url)
        except Exception as e:
            print(f"Error fetching {url}: {e}")
            return None
    
    def _get_page_requests(self, url: str) -> Optional[BeautifulSoup]:
        """Fetch page using requests (fallback)."""
        response = self.session.get(url, timeout=10)
        response.raise_for_status()
        return BeautifulSoup(response.content, 'lxml')
    
    def _get_page_selenium(self, url: str) -> Optional[BeautifulSoup]:
        """Fetch page using Selenium with explicit waits."""
        self.driver.get(url)
        
        # Wait for body to be present
        WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.TAG_NAME, 'body'))
        )
        
        # Try to wait for gallery elements if they exist
        try:
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, '.gallery-grid, .image-asset, .gallery, [class*="gallery"]'))
            )
        except:
            # Gallery elements might not exist on all pages
            pass
        
        # Allow time for dynamic content to load
        time.sleep(2)
        
        html = self.driver.page_source
        return BeautifulSoup(html, 'lxml')
    
    def close(self):
        """Close Selenium driver if initialized."""
        if self.driver:
            self.driver.quit()
    
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
