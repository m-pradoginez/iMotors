/**
 * Input validation for Recommendation API
 */

import {
  RecommendationRequest,
  ValidationError,
  RecommendationError,
} from './types';

const VALID_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS',
  'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC',
  'SP', 'SE', 'TO',
];

const VALID_CATEGORIES = [
  'hatchback', 'sedan', 'suv', 'pickup', 'minivan', 'coupe', 'conversivel',
];

const VALID_FUEL_TYPES = [
  'gasolina', 'etanol', 'flex', 'diesel', 'hibrido', 'eletrico',
];

export function validateRecommendationRequest(
  request: RecommendationRequest
): { valid: boolean; errors: ValidationError[] } {
  const errors: ValidationError[] = [];

  // Validate budget_monthly
  if (typeof request.budget_monthly !== 'number') {
    errors.push({
      field: 'budget_monthly',
      message: 'budget_monthly must be a number',
    });
  } else if (request.budget_monthly < 500 || request.budget_monthly > 20000) {
    errors.push({
      field: 'budget_monthly',
      message: 'budget_monthly must be between 500 and 20000',
    });
  }

  // Validate mileage_annual_km
  if (typeof request.mileage_annual_km !== 'number') {
    errors.push({
      field: 'mileage_annual_km',
      message: 'mileage_annual_km must be a number',
    });
  } else if (
    request.mileage_annual_km < 1000 ||
    request.mileage_annual_km > 100000
  ) {
    errors.push({
      field: 'mileage_annual_km',
      message: 'mileage_annual_km must be between 1000 and 100000',
    });
  }

  // Validate city_highway_ratio
  if (typeof request.city_highway_ratio !== 'number') {
    errors.push({
      field: 'city_highway_ratio',
      message: 'city_highway_ratio must be a number',
    });
  } else if (
    request.city_highway_ratio < 0 ||
    request.city_highway_ratio > 1
  ) {
    errors.push({
      field: 'city_highway_ratio',
      message: 'city_highway_ratio must be between 0 and 1',
    });
  }

  // Validate state
  if (typeof request.state !== 'string') {
    errors.push({
      field: 'state',
      message: 'state must be a string',
    });
  } else if (!VALID_STATES.includes(request.state.toUpperCase())) {
    errors.push({
      field: 'state',
      message: `state must be a valid Brazilian state code: ${VALID_STATES.join(', ')}`,
    });
  }

  // Validate category (optional)
  if (request.category !== undefined) {
    if (typeof request.category !== 'string') {
      errors.push({
        field: 'category',
        message: 'category must be a string',
      });
    } else if (!VALID_CATEGORIES.includes(request.category.toLowerCase())) {
      errors.push({
        field: 'category',
        message: `category must be one of: ${VALID_CATEGORIES.join(', ')}`,
      });
    }
  }

  // Validate fuel_preference (optional)
  if (request.fuel_preference !== undefined) {
    if (typeof request.fuel_preference !== 'string') {
      errors.push({
        field: 'fuel_preference',
        message: 'fuel_preference must be a string',
      });
    } else if (!VALID_FUEL_TYPES.includes(request.fuel_preference.toLowerCase())) {
      errors.push({
        field: 'fuel_preference',
        message: `fuel_preference must be one of: ${VALID_FUEL_TYPES.join(', ')}`,
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function createValidationError(errors: ValidationError[]): RecommendationError {
  return {
    error: 'Invalid request',
    message: errors.map((e) => `${e.field}: ${e.message}`).join('; '),
    code: 'VALIDATION_ERROR',
  };
}
