import * as xlsx from 'xlsx';
import * as fs from 'fs';

export interface FuelEfficiencyEntry {
  brand: string;
  model: string;
  year: number;
  fuelType: string;
  cityKmL: number;
  highwayKmL: number;
  efficiencyRating: string;
}

export interface ParseResult {
  entries: FuelEfficiencyEntry[];
  stats: {
    totalRows: number;
    successfulParses: number;
    failedParses: number;
    errors: string[];
  };
}

export class InmetroParser {
  parseSpreadsheet(filepath: string): ParseResult {
    const entries: FuelEfficiencyEntry[] = [];
    const errors: string[] = [];
    let totalRows = 0;
    let successfulParses = 0;
    let failedParses = 0;

    try {
      console.log(`[InmetroParser] Parsing: ${filepath}`);
      
      if (!fs.existsSync(filepath)) {
        throw new Error(`File not found: ${filepath}`);
      }

      const workbook = xlsx.readFile(filepath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

      // Skip header row (assuming row 0 is header)
      const dataRows = data.slice(1);
      totalRows = dataRows.length;

      for (const row of dataRows) {
        try {
          const entry = this.parseRow(row);
          if (entry) {
            entries.push(entry);
            successfulParses++;
          } else {
            failedParses++;
          }
        } catch (error) {
          failedParses++;
          const errorMsg = `Failed to parse row: ${error}`;
          errors.push(errorMsg);
          console.warn(`[InmetroParser] ${errorMsg}`);
        }
      }

      console.log(`[InmetroParser] Parsed ${successfulParses} entries from ${totalRows} rows`);

      return {
        entries,
        stats: {
          totalRows,
          successfulParses,
          failedParses,
          errors,
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[InmetroParser] Failed to parse spreadsheet: ${errorMessage}`);
      
      return {
        entries,
        stats: {
          totalRows,
          successfulParses,
          failedParses,
          errors: [errorMessage, ...errors],
        },
      };
    }
  }

  private parseRow(row: any[]): FuelEfficiencyEntry | null {
    // This is a simplified parser - actual column mapping will depend on Inmetro spreadsheet format
    // Typical format (may vary):
    // Column 0: Brand
    // Column 1: Model
    // Column 2: Year
    // Column 3: Fuel type
    // Column 4: City km/l
    // Column 5: Highway km/l
    // Column 6: Efficiency rating
    
    if (!row || row.length < 7) {
      return null;
    }

    const brand = this.cleanString(row[0]);
    const model = this.cleanString(row[1]);
    const year = this.parseYear(row[2]);
    const fuelType = this.normalizeFuelType(row[3]);
    const cityKmL = this.parseNumber(row[4]);
    const highwayKmL = this.parseNumber(row[5]);
    const efficiencyRating = this.cleanString(row[6]);

    if (!brand || !model || !year || !fuelType || !cityKmL || !highwayKmL) {
      return null;
    }

    return {
      brand,
      model,
      year,
      fuelType,
      cityKmL,
      highwayKmL,
      efficiencyRating: efficiencyRating || 'N/A',
    };
  }

  private cleanString(value: any): string {
    if (value === null || value === undefined) {
      return '';
    }
    return String(value).trim().toUpperCase();
  }

  private parseYear(value: any): number {
    if (typeof value === 'number') {
      return value;
    }
    const str = this.cleanString(value);
    const year = parseInt(str, 10);
    return isNaN(year) ? 0 : year;
  }

  private normalizeFuelType(value: any): string {
    const str = this.cleanString(value);
    
    if (str.includes('GASOLINA') || str.includes('GASOLINE')) {
      return 'gasolina';
    }
    if (str.includes('ETANOL') || str.includes('ALCOOL')) {
      return 'etanol';
    }
    if (str.includes('FLEX') || str.includes('FLEXFUEL')) {
      return 'flex';
    }
    if (str.includes('DIESEL')) {
      return 'diesel';
    }
    if (str.includes('HIBRIDO') || str.includes('HÍBRIDO') || str.includes('HYBRID')) {
      return 'hibrido';
    }
    
    return str.toLowerCase();
  }

  private parseNumber(value: any): number {
    if (typeof value === 'number') {
      return value;
    }
    const str = this.cleanString(value);
    const num = parseFloat(str.replace(',', '.'));
    return isNaN(num) ? 0 : num;
  }
}

export const inmetroParser = new InmetroParser();
