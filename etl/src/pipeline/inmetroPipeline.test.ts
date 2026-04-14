import { InmetroPipeline } from './inmetroPipeline';
import { InmetroParser } from '../extractors/inmetroParser';
import { FuelEfficiencyTransformer } from '../transformers/fuelEfficiencyTransformer';
import { FuelEfficiencyLoader } from '../loaders/fuelEfficiencyLoader';

jest.mock('../extractors/inmetroParser');
jest.mock('../transformers/fuelEfficiencyTransformer');
jest.mock('../loaders/fuelEfficiencyLoader');

describe('InmetroPipeline', () => {
  let pipeline: InmetroPipeline;
  let mockParser: jest.Mocked<InmetroParser>;
  let mockTransformer: jest.Mocked<FuelEfficiencyTransformer>;
  let mockLoader: jest.Mocked<FuelEfficiencyLoader>;

  beforeEach(() => {
    mockParser = {
      parseSpreadsheet: jest.fn(),
    } as any;
    mockTransformer = {
      transform: jest.fn(),
    } as any;
    mockLoader = {
      load: jest.fn(),
    } as any;

    (InmetroParser as jest.Mock).mockImplementation(() => mockParser);
    (FuelEfficiencyTransformer as jest.Mock).mockImplementation(() => mockTransformer);
    (FuelEfficiencyLoader as jest.Mock).mockImplementation(() => mockLoader);

    pipeline = new InmetroPipeline();
    jest.clearAllMocks();
  });

  describe('run', () => {
    it('should run pipeline successfully with all phases', async () => {
      const mockParseResult = {
        entries: [
          {
            brand: 'TOYOTA',
            model: 'COROLLA',
            year: 2023,
            fuelType: 'gasolina',
            cityKmL: 12.5,
            highwayKmL: 15.2,
            efficiencyRating: 'A',
          },
        ],
        stats: {
          totalRows: 1,
          successfulParses: 1,
          failedParses: 0,
          errors: [],
        },
      };

      const mockTransformResult = {
        vehicles: [
          {
            brand: 'TOYOTA',
            model: 'COROLLA',
            year: 2023,
            fuelType: 'gasolina',
            cityKmL: 12.5,
            highwayKmL: 15.2,
            efficiencyRating: 'A',
          },
        ],
        errors: [],
      };

      const mockLoadResult = {
        success: true,
        inserted: 1,
        updated: 0,
        errors: [],
      };

      mockParser.parseSpreadsheet.mockReturnValue(mockParseResult);
      mockTransformer.transform.mockReturnValue(mockTransformResult);
      mockLoader.load.mockResolvedValue(mockLoadResult);

      const result = await pipeline.run({
        spreadsheetFile: 'test.xlsx',
        skipLoad: false,
      });

      expect(result.success).toBe(true);
      expect(result.metrics.parseStats?.successfulParses).toBe(1);
      expect(result.metrics.transformStats?.total).toBe(1);
      expect(result.metrics.loadStats?.inserted).toBe(1);
      expect(result.metrics.durationMs).toBeGreaterThan(0);
    });

    it('should skip load phase when skipLoad is true', async () => {
      const mockParseResult = {
        entries: [
          {
            brand: 'TOYOTA',
            model: 'COROLLA',
            year: 2023,
            fuelType: 'gasolina',
            cityKmL: 12.5,
            highwayKmL: 15.2,
            efficiencyRating: 'A',
          },
        ],
        stats: {
          totalRows: 1,
          successfulParses: 1,
          failedParses: 0,
          errors: [],
        },
      };

      const mockTransformResult = {
        vehicles: [
          {
            brand: 'TOYOTA',
            model: 'COROLLA',
            year: 2023,
            fuelType: 'gasolina',
            cityKmL: 12.5,
            highwayKmL: 15.2,
            efficiencyRating: 'A',
          },
        ],
        errors: [],
      };

      mockParser.parseSpreadsheet.mockReturnValue(mockParseResult);
      mockTransformer.transform.mockReturnValue(mockTransformResult);

      const result = await pipeline.run({
        spreadsheetFile: 'test.xlsx',
        skipLoad: true,
      });

      expect(result.success).toBe(true);
      expect(result.metrics.loadStats).toBeUndefined();
      expect(mockLoader.load).not.toHaveBeenCalled();
    });

    it('should handle missing spreadsheet file', async () => {
      const result = await pipeline.run({});

      expect(result.success).toBe(false);
      expect(result.error).toContain('No spreadsheet file provided');
    });

    it('should handle parse errors', async () => {
      mockParser.parseSpreadsheet.mockReturnValue({
        entries: [],
        stats: {
          totalRows: 0,
          successfulParses: 0,
          failedParses: 0,
          errors: [],
        },
      });

      const result = await pipeline.run({
        spreadsheetFile: 'test.xlsx',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('No entries parsed');
    });

    it('should handle load errors gracefully', async () => {
      const mockParseResult = {
        entries: [
          {
            brand: 'TOYOTA',
            model: 'COROLLA',
            year: 2023,
            fuelType: 'gasolina',
            cityKmL: 12.5,
            highwayKmL: 15.2,
            efficiencyRating: 'A',
          },
        ],
        stats: {
          totalRows: 1,
          successfulParses: 1,
          failedParses: 0,
          errors: [],
        },
      };

      const mockTransformResult = {
        vehicles: [
          {
            brand: 'TOYOTA',
            model: 'COROLLA',
            year: 2023,
            fuelType: 'gasolina',
            cityKmL: 12.5,
            highwayKmL: 15.2,
            efficiencyRating: 'A',
          },
        ],
        errors: [],
      };

      mockParser.parseSpreadsheet.mockReturnValue(mockParseResult);
      mockTransformer.transform.mockReturnValue(mockTransformResult);
      mockLoader.load.mockResolvedValue({
        success: false,
        inserted: 0,
        updated: 0,
        errors: ['Database error'],
      });

      const result = await pipeline.run({
        spreadsheetFile: 'test.xlsx',
        skipLoad: false,
      });

      expect(result.success).toBe(true); // Pipeline succeeds even if load has errors
      expect(result.metrics.loadStats?.errors).toBe(1);
    });
  });
});
