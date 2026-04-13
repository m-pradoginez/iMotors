import { CatalogEntry } from '../extractors/catalogExtractor';

export interface VehicleRecord {
  fipe_code: string;
  brand: string;
  model: string;
  vehicle_type: string;
}

export interface VehiclePriceRecord {
  fipe_code: string;
  model_year: number;
  fuel_type: string;
  price: number;
  reference_month: string;
}

export interface TransformedData {
  vehicles: VehicleRecord[];
  prices: VehiclePriceRecord[];
  errors: string[];
}

export class VehicleTransformer {
  transform(entries: CatalogEntry[]): TransformedData {
    const vehicles: Map<string, VehicleRecord> = new Map();
    const prices: VehiclePriceRecord[] = [];
    const errors: string[] = [];

    for (const entry of entries) {
      try {
        // Validate required fields
        if (!entry.brandCode || !entry.modelCode) {
          errors.push(`Missing brand or model code for entry: ${entry.modelName}`);
          continue;
        }

        // Extract FIPE code from year code (format: "2024-1" or "32000-1" for zero km)
        const fipeCode = this.extractFipeCode(entry.yearCode);
        if (!fipeCode) {
          errors.push(`Could not extract FIPE code from year code: ${entry.yearCode}`);
          continue;
        }

        // Create or update vehicle record
        if (!vehicles.has(fipeCode)) {
          vehicles.set(fipeCode, {
            fipe_code: fipeCode,
            brand: this.sanitizeText(entry.brandName),
            model: this.sanitizeText(entry.modelName),
            vehicle_type: entry.vehicleType,
          });
        }

        // Parse price if available
        if (entry.price) {
          try {
            const priceRecord = this.parsePrice(entry, fipeCode);
            if (priceRecord) {
              prices.push(priceRecord);
            }
          } catch (error) {
            errors.push(`Failed to parse price for ${fipeCode}: ${error}`);
          }
        }
      } catch (error) {
        errors.push(`Transform failed for entry ${entry.modelName}: ${error}`);
      }
    }

    return {
      vehicles: Array.from(vehicles.values()),
      prices,
      errors,
    };
  }

  private extractFipeCode(yearCode: string): string | null {
    // FIPE codes are typically 7-8 digits with a check digit (e.g., "011015-9")
    // The year code format is "<fipeCode>-<fuelCode>" where fuelCode is usually 1-6
    const parts = yearCode.split('-');
    if (parts.length >= 2) {
      return `${parts[0]}-${parts[1]}`;
    }
    return null;
  }

  private parsePrice(entry: CatalogEntry, fipeCode: string): VehiclePriceRecord | null {
    if (!entry.price) return null;

    const priceValue = this.parsePriceValue(entry.price.valor);
    if (priceValue === null) {
      throw new Error(`Invalid price format: ${entry.price.valor}`);
    }

    const modelYear = this.parseModelYear(entry.yearName);
    if (modelYear === null) {
      throw new Error(`Invalid year format: ${entry.yearName}`);
    }

    return {
      fipe_code: fipeCode,
      model_year: modelYear,
      fuel_type: this.sanitizeText(entry.price.combustivel || 'Desconhecido'),
      price: priceValue,
      reference_month: this.sanitizeText(entry.price.mesReferencia || ''),
    };
  }

  private parsePriceValue(priceStr: string): number | null {
    // Brazilian format: "R$ 150.000,00" or "R$ 1.234.567,89"
    if (!priceStr) return null;

    // Remove R$ and whitespace
    const clean = priceStr
      .replace(/^R\$\s*/, '')
      .replace(/\./g, '')     // Remove thousand separators
      .replace(/,/g, '.');     // Convert decimal separator

    const value = parseFloat(clean);
    return isNaN(value) ? null : value;
  }

  private parseModelYear(yearName: string): number | null {
    // Year names like "2024 Gasolina" or "2023/2024 Diesel"
    if (!yearName) return null;

    // Extract first 4-digit year found
    const match = yearName.match(/(\d{4})/);
    if (match) {
      const year = parseInt(match[1], 10);
      // Sanity check: 1900 to next year
      const currentYear = new Date().getFullYear() + 1;
      if (year >= 1900 && year <= currentYear) {
        return year;
      }
    }

    return null;
  }

  private sanitizeText(text: string): string {
    if (!text) return '';

    return text
      .trim()
      .replace(/\s+/g, ' ')     // Normalize whitespace
      .substring(0, 200);       // Limit length
  }
}

export const vehicleTransformer = new VehicleTransformer();
