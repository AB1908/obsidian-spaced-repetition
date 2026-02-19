import type { CachedMetadata } from "obsidian";
import type { annotation } from "src/data/models/annotations";
import { parseAnnotations } from "src/data/models/annotations";
import type { Flashcard } from "src/data/models/flashcard";
import { extractParagraphFromSection } from "src/data/utils/sectionExtractor";
import { generateFingerprint } from "src/data/utils/fingerprint";
import type { AnnotationsNoteDependencies } from "src/data/utils/dependencies";
import { generateHeaderCounts } from "./heading-graph";
import type { BookMetadataSections } from "./types";
import { Heading } from "./types";

// todo: should this be part of the Book class??
export function bookSections(
    metadata: CachedMetadata | null | undefined,
    fileText: string,
    flashcards: Flashcard[],
    plugin: AnnotationsNoteDependencies
) {
    if (metadata == null) throw new Error("bookSections: metadata cannot be null/undefined");
    let output: BookMetadataSections = [];
    let headingIndex = 0;
    const fileTextArray = fileText.split("\n");
    const blocksWithFlashcards = new Set(flashcards.map(t => t.parentId));
    if (metadata.sections == null) throw new Error("bookSections: file has no sections");
    for (const cacheItem of metadata.sections) {
        // todo: consider parameterizing this
        if (cacheItem.type === "callout") {
            try {
                const annotation = parseAnnotations(fileTextArray.slice(cacheItem.position.start.line, cacheItem.position.end.line + 1).join("\n"));
                // todo: I think I've fucked up the ordering for assignment with spread
                let item = { ...annotation, hasFlashcards: blocksWithFlashcards.has(annotation.id) };
                output.push(item);
                plugin.index.addToAnnotationIndex(item);
            } catch (e) {
                console.warn(`bookSections: skipping non-annotation callout at line ${cacheItem.position.start.line}: ${e.message}`);
            }
        } else if (cacheItem.type === "heading") {
            const headings = metadata?.headings;
            // todo: again, this is another case of an interesting type problem like in paragraphs.ts
            // todo: figure out a way to remove this error handling logic
            if (headings === undefined) throw new Error("bookSections: no headings in file");
            output.push(new Heading(headings[headingIndex]));
            headingIndex++;
        } else if (cacheItem.type == "paragraph") {
            const extracted = extractParagraphFromSection(cacheItem, fileTextArray);
            const paragraph = {
                type: "paragraph" as const,
                ...extracted,
                fingerprint: generateFingerprint(extracted.text),
            };
            let item = {
                ...paragraph,
                hasFlashcards: blocksWithFlashcards.has(paragraph.id),
            };
            plugin.index.addToAnnotationIndex(item);
            output.push(item);
            // TODO: Any edge cases?
        }
    }
    // todo: use method chaining instead?
    output = generateHeaderCounts(output);
    return output;
}
