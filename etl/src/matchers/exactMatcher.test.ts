import { ExactMatcher, FipeVehicle, InmetroVehicle } from './exactMatcher';

describe('ExactMatcher', () => {
  describe('match', () => {
    it('should match vehicles with exact brand, model, year, and fuel type', () => {
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

      const match = ExactMatcher.match(inmetroVehicle, fipeVehicles);

      expect(match).not.toBeNull();
      expect(match?.fipeCode).toBe('001001-0');
      expect(match?.confidence).toBe(1.0);
      expect(match?.matchType).toBe('exact');
    });

    it('should not match vehicles with different brand', () => {
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
          model: 'COROLLA',
          year: 2023,
          fuelType: 'gasolina',
          price: 120000,
        },
      ];

      const match = ExactMatcher.match(inmetroVehicle, fipeVehicles);

      expect(match).toBeNull();
    });

    it('should not match vehicles with different model', () => {
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
          model: 'CAMRY',
          year: 2023,
          fuelType: 'gasolina',
          price: 120000,
        },
      ];

      const match = ExactMatcher.match(inmetroVehicle, fipeVehicles);

      expect(match).toBeNull();
    });

    it('should not match vehicles with different year', () => {
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
          year: 2022,
          fuelType: 'gasolina',
          price: 120000,
        },
      ];

      const match = ExactMatcher.match(inmetroVehicle, fipeVehicles);

      expect(match).toBeNull();
    });

    it('should not match vehicles with different fuel type', () => {
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
          fuelType: 'flex',
          price: 120000,
        },
      ];

      const match = ExactMatcher.match(inmetroVehicle, fipeVehicles);

      expect(match).toBeNull();
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

      const match = ExactMatcher.match(inmetroVehicle, []);

      expect(match).toBeNull();
    });
  });

  describe('matchAll', () => {
    it('should match all vehicles that have exact matches', () => {
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

      const matches = ExactMatcher.matchAll(inmetroVehicles, fipeVehicles);

      expect(matches).toHaveLength(2);
      expect(matches[0].fipeCode).toBe('001001-0');
      expect(matches[1].fipeCode).toBe('002002-0');
    });

    it('should return only matches for vehicles that match', () => {
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

      const matches = ExactMatcher.matchAll(inmetroVehicles, fipeVehicles);

      expect(matches).toHaveLength(1);
      expect(matches[0].fipeCode).toBe('001001-0');
    });
  });

  describe('getStats', () => {
    it('should calculate match statistics correctly', () => {
      const matches = [
        { fipeCode: '001001-0', confidence: 1.0, matchType: 'exact' as const },
        { fipeCode: '002002-0', confidence: 1.0, matchType: 'exact' as const },
      ];

      const stats = ExactMatcher.getStats(matches, 10);

      expect(stats.matched).toBe(2);
      expect(stats.unmatched).toBe(8);
      expect(stats.matchRate).toBe(20);
    });

    it('should handle zero total vehicles', () => {
      const matches: any[] = [];

      const stats = ExactMatcher.getStats(matches, 0);

      expect(stats.matched).toBe(0);
      expect(stats.unmatched).toBe(0);
      expect(stats.matchRate).toBe(0);
    });
  });
});
