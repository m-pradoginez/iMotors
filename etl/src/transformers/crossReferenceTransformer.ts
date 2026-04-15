import { FipeVehicle, InmetroVehicle, VehicleMatch } from '../matchers/exactMatcher';

export interface UnifiedVehicle {
  fipeCode: string;
  brand: string;
  model: string;
  year: number;
  fuelType: string;
  price?: number;
  cityKmL?: number;
  highwayKmL?: number;
  efficiencyRating?: string;
  matchConfidence: 'exact' | 'fuzzy' | 'manual';
  matchNotes?: string;
}

export interface TransformResult {
  vehicles: UnifiedVehicle[];
  fipeOnly: FipeVehicle[];
  inmetroOnly: InmetroVehicle[];
  errors: string[];
}

export class CrossReferenceTransformer {
  /**
   * Transform matched and unmatched vehicles into unified format
   */
  transform(
    fipeVehicles: FipeVehicle[],
    inmetroVehicles: InmetroVehicle[],
    matches: VehicleMatch[]
  ): TransformResult {
    const vehicles: UnifiedVehicle[] = [];
    const errors: string[] = [];

    // Create lookup maps
    const fipeMap = new Map(fipeVehicles.map(v => [v.fipeCode, v]));
    const inmetroMap = new Map(inmetroVehicles.map(v => [v.id, v]));

    // Process matches
    for (const match of matches) {
      try {
        const fipeVehicle = fipeMap.get(match.fipeCode);
        const inmetroVehicle = match.inmetroId ? inmetroMap.get(match.inmetroId) : undefined;

        if (!fipeVehicle) {
          throw new Error(`FIPE vehicle not found for fipeCode: ${match.fipeCode}`);
        }

        const unified = this.combineMatched(fipeVehicle, inmetroVehicle, match);
        vehicles.push(unified);
      } catch (error) {
        const errorMsg = `Failed to transform match for fipeCode ${match.fipeCode}: ${error}`;
        errors.push(errorMsg);
        console.warn(`[CrossReferenceTransformer] ${errorMsg}`);
      }
    }

    // Find FIPE-only vehicles (no match)
    const matchedFipeCodes = new Set(matches.map(m => m.fipeCode));
    const fipeOnly = fipeVehicles.filter(v => !matchedFipeCodes.has(v.fipeCode));

    // Find Inmetro-only vehicles (no match)
    const matchedInmetroIds = new Set(matches.map(m => m.inmetroId).filter((id): id is number => id !== undefined));
    const inmetroOnly = inmetroVehicles.filter(v => v.id !== undefined && !matchedInmetroIds.has(v.id));

    console.log(
      `[CrossReferenceTransformer] Transformed ${vehicles.length} matched vehicles, ` +
      `${fipeOnly.length} FIPE-only, ${inmetroOnly.length} Inmetro-only`
    );

    return {
      vehicles,
      fipeOnly,
      inmetroOnly,
      errors,
    };
  }

  /**
   * Combine FIPE and Inmetro data for matched vehicles
   */
  private combineMatched(
    fipeVehicle: FipeVehicle,
    inmetroVehicle: InmetroVehicle | undefined,
    match: VehicleMatch
  ): UnifiedVehicle {
    const unified: UnifiedVehicle = {
      fipeCode: fipeVehicle.fipeCode,
      brand: fipeVehicle.brand,
      model: fipeVehicle.model,
      year: fipeVehicle.year,
      fuelType: fipeVehicle.fuelType,
      price: fipeVehicle.price,
      matchConfidence: match.matchType,
    };

    if (inmetroVehicle) {
      unified.cityKmL = inmetroVehicle.cityKmL;
      unified.highwayKmL = inmetroVehicle.highwayKmL;
      unified.efficiencyRating = inmetroVehicle.efficiencyRating;
    }

    return unified;
  }

  /**
   * Transform FIPE-only vehicles (no efficiency data)
   */
  transformFipeOnly(fipeVehicles: FipeVehicle[]): UnifiedVehicle[] {
    return fipeVehicles.map(v => ({
      fipeCode: v.fipeCode,
      brand: v.brand,
      model: v.model,
      year: v.year,
      fuelType: v.fuelType,
      price: v.price,
      matchConfidence: 'manual' as const,
      matchNotes: 'No Inmetro match',
    }));
  }

  /**
   * Transform Inmetro-only vehicles (no price data)
   */
  transformInmetroOnly(inmetroVehicles: InmetroVehicle[]): UnifiedVehicle[] {
    return inmetroVehicles.map(v => ({
      fipeCode: '',
      brand: v.brand,
      model: v.model,
      year: v.year,
      fuelType: v.fuelType,
      cityKmL: v.cityKmL,
      highwayKmL: v.highwayKmL,
      efficiencyRating: v.efficiencyRating,
      matchConfidence: 'manual' as const,
      matchNotes: 'No FIPE match',
    }));
  }
}

export const crossReferenceTransformer = new CrossReferenceTransformer();
