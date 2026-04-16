import * as fs from 'fs';
import * as path from 'path';
import type { TCOInput, TCOOutput } from './types';

export interface TCOLogEntry {
  timestamp: string;
  fipeCode: string;
  input: TCOInput;
  output: TCOOutput;
  durationMs: number;
  warnings: string[];
  errors: string[];
}

export interface TCOLogStats {
  total: number;
  errors: number;
  warnings: number;
  averageDurationMs: number;
}

/**
 * Logger for TCO calculations to track performance and edge cases
 */
export class TCOLogger {
  private logDir: string;
  private logFile: string;
  private entries: TCOLogEntry[] = [];
  private maxInMemoryEntries: number;

  constructor(options: { logDir?: string; maxInMemoryEntries?: number } = {}) {
    this.logDir = options.logDir || path.join(process.cwd(), 'logs');
    this.maxInMemoryEntries = options.maxInMemoryEntries || 1000;
    this.logFile = path.join(this.logDir, 'tco.log');
    this.ensureLogDirectory();
  }

  private ensureLogDirectory(): void {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  /**
   * Log a TCO calculation entry
   */
  log(entry: TCOLogEntry): void {
    this.entries.push(entry);

    // Write to file immediately for persistence
    const logLine = JSON.stringify({
      ...entry,
      timestamp: new Date().toISOString(),
    }) + '\n';

    fs.appendFileSync(this.logFile, logLine);

    // Trim in-memory entries if exceeding limit
    if (this.entries.length > this.maxInMemoryEntries) {
      this.entries = this.entries.slice(-this.maxInMemoryEntries);
    }
  }

  /**
   * Log a warning for a specific vehicle calculation
   */
  logWarning(fipeCode: string, message: string, context?: Record<string, unknown>): void {
    const entry: TCOLogEntry = {
      timestamp: new Date().toISOString(),
      fipeCode,
      input: context?.input as TCOInput || {} as TCOInput,
      output: context?.output as TCOOutput || {} as TCOOutput,
      durationMs: 0,
      warnings: [message],
      errors: [],
    };
    this.log(entry);
  }

  /**
   * Log an error for a specific vehicle calculation
   */
  logError(fipeCode: string, error: Error, context?: Record<string, unknown>): void {
    const entry: TCOLogEntry = {
      timestamp: new Date().toISOString(),
      fipeCode,
      input: context?.input as TCOInput || {} as TCOInput,
      output: context?.output as TCOOutput || {} as TCOOutput,
      durationMs: 0,
      warnings: [],
      errors: [error.message],
    };
    this.log(entry);
  }

  /**
   * Get statistics from logged entries
   */
  getStats(): TCOLogStats {
    if (this.entries.length === 0) {
      return { total: 0, errors: 0, warnings: 0, averageDurationMs: 0 };
    }

    const total = this.entries.length;
    const errors = this.entries.filter(e => e.errors.length > 0).length;
    const warnings = this.entries.filter(e => e.warnings.length > 0).length;
    const totalDuration = this.entries.reduce((sum, e) => sum + e.durationMs, 0);

    return {
      total,
      errors,
      warnings,
      averageDurationMs: Math.round(totalDuration / total),
    };
  }

  /**
   * Get recent entries with errors for debugging
   */
  getRecentErrors(limit: number = 10): TCOLogEntry[] {
    return this.entries
      .filter(e => e.errors.length > 0)
      .slice(-limit);
  }

  /**
   * Get recent entries with warnings
   */
  getRecentWarnings(limit: number = 10): TCOLogEntry[] {
    return this.entries
      .filter(e => e.warnings.length > 0)
      .slice(-limit);
  }

  /**
   * Clear all in-memory entries (file persists)
   */
  clear(): void {
    this.entries = [];
  }

  /**
   * Get the log file path
   */
  getLogFilePath(): string {
    return this.logFile;
  }
}

// Singleton instance for the application
export const tcoLogger = new TCOLogger();
