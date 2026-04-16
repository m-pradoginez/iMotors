import * as dotenv from 'dotenv';
import { crossReferenceOrchestrator } from '../orchestrators/crossReferenceOrchestrator';
import { closePool } from '../db/connection';
import { query } from '../db/connection';
import { FipeVehicle, InmetroVehicle } from '../matchers/exactMatcher';

dotenv.config();

async function fetchFipeVehicles(): Promise<FipeVehicle[]> {
  const result = await query(
    `SELECT vp.fipe_code, vp.brand, vp.model, vp.year, vp.fuel_type, vp.price,
            v.category
     FROM vehicle_prices vp
     LEFT JOIN vehicles v ON vp.fipe_code = v.fipe_code
     ORDER BY vp.brand, vp.model`
  );
  return result.rows.map(row => ({
    fipeCode: row.fipe_code,
    brand: row.brand,
    model: row.model,
    year: row.year,
    fuelType: row.fuel_type,
    price: row.price,
    category: row.category,
  }));
}

async function fetchInmetroVehicles(): Promise<InmetroVehicle[]> {
  const result = await query(
    `SELECT id, brand, model, year, fuel_type, city_km_l, highway_km_l, efficiency_rating
     FROM fuel_efficiency
     ORDER BY brand, model`
  );
  return result.rows.map((row, index) => ({
    id: row.id || index,
    brand: row.brand,
    model: row.model,
    year: row.year,
    fuelType: row.fuel_type,
    cityKmL: row.city_km_l,
    highwayKmL: row.highway_km_l,
    efficiencyRating: row.efficiency_rating,
  }));
}

async function main(): Promise<void> {
  console.log('iMotors ETL - Cross-Reference Pipeline');
  console.log('=======================================\n');

  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run') || process.env.CROSS_REF_DRY_RUN === 'true';

  try {
    // Fetch data from database
    console.log('Fetching FIPE vehicles from database...');
    const fipeVehicles = await fetchFipeVehicles();
    console.log(`  Found ${fipeVehicles.length} FIPE vehicles`);

    console.log('Fetching Inmetro vehicles from database...');
    const inmetroVehicles = await fetchInmetroVehicles();
    console.log(`  Found ${inmetroVehicles.length} Inmetro vehicles`);

    if (dryRun) {
      console.log('\n[DRY RUN] Would execute cross-reference with:');
      console.log(`  FIPE vehicles: ${fipeVehicles.length}`);
      console.log(`  Inmetro vehicles: ${inmetroVehicles.length}`);
    } else {
      // Execute cross-reference
      const metrics = await crossReferenceOrchestrator.execute(fipeVehicles, inmetroVehicles);

      console.log('\n✓ Cross-Reference Pipeline completed successfully');
      console.log(`  Duration: ${metrics.durationMs}ms`);
      console.log(`  FIPE vehicles: ${metrics.fipeCount}`);
      console.log(`  Inmetro vehicles: ${metrics.inmetroCount}`);
      console.log(`  Matches found: ${metrics.totalMatches}`);
      console.log(`    - Exact: ${metrics.exactMatches}`);
      console.log(`    - Fuzzy: ${metrics.fuzzyMatches}`);
      console.log(`  FIPE-only: ${metrics.fipeOnly}`);
      console.log(`  Inmetro-only: ${metrics.inmetroOnly}`);
      console.log(`  Unified vehicles loaded: ${metrics.loaded}`);
      if (metrics.errors > 0) {
        console.log(`  Errors: ${metrics.errors}`);
      }
    }
  } catch (error) {
    console.error('\n✗ Cross-Reference Pipeline failed');
    console.error(`  Error: ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  }

  await closePool();
}

main().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
