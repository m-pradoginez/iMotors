import { FipePipeline } from './fipePipeline';
import { closePool } from '../db/connection';

describe('FipePipeline E2E (Sample)', () => {
  let pipeline: FipePipeline;

  beforeAll(() => {
    pipeline = new FipePipeline();
  });

  afterAll(async () => {
    await closePool();
  });

  it('should run a real sample extraction and transformation without errors', async () => {
    // Use a small sample to avoid hitting rate limits in CI
    const result = await pipeline.run({
      sampleMode: true,
      sampleVehicleTypes: ['carros'],
      maxBrandsPerType: 1,
      maxModelsPerBrand: 1,
      skipLoad: true, // Don't touch DB in CI E2E test
    });

    if (!result.success) {
      console.error('Pipeline Error:', result.error);
      console.error('Extract Stats:', JSON.stringify(result.metrics.extractStats, null, 2));
      throw new Error(`Pipeline failed: ${result.error}`);
    }

    expect(result.success).toBe(true);
    expect(result.metrics.extractStats.totalBrands).toBeGreaterThan(0);
    expect(result.metrics.transformStats.vehicles).toBeGreaterThan(0);
    expect(result.metrics.durationMs).toBeGreaterThan(0);
  }, 30000); // 30s timeout for real API calls

  it('should run full pipeline with real DB when DATABASE_URL is set', async () => {
    // Only run this test if DATABASE_URL is set (real DB integration)
    if (!process.env.DATABASE_URL) {
      console.log('Skipping real DB E2E test - DATABASE_URL not set');
      return;
    }

    // Use larger sample to get at least 100 records as per T8 requirement
    const result = await pipeline.run({
      sampleMode: true,
      sampleVehicleTypes: ['carros'],
      maxBrandsPerType: 5, // More brands to get 100+ records
      maxModelsPerBrand: 5,
      skipLoad: false, // Load to real DB
    });

    if (!result.success) {
      console.error('Pipeline Error:', result.error);
      console.error('Extract Stats:', JSON.stringify(result.metrics.extractStats, null, 2));
      throw new Error(`Pipeline failed: ${result.error}`);
    }

    expect(result.success).toBe(true);
    expect(result.metrics.extractStats.totalBrands).toBeGreaterThan(0);
    expect(result.metrics.transformStats.vehicles).toBeGreaterThanOrEqual(100);
    expect(result.metrics.loadStats?.vehiclesInserted).toBeGreaterThan(0);
  }, 120000); // 2min timeout for real DB operations
});
