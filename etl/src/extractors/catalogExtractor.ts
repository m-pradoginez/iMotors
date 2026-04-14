import { BrasilApiClient, VehicleType, Price } from '../clients/brasilApi';
import { checkpointManager } from '../utils/checkpoint';

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
            // Add small delay between brand requests to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 100));
            
            const modelsResponse = await this.client.getModels(vehicleType, brand.code);
            const models = modelsResponse.modelos || [];
            totalModels += models.length;

            for (const model of models) {
              try {
                const years = await this.client.getYears(vehicleType, brand.code, model.code);
                totalYears += years.length;

                for (const year of years) {
                  try {
                    const price = await this.client.getPrice(vehicleType, brand.code, model.code, year.code);
                    successfulPrices++;

                    entries.push({
                      vehicleType,
                      brandCode: brand.code,
                      brandName: brand.name,
                      modelCode: model.code,
                      modelName: model.name,
                      yearCode: year.code,
                      yearName: year.name,
                      price,
                    });
                  } catch (error) {
                    failedPrices++;
                    const errorMsg = `Price fetch failed for ${brand.name} ${model.name} (${year.code}): ${error}`;
                    this.errors.push(errorMsg);

                    entries.push({
                      vehicleType,
                      brandCode: brand.code,
                      brandName: brand.name,
                      modelCode: model.code,
                      modelName: model.name,
                      yearCode: year.code,
                      yearName: year.name,
                      price: null,
                      error: errorMsg,
                    });
                  }
                }
              } catch (error) {
                const errorMsg = `Years fetch failed for ${brand.name} ${model.name}: ${error}`;
                this.errors.push(errorMsg);
                console.warn(errorMsg);
              }
            }
          } catch (error) {
            const errorMsg = `Models fetch failed for ${brand.name}: ${error}`;
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
            const modelsResponse = await this.client.getModels(vehicleType, brand.code);
            const models = (modelsResponse.modelos || []).slice(0, maxModelsPerBrand);
            totalModels += models.length;

            for (const model of models) {
              try {
                const years = await this.client.getYears(vehicleType, brand.code, model.code);
                // Sample just first year to keep it fast
                const year = years[0];
                if (year) {
                  totalYears += 1;

                  try {
                    const price = await this.client.getPrice(vehicleType, brand.code, model.code, year.code);
                    successfulPrices++;

                    entries.push({
                      vehicleType,
                      brandCode: brand.code,
                      brandName: brand.name,
                      modelCode: model.code,
                      modelName: model.name,
                      yearCode: year.code,
                      yearName: year.name,
                      price,
                    });
                  } catch (error) {
                    failedPrices++;
                    const errorMsg = `Price fetch failed: ${error}`;
                    this.errors.push(errorMsg);

                    entries.push({
                      vehicleType,
                      brandCode: brand.code,
                      brandName: brand.name,
                      modelCode: model.code,
                      modelName: model.name,
                      yearCode: year.code,
                      yearName: year.name,
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
            const errorMsg = `Models fetch failed for ${brand.name}: ${error}`;
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

  async extractBatch(startBrandIndex: number, maxBrands: number): Promise<ExtractionResult> {
    this.errors = [];
    const entries: CatalogEntry[] = [];
    let totalBrands = 0;
    let totalModels = 0;
    let totalYears = 0;
    let successfulPrices = 0;
    let failedPrices = 0;

    const vehicleTypes: VehicleType[] = ['carros', 'motos', 'caminhoes'];

    for (const vehicleType of vehicleTypes) {
      console.log(`\n[${vehicleType}] Starting batch extraction (from brand ${startBrandIndex}, max ${maxBrands})...`);

      try {
        const allBrands = await this.client.getBrands(vehicleType);
        
        // Calculate end index
        const endBrandIndex = Math.min(startBrandIndex + maxBrands, allBrands.length);
        const brandsToProcess = allBrands.slice(startBrandIndex, endBrandIndex);
        
        totalBrands += brandsToProcess.length;
        console.log(`[${vehicleType}] Processing ${brandsToProcess.length} of ${allBrands.length} brands`);

        for (let brandIdx = 0; brandIdx < brandsToProcess.length; brandIdx++) {
          const brand = brandsToProcess[brandIdx];
          const absoluteBrandIdx = startBrandIndex + brandIdx;

          try {
            // Delay between brands to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const modelsResponse = await this.client.getModels(vehicleType, brand.code);
            const models = modelsResponse.modelos || [];
            totalModels += models.length;

            for (const model of models) {
              try {
                // Small delay between models
                await new Promise(resolve => setTimeout(resolve, 200));
                
                const years = await this.client.getYears(vehicleType, brand.code, model.code);
                totalYears += years.length;

                for (const year of years) {
                  try {
                    // Delay between year requests
                    await new Promise(resolve => setTimeout(resolve, 100));
                    
                    const price = await this.client.getPrice(vehicleType, brand.code, model.code, year.code);
                    successfulPrices++;

                    entries.push({
                      vehicleType,
                      brandCode: brand.code,
                      brandName: brand.name,
                      modelCode: model.code,
                      modelName: model.name,
                      yearCode: year.code,
                      yearName: year.name,
                      price,
                    });
                  } catch (error) {
                    failedPrices++;
                    const errorMsg = `Price fetch failed for ${brand.name} ${model.name} (${year.code}): ${error}`;
                    this.errors.push(errorMsg);

                    entries.push({
                      vehicleType,
                      brandCode: brand.code,
                      brandName: brand.name,
                      modelCode: model.code,
                      modelName: model.name,
                      yearCode: year.code,
                      yearName: year.name,
                      price: null,
                      error: errorMsg,
                    });
                  }
                }
              } catch (error) {
                const errorMsg = `Years fetch failed for ${brand.name} ${model.name}: ${error}`;
                this.errors.push(errorMsg);
                console.warn(errorMsg);
              }
            }

            // Save checkpoint after each brand
            checkpointManager.markProcessed(absoluteBrandIdx, entries.length);

          } catch (error) {
            const errorMsg = `Models fetch failed for ${brand.name}: ${error}`;
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

    console.log(`\n[Batch Extraction Complete]`);
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
}
