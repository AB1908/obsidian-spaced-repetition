import type { annotation } from "src/data/models/annotations";
import type { paragraph } from "src/data/models/paragraphs";
import type { Flashcard } from "src/data/models/flashcard";
import { findNextHeader } from "../sections/heading-graph";
import { isAnnotationOrParagraph, isHeading } from "../sections/guards";
import type { BookMetadataSections } from "../sections/types";
import { toAnnotationLike } from "./annotation-transform";

export function getProcessedAnnotationsForSection(
    bookSections: BookMetadataSections,
    flashcards: Flashcard[],
    sectionId?: string
) {
    let sectionIndex = 0;
    let nextHeadingIndex = bookSections.length;

    if (sectionId) {
        sectionIndex = bookSections.findIndex(t => sectionId === t.id);
        if (sectionIndex === -1) return [];
        const selectedSection = bookSections[sectionIndex];
        if (!isHeading(selectedSection)) return [];

        const foundNext = findNextHeader(selectedSection, bookSections);
        if (foundNext !== -1) nextHeadingIndex = foundNext;
    }

    const annotations = bookSections
        .slice(sectionIndex, nextHeadingIndex)
        .filter((t): t is (annotation | paragraph) => isAnnotationOrParagraph(t));

    const flashcardCountForAnnotation: Record<string, number> = {};
    for (const id of flashcards.map(t => t.parentId)) {
        flashcardCountForAnnotation[id] = (flashcardCountForAnnotation[id] || 0) + 1;
    }

    return annotations.map(t => {
        return {
            ...toAnnotationLike(t),
            flashcardCount: flashcardCountForAnnotation[t.id] || 0,
        };
    }).filter(t => !t.deleted);
}
