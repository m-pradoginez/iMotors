import { tcoCalculator } from './tcoCalculator';
import { TCOInput } from './types';

describe('TCOCalculator', () => {
  describe('calculateDepreciation', () => {
    it('should calculate depreciation for hatchback', () => {
      const result = tcoCalculator.calculateDepreciation(100000, 'hatchback');
      expect(result).toBe(1250); // (100000 * 0.15) / 12
    });

    it('should calculate depreciation for sedan', () => {
      const result = tcoCalculator.calculateDepreciation(100000, 'sedan');
      expect(result).toBe(1000); // (100000 * 0.12) / 12
    });

    it('should calculate depreciation for suv', () => {
      const result = tcoCalculator.calculateDepreciation(100000, 'suv');
      expect(result).toBeCloseTo(833.33, 2); // (100000 * 0.10) / 12
    });

    it('should calculate depreciation for pickup', () => {
      const result = tcoCalculator.calculateDepreciation(100000, 'pickup');
      expect(result).toBeCloseTo(666.67, 2); // (100000 * 0.08) / 12
    });

    it('should calculate depreciation for minivan', () => {
      const result = tcoCalculator.calculateDepreciation(100000, 'minivan');
      expect(result).toBe(1000); // (100000 * 0.12) / 12
    });

    it('should calculate depreciation for coupe', () => {
      const result = tcoCalculator.calculateDepreciation(100000, 'coupe');
      expect(result).toBe(1500); // (100000 * 0.18) / 12
    });

    it('should calculate depreciation for conversivel', () => {
      const result = tcoCalculator.calculateDepreciation(100000, 'conversivel');
      expect(result).toBeCloseTo(1666.67, 2); // (100000 * 0.20) / 12
    });

    it('should use default rate for unknown category', () => {
      const result = tcoCalculator.calculateDepreciation(100000, 'unknown');
      expect(result).toBe(1000); // (100000 * 0.12) / 12
    });
  });

  describe('calculateFuelCost', () => {
    it('should calculate fuel cost for gasolina with city/highway efficiency', () => {
      const result = tcoCalculator.calculateFuelCost(15000, 0.7, 12, 15, 'gasolina');
      expect(result).toBeCloseTo(532.95, 2); // (1250 * 5.5) / (12*0.7 + 15*0.3)
    });

    it('should calculate fuel cost for etanol', () => {
      const result = tcoCalculator.calculateFuelCost(15000, 0.5, 10, 12, 'etanol');
      expect(result).toBeCloseTo(431.82, 2); // (1250 * 3.8) / (10*0.5 + 12*0.5)
    });

    it('should calculate fuel cost for diesel', () => {
      const result = tcoCalculator.calculateFuelCost(15000, 0.5, 8, 10, 'diesel');
      expect(result).toBeCloseTo(861.11, 2); // (1250 * 6.2) / (8*0.5 + 10*0.5)
    });

    it('should calculate fuel cost for eletrico', () => {
      const result = tcoCalculator.calculateFuelCost(15000, 0.5, undefined, undefined, 'eletrico', 'sedan');
      expect(result).toBeCloseTo(62.5, 2); // (1250 * 0.5) / 10
    });

    it('should use category default when efficiency is missing', () => {
      const result = tcoCalculator.calculateFuelCost(15000, 0.5, undefined, undefined, 'gasolina', 'hatchback');
      expect(result).toBeCloseTo(572.92, 2); // (1250 * 5.5) / 12
    });

    it('should handle zero mileage', () => {
      const result = tcoCalculator.calculateFuelCost(0, 0.5, 10, 12, 'gasolina');
      expect(result).toBe(0);
    });
  });

  describe('calculateIPVA', () => {
    it('should calculate IPVA for SP', () => {
      const result = tcoCalculator.calculateIPVA(100000, 'SP', 'gasolina');
      expect(result).toBeCloseTo(333.33, 2); // (100000 * 0.04) / 12
    });

    it('should calculate IPVA for RJ', () => {
      const result = tcoCalculator.calculateIPVA(100000, 'RJ', 'gasolina');
      expect(result).toBeCloseTo(333.33, 2); // (100000 * 0.04) / 12
    });

    it('should calculate IPVA for BA', () => {
      const result = tcoCalculator.calculateIPVA(100000, 'BA', 'gasolina');
      expect(result).toBe(250); // (100000 * 0.03) / 12
    });

    it('should apply electric vehicle discount', () => {
      const result = tcoCalculator.calculateIPVA(100000, 'SP', 'eletrico');
      expect(result).toBeCloseTo(166.67, 2); // (100000 * 0.04 * 0.5) / 12
    });

    it('should apply high-value surcharge', () => {
      const result = tcoCalculator.calculateIPVA(200000, 'SP', 'gasolina');
      expect(result).toBeCloseTo(833.33, 2); // (200000 * 0.05) / 12
    });

    it('should use default rate for unknown state', () => {
      const result = tcoCalculator.calculateIPVA(100000, 'XX', 'gasolina');
      expect(result).toBeCloseTo(166.67, 2); // (100000 * 0.02) / 12
    });
  });

  describe('calculateInsurance', () => {
    it('should calculate insurance for low-price vehicle', () => {
      const result = tcoCalculator.calculateInsurance(40000, 'sedan', 'SP');
      expect(result).toBeCloseTo(173.33, 2); // (2000/12) * 0.8 * 1.0 * 1.3
    });

    it('should calculate insurance for mid-price vehicle', () => {
      const result = tcoCalculator.calculateInsurance(100000, 'sedan', 'SP');
      expect(result).toBeCloseTo(216.67, 2); // (2000/12) * 1.0 * 1.0 * 1.3
    });

    it('should calculate insurance for high-price vehicle', () => {
      const result = tcoCalculator.calculateInsurance(200000, 'sedan', 'SP');
      expect(result).toBeCloseTo(325, 2); // (2000/12) * 1.5 * 1.0 * 1.3
    });

    it('should apply category factor for coupe', () => {
      const result = tcoCalculator.calculateInsurance(100000, 'coupe', 'SP');
      expect(result).toBeCloseTo(325, 2); // (2000/12) * 1.0 * 1.5 * 1.3
    });

    it('should apply category factor for SUV', () => {
      const result = tcoCalculator.calculateInsurance(100000, 'suv', 'SP');
      expect(result).toBeCloseTo(260, 2); // (2000/12) * 1.0 * 1.2 * 1.3
    });

    it('should apply state factor for RS', () => {
      const result = tcoCalculator.calculateInsurance(100000, 'sedan', 'RS');
      expect(result).toBeCloseTo(183.33, 2); // (2000/12) * 1.0 * 1.0 * 1.1
    });

    it('should use default state factor for unknown state', () => {
      const result = tcoCalculator.calculateInsurance(100000, 'sedan', 'XX');
      expect(result).toBeCloseTo(166.67, 2); // (2000/12) * 1.0 * 1.0 * 1.0
    });
  });

  describe('calculateMaintenance', () => {
    it('should calculate maintenance for low mileage', () => {
      const result = tcoCalculator.calculateMaintenance(8000, 'sedan');
      expect(result).toBeCloseTo(128, 2); // (2400/12) * 0.8 * 1.0 * 0.8
    });

    it('should calculate maintenance for medium mileage', () => {
      const result = tcoCalculator.calculateMaintenance(15000, 'sedan');
      expect(result).toBeCloseTo(160, 2); // (2400/12) * 0.8 * 1.0 * 1.0
    });

    it('should calculate maintenance for high mileage', () => {
      const result = tcoCalculator.calculateMaintenance(25000, 'sedan');
      expect(result).toBeCloseTo(192, 2); // (2400/12) * 0.8 * 1.0 * 1.2
    });

    it('should apply category factor for coupe', () => {
      const result = tcoCalculator.calculateMaintenance(15000, 'coupe');
      expect(result).toBeCloseTo(224, 2); // (2400/12) * 0.8 * 1.4 * 1.0
    });

    it('should apply category factor for SUV', () => {
      const result = tcoCalculator.calculateMaintenance(15000, 'suv');
      expect(result).toBeCloseTo(192, 2); // (2400/12) * 0.8 * 1.2 * 1.0
    });

    it('should apply category factor for minivan', () => {
      const result = tcoCalculator.calculateMaintenance(15000, 'minivan');
      expect(result).toBeCloseTo(176, 2); // (2400/12) * 0.8 * 1.1 * 1.0
    });
  });

  describe('calculate', () => {
    it('should calculate full TCO for a vehicle', () => {
      const input: TCOInput = {
        vehicle: {
          fipe_code: '001001-0',
          price: 100000,
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

      expect(result.tco_monthly).toBeGreaterThan(0);
      expect(result.breakdown.depreciation_monthly).toBe(1000);
      expect(result.breakdown.fuel_cost_monthly).toBeGreaterThan(0);
      expect(result.breakdown.ipva_monthly).toBeCloseTo(333.33, 2);
      expect(result.breakdown.insurance_monthly).toBeCloseTo(216.67, 2);
      expect(result.breakdown.maintenance_monthly).toBe(160);

      // Verify breakdown sums to total
      const sum =
        result.breakdown.depreciation_monthly +
        result.breakdown.fuel_cost_monthly +
        result.breakdown.ipva_monthly +
        result.breakdown.insurance_monthly +
        result.breakdown.maintenance_monthly;
      expect(sum).toBeCloseTo(result.tco_monthly, 2);
    });

    it('should handle missing efficiency data', () => {
      const input: TCOInput = {
        vehicle: {
          fipe_code: '001001-0',
          price: 100000,
          category: 'hatchback',
          fuel_type: 'gasolina',
        },
        user: {
          budget_monthly: 3000,
          mileage_annual_km: 15000,
          city_highway_ratio: 0.5,
          state: 'SP',
        },
      };

      const result = tcoCalculator.calculate(input);

      expect(result.tco_monthly).toBeGreaterThan(0);
      expect(result.breakdown.fuel_cost_monthly).toBeGreaterThan(0);
    });
  });
});
