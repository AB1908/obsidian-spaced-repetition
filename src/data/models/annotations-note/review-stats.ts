import type { Flashcard } from "src/data/models/flashcard";
import { maturityCounts } from "src/data/models/flashcard";

export function computeReviewStats(
    sourceId: string,
    sourceName: string,
    pendingFlashcards: number,
    annotationsWithFlashcardsCount: number,
    annotationsWithoutFlashcardsCount: number,
    flashcards: Flashcard[]
) {
    const progress = maturityCounts(flashcards);
    let annotationCoverage = annotationsWithFlashcardsCount / (annotationsWithFlashcardsCount + annotationsWithoutFlashcardsCount);
    if (isNaN(annotationCoverage)) annotationCoverage = 0;

    return {
        id: sourceId,
        name: sourceName,
        pendingFlashcards,
        annotationCoverage,
        flashcardProgress: progress,
    };
}
