/**
 * Recommendation Service
 * Handles vehicle recommendations based on user constraints
 */

import {
  RecommendationRequest,
  RecommendationResponse,
  RecommendationError,
} from './types';
import { validateRecommendationRequest, createValidationError } from './validation';
import { queryVehicles } from './vehicleQuery';
import { calculateVehiclesTCO } from './tcoIntegration';
import { rankVehicles } from './ranking';

export class RecommendationService {
  /**
   * Get vehicle recommendations based on user constraints
   */
  async getRecommendations(
    request: RecommendationRequest
  ): Promise<RecommendationResponse> {
    // 1. Validate request
    const validation = validateRecommendationRequest(request);
    if (!validation.valid) {
      throw createValidationError(validation.errors);
    }

    // 2. Query vehicle catalog
    const vehicles = await queryVehicles(request);

    if (vehicles.length === 0) {
      const error: RecommendationError = {
        error: 'No vehicles found',
        message: 'No vehicles found matching the specified constraints. Try relaxing the category or fuel preference filters.',
        code: 'NOT_FOUND',
      };
      throw new Error(JSON.stringify(error));
    }

    // 3. Calculate TCO for each vehicle
    const vehiclesWithTCO = await calculateVehiclesTCO(vehicles, request);

    if (vehiclesWithTCO.length === 0) {
      const error: RecommendationError = {
        error: 'No vehicles within budget',
        message: 'No vehicles found within the specified budget. Try increasing the budget or reducing mileage.',
        code: 'NOT_FOUND',
      };
      throw new Error(JSON.stringify(error));
    }

    // 4. Rank by lowest TCO
    const recommendations = rankVehicles(vehiclesWithTCO);

    // 5. Return Top 3
    return {
      recommendations,
    };
  }
}

export const recommendationService = new RecommendationService();
