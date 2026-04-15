import { validateRecommendationRequest, createValidationError } from './validation';
import { RecommendationRequest } from './types';

describe('Validation', () => {
  describe('validateRecommendationRequest', () => {
    it('should validate a valid request', () => {
      const request: RecommendationRequest = {
        budget_monthly: 3000,
        mileage_annual_km: 15000,
        city_highway_ratio: 0.7,
        state: 'SP',
      };

      const result = validateRecommendationRequest(request);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid budget_monthly (too low)', () => {
      const request: RecommendationRequest = {
        budget_monthly: 100,
        mileage_annual_km: 15000,
        city_highway_ratio: 0.7,
        state: 'SP',
      };

      const result = validateRecommendationRequest(request);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('budget_monthly');
    });

    it('should reject invalid budget_monthly (too high)', () => {
      const request: RecommendationRequest = {
        budget_monthly: 30000,
        mileage_annual_km: 15000,
        city_highway_ratio: 0.7,
        state: 'SP',
      };

      const result = validateRecommendationRequest(request);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('budget_monthly');
    });

    it('should reject invalid mileage_annual_km (too low)', () => {
      const request: RecommendationRequest = {
        budget_monthly: 3000,
        mileage_annual_km: 500,
        city_highway_ratio: 0.7,
        state: 'SP',
      };

      const result = validateRecommendationRequest(request);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('mileage_annual_km');
    });

    it('should reject invalid mileage_annual_km (too high)', () => {
      const request: RecommendationRequest = {
        budget_monthly: 3000,
        mileage_annual_km: 150000,
        city_highway_ratio: 0.7,
        state: 'SP',
      };

      const result = validateRecommendationRequest(request);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('mileage_annual_km');
    });

    it('should reject invalid city_highway_ratio (too low)', () => {
      const request: RecommendationRequest = {
        budget_monthly: 3000,
        mileage_annual_km: 15000,
        city_highway_ratio: -0.1,
        state: 'SP',
      };

      const result = validateRecommendationRequest(request);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('city_highway_ratio');
    });

    it('should reject invalid city_highway_ratio (too high)', () => {
      const request: RecommendationRequest = {
        budget_monthly: 3000,
        mileage_annual_km: 15000,
        city_highway_ratio: 1.5,
        state: 'SP',
      };

      const result = validateRecommendationRequest(request);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('city_highway_ratio');
    });

    it('should reject invalid state code', () => {
      const request: RecommendationRequest = {
        budget_monthly: 3000,
        mileage_annual_km: 15000,
        city_highway_ratio: 0.7,
        state: 'XX',
      };

      const result = validateRecommendationRequest(request);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('state');
    });

    it('should reject invalid category', () => {
      const request: RecommendationRequest = {
        budget_monthly: 3000,
        mileage_annual_km: 15000,
        city_highway_ratio: 0.7,
        state: 'SP',
        category: 'invalid',
      };

      const result = validateRecommendationRequest(request);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('category');
    });

    it('should reject invalid fuel_preference', () => {
      const request: RecommendationRequest = {
        budget_monthly: 3000,
        mileage_annual_km: 15000,
        city_highway_ratio: 0.7,
        state: 'SP',
        fuel_preference: 'invalid',
      };

      const result = validateRecommendationRequest(request);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('fuel_preference');
    });

    it('should accept valid category', () => {
      const request: RecommendationRequest = {
        budget_monthly: 3000,
        mileage_annual_km: 15000,
        city_highway_ratio: 0.7,
        state: 'SP',
        category: 'hatchback',
      };

      const result = validateRecommendationRequest(request);

      expect(result.valid).toBe(true);
    });

    it('should accept valid fuel_preference', () => {
      const request: RecommendationRequest = {
        budget_monthly: 3000,
        mileage_annual_km: 15000,
        city_highway_ratio: 0.7,
        state: 'SP',
        fuel_preference: 'flex',
      };

      const result = validateRecommendationRequest(request);

      expect(result.valid).toBe(true);
    });

    it('should accept boundary values', () => {
      const request: RecommendationRequest = {
        budget_monthly: 500,
        mileage_annual_km: 1000,
        city_highway_ratio: 0,
        state: 'SP',
      };

      const result = validateRecommendationRequest(request);

      expect(result.valid).toBe(true);
    });
  });

  describe('createValidationError', () => {
    it('should create a validation error from errors array', () => {
      const errors = [
        { field: 'budget_monthly', message: 'budget_monthly must be between 500 and 20000' },
        { field: 'state', message: 'state must be a valid Brazilian state code' },
      ];

      const result = createValidationError(errors);

      expect(result.error).toBe('Invalid request');
      expect(result.code).toBe('VALIDATION_ERROR');
      expect(result.message).toContain('budget_monthly');
      expect(result.message).toContain('state');
    });
  });
});
