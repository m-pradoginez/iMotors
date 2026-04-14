import { query, testConnection } from '../db/connection';
import { TransformedFuelEfficiency } from '../transformers/fuelEfficiencyTransformer';

export interface LoadResult {
  success: boolean;
  inserted: number;
  updated: number;
  errors: string[];
}

export class FuelEfficiencyLoader {
  async load(vehicles: TransformedFuelEfficiency[]): Promise<LoadResult> {
    const result: LoadResult = {
      success: false,
      inserted: 0,
      updated: 0,
      errors: [],
    };

    try {
      console.log(`[FuelEfficiencyLoader] Loading ${vehicles.length} fuel efficiency records`);

      const connected = await testConnection();
      if (!connected) {
        throw new Error('Database connection failed');
      }

      for (const vehicle of vehicles) {
        try {
          const loadResult = await this.upsertVehicle(vehicle);
          if (loadResult === 'inserted') {
            result.inserted++;
          } else {
            result.updated++;
          }
        } catch (error) {
          const errorMsg = `Failed to load ${vehicle.brand} ${vehicle.model}: ${error}`;
          result.errors.push(errorMsg);
          console.error(`[FuelEfficiencyLoader] ${errorMsg}`);
        }
      }

      result.success = true;
      console.log(`[FuelEfficiencyLoader] Loaded ${result.inserted} inserted, ${result.updated} updated`);

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      result.errors.push(errorMessage);
      console.error(`[FuelEfficiencyLoader] Failed to load data: ${errorMessage}`);
      return result;
    }
  }

  private async upsertVehicle(vehicle: TransformedFuelEfficiency): Promise<'inserted' | 'updated'> {
    const queryText = `
      INSERT INTO fuel_efficiency (
        fipe_code,
        brand,
        model,
        year,
        fuel_type,
        city_km_l,
        highway_km_l,
        efficiency_rating
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (fipe_code, fuel_type, year)
      DO UPDATE SET
        brand = EXCLUDED.brand,
        model = EXCLUDED.model,
        city_km_l = EXCLUDED.city_km_l,
        highway_km_l = EXCLUDED.highway_km_l,
        efficiency_rating = EXCLUDED.efficiency_rating,
        updated_at = NOW()
      RETURNING (xmax = 0) as inserted;
    `;

    const values = [
      vehicle.fipeCode || null,
      vehicle.brand,
      vehicle.model,
      vehicle.year,
      vehicle.fuelType,
      vehicle.cityKmL,
      vehicle.highwayKmL,
      vehicle.efficiencyRating,
    ];

    const result = await query(queryText, values);
    const inserted = result.rows[0]?.inserted === true;
    return inserted ? 'inserted' : 'updated';
  }

  async truncate(): Promise<void> {
    try {
      console.log('[FuelEfficiencyLoader] Truncating fuel_efficiency table');
      await query('TRUNCATE TABLE fuel_efficiency CASCADE');
      console.log('[FuelEfficiencyLoader] Table truncated');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[FuelEfficiencyLoader] Failed to truncate table: ${errorMessage}`);
      throw error;
    }
  }

  async count(): Promise<number> {
    try {
      const result = await query('SELECT COUNT(*) as count FROM fuel_efficiency');
      return parseInt(result.rows[0].count, 10);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[FuelEfficiencyLoader] Failed to count records: ${errorMessage}`);
      throw error;
    }
  }
}

export const fuelEfficiencyLoader = new FuelEfficiencyLoader();
