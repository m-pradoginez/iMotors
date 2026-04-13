import { BrasilApiClient, VehicleType, Price } from '../clients/brasilApi';

export interface CatalogEntry {
  vehicleType: VehicleType;
  brandCode: string;
  brandName: string;
  modelCode: string;
  modelName: string;
  yearCode: string;
  yearName: string;
  price: Price | null;
  error?: string;
}

export interface ExtractionResult {
  entries: CatalogEntry[];
  stats: {
    totalBrands: number;
    totalModels: number;
    totalYears: number;
    successfulPrices: number;
    failedPrices: number;
    errors: string[];
  };
}

export class CatalogExtractor {
  private client: BrasilApiClient;
  private errors: string[] = [];

  constructor(client?: BrasilApiClient) {
    this.client = client || new BrasilApiClient();
  }

  async extract(vehicleTypes: VehicleType[] = ['carros', 'motos', 'caminhoes']): Promise<ExtractionResult> {
    this.errors = [];
    const entries: CatalogEntry[] = [];
    let totalBrands = 0;
    let totalModels = 0;
    let totalYears = 0;
    let successfulPrices = 0;
    let failedPrices = 0;

    for (const vehicleType of vehicleTypes) {
      console.log(`\n[${vehicleType}] Starting extraction...`);

      try {
        const brands = await this.client.getBrands(vehicleType);
        totalBrands += brands.length;
        console.log(`[${vehicleType}] Found ${brands.length} brands`);

        for (const brand of brands) {
          try {
            const modelsResponse = await this.client.getModels(vehicleType, brand.codigo);
            const models = modelsResponse.modelos;
            totalModels += models.length;

            for (const model of models) {
              try {
                const years = await this.client.getYears(vehicleType, brand.codigo, model.codigo);
                totalYears += years.length;

                for (const year of years) {
                  try {
                    // Extract fipe code from year code (format: "2024-1" or "32000-1")
                    const fipeCode = year.codigo.split('-')[0];
                    const price = await this.client.getPrice(fipeCode, year.codigo);
                    successfulPrices++;

                    entries.push({
                      vehicleType,
                      brandCode: brand.codigo,
                      brandName: brand.nome,
                      modelCode: model.codigo,
                      modelName: model.nome,
                      yearCode: year.codigo,
                      yearName: year.nome,
                      price,
                    });
                  } catch (error) {
                    failedPrices++;
                    const errorMsg = `Price fetch failed for ${brand.nome} ${model.nome} (${year.codigo}): ${error}`;
                    this.errors.push(errorMsg);

                    entries.push({
                      vehicleType,
                      brandCode: brand.codigo,
                      brandName: brand.nome,
                      modelCode: model.codigo,
                      modelName: model.nome,
                      yearCode: year.codigo,
                      yearName: year.nome,
                      price: null,
                      error: errorMsg,
                    });
                  }
                }
              } catch (error) {
                const errorMsg = `Years fetch failed for ${brand.nome} ${model.nome}: ${error}`;
                this.errors.push(errorMsg);
                console.warn(errorMsg);
              }
            }
          } catch (error) {
            const errorMsg = `Models fetch failed for ${brand.nome}: ${error}`;
            this.errors.push(errorMsg);
            console.warn(errorMsg);
          }
        }
      } catch (error) {
        const errorMsg = `Brands fetch failed for ${vehicleType}: ${error}`;
        this.errors.push(errorMsg);
        console.error(errorMsg);
      }
    }

    console.log(`\n[Extraction Complete]`);
    console.log(`  Brands: ${totalBrands}`);
    console.log(`  Models: ${totalModels}`);
    console.log(`  Years: ${totalYears}`);
    console.log(`  Successful prices: ${successfulPrices}`);
    console.log(`  Failed prices: ${failedPrices}`);

    return {
      entries,
      stats: {
        totalBrands,
        totalModels,
        totalYears,
        successfulPrices,
        failedPrices,
        errors: this.errors,
      },
    };
  }

  async extractSample(
    vehicleTypes: VehicleType[] = ['carros'],
    maxBrandsPerType: number = 2,
    maxModelsPerBrand: number = 2
  ): Promise<ExtractionResult> {
    this.errors = [];
    const entries: CatalogEntry[] = [];
    let totalBrands = 0;
    let totalModels = 0;
    let totalYears = 0;
    let successfulPrices = 0;
    let failedPrices = 0;

    for (const vehicleType of vehicleTypes) {
      console.log(`\n[${vehicleType}] Starting sample extraction (max ${maxBrandsPerType} brands)...`);

      try {
        const allBrands = await this.client.getBrands(vehicleType);
        const brands = allBrands.slice(0, maxBrandsPerType);
        totalBrands += brands.length;
        console.log(`[${vehicleType}] Sampling ${brands.length} of ${allBrands.length} brands`);

        for (const brand of brands) {
          try {
            const modelsResponse = await this.client.getModels(vehicleType, brand.codigo);
            const models = modelsResponse.modelos.slice(0, maxModelsPerBrand);
            totalModels += models.length;

            for (const model of models) {
              try {
                const years = await this.client.getYears(vehicleType, brand.codigo, model.codigo);
                // Sample just first year to keep it fast
                const year = years[0];
                if (year) {
                  totalYears += 1;

                  try {
                    const fipeCode = year.codigo.split('-')[0];
                    const price = await this.client.getPrice(fipeCode, year.codigo);
                    successfulPrices++;

                    entries.push({
                      vehicleType,
                      brandCode: brand.codigo,
                      brandName: brand.nome,
                      modelCode: model.codigo,
                      modelName: model.nome,
                      yearCode: year.codigo,
                      yearName: year.nome,
                      price,
                    });
                  } catch (error) {
                    failedPrices++;
                    const errorMsg = `Price fetch failed: ${error}`;
                    this.errors.push(errorMsg);

                    entries.push({
                      vehicleType,
                      brandCode: brand.codigo,
                      brandName: brand.nome,
                      modelCode: model.codigo,
                      modelName: model.nome,
                      yearCode: year.codigo,
                      yearName: year.nome,
                      price: null,
                      error: errorMsg,
                    });
                  }
                }
              } catch (error) {
                const errorMsg = `Years fetch failed: ${error}`;
                this.errors.push(errorMsg);
              }
            }
          } catch (error) {
            const errorMsg = `Models fetch failed for ${brand.nome}: ${error}`;
            this.errors.push(errorMsg);
          }
        }
      } catch (error) {
        const errorMsg = `Brands fetch failed for ${vehicleType}: ${error}`;
        this.errors.push(errorMsg);
      }
    }

    return {
      entries,
      stats: {
        totalBrands,
        totalModels,
        totalYears,
        successfulPrices,
        failedPrices,
        errors: this.errors,
      },
    };
  }
}
