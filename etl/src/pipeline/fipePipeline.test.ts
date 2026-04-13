import { FipePipeline, PipelineConfig } from './fipePipeline';
import { BrasilApiClient } from '../clients/brasilApi';
import { CatalogExtractor, ExtractionResult } from '../extractors/catalogExtractor';
import { VehicleTransformer, TransformedData } from '../transformers/vehicleTransformer';
import { VehicleLoader, LoadResult } from '../loaders/vehicleLoader';
import { VehicleType } from '../clients/brasilApi';

jest.mock('../clients/brasilApi');
jest.mock('../extractors/catalogExtractor');
jest.mock('../transformers/vehicleTransformer');
jest.mock('../loaders/vehicleLoader');

describe('FipePipeline', () => {
  let pipeline: FipePipeline;
  let mockClient: jest.Mocked<BrasilApiClient>;
  let mockExtractor: jest.Mocked<CatalogExtractor>;
  let mockTransformer: jest.Mocked<VehicleTransformer>;
  let mockLoader: jest.Mocked<VehicleLoader>;

  beforeEach(() => {
    mockClient = new BrasilApiClient() as jest.Mocked<BrasilApiClient>;
    mockExtractor = new CatalogExtractor(mockClient) as jest.Mocked<CatalogExtractor>;
    mockTransformer = new VehicleTransformer() as jest.Mocked<VehicleTransformer>;
    mockLoader = new VehicleLoader() as jest.Mocked<VehicleLoader>;

    pipeline = new FipePipeline(
      mockClient,
      mockExtractor,
      mockTransformer,
      mockLoader
    );
  });

  const createMockExtractResult = (entryCount: number): ExtractionResult => ({
    entries: Array(entryCount).fill({
      vehicleType: 'carros' as VehicleType,
      brandCode: '1',
      brandName: 'Toyota',
      modelCode: '101',
      modelName: 'Corolla',
      yearCode: '001101-1',
      yearName: '2024 Gasolina',
      price: null,
    }),
    stats: {
      totalBrands: 1,
      totalModels: entryCount,
      totalYears: entryCount,
      successfulPrices: 0,
      failedPrices: 0,
      errors: [],
    },
  });

  const createMockTransformResult = (vehicleCount: number, priceCount: number): TransformedData => ({
    vehicles: Array(vehicleCount).fill({
      fipe_code: '001101-1',
      brand: 'Toyota',
      model: 'Corolla',
      vehicle_type: 'carros',
    }),
    prices: Array(priceCount).fill({
      fipe_code: '001101-1',
      model_year: 2024,
      fuel_type: 'Gasolina',
      price: 150000,
      reference_month: 'abril/2026',
    }),
    errors: [],
  });

  const createMockLoadResult = (): LoadResult => ({
    vehiclesInserted: 1,
    vehiclesUpdated: 0,
    pricesInserted: 1,
    errors: [],
  });

  describe('run', () => {
    it('should run full pipeline successfully', async () => {
      mockExtractor.extract.mockResolvedValue(createMockExtractResult(1));
      mockTransformer.transform.mockReturnValue(createMockTransformResult(1, 1));
      mockLoader.load.mockResolvedValue(createMockLoadResult());

      const result = await pipeline.run();

      expect(result.success).toBe(true);
      expect(result.metrics.extractStats.totalBrands).toBe(1);
      expect(result.metrics.transformStats.vehicles).toBe(1);
      expect(result.metrics.loadStats?.vehiclesInserted).toBe(1);
      expect(result.error).toBeUndefined();
    });

    it('should run sample mode successfully', async () => {
      mockExtractor.extractSample.mockResolvedValue(createMockExtractResult(2));
      mockTransformer.transform.mockReturnValue(createMockTransformResult(2, 2));
      mockLoader.load.mockResolvedValue({
        vehiclesInserted: 2,
        vehiclesUpdated: 0,
        pricesInserted: 2,
        errors: [],
      });

      const config: PipelineConfig = {
        sampleMode: true,
        sampleVehicleTypes: ['carros'],
        maxBrandsPerType: 1,
        maxModelsPerBrand: 2,
      };

      const result = await pipeline.run(config);

      expect(result.success).toBe(true);
      expect(mockExtractor.extractSample).toHaveBeenCalledWith(['carros'], 1, 2);
      expect(result.metrics.extractStats.totalModels).toBe(2);
    });

    it('should skip load when skipLoad is true', async () => {
      mockExtractor.extract.mockResolvedValue(createMockExtractResult(1));
      mockTransformer.transform.mockReturnValue(createMockTransformResult(1, 1));

      const result = await pipeline.run({ skipLoad: true });

      expect(result.success).toBe(true);
      expect(mockLoader.load).not.toHaveBeenCalled();
      expect(result.metrics.loadStats).toBeUndefined();
    });

    it('should handle extract failure', async () => {
      mockExtractor.extract.mockRejectedValue(new Error('API timeout'));

      const result = await pipeline.run();

      expect(result.success).toBe(false);
      expect(result.error).toContain('API timeout');
      expect(mockTransformer.transform).not.toHaveBeenCalled();
      expect(mockLoader.load).not.toHaveBeenCalled();
    });

    it('should handle transform with no vehicles', async () => {
      mockExtractor.extract.mockResolvedValue(createMockExtractResult(1));
      mockTransformer.transform.mockReturnValue({
        vehicles: [],
        prices: [],
        errors: [],
      });

      const result = await pipeline.run();

      expect(result.success).toBe(false);
      expect(result.error).toContain('No vehicles transformed');
      expect(mockLoader.load).not.toHaveBeenCalled();
    });

    it('should handle extract with no entries', async () => {
      mockExtractor.extract.mockResolvedValue({
        entries: [],
        stats: {
          totalBrands: 0,
          totalModels: 0,
          totalYears: 0,
          successfulPrices: 0,
          failedPrices: 0,
          errors: [],
        },
      });

      const result = await pipeline.run();

      expect(result.success).toBe(false);
      expect(result.error).toContain('No data extracted');
    });

    it('should track extraction errors in metrics', async () => {
      const extractResult: ExtractionResult = {
        entries: [],
        stats: {
          totalBrands: 0,
          totalModels: 0,
          totalYears: 0,
          successfulPrices: 0,
          failedPrices: 0,
          errors: ['Failed to fetch brands for carros'],
        },
      };

      mockExtractor.extract.mockResolvedValue(extractResult);

      const result = await pipeline.run();

      expect(result.success).toBe(false);
      expect(result.metrics.extractStats.errors).toContain('Failed to fetch brands for carros');
    });

    it('should handle load errors gracefully', async () => {
      mockExtractor.extract.mockResolvedValue(createMockExtractResult(1));
      mockTransformer.transform.mockReturnValue(createMockTransformResult(1, 1));
      mockLoader.load.mockResolvedValue({
        vehiclesInserted: 1,
        vehiclesUpdated: 0,
        pricesInserted: 0,
        errors: ['Failed to load price for 001101-1'],
      });

      const result = await pipeline.run();

      expect(result.success).toBe(true);
      expect(result.metrics.loadStats?.errors).toContain('Failed to load price for 001101-1');
    });

    it('should track duration in metrics', async () => {
      mockExtractor.extract.mockResolvedValue(createMockExtractResult(1));
      mockTransformer.transform.mockReturnValue(createMockTransformResult(1, 1));
      mockLoader.load.mockResolvedValue(createMockLoadResult());

      const result = await pipeline.run();

      expect(result.metrics.startTime).toBeInstanceOf(Date);
      expect(result.metrics.endTime).toBeInstanceOf(Date);
      expect(result.metrics.durationMs).toBeGreaterThanOrEqual(0);
    });
  });
});
