import { query } from '../db/connection';
import { VehicleRecord, VehiclePriceRecord } from '../transformers/vehicleTransformer';

export interface LoadResult {
  vehiclesInserted: number;
  vehiclesUpdated: number;
  pricesInserted: number;
  errors: string[];
}

export class VehicleLoader {
  async load(vehicles: VehicleRecord[], prices: VehiclePriceRecord[]): Promise<LoadResult> {
    const result: LoadResult = {
      vehiclesInserted: 0,
      vehiclesUpdated: 0,
      pricesInserted: 0,
      errors: [],
    };

    // Load vehicles with upsert (insert or update)
    for (const vehicle of vehicles) {
      try {
        const upsertResult = await this.upsertVehicle(vehicle);
        if (upsertResult === 'inserted') {
          result.vehiclesInserted++;
        } else {
          result.vehiclesUpdated++;
        }
      } catch (error) {
        result.errors.push(`Failed to load vehicle ${vehicle.fipe_code}: ${error}`);
      }
    }

    // Load prices (always insert new, as each month has its own price snapshot)
    for (const price of prices) {
      try {
        await this.insertPrice(price);
        result.pricesInserted++;
      } catch (error) {
        result.errors.push(`Failed to load price for ${price.fipe_code} (${price.model_year}): ${error}`);
      }
    }

    return result;
  }

  private async upsertVehicle(vehicle: VehicleRecord): Promise<'inserted' | 'updated'> {
    // Try to update existing vehicle first
    const updateResult = await query(
      `UPDATE vehicles
       SET brand = $2, model = $3, vehicle_type = $4, updated_at = NOW()
       WHERE fipe_code = $1
       RETURNING fipe_code`,
      [vehicle.fipe_code, vehicle.brand, vehicle.model, vehicle.vehicle_type]
    );

    if (updateResult.rowCount && updateResult.rowCount > 0) {
      return 'updated';
    }

    // If no update happened, insert new vehicle
    await query(
      `INSERT INTO vehicles (fipe_code, brand, model, vehicle_type)
       VALUES ($1, $2, $3, $4)`,
      [vehicle.fipe_code, vehicle.brand, vehicle.model, vehicle.vehicle_type]
    );

    return 'inserted';
  }

  private async insertPrice(price: VehiclePriceRecord): Promise<void> {
    // Check if this exact price record already exists for this month
    const existing = await query(
      `SELECT id FROM vehicle_prices
       WHERE fipe_code = $1 AND model_year = $2 AND reference_month = $3`,
      [price.fipe_code, price.model_year, price.reference_month]
    );

    if (existing.rowCount && existing.rowCount > 0) {
      // Update existing price for this month
      await query(
        `UPDATE vehicle_prices
         SET price = $4, fuel_type = $5, updated_at = NOW()
         WHERE fipe_code = $1 AND model_year = $2 AND reference_month = $3`,
        [price.fipe_code, price.model_year, price.reference_month, price.price, price.fuel_type]
      );
    } else {
      // Insert new price record
      await query(
        `INSERT INTO vehicle_prices (fipe_code, model_year, fuel_type, price, reference_month)
         VALUES ($1, $2, $3, $4, $5)`,
        [price.fipe_code, price.model_year, price.fuel_type, price.price, price.reference_month]
      );
    }
  }

  /**
   * Truncate all vehicle and price data (useful for full reloads)
   */
  async truncateAll(): Promise<void> {
    await query('TRUNCATE TABLE vehicle_prices, vehicles CASCADE');
  }

  /**
   * Get count of vehicles and prices in database
   */
  async getCounts(): Promise<{ vehicles: number; prices: number }> {
    const vehiclesResult = await query('SELECT COUNT(*) as count FROM vehicles');
    const pricesResult = await query('SELECT COUNT(*) as count FROM vehicle_prices');

    return {
      vehicles: parseInt(vehiclesResult.rows[0].count, 10),
      prices: parseInt(pricesResult.rows[0].count, 10),
    };
  }
}

export const vehicleLoader = new VehicleLoader();
