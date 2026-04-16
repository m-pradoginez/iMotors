import * as dotenv from 'dotenv';
import { inmetroPipeline } from './inmetroPipeline';
import { closePool } from '../db/connection';

dotenv.config();

async function main(): Promise<void> {
  console.log('iMotors ETL - Inmetro Pipeline');
  console.log('==============================\n');

  const args = process.argv.slice(2);
  const spreadsheetFile = process.env.INMETRO_SPREADSHEET_FILE;
  const skipLoad = args.includes('--skip-load') || process.env.INMETRO_SKIP_LOAD === 'true';

  const result = await inmetroPipeline.run({
    spreadsheetFile,
    skipLoad,
  });

  if (result.success) {
    console.log('\n✓ Inmetro Pipeline completed successfully');
    console.log(`  Duration: ${result.metrics.durationMs}ms`);
    if (result.metrics.parseStats) {
      console.log(`  Parsed: ${result.metrics.parseStats.successfulParses} entries`);
    }
    if (result.metrics.transformStats) {
      console.log(`  Transformed: ${result.metrics.transformStats.total} entries`);
    }
    if (result.metrics.loadStats) {
      console.log(`  Loaded: ${result.metrics.loadStats.inserted} inserted, ${result.metrics.loadStats.updated} updated`);
    }
  } else {
    console.error('\n✗ Inmetro Pipeline failed');
    console.error(`  Error: ${result.error}`);
    process.exitCode = 1;
  }

  await closePool();
}

main().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
