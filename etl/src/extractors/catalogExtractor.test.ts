import { CatalogExtractor } from './catalogExtractor';
import { BrasilApiClient, Brand, Year, Price } from '../clients/brasilApi';

jest.mock('../clients/brasilApi');

describe('CatalogExtractor', () => {
  let extractor: CatalogExtractor;
  let mockClient: jest.Mocked<BrasilApiClient>;

  beforeEach(() => {
    mockClient = new BrasilApiClient() as jest.Mocked<BrasilApiClient>;
    extractor = new CatalogExtractor(mockClient);
  });

  describe('extractSample', () => {
    it('should extract sample data successfully', async () => {
      const mockBrands: Brand[] = [
        { codigo: '1', nome: 'Toyota' },
        { codigo: '2', nome: 'Honda' },
      ];

      const mockModels = {
        modelos: [
          { codigo: '101', nome: 'Corolla' },
          { codigo: '102', nome: 'Camry' },
        ],
        anos: [],
      };

      const mockYears: Year[] = [
        { codigo: '2024-1', nome: '2024 Gasolina' },
      ];

      const mockPrice: Price = {
        valor: 'R$ 150.000,00',
        marca: 'Toyota',
        modelo: 'Corolla',
        anoModelo: 2024,
        combustivel: 'Gasolina',
        codigoFipe: '001101-1',
        mesReferencia: 'abril/2026',
        tipoVeiculo: 1,
        siglaCombustivel: 'G',
        dataConsulta: '2026-04-13',
      };

      mockClient.getBrands.mockResolvedValue(mockBrands);
      mockClient.getModels.mockResolvedValue(mockModels);
      mockClient.getYears.mockResolvedValue(mockYears);
      mockClient.getPrice.mockResolvedValue(mockPrice);

      const result = await extractor.extractSample(['carros'], 2, 2);

      expect(result.entries).toHaveLength(4); // 2 brands × 2 models × 1 year
      expect(result.stats.totalBrands).toBe(2);
      expect(result.stats.totalModels).toBe(4); // 2 brands × 2 models
      expect(result.stats.successfulPrices).toBe(4);
      expect(result.stats.failedPrices).toBe(0);
      expect(result.entries[0]).toMatchObject({
        vehicleType: 'carros',
        brandName: 'Toyota',
        modelName: 'Corolla',
        price: mockPrice,
      });
    });

    it('should handle API failures gracefully', async () => {
      mockClient.getBrands.mockRejectedValue(new Error('Network error'));

      const result = await extractor.extractSample(['carros'], 1, 1);

      expect(result.entries).toHaveLength(0);
      expect(result.stats.totalBrands).toBe(0);
      expect(result.stats.errors).toHaveLength(1);
      expect(result.stats.errors[0]).toContain('Network error');
    });

    it('should continue when individual price fetch fails', async () => {
      const mockBrands: Brand[] = [{ codigo: '1', nome: 'Toyota' }];
      const mockModels = {
        modelos: [{ codigo: '101', nome: 'Corolla' }],
        anos: [],
      };
      const mockYears: Year[] = [{ codigo: '2024-1', nome: '2024 Gasolina' }];

      mockClient.getBrands.mockResolvedValue(mockBrands);
      mockClient.getModels.mockResolvedValue(mockModels);
      mockClient.getYears.mockResolvedValue(mockYears);
      mockClient.getPrice.mockRejectedValue(new Error('Price not found'));

      const result = await extractor.extractSample(['carros'], 1, 1);

      expect(result.entries).toHaveLength(1);
      expect(result.entries[0].price).toBeNull();
      expect(result.entries[0].error).toContain('Price not found');
      expect(result.stats.failedPrices).toBe(1);
    });

    it('should limit brands and models according to parameters', async () => {
      const mockBrands: Brand[] = [
        { codigo: '1', nome: 'Toyota' },
        { codigo: '2', nome: 'Honda' },
        { codigo: '3', nome: 'Ford' },
      ];

      const mockModels = {
        modelos: [
          { codigo: '101', nome: 'Model A' },
          { codigo: '102', nome: 'Model B' },
          { codigo: '103', nome: 'Model C' },
        ],
        anos: [],
      };

      mockClient.getBrands.mockResolvedValue(mockBrands);
      mockClient.getModels.mockResolvedValue(mockModels);
      mockClient.getYears.mockResolvedValue([{ codigo: '2024-1', nome: '2024' }]);
      mockClient.getPrice.mockResolvedValue({} as Price);

      const result = await extractor.extractSample(['carros'], 2, 1);

      expect(mockClient.getBrands).toHaveBeenCalled();
      expect(result.stats.totalBrands).toBe(2);
      expect(result.stats.totalModels).toBe(2); // 2 brands × 1 model each
    });
  });

  describe('extract', () => {
    it('should call extract with all vehicle types by default', async () => {
      mockClient.getBrands.mockResolvedValue([]);

      await extractor.extract();

      expect(mockClient.getBrands).toHaveBeenCalledTimes(3);
      expect(mockClient.getBrands).toHaveBeenCalledWith('carros');
      expect(mockClient.getBrands).toHaveBeenCalledWith('motos');
      expect(mockClient.getBrands).toHaveBeenCalledWith('caminhoes');
    });

    it('should extract full catalog for single vehicle type', async () => {
      const mockBrands: Brand[] = [{ codigo: '1', nome: 'Toyota' }];
      const mockModels = {
        modelos: [{ codigo: '101', nome: 'Corolla' }],
        anos: [],
      };
      const mockYears: Year[] = [
        { codigo: '2024-1', nome: '2024 Gasolina' },
        { codigo: '2023-1', nome: '2023 Gasolina' },
      ];

      mockClient.getBrands.mockResolvedValue(mockBrands);
      mockClient.getModels.mockResolvedValue(mockModels);
      mockClient.getYears.mockResolvedValue(mockYears);
      mockClient.getPrice.mockResolvedValue({} as Price);

      const result = await extractor.extract(['carros']);

      expect(result.stats.totalBrands).toBe(1);
      expect(result.stats.totalModels).toBe(1);
      expect(result.stats.totalYears).toBe(2);
      expect(result.entries).toHaveLength(2); // 1 brand × 1 model × 2 years
    });

    it('should handle missing years gracefully', async () => {
      const mockBrands: Brand[] = [{ codigo: '1', nome: 'Toyota' }];
      const mockModels = {
        modelos: [{ codigo: '101', nome: 'Corolla' }],
        anos: [],
      };

      mockClient.getBrands.mockResolvedValue(mockBrands);
      mockClient.getModels.mockResolvedValue(mockModels);
      mockClient.getYears.mockResolvedValue([]);

      const result = await extractor.extract(['carros']);

      expect(result.entries).toHaveLength(0);
      expect(result.stats.totalYears).toBe(0);
    });
  });
});
