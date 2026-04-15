import { FuzzyMatcher } from './fuzzyMatcher';
import { FipeVehicle, InmetroVehicle } from './exactMatcher';

describe('FuzzyMatcher', () => {
  describe('match', () => {
    it('should match vehicles with similar brand, model, year, and fuel type', () => {
      const inmetroVehicle: InmetroVehicle = {
        id: 1,
        brand: 'TOYOTA',
        model: 'COROLLA',
        year: 2023,
        fuelType: 'gasolina',
        cityKmL: 12.5,
        highwayKmL: 15.2,
        efficiencyRating: 'A',
      };

      const fipeVehicles: FipeVehicle[] = [
        {
          fipeCode: '001001-0',
          brand: 'TOYOTA',
          model: 'COROLLA',
          year: 2023,
          fuelType: 'gasolina',
          price: 120000,
        },
      ];

      const match = FuzzyMatcher.match(inmetroVehicle, fipeVehicles);

      expect(match).not.toBeNull();
      expect(match?.fipeCode).toBe('001001-0');
      expect(match?.confidence).toBeCloseTo(1.0);
      expect(match?.matchType).toBe('fuzzy');
    });

    it('should match vehicles with similar model names (typo tolerance)', () => {
      const inmetroVehicle: InmetroVehicle = {
        id: 1,
        brand: 'TOYOTA',
        model: 'COROLA', // Typo: missing one L
        year: 2023,
        fuelType: 'gasolina',
        cityKmL: 12.5,
        highwayKmL: 15.2,
        efficiencyRating: 'A',
      };

      const fipeVehicles: FipeVehicle[] = [
        {
          fipeCode: '001001-0',
          brand: 'TOYOTA',
          model: 'COROLLA',
          year: 2023,
          fuelType: 'gasolina',
          price: 120000,
        },
      ];

      const match = FuzzyMatcher.match(inmetroVehicle, fipeVehicles);

      expect(match).not.toBeNull();
      expect(match?.fipeCode).toBe('001001-0');
      expect(match?.confidence).toBeGreaterThan(0.8);
      expect(match?.matchType).toBe('fuzzy');
    });

    it('should not match vehicles with low similarity below threshold', () => {
      const inmetroVehicle: InmetroVehicle = {
        id: 1,
        brand: 'TOYOTA',
        model: 'COROLLA',
        year: 2023,
        fuelType: 'gasolina',
        cityKmL: 12.5,
        highwayKmL: 15.2,
        efficiencyRating: 'A',
      };

      const fipeVehicles: FipeVehicle[] = [
        {
          fipeCode: '001001-0',
          brand: 'HONDA',
          model: 'CIVIC',
          year: 2023,
          fuelType: 'gasolina',
          price: 110000,
        },
      ];

      const match = FuzzyMatcher.match(inmetroVehicle, fipeVehicles);

      expect(match).toBeNull();
    });

    it('should use custom confidence threshold', () => {
      const inmetroVehicle: InmetroVehicle = {
        id: 1,
        brand: 'TOYOTA',
        model: 'COROLA', // Typo
        year: 2023,
        fuelType: 'gasolina',
        cityKmL: 12.5,
        highwayKmL: 15.2,
        efficiencyRating: 'A',
      };

      const fipeVehicles: FipeVehicle[] = [
        {
          fipeCode: '001001-0',
          brand: 'TOYOTA',
          model: 'COROLLA',
          year: 2023,
          fuelType: 'gasolina',
          price: 120000,
        },
      ];

      const match = FuzzyMatcher.match(inmetroVehicle, fipeVehicles, 0.95);

      expect(match).toBeNull(); // Should not match with high threshold
    });

    it('should handle empty FIPE vehicle list', () => {
      const inmetroVehicle: InmetroVehicle = {
        id: 1,
        brand: 'TOYOTA',
        model: 'COROLLA',
        year: 2023,
        fuelType: 'gasolina',
        cityKmL: 12.5,
        highwayKmL: 15.2,
        efficiencyRating: 'A',
      };

      const match = FuzzyMatcher.match(inmetroVehicle, []);

      expect(match).toBeNull();
    });
  });

  describe('matchAll', () => {
    it('should match all vehicles that meet threshold', () => {
      const inmetroVehicles: InmetroVehicle[] = [
        {
          id: 1,
          brand: 'TOYOTA',
          model: 'COROLLA',
          year: 2023,
          fuelType: 'gasolina',
          cityKmL: 12.5,
          highwayKmL: 15.2,
          efficiencyRating: 'A',
        },
        {
          id: 2,
          brand: 'HONDA',
          model: 'CIVIC',
          year: 2023,
          fuelType: 'gasolina',
          cityKmL: 10.0,
          highwayKmL: 13.5,
          efficiencyRating: 'B',
        },
      ];

      const fipeVehicles: FipeVehicle[] = [
        {
          fipeCode: '001001-0',
          brand: 'TOYOTA',
          model: 'COROLLA',
          year: 2023,
          fuelType: 'gasolina',
          price: 120000,
        },
        {
          fipeCode: '002002-0',
          brand: 'HONDA',
          model: 'CIVIC',
          year: 2023,
          fuelType: 'gasolina',
          price: 110000,
        },
      ];

      const matches = FuzzyMatcher.matchAll(inmetroVehicles, fipeVehicles);

      expect(matches).toHaveLength(2);
    });

    it('should only return matches above threshold', () => {
      const inmetroVehicles: InmetroVehicle[] = [
        {
          id: 1,
          brand: 'TOYOTA',
          model: 'COROLLA',
          year: 2023,
          fuelType: 'gasolina',
          cityKmL: 12.5,
          highwayKmL: 15.2,
          efficiencyRating: 'A',
        },
        {
          id: 2,
          brand: 'NISSAN',
          model: 'LEAF',
          year: 2023,
          fuelType: 'eletrico',
          cityKmL: 15.0,
          highwayKmL: 18.0,
          efficiencyRating: 'A',
        },
      ];

      const fipeVehicles: FipeVehicle[] = [
        {
          fipeCode: '001001-0',
          brand: 'TOYOTA',
          model: 'COROLLA',
          year: 2023,
          fuelType: 'gasolina',
          price: 120000,
        },
      ];

      const matches = FuzzyMatcher.matchAll(inmetroVehicles, fipeVehicles);

      expect(matches).toHaveLength(1);
      expect(matches[0].fipeCode).toBe('001001-0');
    });
  });

  describe('getStats', () => {
    it('should calculate match statistics including average confidence', () => {
      const matches = [
        { fipeCode: '001001-0', confidence: 0.95, matchType: 'fuzzy' as const },
        { fipeCode: '002002-0', confidence: 0.85, matchType: 'fuzzy' as const },
      ];

      const stats = FuzzyMatcher.getStats(matches, 10);

      expect(stats.matched).toBe(2);
      expect(stats.unmatched).toBe(8);
      expect(stats.matchRate).toBe(20);
      expect(stats.averageConfidence).toBeCloseTo(0.9);
    });

    it('should handle zero matches', () => {
      const matches: any[] = [];

      const stats = FuzzyMatcher.getStats(matches, 10);

      expect(stats.matched).toBe(0);
      expect(stats.unmatched).toBe(10);
      expect(stats.matchRate).toBe(0);
      expect(stats.averageConfidence).toBe(0);
    });

    it('should handle zero total vehicles', () => {
      const matches: any[] = [];

      const stats = FuzzyMatcher.getStats(matches, 0);

      expect(stats.matched).toBe(0);
      expect(stats.unmatched).toBe(0);
      expect(stats.matchRate).toBe(0);
      expect(stats.averageConfidence).toBe(0);
    });
  });
});
