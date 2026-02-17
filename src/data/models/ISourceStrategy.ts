import { type annotation } from "./annotations";
import type { BookMetadataSections, Heading } from "./AnnotationsNote";

export interface ISourceStrategy {
  // Define contract for source-specific operations
  sync?(sinceId?: string): Promise<annotation[]>;
  extract?(): Promise<annotation[]>;
  getNavigableSections(sections: BookMetadataSections): Heading[];
}
