import { FuelEfficiencyTransformer } from './fuelEfficiencyTransformer';
import { FuelEfficiencyEntry } from '../extractors/inmetroParser';

describe('FuelEfficiencyTransformer', () => {
  let transformer: FuelEfficiencyTransformer;

  beforeEach(() => {
    transformer = new FuelEfficiencyTransformer();
  });

  describe('transform', () => {
    it('should transform entries successfully', () => {
      const entries: FuelEfficiencyEntry[] = [
        {
          brand: 'Toyota',
          model: 'Corolla',
          year: 2023,
          fuelType: 'gasolina',
          cityKmL: 12.5,
          highwayKmL: 15.2,
          efficiencyRating: 'A',
        },
        {
          brand: 'Honda',
          model: 'Civic',
          year: 2023,
          fuelType: 'flex',
          cityKmL: 10.0,
          highwayKmL: 13.5,
          efficiencyRating: 'B',
        },
      ];

      const result = transformer.transform(entries);

      expect(result.vehicles).toHaveLength(2);
      expect(result.errors).toHaveLength(0);
      expect(result.vehicles[0].brand).toBe('TOYOTA');
      expect(result.vehicles[0].model).toBe('COROLLA');
    });

    it('should normalize brand names', () => {
      const entries: FuelEfficiencyEntry[] = [
        {
          brand: 'VW',
          model: 'Golf',
          year: 2023,
          fuelType: 'gasolina',
          cityKmL: 12.5,
          highwayKmL: 15.2,
          efficiencyRating: 'A',
        },
        {
          brand: 'Mercedes',
          model: 'C-Class',
          year: 2023,
          fuelType: 'diesel',
          cityKmL: 14.0,
          highwayKmL: 16.5,
          efficiencyRating: 'A',
        },
      ];

      const result = transformer.transform(entries);

      expect(result.vehicles[0].brand).toBe('VOLKSWAGEN');
      expect(result.vehicles[1].brand).toBe('MERCEDES-BENZ');
    });

    it('should normalize model names', () => {
      const entries: FuelEfficiencyEntry[] = [
        {
          brand: 'Toyota',
          model: 'Corolla  -  Edition',
          year: 2023,
          fuelType: 'gasolina',
          cityKmL: 12.5,
          highwayKmL: 15.2,
          efficiencyRating: 'A',
        },
      ];

      const result = transformer.transform(entries);

      expect(result.vehicles[0].model).toBe('COROLLA-EDITION');
    });

    it('should handle invalid efficiency values', () => {
      const entries: FuelEfficiencyEntry[] = [
        {
          brand: 'Toyota',
          model: 'Corolla',
          year: 2023,
          fuelType: 'gasolina',
          cityKmL: 0, // Invalid
          highwayKmL: 15.2,
          efficiencyRating: 'A',
        },
      ];

      const result = transformer.transform(entries);

      expect(result.vehicles).toHaveLength(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('Invalid efficiency values');
    });

    it('should handle missing required fields', () => {
      const entries: FuelEfficiencyEntry[] = [
        {
          brand: '', // Missing
          model: 'Corolla',
          year: 2023,
          fuelType: 'gasolina',
          cityKmL: 12.5,
          highwayKmL: 15.2,
          efficiencyRating: 'A',
        },
      ];

      const result = transformer.transform(entries);

      expect(result.vehicles).toHaveLength(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('Missing required field');
    });
  });
});
