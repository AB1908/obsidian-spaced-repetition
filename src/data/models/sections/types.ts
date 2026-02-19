import type { HeadingCache, SectionCache } from "obsidian";
import { nanoid } from "nanoid";
import type { annotation } from "src/data/models/annotations";
import type { paragraph } from "src/data/models/paragraphs";

export interface Count {
    with: number;
    without: number;
}

export class Heading {
    readonly type = "heading" as const;
    id: string;
    level: number;
    name: string;
    children: Heading[];
    counts: Count;

    constructor(heading: HeadingCache) {
        ({ heading: this.name, level: this.level } = heading);
        this.id = nanoid(8);
        this.children = [];
        this.counts = { with: 0, without: 0 };
    }
}

export type RawBookSection = SectionCache | HeadingCache;
export type BookMetadataSection = Heading | annotation | paragraph;
export type BookMetadataSections = BookMetadataSection[];
// Internal alias for source-neutral naming in new modules.
export type SectionNode = BookMetadataSection;
