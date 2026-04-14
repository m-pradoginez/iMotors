import * as dotenv from 'dotenv';
import { fipePipeline } from './pipeline/fipePipeline';
import { closePool } from './db/connection';
import { checkpointManager } from './utils/checkpoint';

dotenv.config();

async function main(): Promise<void> {
  console.log('iMotors ETL - FIPE Pipeline');
  console.log('===========================\n');

  // Parse CLI arguments
  const args = process.argv.slice(2);
  const sampleMode = args.includes('--sample') || process.env.ETL_SAMPLE_MODE === 'true';
  const batchMode = args.includes('--batch') || process.env.ETL_BATCH_MODE === 'true';
  const batchSize = parseInt(process.env.ETL_BATCH_SIZE || '10', 10);
  const resetCheckpoint = args.includes('--reset') || process.env.ETL_RESET === 'true';
  const status = args.includes('--status');
  const skipLoad = args.includes('--skip-load') || process.env.ETL_SKIP_LOAD === 'true';

  // Show checkpoint status if requested
  if (status) {
    const chk = checkpointManager.getStatus();
    console.log('Checkpoint Status:');
    console.log(`  Last brand index: ${chk.lastBrandIndex}`);
    console.log(`  Total processed: ${chk.totalProcessed}`);
    console.log(`  Last updated: ${chk.updatedAt}`);
    await closePool();
    return;
  }

  // Determine run mode from environment or args
  const result = await fipePipeline.run({
    sampleMode,
    batchMode,
    batchSize,
    resetCheckpoint,
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
