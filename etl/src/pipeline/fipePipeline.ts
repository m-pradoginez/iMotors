import { BrasilApiClient, VehicleType } from '../clients/brasilApi';
import { CatalogExtractor, ExtractionResult } from '../extractors/catalogExtractor';
import { VehicleTransformer } from '../transformers/vehicleTransformer';
import { VehicleLoader } from '../loaders/vehicleLoader';
import { checkpointManager } from '../utils/checkpoint';

export interface PipelineConfig {
  sampleMode?: boolean;
  batchMode?: boolean;       // Process limited brands, resume from checkpoint
  batchSize?: number;      // Brands per batch (default: 10)
  maxBrandsPerType?: number;
  maxModelsPerBrand?: number;
  sampleVehicleTypes?: string[];
  skipLoad?: boolean; // For extract-only runs
  resetCheckpoint?: boolean; // Reset and start over
}

export interface PipelineMetrics {
  startTime: Date;
  endTime?: Date;
  durationMs?: number;
  extractStats: {
    totalBrands: number;
    totalModels: number;
    totalYears: number;
    successfulPrices: number;
    failedPrices: number;
    errors: string[];
  };
  transformStats: {
    vehicles: number;
    prices: number;
    errors: string[];
  };
  loadStats?: {
    vehiclesInserted: number;
    vehiclesUpdated: number;
    pricesInserted: number;
    errors: string[];
  };
}

export interface PipelineResult {
  success: boolean;
  metrics: PipelineMetrics;
  error?: string;
}

export class FipePipeline {
  private client: BrasilApiClient;
  private extractor: CatalogExtractor;
  private transformer: VehicleTransformer;
  private loader: VehicleLoader;

  constructor(
    client?: BrasilApiClient,
    extractor?: CatalogExtractor,
    transformer?: VehicleTransformer,
    loader?: VehicleLoader
  ) {
    this.client = client || new BrasilApiClient();
    this.extractor = extractor || new CatalogExtractor(this.client);
    this.transformer = transformer || new VehicleTransformer();
    this.loader = loader || new VehicleLoader();
  }

  async run(config: PipelineConfig = {}): Promise<PipelineResult> {
    const metrics: PipelineMetrics = {
      startTime: new Date(),
      extractStats: { totalBrands: 0, totalModels: 0, totalYears: 0, successfulPrices: 0, failedPrices: 0, errors: [] },
      transformStats: { vehicles: 0, prices: 0, errors: [] },
    };

    try {
      console.log('[Pipeline] Starting FIPE ETL pipeline...');
      console.log(`[Pipeline] Mode: ${config.sampleMode ? 'SAMPLE' : 'FULL'}`);

      // Step 1: Extract
      console.log('[Pipeline] Step 1/3: Extracting data from Brasil API...');
      const extractResult = await this.extract(config);
      metrics.extractStats = {
        totalBrands: extractResult.stats.totalBrands,
        totalModels: extractResult.stats.totalModels,
        totalYears: extractResult.stats.totalYears,
        successfulPrices: extractResult.stats.successfulPrices,
        failedPrices: extractResult.stats.failedPrices,
        errors: extractResult.stats.errors,
      };
      console.log(`[Pipeline] Extracted: ${extractResult.entries.length} entries`);
      console.log(`[Pipeline]   - Brands: ${extractResult.stats.totalBrands}, Models: ${extractResult.stats.totalModels}, Years: ${extractResult.stats.totalYears}`);
      console.log(`[Pipeline]   - Prices: ${extractResult.stats.successfulPrices} successful, ${extractResult.stats.failedPrices} failed`);

      if (extractResult.entries.length === 0) {
        throw new Error('No data extracted from API');
      }

      // Step 2: Transform
      console.log('[Pipeline] Step 2/3: Transforming data...');
      const transformResult = this.transformer.transform(extractResult.entries);
      metrics.transformStats = {
        vehicles: transformResult.vehicles.length,
        prices: transformResult.prices.length,
        errors: transformResult.errors,
      };
      console.log(`[Pipeline] Transformed: ${transformResult.vehicles.length} vehicles, ${transformResult.prices.length} prices`);

      if (transformResult.vehicles.length === 0) {
        throw new Error('No vehicles transformed from extracted data');
      }

      // Step 3: Load (optional)
      if (!config.skipLoad) {
        console.log('[Pipeline] Step 3/3: Loading to database...');
        const loadResult = await this.loader.load(
          transformResult.vehicles,
          transformResult.prices
        );
        metrics.loadStats = {
          vehiclesInserted: loadResult.vehiclesInserted,
          vehiclesUpdated: loadResult.vehiclesUpdated,
          pricesInserted: loadResult.pricesInserted,
          errors: loadResult.errors,
        };
        console.log(`[Pipeline] Loaded: ${loadResult.vehiclesInserted} vehicles inserted, ${loadResult.vehiclesUpdated} updated`);
        console.log(`[Pipeline]   - ${loadResult.pricesInserted} prices inserted`);

        if (loadResult.errors.length > 0) {
          console.warn(`[Pipeline]   - ${loadResult.errors.length} load errors`);
        }
      } else {
        console.log('[Pipeline] Step 3/3: Skipped (skipLoad=true)');
      }

      // Finalize metrics
      metrics.endTime = new Date();
      metrics.durationMs = metrics.endTime.getTime() - metrics.startTime.getTime();

      console.log(`[Pipeline] Completed in ${metrics.durationMs}ms`);

      return {
        success: true,
        metrics,
      };
    } catch (error) {
      metrics.endTime = new Date();
      metrics.durationMs = metrics.endTime.getTime() - metrics.startTime.getTime();

      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[Pipeline] Failed after ${metrics.durationMs}ms: ${errorMessage}`);

      return {
        success: false,
        metrics,
        error: errorMessage,
      };
    }
  }

  private async extract(config: PipelineConfig): Promise<ExtractionResult> {
    // Handle checkpoint reset if requested
    if (config.resetCheckpoint) {
      checkpointManager.reset();
    }

    if (config.sampleMode) {
      return this.extractor.extractSample(
        config.sampleVehicleTypes as VehicleType[] | undefined,
        config.maxBrandsPerType,
        config.maxModelsPerBrand
      );
    }

    // Batch mode: process limited brands with checkpointing
    if (config.batchMode) {
      const batchSize = config.batchSize || 10;
      const startIndex = checkpointManager.getStartIndex();
      console.log(`[Pipeline] Batch mode: starting from brand index ${startIndex}, max ${batchSize} brands`);
      return this.extractor.extractBatch(startIndex, batchSize);
    }

    // Full mode: check if we have a checkpoint to resume from
    const startIndex = checkpointManager.getStartIndex();
    if (startIndex > 0 && !config.resetCheckpoint) {
      console.log(`[Pipeline] Resuming from checkpoint at brand index ${startIndex}`);
      return this.extractor.extractBatch(startIndex, 9999);
    }

    return this.extractor.extract();
  }
}

export const fipePipeline = new FipePipeline();
