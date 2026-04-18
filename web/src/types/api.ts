export interface Vehicle {
  fipe_code: string;
  brand: string;
  model: string;
  year: number;
  fuel_type: 'gasolina' | 'etanol' | 'flex' | 'diesel' | 'hibrido' | 'eletrico';
  price: number | null;
  city_km_l: number | null;
  highway_km_l: number | null;
  efficiency_rating: string | null;
  match_confidence: 'exact' | 'fuzzy' | 'manual';
  image_url?: string | null;
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
  vehicle: Vehicle;
  tco_monthly: number;
  breakdown: TCOBreakdown;
}

export interface RecommendationRequest {
  budget_monthly: number;
  mileage_annual_km: number;
  city_highway_ratio: number;
  state: BrazilianState;
  category?: VehicleCategory;
  fuel_preference?: FuelType;
}

export interface RecommendationResponse {
  recommendations: Recommendation[];
}

export type BrazilianState = 
  | 'AC' | 'AL' | 'AP' | 'AM' | 'BA' | 'CE' | 'DF' | 'ES' | 'GO' | 'MA' 
  | 'MT' | 'MS' | 'MG' | 'PA' | 'PB' | 'PR' | 'PE' | 'PI' | 'RJ' | 'RN' 
  | 'RS' | 'RO' | 'RR' | 'SC' | 'SP' | 'SE' | 'TO';

export type VehicleCategory = 'hatchback' | 'sedan' | 'suv' | 'pickup' | 'minivan' | 'coupe' | 'conversivel';

export type FuelType = 'gasolina' | 'etanol' | 'flex' | 'diesel' | 'hibrido' | 'eletrico';

export interface PaginationParams {
  limit?: number;
  offset?: number;
}

export interface VehicleFilters extends PaginationParams {
  brand?: string;
  category?: VehicleCategory;
  fuel_type?: FuelType;
  year_min?: number;
  year_max?: number;
  price_min?: number;
  price_max?: number;
  [key: string]: string | number | undefined;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
}

export interface ApiError {
  error: string;
  message: string;
  code: string;
}
