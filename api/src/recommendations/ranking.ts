/**
 * Ranking logic for vehicle recommendations
 */

import { VehicleWithTCO } from './tcoIntegration';
import { Recommendation } from './types';

const EFFICIENCY_RATING_ORDER = ['A', 'B', 'C', 'D', 'E'];

export function rankVehicles(
  vehiclesWithTCO: VehicleWithTCO[]
): Recommendation[] {
  // Sort by TCO ascending
  const sorted = vehiclesWithTCO.sort((a, b) => {
    // Primary sort: by TCO ascending
    if (a.tco !== b.tco) {
      return a.tco - b.tco;
    }

    // Tie-breaking 1: Prefer better efficiency rating
    const aRatingIndex = EFFICIENCY_RATING_ORDER.indexOf(
      a.vehicle.efficiency_rating || 'E'
    );
    const bRatingIndex = EFFICIENCY_RATING_ORDER.indexOf(
      b.vehicle.efficiency_rating || 'E'
    );
    if (aRatingIndex !== bRatingIndex) {
      return aRatingIndex - bRatingIndex;
    }

    // Tie-breaking 2: Prefer lower price
    return a.vehicle.price - b.vehicle.price;
  });

  // Return Top 3
  const top3 = sorted.slice(0, 3);

  // Map to Recommendation format
  return top3.map((item, index) => ({
    rank: index + 1,
    vehicle: item.vehicle,
    tco_monthly: item.tco,
    breakdown: item.breakdown,
  }));
}
