import { type annotation } from "./annotations";
import { ISourceStrategy } from "./ISourceStrategy";

export class Source {
  constructor(
    public path: string,
    public type: 'markdown' | 'moonreader',
    private strategy: ISourceStrategy
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
