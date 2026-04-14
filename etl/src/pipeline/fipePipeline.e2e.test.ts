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
    // We use a very small sample to avoid hitting rate limits or taking too long
    // only 1 brand, 1 model, 1 year
    const result = await pipeline.run({
      sampleMode: true,
      sampleVehicleTypes: ['carros'],
      maxBrandsPerType: 1,
      maxModelsPerBrand: 1,
      skipLoad: true, // Don't touch DB in E2E integration test unless explicitly needed
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
});
