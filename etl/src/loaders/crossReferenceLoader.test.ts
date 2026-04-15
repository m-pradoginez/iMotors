import { crossReferenceLoader } from './crossReferenceLoader';
import { UnifiedVehicle } from '../transformers/crossReferenceTransformer';
import { query } from '../db/connection';

jest.mock('../db/connection');

describe('CrossReferenceLoader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('load', () => {
    it('should load vehicles to database and update fuel_efficiency', async () => {
      const vehicles: UnifiedVehicle[] = [
        {
          fipeCode: '001001-0',
          brand: 'TOYOTA',
          model: 'COROLLA',
          year: 2023,
          fuelType: 'gasolina',
          price: 120000,
          cityKmL: 12.5,
          highwayKmL: 15.2,
          efficiencyRating: 'A',
          matchConfidence: 'exact',
        },
      ];

      (query as jest.Mock).mockResolvedValue({ rows: [] });

      const result = await crossReferenceLoader.load(vehicles);

      expect(result.inserted).toBe(1);
      expect(result.errors).toHaveLength(0);
      expect(query).toHaveBeenCalledTimes(2); // 1 upsert + 1 update fuel_efficiency
    });

    it('should handle vehicles without efficiency data', async () => {
      const vehicles: UnifiedVehicle[] = [
        {
          fipeCode: '001001-0',
          brand: 'TOYOTA',
          model: 'COROLLA',
          year: 2023,
          fuelType: 'gasolina',
          price: 120000,
          matchConfidence: 'manual',
          matchNotes: 'No Inmetro match',
        },
      ];

      (query as jest.Mock).mockResolvedValue({ rows: [] });

      const result = await crossReferenceLoader.load(vehicles);

      expect(result.inserted).toBe(1);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle Inmetro-only vehicles (no fipe_code)', async () => {
      const vehicles: UnifiedVehicle[] = [
        {
          fipeCode: '',
          brand: 'TOYOTA',
          model: 'COROLLA',
          year: 2023,
          fuelType: 'gasolina',
          cityKmL: 12.5,
          highwayKmL: 15.2,
          efficiencyRating: 'A',
          matchConfidence: 'manual',
          matchNotes: 'No FIPE match',
        },
      ];

      (query as jest.Mock).mockResolvedValue({ rows: [] });

      const result = await crossReferenceLoader.load(vehicles);

      expect(result.inserted).toBe(1);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle load errors gracefully', async () => {
      const vehicles: UnifiedVehicle[] = [
        {
          fipeCode: '001001-0',
          brand: 'TOYOTA',
          model: 'COROLLA',
          year: 2023,
          fuelType: 'gasolina',
          price: 120000,
          cityKmL: 12.5,
          highwayKmL: 15.2,
          efficiencyRating: 'A',
          matchConfidence: 'exact',
        },
      ];

      (query as jest.Mock).mockRejectedValue(new Error('Database error'));

      const result = await crossReferenceLoader.load(vehicles);

      expect(result.inserted).toBe(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('Failed to load vehicle');
    });
  });

  describe('count', () => {
    it('should return count of vehicles in table', async () => {
      (query as jest.Mock).mockResolvedValue({ rows: [{ count: '42' }] });

      const result = await crossReferenceLoader.count();

      expect(result).toBe(42);
      expect(query).toHaveBeenCalledWith('SELECT COUNT(*) as count FROM vehicles_unified');
    });
  });

  describe('truncate', () => {
    it('should truncate vehicles_unified table', async () => {
      (query as jest.Mock).mockResolvedValue({ rows: [] });

      await crossReferenceLoader.truncate();

      expect(query).toHaveBeenCalledWith('TRUNCATE TABLE vehicles_unified CASCADE');
    });
  });
});
