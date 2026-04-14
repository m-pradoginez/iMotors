import axios, { AxiosInstance } from 'axios';
import * as fs from 'fs';
import * as path from 'path';

const INMETRO_BASE_URL = 'http://www.inmetro.gov.br/consumidor/pbe/';

export interface DownloadResult {
  success: boolean;
  filepath?: string;
  error?: string;
}

export class InmetroDownloader {
  private client: AxiosInstance;
  private dataDir: string;

  constructor(dataDir: string = './data/inmetro') {
    this.client = axios.create({
      baseURL: INMETRO_BASE_URL,
      timeout: 30000,
      headers: {
        'Accept': 'application/html',
      },
    });

    this.dataDir = dataDir;
    this.ensureDataDir();
  }

  private ensureDataDir(): void {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  async downloadSpreadsheet(filename: string): Promise<DownloadResult> {
    const url = `${INMETRO_BASE_URL}${filename}`;
    const filepath = path.join(this.dataDir, filename);

    try {
      console.log(`[InmetroDownloader] Downloading: ${url}`);
      
      const response = await this.client.get(url, {
        responseType: 'arraybuffer',
      });

      fs.writeFileSync(filepath, response.data);
      console.log(`[InmetroDownloader] Saved to: ${filepath}`);

      return {
        success: true,
        filepath,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[InmetroDownloader] Failed to download ${filename}: ${errorMessage}`);
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  async downloadMultiple(filenames: string[]): Promise<DownloadResult[]> {
    const results: DownloadResult[] = [];

    for (const filename of filenames) {
      const result = await this.downloadSpreadsheet(filename);
      results.push(result);
      
      // Small delay between downloads to be polite
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    return results;
  }

  listDownloadedFiles(): string[] {
    if (!fs.existsSync(this.dataDir)) {
      return [];
    }

    return fs.readdirSync(this.dataDir).filter(f => 
      f.endsWith('.xls') || f.endsWith('.xlsx')
    );
  }
}

export const inmetroDownloader = new InmetroDownloader();
