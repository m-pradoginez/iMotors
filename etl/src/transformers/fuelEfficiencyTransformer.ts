import { FuelEfficiencyEntry } from '../extractors/inmetroParser';
import { Normalizer } from '../utils/normalizer';

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
    const normalizedBrand = Normalizer.normalizeBrand(entry.brand);
    
    // Normalize model name to match FIPE conventions
    const normalizedModel = Normalizer.normalizeModel(entry.model);
    
    // Normalize fuel type
    const normalizedFuelType = Normalizer.normalizeFuelType(entry.fuelType);
    
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
      fuelType: normalizedFuelType,
      cityKmL: entry.cityKmL,
      highwayKmL: entry.highwayKmL,
      efficiencyRating: entry.efficiencyRating,
    };
  }
}

export const fuelEfficiencyTransformer = new FuelEfficiencyTransformer();
