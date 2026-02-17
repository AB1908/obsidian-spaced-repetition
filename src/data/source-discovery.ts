export const REVIEW_SOURCE_TAGS = ["review/book", "review/note"] as const;
export const DIRECT_MARKDOWN_TAGS = ["clippings"] as const;
export const ELIGIBLE_SOURCE_TAGS = [...REVIEW_SOURCE_TAGS, ...DIRECT_MARKDOWN_TAGS] as const;

export type SourceType = "moonreader" | "direct-markdown";

export interface SourceCandidate {
    path: string;
    tags: string[];
}

export function normalizeTags(tags: string[]): string[] {
    return Array.from(new Set(tags.map(tag => tag.trim()).filter(Boolean)));
}

export function isEligibleSourceTag(tag: string): boolean {
    return ELIGIBLE_SOURCE_TAGS.includes(tag as (typeof ELIGIBLE_SOURCE_TAGS)[number]);
}

export function isEligibleSourceTags(tags: string[]): boolean {
    return normalizeTags(tags).some(isEligibleSourceTag);
}

export function selectEligibleSourcePaths(fileTagsMap: Map<string, string[]>): string[] {
    const output: string[] = [];
    for (const [path, tags] of fileTagsMap.entries()) {
        if (isEligibleSourceTags(tags)) output.push(path);
    }
    return output;
}

export function hasTag(tags: string[], tag: string): boolean {
    return normalizeTags(tags).includes(tag);
}

export function getSourceType(tags: string[], hasMoonReaderFrontmatter: boolean): SourceType {
    if (!hasMoonReaderFrontmatter && hasTag(tags, "clippings")) return "direct-markdown";
    return "moonreader";
}
