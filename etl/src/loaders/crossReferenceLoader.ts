import { query } from '../db/connection';
import { UnifiedVehicle } from '../transformers/crossReferenceTransformer';

export interface LoadResult {
  inserted: number;
  updated: number;
  errors: string[];
}

export class CrossReferenceLoader {
  /**
   * Load unified vehicles to vehicles_unified table
   */
  async load(vehicles: UnifiedVehicle[]): Promise<LoadResult> {
    let inserted = 0;
    let updated = 0;
    const errors: string[] = [];

    for (const vehicle of vehicles) {
      try {
        await this.upsertVehicle(vehicle);
        
        // Check if it was an insert or update based on whether fipe_code already exists
        // For simplicity, we'll count all as upserts (inserts + updates)
        inserted++;
      } catch (error) {
        const errorMsg = `Failed to load vehicle ${vehicle.fipeCode}: ${error}`;
        errors.push(errorMsg);
        console.warn(`[CrossReferenceLoader] ${errorMsg}`);
      }
    }

    // Update fuel_efficiency.fipe_code for matched records
    await this.updateFuelEfficiencyFipeCodes(vehicles);

    console.log(
      `[CrossReferenceLoader] Loaded ${inserted} vehicles to vehicles_unified table`
    );

    return {
      inserted,
      updated,
      errors,
    };
  }

  /**
   * Upsert a single vehicle to vehicles_unified table
   */
  private async upsertVehicle(vehicle: UnifiedVehicle): Promise<void> {
    const queryText = `
      INSERT INTO vehicles_unified (
        fipe_code,
        brand,
        model,
        year,
        fuel_type,
        price,
        city_km_l,
        highway_km_l,
        efficiency_rating,
        match_confidence,
        match_notes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (fipe_code)
      DO UPDATE SET
        brand = EXCLUDED.brand,
        model = EXCLUDED.model,
        year = EXCLUDED.year,
        fuel_type = EXCLUDED.fuel_type,
        price = EXCLUDED.price,
        city_km_l = EXCLUDED.city_km_l,
        highway_km_l = EXCLUDED.highway_km_l,
        efficiency_rating = EXCLUDED.efficiency_rating,
        match_confidence = EXCLUDED.match_confidence,
        match_notes = EXCLUDED.match_notes,
        updated_at = NOW()
    `;

    const values = [
      vehicle.fipeCode,
      vehicle.brand,
      vehicle.model,
      vehicle.year,
      vehicle.fuelType,
      vehicle.price || null,
      vehicle.cityKmL || null,
      vehicle.highwayKmL || null,
      vehicle.efficiencyRating || null,
      vehicle.matchConfidence,
      vehicle.matchNotes || null,
    ];

    await query(queryText, values);
  }

  /**
   * Update fuel_efficiency.fipe_code for matched records
   */
  private async updateFuelEfficiencyFipeCodes(vehicles: UnifiedVehicle[]): Promise<void> {
    for (const vehicle of vehicles) {
      if (!vehicle.fipeCode) continue; // Skip vehicles without fipe_code (Inmetro-only)

      try {
        const queryText = `
          UPDATE fuel_efficiency
          SET fipe_code = $1
          WHERE brand = $2
            AND model = $3
            AND model_year = $4
            AND fuel_type = $5
            AND fipe_code IS NULL
        `;

        const values = [
          vehicle.fipeCode,
          vehicle.brand,
          vehicle.model,
          vehicle.year,
          vehicle.fuelType,
        ];

        await query(queryText, values);
      } catch (error) {
        console.warn(
          `[CrossReferenceLoader] Failed to update fuel_efficiency for ${vehicle.fipeCode}: ${error}`
        );
      }
    }
  }

  /**
   * Count records in vehicles_unified table
   */
  async count(): Promise<number> {
    const result = await query('SELECT COUNT(*) as count FROM vehicles_unified');
    return parseInt(result.rows[0].count, 10);
  }

  /**
   * Truncate vehicles_unified table
   */
  async truncate(): Promise<void> {
    await query('TRUNCATE TABLE vehicles_unified CASCADE');
  }
}

export const crossReferenceLoader = new CrossReferenceLoader();
