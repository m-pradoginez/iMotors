import { FuelEfficiencyEntry } from '../extractors/inmetroParser';

export interface TransformedFuelEfficiency {
  fipeCode?: string;
  brand: string;
  model: string;
  year: number;
  fuelType: string;
  cityKmL: number;
  highwayKmL: number;
  efficiencyRating: string;
}

export interface TransformResult {
  vehicles: TransformedFuelEfficiency[];
  errors: string[];
}

export class FuelEfficiencyTransformer {
  transform(entries: FuelEfficiencyEntry[]): TransformResult {
    const vehicles: TransformedFuelEfficiency[] = [];
    const errors: string[] = [];

    for (const entry of entries) {
      try {
        const transformed = this.transformEntry(entry);
        vehicles.push(transformed);
      } catch (error) {
        const errorMsg = `Failed to transform entry for ${entry.brand} ${entry.model}: ${error}`;
        errors.push(errorMsg);
        console.warn(`[FuelEfficiencyTransformer] ${errorMsg}`);
      }
    }

    console.log(`[FuelEfficiencyTransformer] Transformed ${vehicles.length} entries from ${entries.length} inputs`);

    return {
      vehicles,
      errors,
    };
  }

  private transformEntry(entry: FuelEfficiencyEntry): TransformedFuelEfficiency {
    // Normalize brand name to match FIPE conventions
    const normalizedBrand = this.normalizeBrand(entry.brand);
    
    // Normalize model name to match FIPE conventions
    const normalizedModel = this.normalizeModel(entry.model);
    
    // Validate required fields
    if (!normalizedBrand || !normalizedModel) {
      throw new Error('Missing required field after normalization');
    }

    // Validate efficiency values
    if (entry.cityKmL <= 0 || entry.highwayKmL <= 0) {
      throw new Error('Invalid efficiency values (must be > 0)');
    }

    return {
      fipeCode: undefined, // Will be set during F-03 cross-reference
      brand: normalizedBrand,
      model: normalizedModel,
      year: entry.year,
      fuelType: entry.fuelType,
      cityKmL: entry.cityKmL,
      highwayKmL: entry.highwayKmL,
      efficiencyRating: entry.efficiencyRating,
    };
  }

  private normalizeBrand(brand: string): string {
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
    };

    if (brandMappings[normalized]) {
      normalized = brandMappings[normalized];
    }

    return normalized;
  }

  private normalizeModel(model: string): string {
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
      .replace(/\s+(EDITION|VERSAO|VERSION)$/i, '')
      .trim();

    return normalized;
  }
}

export const fuelEfficiencyTransformer = new FuelEfficiencyTransformer();
