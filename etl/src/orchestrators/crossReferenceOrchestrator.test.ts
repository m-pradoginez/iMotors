import { crossReferenceOrchestrator } from './crossReferenceOrchestrator';
import { FipeVehicle, InmetroVehicle } from '../matchers/exactMatcher';

jest.mock('../matchers/exactMatcher');
jest.mock('../matchers/fuzzyMatcher');
jest.mock('../transformers/crossReferenceTransformer');
jest.mock('../loaders/crossReferenceLoader');

describe('CrossReferenceOrchestrator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('execute', () => {
    it('should orchestrate the cross-reference pipeline', async () => {
      const fipeVehicles: FipeVehicle[] = [
        {
          fipeCode: '001001-0',
          brand: 'TOYOTA',
          model: 'COROLLA',
          year: 2023,
          fuelType: 'gasolina',
          price: 120000,
        },
      ];

      const inmetroVehicles: InmetroVehicle[] = [
        {
          id: 1,
          brand: 'TOYOTA',
          model: 'COROLLA',
          year: 2023,
          fuelType: 'gasolina',
          cityKmL: 12.5,
          highwayKmL: 15.2,
          efficiencyRating: 'A',
        },
      ];

      // Mock the dependencies
      const { ExactMatcher } = require('../matchers/exactMatcher');
      const { FuzzyMatcher } = require('../matchers/fuzzyMatcher');
      const { crossReferenceTransformer } = require('../transformers/crossReferenceTransformer');
      const { crossReferenceLoader } = require('../loaders/crossReferenceLoader');

      ExactMatcher.matchAll.mockReturnValue([]);
      ExactMatcher.getStats.mockReturnValue({ matched: 0, unmatched: 1, matchRate: 0 });
      FuzzyMatcher.matchAll.mockReturnValue([]);
      FuzzyMatcher.getStats.mockReturnValue({ matched: 0, unmatched: 1, matchRate: 0, averageConfidence: 0 });
      crossReferenceTransformer.transform.mockReturnValue({
        vehicles: [],
        fipeOnly: [],
        inmetroOnly: [],
        errors: [],
      });
      crossReferenceLoader.load.mockResolvedValue({ inserted: 0, updated: 0, errors: [] });

      const metrics = await crossReferenceOrchestrator.execute(fipeVehicles, inmetroVehicles);

      expect(metrics.fipeCount).toBe(1);
      expect(metrics.inmetroCount).toBe(1);
      expect(metrics.exactMatches).toBe(0);
      expect(metrics.fuzzyMatches).toBe(0);
      expect(metrics.totalMatches).toBe(0);
      expect(metrics.errors).toBe(0);
      expect(metrics.durationMs).toBeGreaterThanOrEqual(0);
    });

    it('should track execution time', async () => {
      const fipeVehicles: FipeVehicle[] = [];
      const inmetroVehicles: InmetroVehicle[] = [];

      const { ExactMatcher } = require('../matchers/exactMatcher');
      const { FuzzyMatcher } = require('../matchers/fuzzyMatcher');
      const { crossReferenceTransformer } = require('../transformers/crossReferenceTransformer');
      const { crossReferenceLoader } = require('../loaders/crossReferenceLoader');

      ExactMatcher.matchAll.mockReturnValue([]);
      ExactMatcher.getStats.mockReturnValue({ matched: 0, unmatched: 0, matchRate: 0 });
      FuzzyMatcher.matchAll.mockReturnValue([]);
      FuzzyMatcher.getStats.mockReturnValue({ matched: 0, unmatched: 0, matchRate: 0, averageConfidence: 0 });
      crossReferenceTransformer.transform.mockReturnValue({
        vehicles: [],
        fipeOnly: [],
        inmetroOnly: [],
        errors: [],
      });
      crossReferenceLoader.load.mockResolvedValue({ inserted: 0, updated: 0, errors: [] });

      const metrics = await crossReferenceOrchestrator.execute(fipeVehicles, inmetroVehicles);

      expect(metrics.durationMs).toBeGreaterThanOrEqual(0);
      expect(metrics.startTime).toBeInstanceOf(Date);
      expect(metrics.endTime).toBeInstanceOf(Date);
    });

    it('should accumulate errors from transform and load', async () => {
      const fipeVehicles: FipeVehicle[] = [];
      const inmetroVehicles: InmetroVehicle[] = [];

      const { ExactMatcher } = require('../matchers/exactMatcher');
      const { FuzzyMatcher } = require('../matchers/fuzzyMatcher');
      const { crossReferenceTransformer } = require('../transformers/crossReferenceTransformer');
      const { crossReferenceLoader } = require('../loaders/crossReferenceLoader');

      ExactMatcher.matchAll.mockReturnValue([]);
      ExactMatcher.getStats.mockReturnValue({ matched: 0, unmatched: 0, matchRate: 0 });
      FuzzyMatcher.matchAll.mockReturnValue([]);
      FuzzyMatcher.getStats.mockReturnValue({ matched: 0, unmatched: 0, matchRate: 0, averageConfidence: 0 });
      crossReferenceTransformer.transform.mockReturnValue({
        vehicles: [],
        fipeOnly: [],
        inmetroOnly: [],
        errors: ['error1'],
      });
      crossReferenceLoader.load.mockResolvedValue({ inserted: 0, updated: 0, errors: ['error2'] });

      const metrics = await crossReferenceOrchestrator.execute(fipeVehicles, inmetroVehicles);

      expect(metrics.errors).toBe(2);
    });
  });

  describe('clear', () => {
    it('should clear vehicles_unified table', async () => {
      const { crossReferenceLoader } = require('../loaders/crossReferenceLoader');
      crossReferenceLoader.truncate.mockResolvedValue();

      await crossReferenceOrchestrator.clear();

      expect(crossReferenceLoader.truncate).toHaveBeenCalled();
    });
  });
});
