import { tcoCalculator } from './tcoCalculator';
import { TCOInput } from './types';

/**
 * Manual TCO Calculation Validation
 * 
 * This test validates the TCO calculator against manual calculations for sample vehicles.
 * Manual calculations are performed using the formulas from the spec:
 * 
 * 1. Depreciation: (price * depreciation_rate) / 12
 * 2. Fuel Cost: (mileage_annual_km / 12 * fuel_price) / efficiency
 * 3. IPVA: (price * ipva_rate) / 12
 * 4. Insurance: (base_rate / 12) * price_factor * category_factor * state_factor
 * 5. Maintenance: (base_rate / 12) * age_factor * category_factor * mileage_factor
 */

describe('Manual TCO Validation', () => {
  describe('Sample Vehicle 1: Toyota Corolla (Sedan, Flex)', () => {
    it('should match manual calculation within ±10%', () => {
      // Vehicle: Toyota Corolla 2023, Sedan, Flex
      // Price: R$ 120,000
      // Efficiency: 10 km/l city, 12 km/l highway
      // User: SP state, 15,000 km/year, 70% city driving

      const input: TCOInput = {
        vehicle: {
          fipe_code: '001001-0',
          price: 120000,
          category: 'sedan',
          fuel_type: 'flex',
          city_km_l: 10,
          highway_km_l: 12,
        },
        user: {
          budget_monthly: 3000,
          mileage_annual_km: 15000,
          city_highway_ratio: 0.7,
          state: 'SP',
        },
      };

      const result = tcoCalculator.calculate(input);

      // Manual Calculation:
      // Depreciation: (120000 * 0.12) / 12 = R$ 1,200
      // Efficiency: 10 * 0.7 + 12 * 0.3 = 10.6 km/l
      // Fuel Cost: (1250 * 5.5) / 10.6 = R$ 648.58
      // IPVA: (120000 * 0.04) / 12 = R$ 400
      // Insurance: (2000/12) * 1.0 * 1.0 * 1.3 = R$ 216.67
      // Maintenance: (2400/12) * 0.8 * 1.0 * 1.0 = R$ 160
      // Total: 1200 + 648.58 + 400 + 216.67 + 160 = R$ 2,625.25

      const manualTCO = 1200 + 648.58 + 400 + 216.67 + 160;
      const tolerance = manualTCO * 0.1;

      expect(result.tco_monthly).toBeGreaterThanOrEqual(manualTCO - tolerance);
      expect(result.tco_monthly).toBeLessThanOrEqual(manualTCO + tolerance);
    });
  });

  describe('Sample Vehicle 2: Honda Civic (Hatchback, Gasolina)', () => {
    it('should match manual calculation within ±10%', () => {
      // Vehicle: Honda Civic 2023, Hatchback, Gasolina
      // Price: R$ 95,000
      // Efficiency: 12 km/l city, 14 km/l highway
      // User: RJ state, 12,000 km/year, 60% city driving

      const input: TCOInput = {
        vehicle: {
          fipe_code: '002001-0',
          price: 95000,
          category: 'hatchback',
          fuel_type: 'gasolina',
          city_km_l: 12,
          highway_km_l: 14,
        },
        user: {
          budget_monthly: 2500,
          mileage_annual_km: 12000,
          city_highway_ratio: 0.6,
          state: 'RJ',
        },
      };

      const result = tcoCalculator.calculate(input);

      // Manual Calculation:
      // Depreciation: (95000 * 0.15) / 12 = R$ 1,187.50
      // Efficiency: 12 * 0.6 + 14 * 0.4 = 12.8 km/l
      // Fuel Cost: (1000 * 5.5) / 12.8 = R$ 429.69
      // IPVA: (95000 * 0.04) / 12 = R$ 316.67
      // Insurance: (2000/12) * 0.8 * 1.0 * 1.3 = R$ 173.33
      // Maintenance: (2400/12) * 0.8 * 1.0 * 0.8 = R$ 128
      // Total: 1187.50 + 429.69 + 316.67 + 173.33 + 128 = R$ 2,235.19

      const manualTCO = 1187.5 + 429.69 + 316.67 + 173.33 + 128;
      const tolerance = manualTCO * 0.1;

      expect(result.tco_monthly).toBeGreaterThanOrEqual(manualTCO - tolerance);
      expect(result.tco_monthly).toBeLessThanOrEqual(manualTCO + tolerance);
    });
  });

  describe('Sample Vehicle 3: VW Gol (Hatchback, Flex)', () => {
    it('should match manual calculation within ±10%', () => {
      // Vehicle: VW Gol 2023, Hatchback, Flex
      // Price: R$ 70,000
      // Efficiency: 11 km/l city, 13 km/l highway
      // User: MG state, 18,000 km/year, 75% city driving

      const input: TCOInput = {
        vehicle: {
          fipe_code: '003001-0',
          price: 70000,
          category: 'hatchback',
          fuel_type: 'flex',
          city_km_l: 11,
          highway_km_l: 13,
        },
        user: {
          budget_monthly: 2000,
          mileage_annual_km: 18000,
          city_highway_ratio: 0.75,
          state: 'MG',
        },
      };

      const result = tcoCalculator.calculate(input);

      // Manual Calculation:
      // Depreciation: (70000 * 0.15) / 12 = R$ 875
      // Efficiency: 11 * 0.75 + 13 * 0.25 = 11.5 km/l
      // Fuel Cost: (1500 * 5.5) / 11.5 = R$ 717.39
      // IPVA: (70000 * 0.04) / 12 = R$ 233.33
      // Insurance: (2000/12) * 0.8 * 1.0 * 1.3 = R$ 173.33
      // Maintenance: (2400/12) * 0.8 * 1.0 * 1.0 = R$ 160
      // Total: 875 + 717.39 + 233.33 + 173.33 + 160 = R$ 2,159.05

      const manualTCO = 875 + 717.39 + 233.33 + 173.33 + 160;
      const tolerance = manualTCO * 0.1;

      expect(result.tco_monthly).toBeGreaterThanOrEqual(manualTCO - tolerance);
      expect(result.tco_monthly).toBeLessThanOrEqual(manualTCO + tolerance);
    });
  });

  describe('Sample Vehicle 4: Chevrolet Onix (Hatchback, Flex)', () => {
    it('should match manual calculation within ±10%', () => {
      // Vehicle: Chevrolet Onix 2023, Hatchback, Flex
      // Price: R$ 85,000
      // Efficiency: 13 km/l city, 15 km/l highway
      // User: RS state, 10,000 km/year, 50% city driving

      const input: TCOInput = {
        vehicle: {
          fipe_code: '004001-0',
          price: 85000,
          category: 'hatchback',
          fuel_type: 'flex',
          city_km_l: 13,
          highway_km_l: 15,
        },
        user: {
          budget_monthly: 2200,
          mileage_annual_km: 10000,
          city_highway_ratio: 0.5,
          state: 'RS',
        },
      };

      const result = tcoCalculator.calculate(input);

      // Manual Calculation:
      // Depreciation: (85000 * 0.15) / 12 = R$ 1,062.50
      // Efficiency: 13 * 0.5 + 15 * 0.5 = 14 km/l
      // Fuel Cost: (833.33 * 5.5) / 14 = R$ 327.38
      // IPVA: (85000 * 0.04) / 12 = R$ 283.33
      // Insurance: (2000/12) * 0.8 * 1.0 * 1.1 = R$ 146.67
      // Maintenance: (2400/12) * 0.8 * 1.0 * 0.8 = R$ 128
      // Total: 1062.50 + 327.38 + 283.33 + 146.67 + 128 = R$ 1,947.88

      const manualTCO = 1062.5 + 327.38 + 283.33 + 146.67 + 128;
      const tolerance = manualTCO * 0.1;

      expect(result.tco_monthly).toBeGreaterThanOrEqual(manualTCO - tolerance);
      expect(result.tco_monthly).toBeLessThanOrEqual(manualTCO + tolerance);
    });
  });

  describe('Sample Vehicle 5: Toyota Hilux (Pickup, Diesel)', () => {
    it('should match manual calculation within ±10%', () => {
      // Vehicle: Toyota Hilux 2023, Pickup, Diesel
      // Price: R$ 180,000
      // Efficiency: 8 km/l city, 10 km/l highway
      // User: PR state, 20,000 km/year, 80% city driving

      const input: TCOInput = {
        vehicle: {
          fipe_code: '005001-0',
          price: 180000,
          category: 'pickup',
          fuel_type: 'diesel',
          city_km_l: 8,
          highway_km_l: 10,
        },
        user: {
          budget_monthly: 4000,
          mileage_annual_km: 20000,
          city_highway_ratio: 0.8,
          state: 'PR',
        },
      };

      const result = tcoCalculator.calculate(input);

      // Manual Calculation:
      // Depreciation: (180000 * 0.08) / 12 = R$ 1,200
      // Efficiency: 8 * 0.8 + 10 * 0.2 = 8.4 km/l
      // Fuel Cost: (1666.67 * 6.2) / 8.4 = R$ 1,231.75
      // IPVA: (180000 * 0.04) / 12 = R$ 600
      // Insurance: (2000/12) * 1.5 * 1.2 * 1.1 = R$ 330
      // Maintenance: (2400/12) * 0.8 * 1.2 * 1.2 = R$ 230.40
      // Total: 1200 + 1231.75 + 600 + 330 + 230.40 = R$ 3,592.15

      const manualTCO = 1200 + 1231.75 + 600 + 330 + 230.4;
      const tolerance = manualTCO * 0.1;

      expect(result.tco_monthly).toBeGreaterThanOrEqual(manualTCO - tolerance);
      expect(result.tco_monthly).toBeLessThanOrEqual(manualTCO + tolerance);
    });
  });
});
