import { FuelEfficiencyLoader } from './fuelEfficiencyLoader';
import { query, testConnection } from '../db/connection';
import { TransformedFuelEfficiency } from '../transformers/fuelEfficiencyTransformer';

jest.mock('../db/connection');
const mockedQuery = query as jest.MockedFunction<typeof query>;
const mockedTestConnection = testConnection as jest.MockedFunction<typeof testConnection>;

describe('FuelEfficiencyLoader', () => {
  let loader: FuelEfficiencyLoader;

  beforeEach(() => {
    loader = new FuelEfficiencyLoader();
    jest.clearAllMocks();
  });

  describe('load', () => {
    it('should load vehicles successfully', async () => {
      const vehicles: TransformedFuelEfficiency[] = [
        {
          fipeCode: '001001-0',
          brand: 'TOYOTA',
          model: 'COROLLA',
          year: 2023,
          fuelType: 'gasolina',
          cityKmL: 12.5,
          highwayKmL: 15.2,
          efficiencyRating: 'A',
        },
      ];

      mockedTestConnection.mockResolvedValue(true);
      mockedQuery.mockResolvedValue({
        rows: [{ inserted: true }],
      } as any);

      const result = await loader.load(vehicles);

      expect(result.success).toBe(true);
      expect(result.inserted).toBe(1);
      expect(result.updated).toBe(0);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle database connection failure', async () => {
      const vehicles: TransformedFuelEfficiency[] = [
        {
          fipeCode: '001001-0',
          brand: 'TOYOTA',
          model: 'COROLLA',
          year: 2023,
          fuelType: 'gasolina',
          cityKmL: 12.5,
          highwayKmL: 15.2,
          efficiencyRating: 'A',
        },
      ];

      mockedTestConnection.mockResolvedValue(false);

      const result = await loader.load(vehicles);

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('Database connection failed');
    });

    it('should handle partial failures gracefully', async () => {
      const vehicles: TransformedFuelEfficiency[] = [
        {
          fipeCode: '001001-0',
          brand: 'TOYOTA',
          model: 'COROLLA',
          year: 2023,
          fuelType: 'gasolina',
          cityKmL: 12.5,
          highwayKmL: 15.2,
          efficiencyRating: 'A',
        },
        {
          fipeCode: '002002-0',
          brand: 'HONDA',
          model: 'CIVIC',
          year: 2023,
          fuelType: 'flex',
          cityKmL: 10.0,
          highwayKmL: 13.5,
          efficiencyRating: 'B',
        },
      ];

      mockedTestConnection.mockResolvedValue(true);
      mockedQuery
        .mockResolvedValueOnce({ rows: [{ inserted: true }] } as any)
        .mockRejectedValueOnce(new Error('Database error'));

      const result = await loader.load(vehicles);

      expect(result.success).toBe(true);
      expect(result.inserted).toBe(1);
      expect(result.errors).toHaveLength(1);
    });
  });

  describe('truncate', () => {
    it('should truncate table successfully', async () => {
      mockedQuery.mockResolvedValue({} as any);

      await loader.truncate();

      expect(mockedQuery).toHaveBeenCalledWith('TRUNCATE TABLE fuel_efficiency CASCADE');
    });

    it('should handle truncate errors', async () => {
      mockedQuery.mockRejectedValue(new Error('Database error'));

      await expect(loader.truncate()).rejects.toThrow('Database error');
    });
  });

  describe('count', () => {
    it('should count records successfully', async () => {
      mockedQuery.mockResolvedValue({
        rows: [{ count: '100' }],
      } as any);

      const count = await loader.count();

      expect(count).toBe(100);
      expect(mockedQuery).toHaveBeenCalledWith('SELECT COUNT(*) as count FROM fuel_efficiency');
    });

    it('should handle count errors', async () => {
      mockedQuery.mockRejectedValue(new Error('Database error'));

      await expect(loader.count()).rejects.toThrow('Database error');
    });
  });
});
