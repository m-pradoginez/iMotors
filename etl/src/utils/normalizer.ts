/**
 * Normalization utilities for brand and model names
 * Reused across F-02 (Inmetro) and F-03 (Cross-reference)
 */

export class Normalizer {
  /**
   * Normalize brand name to match FIPE conventions
   */
  static normalizeBrand(brand: string): string {
    // Remove common prefixes/suffixes
    let normalized = brand
      .toUpperCase()
      .trim()
      .replace(/^THE\s+/i, '')
      .replace(/\s+(CORPORATION|INC|LTD|GMBH|SA)$/i, '');

    // Common brand name mappings to FIPE format
    const brandMappings: Record<string, string> = {
      'VW': 'VOLKSWAGEN',
      'MERCEDES': 'MERCEDES-BENZ',
      'CHEVY': 'CHEVROLET',
      'GM': 'CHEVROLET',
      'BMW': 'BMW',
      'AUDI': 'AUDI',
      'FORD': 'FORD',
      'TOYOTA': 'TOYOTA',
      'HONDA': 'HONDA',
      'NISSAN': 'NISSAN',
      'HYUNDAI': 'HYUNDAI',
      'KIA': 'KIA',
      'RENAULT': 'RENAULT',
      'PEUGEOT': 'PEUGEOT',
      'CITROEN': 'CITROËN',
      'FIAT': 'FIAT',
      'JEEP': 'JEEP',
      'LAND ROVER': 'LAND ROVER',
      'VOLVO': 'VOLVO',
      'MAZDA': 'MAZDA',
      'SUBARU': 'SUBARU',
      'MITSUBISHI': 'MITSUBISHI',
      'SUZUKI': 'SUZUKI',
    };

    if (brandMappings[normalized]) {
      normalized = brandMappings[normalized];
    }

    return normalized;
  }

  /**
   * Normalize model name to match FIPE conventions
   */
  static normalizeModel(model: string): string {
    // Normalize model name
    let normalized = model
      .toUpperCase()
      .trim()
      .replace(/\s+/g, ' ') // Multiple spaces to single space
      .replace(/[^\w\s\-\.]/g, '') // Remove special characters except hyphen, period
      .replace(/\s*\-\s*/g, '-') // Normalize hyphens
      .replace(/\s*\.\s*/g, '.'); // Normalize periods

    // Remove common suffixes that might not match FIPE
    normalized = normalized
      .replace(/\s+(EDITION|VERSAO|VERSION|EDICAO)$/i, '')
      .trim();

    return normalized;
  }

  /**
   * Normalize fuel type to standard format
   */
  static normalizeFuelType(fuelType: string): string {
    const normalized = fuelType
      .toUpperCase()
      .trim()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, ''); // Remove accents

    const fuelMappings: Record<string, string> = {
      'GASOLINA': 'GASOLINA',
      'ETANOL': 'ETANOL',
      'FLEX': 'FLEX',
      'DIESEL': 'DIESEL',
      'HIBRIDO': 'HIBRIDO',
      'ELETRICO': 'ELETRICO',
      'GAS': 'GAS',
      'GNV': 'GNV',
    };

    return fuelMappings[normalized] || normalized;
  }

  /**
   * Calculate similarity score between two strings (0-1)
   * Uses Levenshtein distance
   */
  static calculateSimilarity(str1: string, str2: string): number {
    const s1 = str1.toUpperCase().trim();
    const s2 = str2.toUpperCase().trim();

    if (s1 === s2) return 1;
    if (s1.length === 0 || s2.length === 0) return 0;

    const distance = this.levenshteinDistance(s1, s2);
    const maxLength = Math.max(s1.length, s2.length);
    
    return 1 - (distance / maxLength);
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  private static levenshteinDistance(str1: string, str2: string): number {
    const m = str1.length;
    const n = str2.length;
    const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,     // deletion
          dp[i][j - 1] + 1,     // insertion
          dp[i - 1][j - 1] + cost // substitution
        );
      }
    }

    return dp[m][n];
  }
}
