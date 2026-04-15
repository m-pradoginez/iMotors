/**
 * TCO calculator integration
 */

import { tcoCalculator } from '../tco/tcoCalculator';
import { TCOInput } from '../tco/types';
import { RecommendationRequest, RecommendationVehicle } from './types';

export interface VehicleWithTCO {
  vehicle: RecommendationVehicle;
  tco: number;
  breakdown: any;
}

export async function calculateVehicleTCO(
  vehicle: RecommendationVehicle,
  request: RecommendationRequest
): Promise<VehicleWithTCO | null> {
  const tcoInput: TCOInput = {
    vehicle: {
      fipe_code: vehicle.fipe_code,
      price: vehicle.price,
      category: vehicle.category,
      fuel_type: vehicle.fuel_type,
      city_km_l: vehicle.city_km_l,
      highway_km_l: vehicle.highway_km_l,
    },
    user: {
      budget_monthly: request.budget_monthly,
      mileage_annual_km: request.mileage_annual_km,
      city_highway_ratio: request.city_highway_ratio,
      state: request.state,
    },
  };

  const result = tcoCalculator.calculate(tcoInput);

  // Filter out vehicles exceeding budget
  if (result.tco_monthly > request.budget_monthly) {
    return null;
  }

  return {
    vehicle,
    tco: result.tco_monthly,
    breakdown: result.breakdown,
  };
}

export async function calculateVehiclesTCO(
  vehicles: RecommendationVehicle[],
  request: RecommendationRequest
): Promise<VehicleWithTCO[]> {
  const results: VehicleWithTCO[] = [];

  for (const vehicle of vehicles) {
    const result = await calculateVehicleTCO(vehicle, request);
    if (result) {
      results.push(result);
    }
  }

  return results;
}
