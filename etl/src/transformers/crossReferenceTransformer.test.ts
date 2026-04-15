import { crossReferenceTransformer } from './crossReferenceTransformer';
import { FipeVehicle, InmetroVehicle, VehicleMatch } from '../matchers/exactMatcher';

describe('CrossReferenceTransformer', () => {
  describe('transform', () => {
    it('should combine FIPE and Inmetro data for matched vehicles', () => {
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
      ];

      const matches: VehicleMatch[] = [
        {
          fipeCode: '001001-0',
          inmetroId: 1,
          confidence: 1.0,
          matchType: 'exact',
        },
      ];

      const result = crossReferenceTransformer.transform(fipeVehicles, inmetroVehicles, matches);

      expect(result.vehicles).toHaveLength(1);
      expect(result.vehicles[0].fipeCode).toBe('001001-0');
      expect(result.vehicles[0].price).toBe(120000);
      expect(result.vehicles[0].cityKmL).toBe(12.5);
      expect(result.vehicles[0].highwayKmL).toBe(15.2);
      expect(result.vehicles[0].efficiencyRating).toBe('A');
      expect(result.vehicles[0].matchConfidence).toBe('exact');
    });

    it('should identify FIPE-only vehicles', () => {
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
      ];

      const matches: VehicleMatch[] = [
        {
          fipeCode: '001001-0',
          inmetroId: 1,
          confidence: 1.0,
          matchType: 'exact',
        },
      ];

      const result = crossReferenceTransformer.transform(fipeVehicles, inmetroVehicles, matches);

      expect(result.fipeOnly).toHaveLength(1);
      expect(result.fipeOnly[0].fipeCode).toBe('002002-0');
    });

    it('should identify Inmetro-only vehicles', () => {
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

      const matches: VehicleMatch[] = [
        {
          fipeCode: '001001-0',
          inmetroId: 1,
          confidence: 1.0,
          matchType: 'exact',
        },
      ];

      const result = crossReferenceTransformer.transform(fipeVehicles, inmetroVehicles, matches);

      expect(result.inmetroOnly).toHaveLength(1);
      expect(result.inmetroOnly[0].id).toBe(2);
    });

    it('should handle empty matches', () => {
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
      ];

      const matches: VehicleMatch[] = [];

      const result = crossReferenceTransformer.transform(fipeVehicles, inmetroVehicles, matches);

      expect(result.vehicles).toHaveLength(0);
      expect(result.fipeOnly).toHaveLength(1);
      expect(result.inmetroOnly).toHaveLength(1);
    });

    it('should handle match errors gracefully', () => {
      const fipeVehicles: FipeVehicle[] = [];

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
      ];

      const matches: VehicleMatch[] = [
        {
          fipeCode: '001001-0',
          inmetroId: 1,
          confidence: 1.0,
          matchType: 'exact',
        },
      ];

      const result = crossReferenceTransformer.transform(fipeVehicles, inmetroVehicles, matches);

      expect(result.vehicles).toHaveLength(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('FIPE vehicle not found');
    });
  });

  describe('transformFipeOnly', () => {
    it('should transform FIPE-only vehicles with manual match type', () => {
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

      const result = crossReferenceTransformer.transformFipeOnly(fipeVehicles);

      expect(result).toHaveLength(1);
      expect(result[0].fipeCode).toBe('001001-0');
      expect(result[0].matchConfidence).toBe('manual');
      expect(result[0].matchNotes).toBe('No Inmetro match');
      expect(result[0].cityKmL).toBeUndefined();
    });
  });

  describe('transformInmetroOnly', () => {
    it('should transform Inmetro-only vehicles with manual match type', () => {
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
      ];

      const result = crossReferenceTransformer.transformInmetroOnly(inmetroVehicles);

      expect(result).toHaveLength(1);
      expect(result[0].fipeCode).toBe('');
      expect(result[0].matchConfidence).toBe('manual');
      expect(result[0].matchNotes).toBe('No FIPE match');
      expect(result[0].cityKmL).toBe(12.5);
      expect(result[0].price).toBeUndefined();
    });
  });
});
