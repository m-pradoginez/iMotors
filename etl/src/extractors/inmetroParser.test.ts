import { InmetroParser } from './inmetroParser';
import * as xlsx from 'xlsx';
import * as fs from 'fs';

jest.mock('xlsx');
jest.mock('fs');

const mockedXlsx = xlsx as jest.Mocked<typeof xlsx>;
const mockedFs = fs as jest.Mocked<typeof fs>;

describe('InmetroParser', () => {
  let parser: InmetroParser;

  beforeEach(() => {
    parser = new InmetroParser();
    jest.clearAllMocks();
  });

  describe('parseSpreadsheet', () => {
    it('should parse spreadsheet successfully', () => {
      const mockData = [
        ['BRAND', 'MODEL', 'YEAR', 'FUEL', 'CITY', 'HIGHWAY', 'RATING'],
        ['Toyota', 'Corolla', 2023, 'GASOLINA', '12.5', '15.2', 'A'],
        ['Honda', 'Civic', 2023, 'FLEX', '10.0', '13.5', 'B'],
      ];

      mockedFs.existsSync.mockReturnValue(true);
      mockedXlsx.readFile.mockReturnValue({
        SheetNames: ['Sheet1'],
        Sheets: {
          Sheet1: {} as any,
        },
      } as any);
      (mockedXlsx.utils.sheet_to_json as jest.Mock).mockReturnValue(mockData);

      const result = parser.parseSpreadsheet('test.xlsx');

      expect(result.entries).toHaveLength(2);
      expect(result.stats.successfulParses).toBe(2);
      expect(result.stats.failedParses).toBe(0);
      expect(result.entries[0].brand).toBe('TOYOTA');
      expect(result.entries[0].fuelType).toBe('gasolina');
    });

    it('should handle missing file', () => {
      mockedFs.existsSync.mockReturnValue(false);

      const result = parser.parseSpreadsheet('nonexistent.xlsx');

      expect(result.entries).toHaveLength(0);
      expect(result.stats.errors).toHaveLength(1);
      expect(result.stats.errors[0]).toContain('File not found');
    });

    it('should handle malformed rows gracefully', () => {
      const mockData = [
        ['BRAND', 'MODEL', 'YEAR', 'FUEL', 'CITY', 'HIGHWAY', 'RATING'],
        ['Toyota', 'Corolla', 2023, 'GASOLINA', '12.5', '15.2', 'A'],
        ['Honda', null, 2023, 'FLEX', '10.0', '13.5', 'B'], // Missing model
        ['', 'Civic', 2023, 'FLEX', '10.0', '13.5', 'B'], // Missing brand
      ];

      mockedFs.existsSync.mockReturnValue(true);
      mockedXlsx.readFile.mockReturnValue({
        SheetNames: ['Sheet1'],
        Sheets: {
          Sheet1: {} as any,
        },
      } as any);
      (mockedXlsx.utils.sheet_to_json as jest.Mock).mockReturnValue(mockData);

      const result = parser.parseSpreadsheet('test.xlsx');

      expect(result.entries).toHaveLength(1);
      expect(result.stats.successfulParses).toBe(1);
      expect(result.stats.failedParses).toBe(2);
    });

    it('should normalize fuel types', () => {
      const mockData = [
        ['BRAND', 'MODEL', 'YEAR', 'FUEL', 'CITY', 'HIGHWAY', 'RATING'],
        ['Toyota', 'Corolla', 2023, 'Gasolina', '12.5', '15.2', 'A'],
        ['Honda', 'Civic', 2023, 'Etanol', '10.0', '13.5', 'B'],
        ['Volkswagen', 'Golf', 2023, 'Flex', '9.5', '12.0', 'C'],
        ['Chevrolet', 'Onix', 2023, 'Diesel', '14.0', '16.5', 'A'],
      ];

      mockedFs.existsSync.mockReturnValue(true);
      mockedXlsx.readFile.mockReturnValue({
        SheetNames: ['Sheet1'],
        Sheets: {
          Sheet1: {} as any,
        },
      } as any);
      (mockedXlsx.utils.sheet_to_json as jest.Mock).mockReturnValue(mockData);

      const result = parser.parseSpreadsheet('test.xlsx');

      expect(result.entries[0].fuelType).toBe('gasolina');
      expect(result.entries[1].fuelType).toBe('etanol');
      expect(result.entries[2].fuelType).toBe('flex');
      expect(result.entries[3].fuelType).toBe('diesel');
    });

    it('should parse numbers with comma decimal separator', () => {
      const mockData = [
        ['BRAND', 'MODEL', 'YEAR', 'FUEL', 'CITY', 'HIGHWAY', 'RATING'],
        ['Toyota', 'Corolla', 2023, 'GASOLINA', '12,5', '15,2', 'A'],
      ];

      mockedFs.existsSync.mockReturnValue(true);
      mockedXlsx.readFile.mockReturnValue({
        SheetNames: ['Sheet1'],
        Sheets: {
          Sheet1: {} as any,
        },
      } as any);
      (mockedXlsx.utils.sheet_to_json as jest.Mock).mockReturnValue(mockData);

      const result = parser.parseSpreadsheet('test.xlsx');

      expect(result.entries[0].cityKmL).toBe(12.5);
      expect(result.entries[0].highwayKmL).toBe(15.2);
    });
  });
});
