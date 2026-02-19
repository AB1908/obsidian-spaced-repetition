import { type annotation } from "./annotations";
import type { FlashcardSourceStrategy } from "./FlashcardSourceStrategy";

export class FlashcardSource {
  constructor(
    public path: string,
    public type: 'markdown' | 'moonreader',
    private strategy: FlashcardSourceStrategy
  ) {}

  getAnnotationsNotePath(): string {
    // This might need more logic later to map source path to annotations note path
    // For now, let's keep it simple or assume it's stored in metadata
    return ""; 
  }

  async sync(sinceId?: string): Promise<annotation[]> {
    if (!this.strategy.sync) throw new Error('Sync not supported');
    return this.strategy.sync(sinceId);
  }

  async extract(): Promise<annotation[]> {
    if (!this.strategy.extract) throw new Error('Extract not supported');
    return this.strategy.extract();
  }
}

// Backward compatibility while migrating to FlashcardSource naming.
export class Source extends FlashcardSource {}
