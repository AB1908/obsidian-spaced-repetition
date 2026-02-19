import { type annotation } from "./annotations";
import type { BookMetadataSections, Heading } from "./sections/types";

export interface FlashcardSourceStrategy {
    sync?(sinceId?: string): Promise<annotation[]>;
    extract?(): Promise<annotation[]>;
    getNavigableSections(sections: BookMetadataSections): Heading[];
}
