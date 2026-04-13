import axios from 'axios';
import axiosRetry from 'axios-retry';
import { BrasilApiClient } from './brasilApi';

jest.mock('axios');
jest.mock('axios-retry');

describe('BrasilApiClient', () => {
  let client: BrasilApiClient;
  let mockAxiosInstance: any;

  beforeEach(() => {
    mockAxiosInstance = {
      get: jest.fn(),
    };

    (axios.create as jest.Mock).mockReturnValue(mockAxiosInstance);
    (axiosRetry as unknown as jest.Mock).mockImplementation(() => {});

    client = new BrasilApiClient('https://test.api/fipe');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create axios instance with correct config', () => {
      expect(axios.create).toHaveBeenCalledWith({
        baseURL: 'https://test.api/fipe',
        timeout: 30000,
        headers: { 'Accept': 'application/json' },
      });
    });

    it('should configure retry with default settings', () => {
      expect(axiosRetry).toHaveBeenCalledWith(mockAxiosInstance, {
        retries: 3,
        retryDelay: expect.any(Function),
        retryCondition: expect.any(Function),
      });
    });

    it('should use environment variables for retry config when set', () => {
      process.env.ETL_MAX_RETRIES = '5';
      process.env.ETL_RETRY_DELAY_MS = '2000';

      new BrasilApiClient();

      expect(axiosRetry).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ retries: 5 })
      );

      delete process.env.ETL_MAX_RETRIES;
      delete process.env.ETL_RETRY_DELAY_MS;
    });
  });

  describe('getBrands', () => {
    it('should fetch brands for vehicle type', async () => {
      const mockBrands = [
        { codigo: '1', nome: 'Toyota' },
        { codigo: '2', nome: 'Honda' },
      ];

      mockAxiosInstance.get.mockResolvedValue({ data: mockBrands });

      const result = await client.getBrands('carros');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/marcas/v1/carros');
      expect(result).toEqual(mockBrands);
    });
  });

  describe('getModels', () => {
    it('should fetch models for brand', async () => {
      const mockResponse = {
        modelos: [{ codigo: '1', nome: 'Corolla' }],
        anos: [{ codigo: '2024-1', nome: '2024 Gasolina' }],
      };

      mockAxiosInstance.get.mockResolvedValue({ data: mockResponse });

      const result = await client.getModels('carros', '1');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/marcas/v1/carros/1/modelos');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getYears', () => {
    it('should fetch years for model', async () => {
      const mockYears = [
        { codigo: '2024-1', nome: '2024 Gasolina' },
        { codigo: '2023-1', nome: '2023 Gasolina' },
      ];

      mockAxiosInstance.get.mockResolvedValue({ data: mockYears });

      const result = await client.getYears('carros', '1', '1');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/marcas/v1/carros/1/1/anos');
      expect(result).toEqual(mockYears);
    });
  });

  describe('getPrice', () => {
    it('should fetch price for FIPE code and year', async () => {
      const mockPrice = {
        valor: 'R$ 100.000,00',
        marca: 'Toyota',
        modelo: 'Corolla',
        anoModelo: 2024,
        combustivel: 'Gasolina',
        codigoFipe: '001000-1',
        mesReferencia: 'abril/2026',
        tipoVeiculo: 1,
        siglaCombustivel: 'G',
        dataConsulta: '2026-04-13',
      };

      mockAxiosInstance.get.mockResolvedValue({ data: mockPrice });

      const result = await client.getPrice('001000-1', '2024-1');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/preco/v1/001000-1?ano=2024-1');
      expect(result).toEqual(mockPrice);
    });
  });

  describe('getPriceHistory', () => {
    it('should fetch price history for FIPE code', async () => {
      const mockHistory = [
        { valor: 'R$ 100.000,00', codigoFipe: '001000-1', mesReferencia: 'abril/2026' },
        { valor: 'R$ 98.000,00', codigoFipe: '001000-1', mesReferencia: 'março/2026' },
      ];

      mockAxiosInstance.get.mockResolvedValue({ data: mockHistory });

      const result = await client.getPriceHistory('001000-1');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/preco/v1/001000-1');
      expect(result).toEqual(mockHistory);
    });
  });
});
