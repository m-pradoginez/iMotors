/**
 * Recommendation Controller
 * Handles HTTP requests for the recommendations endpoint
 */

import { Request, Response } from 'express';
import { recommendationService } from './recommendationService';
import { RecommendationRequest, RecommendationError } from './types';
import { validateRecommendationRequest, createValidationError } from './validation';

export class RecommendationController {
  /**
   * POST /recommendations
   * Accepts user constraints and returns ranked vehicle recommendations
   */
  async postRecommendations(req: Request, res: Response): Promise<void> {
    try {
      const request: RecommendationRequest = req.body;

      // Validate request
      const validation = validateRecommendationRequest(request);
      if (!validation.valid) {
        const error = createValidationError(validation.errors);
        res.status(400).json(error);
        return;
      }

      // Get recommendations
      const response = await recommendationService.getRecommendations(request);

      res.status(200).json(response);
    } catch (error) {
      // Handle errors thrown by service
      if (error instanceof Error) {
        try {
          const parsedError = JSON.parse(error.message) as RecommendationError;
          res.status(404).json(parsedError);
          return;
        } catch {
          // Not a JSON error, treat as internal server error
        }
      }

      // Internal server error
      console.error('[RecommendationController] Unhandled error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'An unexpected error occurred while processing your request',
        code: 'INTERNAL_ERROR',
      });
    }
  }
}

export const recommendationController = new RecommendationController();
