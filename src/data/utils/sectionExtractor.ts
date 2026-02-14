import type { SectionCache } from "obsidian";
import { nanoid } from "nanoid";

export interface ExtractedParagraph {
    id: string;
    text: string;
    wasIdPresent: boolean;
}

/**
 * Extract paragraph text from a metadata section cache entry.
 * Strips block ID markers (^id) from the end of text.
 */
export function extractParagraphFromSection(
    section: SectionCache,
    fileLines: string[]
): ExtractedParagraph {
    const text = fileLines
        .slice(section.position.start.line, section.position.end.line + 1)
        .join("\n")
        .replace(/\^.*$/g, "");
    return {
        id: section.id || nanoid(8),
        text,
        wasIdPresent: !!section.id,
    };
}
