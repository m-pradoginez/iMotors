import {
  TCOInput,
  TCOOutput,
  TCOBreakdown,
  VehicleInput,
  UserInput,
} from './types';
import { tcoConfig } from './config';

export class TCOCalculator {
  /**
   * Calculate the total cost of ownership for a vehicle
   */
  calculate(input: TCOInput): TCOOutput {
    const { vehicle, user } = input;

    const depreciation_monthly = this.calculateDepreciation(vehicle.price, vehicle.category);
    const fuel_cost_monthly = this.calculateFuelCost(
      user.mileage_annual_km,
      user.city_highway_ratio,
      vehicle.city_km_l,
      vehicle.highway_km_l,
      vehicle.fuel_type,
      vehicle.category,
    );
    const ipva_monthly = this.calculateIPVA(vehicle.price, user.state, vehicle.fuel_type);
    const insurance_monthly = this.calculateInsurance(vehicle.price, vehicle.category, user.state);
    const maintenance_monthly = this.calculateMaintenance(
      user.mileage_annual_km,
      vehicle.category,
    );

    const breakdown: TCOBreakdown = {
      depreciation_monthly,
      fuel_cost_monthly,
      ipva_monthly,
      insurance_monthly,
      maintenance_monthly,
    };

    const tco_monthly =
      depreciation_monthly +
      fuel_cost_monthly +
      ipva_monthly +
      insurance_monthly +
      maintenance_monthly;

    return {
      tco_monthly,
      breakdown,
    };
  }

  /**
   * Calculate monthly depreciation based on vehicle price and category
   */
  calculateDepreciation(price: number, category: string): number {
    const rate = tcoConfig.depreciationRates[category.toLowerCase()] || 0.12;
    return (price * rate) / 12;
  }

  /**
   * Calculate monthly fuel cost based on mileage, efficiency, and fuel type
   */
  calculateFuelCost(
    mileage_annual_km: number,
    city_highway_ratio: number,
    city_km_l?: number,
    highway_km_l?: number,
    fuel_type?: string,
    category?: string,
  ): number {
    const fuelType = (fuel_type || 'gasolina').toLowerCase();
    const fuelPrice = tcoConfig.fuelPrices[fuelType] || tcoConfig.fuelPrices.gasolina;

    // Calculate efficiency based on city/highway ratio
    let efficiency: number;
    if (city_km_l && highway_km_l) {
      efficiency = city_km_l * city_highway_ratio + highway_km_l * (1 - city_highway_ratio);
    } else {
      // Use category default if efficiency data is missing
      const cat = (category || 'sedan').toLowerCase();
      efficiency = tcoConfig.defaultEfficiency[cat] || 10;
    }

    const monthly_mileage = mileage_annual_km / 12;
    return (monthly_mileage * fuelPrice) / efficiency;
  }

  /**
   * Calculate monthly IPVA based on vehicle price, state, and fuel type
   */
  calculateIPVA(price: number, state: string, fuel_type?: string): number {
    const stateCode = state.toUpperCase();
    let rate = tcoConfig.ipvaRates[stateCode] || tcoConfig.ipvaRates.default;

    // Electric vehicle discount
    if (fuel_type?.toLowerCase() === 'eletrico') {
      rate *= 0.5;
    }

    // High-value vehicle surcharge
    if (price > 150000) {
      rate += 0.01;
    }

    return (price * rate) / 12;
  }

  /**
   * Calculate monthly insurance based on price, category, and state
   */
  calculateInsurance(price: number, category: string, state: string): number {
    const baseRate = tcoConfig.insurance.baseRate / 12;

    // Price factor
    let priceFactor = 1.0;
    if (price < 50000) {
      priceFactor = 0.8;
    } else if (price > 150000) {
      priceFactor = 1.5;
    }

    // Category factor
    const cat = category.toLowerCase();
    let categoryFactor = 1.0;
    if (['coupe', 'conversivel'].includes(cat)) {
      categoryFactor = 1.5;
    } else if (['suv', 'pickup'].includes(cat)) {
      categoryFactor = 1.2;
    }

    // State factor
    const stateCode = state.toUpperCase();
    let stateFactor = 1.0;
    if (['SP', 'RJ', 'MG'].includes(stateCode)) {
      stateFactor = 1.3;
    } else if (['RS', 'PR', 'SC', 'BA', 'PE'].includes(stateCode)) {
      stateFactor = 1.1;
    }

    return baseRate * priceFactor * categoryFactor * stateFactor;
  }

  /**
   * Calculate monthly maintenance based on mileage and category
   */
  calculateMaintenance(mileage_annual_km: number, category: string): number {
    const baseMaintenance = tcoConfig.maintenance.baseRate / 12;

    // Age factor (assume new vehicle for v1)
    const ageFactor = 0.8;

    // Category factor
    const cat = category.toLowerCase();
    let categoryFactor = 1.0;
    if (cat === 'coupe' || cat === 'conversivel') {
      categoryFactor = 1.4;
    } else if (cat === 'suv' || cat === 'pickup') {
      categoryFactor = 1.2;
    } else if (cat === 'minivan') {
      categoryFactor = 1.1;
    }

    // Mileage factor
    let mileageFactor = 1.0;
    if (mileage_annual_km < 10000) {
      mileageFactor = 0.8;
    } else if (mileage_annual_km > 20000) {
      mileageFactor = 1.2;
    }

    return baseMaintenance * ageFactor * categoryFactor * mileageFactor;
  }
}

export const tcoCalculator = new TCOCalculator();
