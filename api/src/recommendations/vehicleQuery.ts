/**
 * Vehicle catalog query logic
 */

import { query } from '../db/connection';
import { RecommendationRequest, RecommendationVehicle } from './types';

export async function queryVehicles(
  request: RecommendationRequest
): Promise<RecommendationVehicle[]> {
  let sql = `
    SELECT 
      fipe_code,
      brand,
      model,
      year,
      fuel_type,
      category,
      price,
      city_km_l,
      highway_km_l,
      efficiency_rating,
      match_confidence,
      image_url
    FROM vehicles
    WHERE price IS NOT NULL
      AND city_km_l IS NOT NULL
      AND highway_km_l IS NOT NULL
  `;

  const params: any[] = [];
  let paramCount = 0;

  // Apply category filter if specified
  if (request.category) {
    paramCount++;
    sql += ` AND category = $${paramCount}`;
    params.push(request.category.toLowerCase());
  }

  // Apply fuel_type filter if fuel_preference specified
  if (request.fuel_preference) {
    paramCount++;
    sql += ` AND fuel_type = $${paramCount}`;
    params.push(request.fuel_preference.toLowerCase());
  }

  // Optional: Price range filter (10x budget_monthly * 12)
  const maxPrice = request.budget_monthly * 12 * 10;
  paramCount++;
  sql += ` AND price <= $${paramCount}`;
  params.push(maxPrice);

  sql += ' ORDER BY price ASC LIMIT 100';

  const result = await query(sql, params);

  return result.rows.map((row: any) => ({
    fipe_code: row.fipe_code,
    brand: row.brand,
    model: row.model,
    year: row.year,
    fuel_type: row.fuel_type,
    category: row.category,
    price: row.price,
    city_km_l: row.city_km_l,
    highway_km_l: row.highway_km_l,
    efficiency_rating: row.efficiency_rating,
    match_confidence: row.match_confidence,
    image_url: row.image_url,
  }));
}
