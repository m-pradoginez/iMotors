import * as fs from 'fs';
import * as path from 'path';

const CHECKPOINT_DIR = path.join(__dirname, '..', '..', 'data');
const CHECKPOINT_FILE = path.join(CHECKPOINT_DIR, 'checkpoint.json');

export interface Checkpoint {
  lastBrandIndex: number;
  vehicleType: string;
  updatedAt: string;
  totalProcessed: number;
}

export class CheckpointManager {
  private checkpoint: Checkpoint;

  constructor() {
    this.checkpoint = this.load();
  }

  private load(): Checkpoint {
    try {
      if (fs.existsSync(CHECKPOINT_FILE)) {
        const data = fs.readFileSync(CHECKPOINT_FILE, 'utf-8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.warn('Failed to load checkpoint, starting fresh:', error);
    }
    return {
      lastBrandIndex: -1,
      vehicleType: 'carros',
      updatedAt: new Date().toISOString(),
      totalProcessed: 0,
    };
  }

  private save(): void {
    try {
      if (!fs.existsSync(CHECKPOINT_DIR)) {
        fs.mkdirSync(CHECKPOINT_DIR, { recursive: true });
      }
      this.checkpoint.updatedAt = new Date().toISOString();
      fs.writeFileSync(CHECKPOINT_FILE, JSON.stringify(this.checkpoint, null, 2));
    } catch (error) {
      console.error('Failed to save checkpoint:', error);
    }
  }

  getStartIndex(): number {
    return this.checkpoint.lastBrandIndex + 1;
  }

  getTotalProcessed(): number {
    return this.checkpoint.totalProcessed;
  }

  markProcessed(brandIndex: number, itemsProcessed: number): void {
    this.checkpoint.lastBrandIndex = brandIndex;
    this.checkpoint.totalProcessed += itemsProcessed;
    this.save();
    console.log(`[Checkpoint] Saved: brand index ${brandIndex}, total ${this.checkpoint.totalProcessed} vehicles`);
  }

  reset(): void {
    this.checkpoint = {
      lastBrandIndex: -1,
      vehicleType: 'carros',
      updatedAt: new Date().toISOString(),
      totalProcessed: 0,
    };
    this.save();
    console.log('[Checkpoint] Reset to beginning');
  }

  getStatus(): Checkpoint {
    return this.checkpoint;
  }

  isComplete(totalBrands: number): boolean {
    return this.checkpoint.lastBrandIndex >= totalBrands - 1;
  }
}

export const checkpointManager = new CheckpointManager();