"""Scrapers module for Brazilian car press rooms."""

from .base_scraper import BaseScraper
from .stellantis import StellantisScraper
from .vw import VWScraper
from .gm import GMScraper

__all__ = ['BaseScraper', 'StellantisScraper', 'VWScraper', 'GMScraper']
