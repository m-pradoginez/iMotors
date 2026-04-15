export interface VehicleInput {
  fipe_code: string;
  price: number;
  category: string;
  fuel_type: string;
  city_km_l?: number;
  highway_km_l?: number;
}

export interface UserInput {
  budget_monthly: number;
  mileage_annual_km: number;
  city_highway_ratio: number;
  state: string;
}

export interface TCOInput {
  vehicle: VehicleInput;
  user: UserInput;
}

export interface TCODepreciation {
  depreciation_monthly: number;
}

export interface TCOFuelCost {
  fuel_cost_monthly: number;
}

export interface TCOIPVA {
  ipva_monthly: number;
}

export interface TCOInsurance {
  insurance_monthly: number;
}

export interface TCOMaintenance {
  maintenance_monthly: number;
}

export interface TCOBreakdown {
  depreciation_monthly: number;
  fuel_cost_monthly: number;
  ipva_monthly: number;
  insurance_monthly: number;
  maintenance_monthly: number;
}

export interface TCOOutput {
  tco_monthly: number;
  breakdown: TCOBreakdown;
}
