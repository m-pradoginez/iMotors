import { VehicleLoader } from './vehicleLoader';
import { query } from '../db/connection';
import { VehicleRecord, VehiclePriceRecord } from '../transformers/vehicleTransformer';

jest.mock('../db/connection');

describe('VehicleLoader', () => {
  let loader: VehicleLoader;
  let mockQuery: jest.MockedFunction<typeof query>;

  beforeEach(() => {
    loader = new VehicleLoader();
    mockQuery = query as jest.MockedFunction<typeof query>;
    mockQuery.mockReset();
    mockQuery.mockResolvedValue({ rows: [], rowCount: 0, command: 'SELECT', oid: 0, fields: [] } as any);
  });

  const createMockVehicle = (fipeCode: string, brand: string, model: string): VehicleRecord => ({
    fipe_code: fipeCode,
    brand,
    model,
    vehicle_type: 'carros',
  });

  const createMockPrice = (fipeCode: string, year: number, price: number, month: string): VehiclePriceRecord => ({
    fipe_code: fipeCode,
    model_year: year,
    fuel_type: 'Gasolina',
    price,
    reference_month: month,
  });

  describe('load', () => {
    it('should insert new vehicles when they do not exist', async () => {
      // Mock update returning 0 rows (vehicle doesn't exist)
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 } as any);
      // Mock insert
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 1 } as any);

      const vehicles = [createMockVehicle('001101-1', 'Toyota', 'Corolla')];
      const result = await loader.load(vehicles, []);

      expect(result.vehiclesInserted).toBe(1);
      expect(result.vehiclesUpdated).toBe(0);
    });

    it('should update existing vehicles when they already exist', async () => {
      // Mock update returning 1 row (vehicle exists and was updated)
      mockQuery.mockResolvedValueOnce({ rows: [{ fipe_code: '001101-1' }], rowCount: 1 } as any);

      const vehicles = [createMockVehicle('001101-1', 'Toyota', 'Corolla')];
      const result = await loader.load(vehicles, []);

      expect(result.vehiclesInserted).toBe(0);
      expect(result.vehiclesUpdated).toBe(1);
    });

    it('should insert new price records', async () => {
      // Skip vehicle upsert
      mockQuery.mockResolvedValueOnce({ rows: [{ fipe_code: '001101-1' }], rowCount: 1 } as any);
      // Check existing price - returns empty
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 } as any);
      // Insert price
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 1 } as any);

      const vehicles: VehicleRecord[] = [];
      const prices = [createMockPrice('001101-1', 2024, 150000, 'abril/2026')];
      const result = await loader.load(vehicles, prices);

      expect(result.pricesInserted).toBe(1);
    });

    it('should update existing price records for the same month', async () => {
      // Skip vehicle upsert
      mockQuery.mockResolvedValueOnce({ rows: [{ fipe_code: '001101-1' }], rowCount: 1 } as any);
      // Check existing price - returns existing record
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1 }], rowCount: 1 } as any);
      // Update price
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 1 } as any);

      const vehicles: VehicleRecord[] = [];
      const prices = [createMockPrice('001101-1', 2024, 155000, 'abril/2026')];
      const result = await loader.load(vehicles, prices);

      // Price is updated, still counts as inserted for stats
      expect(result.pricesInserted).toBe(1);
    });

    it('should handle vehicle load failures gracefully', async () => {
      mockQuery.mockRejectedValueOnce(new Error('Database error'));

      const vehicles = [createMockVehicle('001101-1', 'Toyota', 'Corolla')];
      const result = await loader.load(vehicles, []);

      expect(result.vehiclesInserted).toBe(0);
      expect(result.vehiclesUpdated).toBe(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('Failed to load vehicle');
    });

    it('should handle price load failures gracefully', async () => {
      // Vehicle upsert success
      mockQuery.mockResolvedValueOnce({ rows: [{ fipe_code: '001101-1' }], rowCount: 1 } as any);
      // Price check fails
      mockQuery.mockRejectedValueOnce(new Error('Database error'));

      const vehicles: VehicleRecord[] = [];
      const prices = [createMockPrice('001101-1', 2024, 150000, 'abril/2026')];
      const result = await loader.load(vehicles, prices);

      expect(result.pricesInserted).toBe(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('Failed to load price');
    });

    it('should process multiple vehicles and prices', async () => {
      // Vehicle 1: update existing
      mockQuery.mockResolvedValueOnce({ rows: [{ fipe_code: '001101-1' }], rowCount: 1 } as any);
      // Vehicle 2: insert new
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 } as any);
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 1 } as any);

      // Price 1: check existing (0 rows) and insert
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 } as any);
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 1 } as any);
      // Price 2: check existing (0 rows) and insert
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 } as any);
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 1 } as any);

      const vehicles = [
        createMockVehicle('001101-1', 'Toyota', 'Corolla'),
        createMockVehicle('002201-1', 'Honda', 'Civic'),
      ];
      const prices = [
        createMockPrice('001101-1', 2024, 150000, 'abril/2026'),
        createMockPrice('002201-1', 2024, 160000, 'abril/2026'),
      ];

      const result = await loader.load(vehicles, prices);

      expect(result.vehiclesInserted).toBe(1);
      expect(result.vehiclesUpdated).toBe(1);
      expect(result.pricesInserted).toBe(2);
    });

    it('should handle empty arrays', async () => {
      const result = await loader.load([], []);

      expect(result.vehiclesInserted).toBe(0);
      expect(result.vehiclesUpdated).toBe(0);
      expect(result.pricesInserted).toBe(0);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('truncateAll', () => {
    it('should truncate both tables', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 } as any);

      await loader.truncateAll();

      expect(mockQuery).toHaveBeenCalledWith('TRUNCATE TABLE vehicle_prices, vehicles CASCADE');
    });
  });

  describe('getCounts', () => {
    it('should return vehicle and price counts', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ count: '42' }], rowCount: 1 } as any);
      mockQuery.mockResolvedValueOnce({ rows: [{ count: '156' }], rowCount: 1 } as any);

      const counts = await loader.getCounts();

      expect(counts.vehicles).toBe(42);
      expect(counts.prices).toBe(156);
    });
  });
});
