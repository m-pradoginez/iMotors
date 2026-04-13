import * as dotenv from 'dotenv';
import { fipePipeline } from './pipeline/fipePipeline';
import { closePool } from './db/connection';

dotenv.config();

async function main(): Promise<void> {
  console.log('iMotors ETL - FIPE Pipeline');
  console.log('===========================\n');

  // Determine run mode from environment or args
  const sampleMode = process.env.ETL_SAMPLE_MODE === 'true';
  const skipLoad = process.env.ETL_SKIP_LOAD === 'true';

  const result = await fipePipeline.run({
    sampleMode,
    skipLoad,
  });

  if (result.success) {
    console.log('\n✓ Pipeline completed successfully');
    console.log(`  Duration: ${result.metrics.durationMs}ms`);
    console.log(`  Vehicles: ${result.metrics.transformStats.vehicles}`);
    console.log(`  Prices: ${result.metrics.transformStats.prices}`);
    if (result.metrics.loadStats) {
      console.log(`  Loaded: ${result.metrics.loadStats.vehiclesInserted} inserted, ${result.metrics.loadStats.vehiclesUpdated} updated`);
    }
  } else {
    console.error('\n✗ Pipeline failed');
    console.error(`  Error: ${result.error}`);
    process.exitCode = 1;
  }

  // Close database connection
  await closePool();
}

main().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
