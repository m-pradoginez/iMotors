import { InmetroParser } from '../extractors/inmetroParser';
import { FuelEfficiencyTransformer } from '../transformers/fuelEfficiencyTransformer';
import { FuelEfficiencyLoader } from '../loaders/fuelEfficiencyLoader';

export interface InmetroPipelineOptions {
  spreadsheetFile?: string;
  skipLoad?: boolean;
}

export interface PipelineResult {
  success: boolean;
  error?: string;
  metrics: {
    downloadStats?: { downloaded: number; errors: number };
    parseStats?: { totalRows: number; successfulParses: number; failedParses: number };
    transformStats?: { total: number; errors: number };
    loadStats?: { inserted: number; updated: number; errors: number };
    durationMs: number;
  };
}

export class InmetroPipeline {
  private parser: InmetroParser;
  private transformer: FuelEfficiencyTransformer;
  private loader: FuelEfficiencyLoader;

  constructor() {
    this.parser = new InmetroParser();
    this.transformer = new FuelEfficiencyTransformer();
    this.loader = new FuelEfficiencyLoader();
  }

  async run(options: InmetroPipelineOptions = {}): Promise<PipelineResult> {
    const startTime = Date.now();
    const result: PipelineResult = {
      success: false,
      metrics: {
        durationMs: 0,
      },
    };

    try {
      console.log('[InmetroPipeline] Starting Inmetro PBE ETL pipeline...');

      // Phase 1: Download (if file not provided)
      let spreadsheetPath = options.spreadsheetFile;
      if (!spreadsheetPath) {
        console.log('[InmetroPipeline] Phase 1/4: Downloading spreadsheet...');
        // For now, we'll skip download if no file is provided
        // In production, this would download from Inmetro PBE
        console.log('[InmetroPipeline] Skipping download (no file specified)');
      } else {
        console.log(`[InmetroPipeline] Using provided spreadsheet: ${spreadsheetPath}`);
      }

      // Phase 2: Parse
      console.log('[InmetroPipeline] Phase 2/4: Parsing spreadsheet...');
      if (!spreadsheetPath) {
        throw new Error('No spreadsheet file provided for parsing');
      }
      const parseResult = this.parser.parseSpreadsheet(spreadsheetPath);
      result.metrics.parseStats = {
        totalRows: parseResult.stats.totalRows,
        successfulParses: parseResult.stats.successfulParses,
        failedParses: parseResult.stats.failedParses,
      };
      console.log(`[InmetroPipeline] Parsed ${parseResult.stats.successfulParses} entries`);

      if (parseResult.entries.length === 0) {
        throw new Error('No entries parsed from spreadsheet');
      }

      // Phase 3: Transform
      console.log('[InmetroPipeline] Phase 3/4: Transforming data...');
      const transformResult = this.transformer.transform(parseResult.entries);
      result.metrics.transformStats = {
        total: transformResult.vehicles.length,
        errors: transformResult.errors.length,
      };
      console.log(`[InmetroPipeline] Transformed ${transformResult.vehicles.length} entries`);

      // Phase 4: Load
      if (!options.skipLoad) {
        console.log('[InmetroPipeline] Phase 4/4: Loading to database...');
        const loadResult = await this.loader.load(transformResult.vehicles);
        result.metrics.loadStats = {
          inserted: loadResult.inserted,
          updated: loadResult.updated,
          errors: loadResult.errors.length,
        };
        console.log(`[InmetroPipeline] Loaded ${loadResult.inserted} inserted, ${loadResult.updated} updated`);
      } else {
        console.log('[InmetroPipeline] Skipping database load');
      }

      result.success = true;
      result.metrics.durationMs = Date.now() - startTime;
      console.log(`[InmetroPipeline] Pipeline completed in ${result.metrics.durationMs}ms`);
      console.log('[InmetroPipeline] Summary:', JSON.stringify(result.metrics, null, 2));

      return result;
    } catch (error) {
      result.error = error instanceof Error ? error.message : String(error);
      result.metrics.durationMs = Date.now() - startTime;
      console.error(`[InmetroPipeline] Pipeline failed: ${result.error}`);
      return result;
    }
  }
}

export const inmetroPipeline = new InmetroPipeline();
