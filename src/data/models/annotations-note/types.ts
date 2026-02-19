import type { BookMetadataSections, Count, Heading } from "src/data/models/sections/types";

export interface BookFrontmatter {
    id: string;
    path: string;
    annotationsPath: string;
    title: string;
    author: string;
    lastExportedTimestamp: number;
    lastExportedID: number;
    tags: string[];
}

// TODO: this is not really a "book" per se
export interface book {
    id: string;
    name: string;
    children: Heading[];
    counts: Count;
}

export interface frontbook {
    id: string;
    name: string;
    path: string;
    bookSections: BookMetadataSections;
}

// Internal alias for source-neutral naming in application modules.
export type SourceRecord = frontbook;
