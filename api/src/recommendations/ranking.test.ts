import { rankVehicles } from './ranking';
import { VehicleWithTCO } from './tcoIntegration';
import { RecommendationVehicle } from './types';

describe('Ranking', () => {
  describe('rankVehicles', () => {
    const createMockVehicle = (
      tco: number,
      price: number,
      efficiencyRating?: string
    ): VehicleWithTCO => ({
      vehicle: {
        fipe_code: '001001-0',
        brand: 'TOYOTA',
        model: 'COROLLA',
        year: 2023,
        fuel_type: 'flex',
        category: 'sedan',
        price,
        city_km_l: 10,
        highway_km_l: 12,
        efficiency_rating: efficiencyRating,
        match_confidence: 'exact',
      },
      tco,
      breakdown: {
        depreciation_monthly: 1000,
        fuel_cost_monthly: 500,
        ipva_monthly: 300,
        insurance_monthly: 200,
        maintenance_monthly: 100,
      },
    });

    it('should rank vehicles by lowest TCO', () => {
      const vehicles: VehicleWithTCO[] = [
        createMockVehicle(3000, 120000, 'A'),
        createMockVehicle(2000, 100000, 'B'),
        createMockVehicle(2500, 110000, 'C'),
      ];

      const result = rankVehicles(vehicles);

      expect(result).toHaveLength(3);
      expect(result[0].rank).toBe(1);
      expect(result[0].tco_monthly).toBe(2000);
      expect(result[1].rank).toBe(2);
      expect(result[1].tco_monthly).toBe(2500);
      expect(result[2].rank).toBe(3);
      expect(result[2].tco_monthly).toBe(3000);
    });

    it('should break ties by efficiency rating', () => {
      const vehicles: VehicleWithTCO[] = [
        createMockVehicle(2000, 120000, 'C'),
        createMockVehicle(2000, 100000, 'A'),
        createMockVehicle(2000, 110000, 'B'),
      ];

      const result = rankVehicles(vehicles);

      expect(result).toHaveLength(3);
      expect(result[0].vehicle.efficiency_rating).toBe('A');
      expect(result[1].vehicle.efficiency_rating).toBe('B');
      expect(result[2].vehicle.efficiency_rating).toBe('C');
    });

    it('should break ties by price if efficiency rating is same', () => {
      const vehicles: VehicleWithTCO[] = [
        createMockVehicle(2000, 120000, 'A'),
        createMockVehicle(2000, 100000, 'A'),
        createMockVehicle(2000, 110000, 'A'),
      ];

      const result = rankVehicles(vehicles);

      expect(result).toHaveLength(3);
      expect(result[0].vehicle.price).toBe(100000);
      expect(result[1].vehicle.price).toBe(110000);
      expect(result[2].vehicle.price).toBe(120000);
    });

    it('should handle vehicles with missing efficiency rating', () => {
      const vehicles: VehicleWithTCO[] = [
        createMockVehicle(2000, 120000, 'A'),
        createMockVehicle(2000, 100000, undefined),
      ];

      const result = rankVehicles(vehicles);

      expect(result).toHaveLength(2);
      expect(result[0].vehicle.efficiency_rating).toBe('A');
      expect(result[1].vehicle.efficiency_rating).toBeUndefined();
    });

    it('should return fewer than 3 vehicles if input has fewer', () => {
      const vehicles: VehicleWithTCO[] = [
        createMockVehicle(2000, 100000, 'A'),
        createMockVehicle(2500, 110000, 'B'),
      ];

      const result = rankVehicles(vehicles);

      expect(result).toHaveLength(2);
    });

    it('should return Top 3 when input has more than 3 vehicles', () => {
      const vehicles: VehicleWithTCO[] = [
        createMockVehicle(3000, 120000, 'A'),
        createMockVehicle(2000, 100000, 'B'),
        createMockVehicle(2500, 110000, 'C'),
        createMockVehicle(3500, 130000, 'D'),
        createMockVehicle(4000, 140000, 'E'),
      ];

      const result = rankVehicles(vehicles);

      expect(result).toHaveLength(3);
      expect(result[0].tco_monthly).toBe(2000);
      expect(result[1].tco_monthly).toBe(2500);
      expect(result[2].tco_monthly).toBe(3000);
    });

    it('should assign correct ranks starting from 1', () => {
      const vehicles: VehicleWithTCO[] = [
        createMockVehicle(2000, 100000, 'A'),
        createMockVehicle(2500, 110000, 'B'),
        createMockVehicle(3000, 120000, 'C'),
      ];

      const result = rankVehicles(vehicles);

      expect(result[0].rank).toBe(1);
      expect(result[1].rank).toBe(2);
      expect(result[2].rank).toBe(3);
    });

    it('should include breakdown in result', () => {
      const vehicles: VehicleWithTCO[] = [
        createMockVehicle(2000, 100000, 'A'),
      ];

      const result = rankVehicles(vehicles);

      expect(result[0].breakdown).toBeDefined();
      expect(result[0].breakdown.depreciation_monthly).toBe(1000);
    });
  });
});
