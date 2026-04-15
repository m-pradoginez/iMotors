/**
 * Types for Recommendation API
 */

export interface RecommendationRequest {
  budget_monthly: number;
  mileage_annual_km: number;
  city_highway_ratio: number;
  state: string;
  category?: string;
  fuel_preference?: string;
}

export interface RecommendationVehicle {
  fipe_code: string;
  brand: string;
  model: string;
  year: number;
  fuel_type: string;
  category: string;
  price: number;
  city_km_l: number;
  highway_km_l: number;
  efficiency_rating?: string;
  match_confidence?: string;
}

export interface TCOBreakdown {
  depreciation_monthly: number;
  fuel_cost_monthly: number;
  ipva_monthly: number;
  insurance_monthly: number;
  maintenance_monthly: number;
}

export interface Recommendation {
  rank: number;
  vehicle: RecommendationVehicle;
  tco_monthly: number;
  breakdown: TCOBreakdown;
}

export interface RecommendationResponse {
  recommendations: Recommendation[];
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface RecommendationError {
  error: string;
  message: string;
  code: string;
}
