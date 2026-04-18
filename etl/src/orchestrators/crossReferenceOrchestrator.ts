import { ExactMatcher, FipeVehicle, InmetroVehicle } from '../matchers/exactMatcher';
import { FuzzyMatcher } from '../matchers/fuzzyMatcher';
import { crossReferenceTransformer } from '../transformers/crossReferenceTransformer';
import { crossReferenceLoader } from '../loaders/crossReferenceLoader';
import { VehicleMatch } from '../matchers/exactMatcher';

export interface ExecutionMetrics {
  startTime: Date;
  endTime: Date;
  durationMs: number;
  fipeCount: number;
  inmetroCount: number;
  exactMatches: number;
  fuzzyMatches: number;
  totalMatches: number;
  fipeOnly: number;
  inmetroOnly: number;
  loaded: number;
  errors: number;
}

export class CrossReferenceOrchestrator {
  /**
   * Orchestrate the cross-reference pipeline
   */
  async execute(fipeVehicles: FipeVehicle[], inmetroVehicles: InmetroVehicle[]): Promise<ExecutionMetrics> {
    const startTime = new Date();
    console.log('[CrossReferenceOrchestrator] Starting cross-reference pipeline');
    console.log(`[CrossReferenceOrchestrator] FIPE vehicles: ${fipeVehicles.length}`);
    console.log(`[CrossReferenceOrchestrator] Inmetro vehicles: ${inmetroVehicles.length}`);

    let totalErrors = 0;

    // Step 1: Exact matching
    console.log('[CrossReferenceOrchestrator] Running exact matching...');
    const exactMatches = ExactMatcher.matchAll(inmetroVehicles, fipeVehicles);
    const exactStats = ExactMatcher.getStats(exactMatches, inmetroVehicles.length);
    console.log(
      `[CrossReferenceOrchestrator] Exact matches: ${exactStats.matched} (${exactStats.matchRate.toFixed(2)}%)`
    );

    // Step 2: Find unmatched Inmetro vehicles for fuzzy matching
    const matchedInmetroIds = new Set(
      exactMatches.map(m => m.inmetroId).filter((id): id is number => id !== undefined)
    );
    const unmatchedInmetro = inmetroVehicles.filter(v => v.id !== undefined && !matchedInmetroIds.has(v.id));

    // Step 3: Fuzzy matching
    console.log('[CrossReferenceOrchestrator] Running fuzzy matching...');
    const fuzzyMatches = FuzzyMatcher.matchAll(unmatchedInmetro, fipeVehicles);
    const fuzzyStats = FuzzyMatcher.getStats(fuzzyMatches, unmatchedInmetro.length);
    console.log(
      `[CrossReferenceOrchestrator] Fuzzy matches: ${fuzzyStats.matched} (${fuzzyStats.matchRate.toFixed(2)}%)`
    );
    console.log(
      `[CrossReferenceOrchestrator] Average fuzzy confidence: ${fuzzyStats.averageConfidence.toFixed(3)}`
    );

    // Step 4: Combine all matches
    const allMatches: VehicleMatch[] = [...exactMatches, ...fuzzyMatches];
    console.log(`[CrossReferenceOrchestrator] Total matches: ${allMatches.length}`);

    // Step 5: Transform
    console.log('[CrossReferenceOrchestrator] Transforming matched vehicles...');
    const transformResult = crossReferenceTransformer.transform(fipeVehicles, inmetroVehicles, allMatches);
    console.log(`[CrossReferenceOrchestrator] Transformed: ${transformResult.vehicles.length} matched`);
    console.log(`[CrossReferenceOrchestrator] FIPE-only: ${transformResult.fipeOnly.length}`);
    console.log(`[CrossReferenceOrchestrator] Inmetro-only: ${transformResult.inmetroOnly.length}`);

    if (transformResult.errors.length > 0) {
      console.warn(`[CrossReferenceOrchestrator] Transform errors: ${transformResult.errors.length}`);
      totalErrors += transformResult.errors.length;
    }

    // Step 6: Load matched vehicles
    console.log('[CrossReferenceOrchestrator] Loading to database...');
    const loadResult = await crossReferenceLoader.load(transformResult.vehicles);
    console.log(`[CrossReferenceOrchestrator] Loaded: ${loadResult.inserted} vehicles`);

    if (loadResult.errors.length > 0) {
      console.warn(`[CrossReferenceOrchestrator] Load errors: ${loadResult.errors.length}`);
      totalErrors += loadResult.errors.length;
    }

    const endTime = new Date();
    const durationMs = endTime.getTime() - startTime.getTime();

    const metrics: ExecutionMetrics = {
      startTime,
      endTime,
      durationMs,
      fipeCount: fipeVehicles.length,
      inmetroCount: inmetroVehicles.length,
      exactMatches: exactStats.matched,
      fuzzyMatches: fuzzyStats.matched,
      totalMatches: allMatches.length,
      fipeOnly: transformResult.fipeOnly.length,
      inmetroOnly: transformResult.inmetroOnly.length,
      loaded: loadResult.inserted,
      errors: totalErrors,
    };

    console.log('[CrossReferenceOrchestrator] Pipeline complete');
    console.log(`[CrossReferenceOrchestrator] Duration: ${durationMs}ms`);
    console.log(`[CrossReferenceOrchestrator] Total errors: ${totalErrors}`);

    return metrics;
  }

  /**
   * Clear vehicles table before running
   */
  async clear(): Promise<void> {
    console.log('[CrossReferenceOrchestrator] Clearing vehicles table...');
    await crossReferenceLoader.truncate();
  }
}

export const crossReferenceOrchestrator = new CrossReferenceOrchestrator();
