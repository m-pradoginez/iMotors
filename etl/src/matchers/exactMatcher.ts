import { Normalizer } from '../utils/normalizer';

export interface VehicleMatch {
  fipeCode: string;
  inmetroId?: number;
  confidence: number;
  matchType: 'exact' | 'fuzzy' | 'manual';
}

export interface FipeVehicle {
  fipeCode: string;
  brand: string;
  model: string;
  year: number;
  fuelType: string;
  price?: number;
}

export interface InmetroVehicle {
  id?: number;
  brand: string;
  model: string;
  year: number;
  fuelType: string;
  cityKmL: number;
  highwayKmL: number;
  efficiencyRating: string;
}

export class ExactMatcher {
  /**
   * Match a single Inmetro vehicle against a list of FIPE vehicles using exact criteria
   */
  static match(inmetroVehicle: InmetroVehicle, fipeVehicles: FipeVehicle[]): VehicleMatch | null {
    const normalizedInmetro = {
      brand: Normalizer.normalizeBrand(inmetroVehicle.brand),
      model: Normalizer.normalizeModel(inmetroVehicle.model),
      year: inmetroVehicle.year,
      fuelType: Normalizer.normalizeFuelType(inmetroVehicle.fuelType),
    };

    for (const fipeVehicle of fipeVehicles) {
      const normalizedFipe = {
        brand: Normalizer.normalizeBrand(fipeVehicle.brand),
        model: Normalizer.normalizeModel(fipeVehicle.model),
        year: fipeVehicle.year,
        fuelType: Normalizer.normalizeFuelType(fipeVehicle.fuelType),
      };

      if (this.isExactMatch(normalizedInmetro, normalizedFipe)) {
        return {
          fipeCode: fipeVehicle.fipeCode,
          inmetroId: inmetroVehicle.id,
          confidence: 1.0,
          matchType: 'exact',
        };
      }
    }

    return null;
  }

  /**
   * Match all Inmetro vehicles against FIPE vehicles
   */
  static matchAll(inmetroVehicles: InmetroVehicle[], fipeVehicles: FipeVehicle[]): VehicleMatch[] {
    const matches: VehicleMatch[] = [];

    for (const inmetroVehicle of inmetroVehicles) {
      const match = this.match(inmetroVehicle, fipeVehicles);
      if (match) {
        matches.push(match);
      }
    }

    return matches;
  }

  /**
   * Check if two normalized vehicles are an exact match
   */
  private static isExactMatch(v1: { brand: string; model: string; year: number; fuelType: string }, v2: { brand: string; model: string; year: number; fuelType: string }): boolean {
    return (
      v1.brand === v2.brand &&
      v1.model === v2.model &&
      v1.year === v2.year &&
      v1.fuelType === v2.fuelType
    );
  }

  /**
   * Get match statistics
   */
  static getStats(matches: VehicleMatch[], totalInmetro: number): {
    matched: number;
    unmatched: number;
    matchRate: number;
  } {
    const matched = matches.length;
    const unmatched = totalInmetro - matched;
    const matchRate = totalInmetro > 0 ? (matched / totalInmetro) * 100 : 0;

    return {
      matched,
      unmatched,
      matchRate,
    };
  }
}
