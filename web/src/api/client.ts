import type { 
  Vehicle, 
  VehicleFilters, 
  PaginatedResponse, 
  RecommendationRequest, 
  RecommendationResponse,
  ApiError 
} from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.message || 'An error occurred');
  }
  return response.json();
}

function buildQueryString(params: Record<string, string | number | undefined>): string {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      query.append(key, String(value));
    }
  });
  return query.toString();
}

export const apiClient = {
  async getVehicles(filters: VehicleFilters = {}): Promise<PaginatedResponse<Vehicle>> {
    const query = buildQueryString(filters);
    const url = `${API_BASE_URL}/vehicles${query ? `?${query}` : ''}`;
    const response = await fetch(url);
    return handleResponse<PaginatedResponse<Vehicle>>(response);
  },

  async getVehicleByFipeCode(fipeCode: string): Promise<Vehicle> {
    const url = `${API_BASE_URL}/vehicles/${encodeURIComponent(fipeCode)}`;
    const response = await fetch(url);
    return handleResponse<Vehicle>(response);
  },

  async getRecommendations(request: RecommendationRequest): Promise<RecommendationResponse> {
    const url = `${API_BASE_URL}/recommendations`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return handleResponse<RecommendationResponse>(response);
  },

  async healthCheck(): Promise<{ status: string; database: string; timestamp: string }> {
    const url = `${API_BASE_URL}/health`;
    const response = await fetch(url);
    return handleResponse<{ status: string; database: string; timestamp: string }>(response);
  },
};
