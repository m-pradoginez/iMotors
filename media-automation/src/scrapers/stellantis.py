"""Stellantis press room scraper for Fiat and Jeep brands."""

from typing import List, Dict
from .base_scraper import BaseScraper


class StellantisScraper(BaseScraper):
    """Scraper for Stellantis press room (media.stellantis.com/br-pt/)."""
    
    def __init__(self):
        super().__init__("https://media.stellantis.com")
        self.brands = ['fiat', 'jeep']
    
    def scrape_vehicles(self) -> List[Dict]:
        """Scrape vehicles from Stellantis press room."""
        vehicles = []
        
        for brand in self.brands:
            brand_url = f"{self.base_url}/br-pt/{brand}/"
            print(f"  Scraping {brand.upper()} at {brand_url}")
            
            soup = self.get_page(brand_url)
            if not soup:
                continue
            
            # Find vehicle model pages
            vehicle_links = self._extract_vehicle_links(soup, brand)
            
            for link in vehicle_links:
                vehicle = self._scrape_vehicle_page(link, brand)
                if vehicle:
                    vehicles.append(vehicle)
                    print(f"    Found: {vehicle['model']} {vehicle['year']}")
                
                # Rate limiting
                import time
                time.sleep(0.5)
        
        return vehicles
    
    def _extract_vehicle_links(self, soup, brand: str) -> List[str]:
        """Extract links to vehicle model pages."""
        links = []
        
        # Look for vehicle cards or links
        # This is a placeholder implementation - actual selectors will depend on the page structure
        vehicle_cards = soup.find_all('a', class_=lambda x: x and 'model' in x.lower())
        
        for card in vehicle_cards:
            href = card.get('href')
            if href and not href.startswith('http'):
                href = f"{self.base_url}{href}"
            links.append(href)
        
        return links
    
    def _scrape_vehicle_page(self, url: str, brand: str) -> Dict:
        """Scrape a single vehicle page for details and images."""
        soup = self.get_page(url)
        if not soup:
            return None
        
        # Extract vehicle details
        # This is a placeholder implementation - actual selectors will depend on the page structure
        title = soup.find('h1')
        model = title.text.strip() if title else "Unknown"
        
        # Extract year from title or metadata
        year = self._extract_year(model)
        
        # Extract images
        images = self._extract_images(soup)
        studio_image = self.extract_studio_image(images)
        
        return {
            'brand': self.normalize_brand(brand),
            'model': model,
            'year': year,
            'image_url': studio_image,
            'attribution': 'Foto: Divulgação/Stellantis',
            'fipe_code': None  # Will be matched later
        }
    
    def _extract_year(self, text: str) -> int:
        """Extract year from text."""
        import re
        year_match = re.search(r'\b(20\d{2})\b', text)
        if year_match:
            return int(year_match.group(1))
        return 2024  # Default to current year
    
    def _extract_images(self, soup) -> List[str]:
        """Extract all image URLs from the page."""
        images = []
        
        # Look for high-quality images
        img_tags = soup.find_all('img')
        
        for img in img_tags:
            src = img.get('src') or img.get('data-src')
            if src:
                if not src.startswith('http'):
                    src = f"{self.base_url}{src}"
                # Filter for high-resolution images
                if any(size in src.lower() for size in ['large', 'high', 'original', 'full']):
                    images.append(src)
        
        return images
