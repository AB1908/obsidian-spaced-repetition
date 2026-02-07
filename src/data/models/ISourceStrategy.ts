import { type annotation } from "./annotations";

export interface ISourceStrategy {
  // Define contract for source-specific operations
  sync?(sinceId?: string): Promise<annotation[]>;
  extract?(): Promise<annotation[]>;
}
