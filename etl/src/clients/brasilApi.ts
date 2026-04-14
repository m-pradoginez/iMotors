import axios, { AxiosInstance } from 'axios';
import axiosRetry from 'axios-retry';

// Use fipe.parallelum.com.br - free public API that works
const BRASIL_API_URL = 'https://fipe.parallelum.com.br/api/v2';

export interface Brand {
  code: string;
  name: string;
}

export interface Model {
  code: string;
  name: string;
}

export interface ModelsResponse {
  modelos?: Model[];
}

export interface Year {
  code: string;
  name: string;
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
      timeout: 60000,
      headers: {
        'Accept': 'application/json',
      },
    });

    const maxRetries = 5;
    const retryDelay = 2000;

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
    const typeMap: Record<VehicleType, string> = {
      carros: 'cars',
      motos: 'motorcycles',
      caminhoes: 'trucks',
    };
    const response = await this.client.get<Brand[]>(`/${typeMap[vehicleType]}/brands`);
    return response.data;
  }

async getModels(vehicleType: VehicleType, brandCode: string): Promise<ModelsResponse> {
    const typeMap: Record<VehicleType, string> = {
      carros: 'cars',
      motos: 'motorcycles',
      caminhoes: 'trucks',
    };
    const response = await this.client.get<Model[]>(`/${typeMap[vehicleType]}/brands/${brandCode}/models`);
    return { modelos: response.data };
  }

  async getYears(vehicleType: VehicleType, brandCode: string, modelCode: string): Promise<Year[]> {
    const typeMap: Record<VehicleType, string> = {
      carros: 'cars',
      motos: 'motorcycles',
      caminhoes: 'trucks',
    };
const response = await this.client.get<Year[]>(`/${typeMap[vehicleType]}/brands/${brandCode}/models/${modelCode}/years`);
    return response.data;
  }

  async getPrice(vehicleType: VehicleType, brandCode: string, modelCode: string, yearCode: string): Promise<Price> {
    const typeMap: Record<VehicleType, string> = {
      carros: 'cars',
      motos: 'motorcycles',
      caminhoes: 'trucks',
    };
    const response = await this.client.get<Price>(`/${typeMap[vehicleType]}/brands/${brandCode}/models/${modelCode}/years/${yearCode}`);
    return response.data;
  }

  async getPriceHistory(_fipeCode: string): Promise<Price[]> {
    // Not available in parallelum API
    throw new Error('getPriceHistory not supported in parallelum API');
  }
}

export const brasilApi = new BrasilApiClient();
