import axios, { AxiosInstance } from 'axios';
import axiosRetry from 'axios-retry';

const BRASIL_API_URL = process.env.BRASIL_API_URL || 'https://brasilapi.com.br/api/fipe';

export interface Brand {
  codigo: string;
  nome: string;
}

export interface Model {
  codigo: string;
  nome: string;
}

export interface ModelsResponse {
  modelos: Model[];
  anos: Year[];
}

export interface Year {
  codigo: string;
  nome: string;
}

export interface Price {
  valor: string;
  marca: string;
  modelo: string;
  anoModelo: number;
  combustivel: string;
  codigoFipe: string;
  mesReferencia: string;
  tipoVeiculo: number;
  siglaCombustivel: string;
  dataConsulta: string;
}

export type VehicleType = 'carros' | 'motos' | 'caminhoes';

export class BrasilApiClient {
  private client: AxiosInstance;

  constructor(baseURL: string = BRASIL_API_URL) {
    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Accept': 'application/json',
      },
    });

    const maxRetries = parseInt(process.env.ETL_MAX_RETRIES || '3', 10);
    const retryDelay = parseInt(process.env.ETL_RETRY_DELAY_MS || '1000', 10);

    axiosRetry(this.client, {
      retries: maxRetries,
      retryDelay: (retryCount) => retryCount * retryDelay,
      retryCondition: (error) => {
        // Retry on network errors or 5xx responses
        return axiosRetry.isNetworkOrIdempotentRequestError(error) ||
          (error.response?.status !== undefined && error.response.status >= 500) ||
          error.response?.status === 429; // Rate limit
      },
    });
  }

  async getBrands(vehicleType: VehicleType): Promise<Brand[]> {
    const response = await this.client.get<Brand[]>(`/marcas/v1/${vehicleType}`);
    return response.data;
  }

  async getModels(vehicleType: VehicleType, brandCode: string): Promise<ModelsResponse> {
    const response = await this.client.get<ModelsResponse>(`/marcas/v1/${vehicleType}/${brandCode}/modelos`);
    return response.data;
  }

  async getYears(vehicleType: VehicleType, brandCode: string, modelCode: string): Promise<Year[]> {
    const response = await this.client.get<Year[]>(`/marcas/v1/${vehicleType}/${brandCode}/${modelCode}/anos`);
    return response.data;
  }

  async getPrice(fipeCode: string, yearCode: string): Promise<Price> {
    const response = await this.client.get<Price>(`/preco/v1/${fipeCode}?ano=${yearCode}`);
    return response.data;
  }

  async getPriceHistory(fipeCode: string): Promise<Price[]> {
    const response = await this.client.get<Price[]>(`/preco/v1/${fipeCode}`);
    return response.data;
  }
}

export const brasilApi = new BrasilApiClient();
