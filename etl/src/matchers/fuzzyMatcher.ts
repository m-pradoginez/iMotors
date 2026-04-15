import { Normalizer } from '../utils/normalizer';
import { FipeVehicle, InmetroVehicle, VehicleMatch } from './exactMatcher';

export class FuzzyMatcher {
  private static readonly DEFAULT_CONFIDENCE_THRESHOLD = 0.8;

  /**
   * Match a single Inmetro vehicle against a list of FIPE vehicles using fuzzy matching
   */
  static match(
    inmetroVehicle: InmetroVehicle,
    fipeVehicles: FipeVehicle[],
    confidenceThreshold: number = this.DEFAULT_CONFIDENCE_THRESHOLD
  ): VehicleMatch | null {
    const normalizedInmetro = {
      brand: Normalizer.normalizeBrand(inmetroVehicle.brand),
      model: Normalizer.normalizeModel(inmetroVehicle.model),
      year: inmetroVehicle.year,
      fuelType: Normalizer.normalizeFuelType(inmetroVehicle.fuelType),
    };

    let bestMatch: VehicleMatch | null = null;
    let bestScore = 0;

    for (const fipeVehicle of fipeVehicles) {
      const normalizedFipe = {
        brand: Normalizer.normalizeBrand(fipeVehicle.brand),
        model: Normalizer.normalizeModel(fipeVehicle.model),
        year: fipeVehicle.year,
        fuelType: Normalizer.normalizeFuelType(fipeVehicle.fuelType),
      };

      const score = this.calculateMatchScore(normalizedInmetro, normalizedFipe);

      if (score > bestScore && score >= confidenceThreshold) {
        bestScore = score;
        bestMatch = {
          fipeCode: fipeVehicle.fipeCode,
          inmetroId: inmetroVehicle.id,
          confidence: score,
          matchType: 'fuzzy',
        };
      }
    }

    return bestMatch;
  }

  /**
   * Match all Inmetro vehicles against FIPE vehicles using fuzzy matching
   */
  static matchAll(
    inmetroVehicles: InmetroVehicle[],
    fipeVehicles: FipeVehicle[],
    confidenceThreshold: number = this.DEFAULT_CONFIDENCE_THRESHOLD
  ): VehicleMatch[] {
    const matches: VehicleMatch[] = [];

    for (const inmetroVehicle of inmetroVehicles) {
      const match = this.match(inmetroVehicle, fipeVehicles, confidenceThreshold);
      if (match) {
        matches.push(match);
      }
    }

    return matches;
  }

  /**
   * Calculate match score between two normalized vehicles
   * Uses weighted scoring: brand (30%), model (40%), year (20%), fuel type (10%)
   */
  private static calculateMatchScore(
    v1: { brand: string; model: string; year: number; fuelType: string },
    v2: { brand: string; model: string; year: number; fuelType: string }
  ): number {
    const brandScore = Normalizer.calculateSimilarity(v1.brand, v2.brand);
    const modelScore = Normalizer.calculateSimilarity(v1.model, v2.model);
    const yearScore = v1.year === v2.year ? 1 : 0;
    const fuelScore = Normalizer.calculateSimilarity(v1.fuelType, v2.fuelType);

    // Weighted scoring
    const totalScore = (brandScore * 0.3) + (modelScore * 0.4) + (yearScore * 0.2) + (fuelScore * 0.1);

    return totalScore;
  }

  /**
   * Get match statistics
   */
  static getStats(matches: VehicleMatch[], totalInmetro: number): {
    matched: number;
    unmatched: number;
    matchRate: number;
    averageConfidence: number;
  } {
    const matched = matches.length;
    const unmatched = totalInmetro - matched;
    const matchRate = totalInmetro > 0 ? (matched / totalInmetro) * 100 : 0;
    const averageConfidence = matched > 0
      ? matches.reduce((sum, m) => sum + m.confidence, 0) / matched
      : 0;

    return {
      matched,
      unmatched,
      matchRate,
      averageConfidence,
    };
  }
}
