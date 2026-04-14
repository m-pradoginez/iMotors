import { InmetroDownloader } from './inmetroDownloader';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('InmetroDownloader', () => {
  let downloader: InmetroDownloader;
  let mockGet: jest.Mock;
  const testDataDir = './data/test-inmetro';

  beforeEach(() => {
    mockGet = jest.fn();
    mockedAxios.create.mockReturnValue({
      get: mockGet,
    } as any);
    
    downloader = new InmetroDownloader(testDataDir);
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Clean up test directory
    if (fs.existsSync(testDataDir)) {
      fs.rmSync(testDataDir, { recursive: true, force: true });
    }
  });

  describe('downloadSpreadsheet', () => {
    it('should download spreadsheet successfully', async () => {
      const mockData = Buffer.from('test spreadsheet data');
      mockGet.mockResolvedValue({ data: mockData });

      const result = await downloader.downloadSpreadsheet('test.xlsx');

      expect(result.success).toBe(true);
      expect(result.filepath).toContain('test.xlsx');
      expect(fs.existsSync(result.filepath!)).toBe(true);
    });

    it('should handle download errors gracefully', async () => {
      mockGet.mockRejectedValue(new Error('Network error'));

      const result = await downloader.downloadSpreadsheet('test.xlsx');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('downloadMultiple', () => {
    it('should download multiple spreadsheets', async () => {
      const mockData = Buffer.from('test spreadsheet data');
      mockGet.mockResolvedValue({ data: mockData });

      const filenames = ['file1.xlsx', 'file2.xlsx'];
      const results = await downloader.downloadMultiple(filenames);

      expect(results).toHaveLength(2);
      expect(results.every(r => r.success)).toBe(true);
    });

    it('should handle partial failures', async () => {
      mockGet
        .mockResolvedValueOnce({ data: Buffer.from('data1') })
        .mockRejectedValueOnce(new Error('Network error'));

      const filenames = ['file1.xlsx', 'file2.xlsx'];
      const results = await downloader.downloadMultiple(filenames);

      expect(results).toHaveLength(2);
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(false);
    });
  });

  describe('listDownloadedFiles', () => {
    it('should list downloaded spreadsheet files', async () => {
      // Create test files
      fs.mkdirSync(testDataDir, { recursive: true });
      fs.writeFileSync(path.join(testDataDir, 'file1.xlsx'), 'data');
      fs.writeFileSync(path.join(testDataDir, 'file2.xls'), 'data');
      fs.writeFileSync(path.join(testDataDir, 'readme.txt'), 'text');

      const files = downloader.listDownloadedFiles();

      expect(files).toHaveLength(2);
      expect(files).toContain('file1.xlsx');
      expect(files).toContain('file2.xls');
      expect(files).not.toContain('readme.txt');
    });

    it('should return empty array when directory does not exist', () => {
      const files = downloader.listDownloadedFiles();
      expect(files).toEqual([]);
    });
  });
});
