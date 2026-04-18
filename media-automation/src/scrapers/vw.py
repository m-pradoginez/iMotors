"""VW press room scraper for Volkswagen brand."""

from typing import List, Dict
from .base_scraper import BaseScraper


class VWScraper(BaseScraper):
    """Scraper for VW press room (vwnews.com.br)."""
    
    def __init__(self):
        super().__init__("https://vwnews.com.br")
    
    def scrape_vehicles(self) -> List[Dict]:
        """Scrape vehicles from VW press room."""
        vehicles = []
        
        brand_url = f"{self.base_url}/modelos/"
        print(f"  Scraping VW at {brand_url}")
        
        soup = self.get_page(brand_url)
        if not soup:
            return vehicles
        
        # Find vehicle model pages
        vehicle_links = self._extract_vehicle_links(soup)
        
        for link in vehicle_links:
            vehicle = self._scrape_vehicle_page(link)
            if vehicle:
                vehicles.append(vehicle)
                print(f"    Found: {vehicle['model']} {vehicle['year']}")
            
            # Rate limiting
            import time
            time.sleep(0.5)
        
        return vehicles
    
    def _extract_vehicle_links(self, soup) -> List[str]:
        """Extract links to vehicle model pages."""
        links = []
        
        # Look for vehicle cards or links
        vehicle_cards = soup.find_all('a', class_=lambda x: x and 'modelo' in x.lower())
        
        for card in vehicle_cards:
            href = card.get('href')
            if href and not href.startswith('http'):
                href = f"{self.base_url}{href}"
            links.append(href)
        
        return links
    
    def _scrape_vehicle_page(self, url: str) -> Dict:
        """Scrape a single vehicle page for details and images."""
        soup = self.get_page(url)
        if not soup:
            return None
        
        # Extract vehicle details
        title = soup.find('h1')
        model = title.text.strip() if title else "Unknown"
        
        # Extract year from title or metadata
        year = self._extract_year(model)
        
        # Extract images
        images = self._extract_images(soup)
        studio_image = self.extract_studio_image(images)
        
        return {
            'brand': 'VW',
            'model': model,
            'year': year,
            'image_url': studio_image,
            'attribution': 'Foto: Divulgação/Volkswagen',
            'fipe_code': None
        }
    
    def _extract_year(self, text: str) -> int:
        """Extract year from text."""
        import re
        year_match = re.search(r'\b(20\d{2})\b', text)
        if year_match:
            return int(year_match.group(1))
        return 2024
    
    def _extract_images(self, soup) -> List[str]:
        """Extract all image URLs from the page."""
        images = []
        
        img_tags = soup.find_all('img')
        
        for img in img_tags:
            src = img.get('src') or img.get('data-src')
            if src:
                if not src.startswith('http'):
                    src = f"{self.base_url}{src}"
                if any(size in src.lower() for size in ['large', 'high', 'original', 'full']):
                    images.append(src)
        
        return images
