import type { annotation } from "src/data/models/annotations";
import type { paragraph } from "src/data/models/paragraphs";
import type { Flashcard } from "src/data/models/flashcard";

export function computeAnnotationCoverage(
    annotations: Array<annotation | paragraph>,
    flashcards: Flashcard[]
): { annotationsWithFlashcards: Set<string>; annotationsWithoutFlashcards: Set<string> } {
    const annotationsWithFlashcards = new Set(flashcards.map(t => t.parentId));
    const annotationsWithoutFlashcards = new Set<string>();

    for (const entry of annotations) {
        if (!annotationsWithFlashcards.has(entry.id)) {
            annotationsWithoutFlashcards.add(entry.id);
        }
    }

    return { annotationsWithFlashcards, annotationsWithoutFlashcards };
}
