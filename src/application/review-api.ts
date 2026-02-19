import { maturityCounts, type Flashcard } from "src/data/models/flashcard";
import { calculateDelayBeforeReview } from "src/data/utils/calculateDelayBeforeReview";
import type { ReviewResponse } from "src/types/CardType";
import type { FrontendFlashcard } from "src/ui/routes/books/review";
import { getPluginContext } from "./plugin-context";

export interface ReviewBook {
    id: string;
    name: string;
    pendingFlashcards: number;
    annotationCoverage: number;
    flashcardProgress: ReturnType<typeof maturityCounts>;
}

export interface FlashCount {
    mature: number;
    new: number;
    learning: number;
}

export function getNextCard(bookId: string) {
    const plugin = getPluginContext();
    const book = plugin.annotationsNoteIndex.getBook(bookId);
    if (!book.isInReview() && book.canBeReviewed()) {
        book.startReviewing();
        return book.getReviewCard();
    } else if (book.isInReview()) {
        book.nextReviewCard();
        return book.getReviewCard();
    }
}

export async function deleteFlashcard(bookId: string, flashcardId: string) {
    const plugin = getPluginContext();
    const book = plugin.annotationsNoteIndex.getBook(bookId);
    await book.deleteFlashcard(flashcardId);
}

export function getCurrentCard(bookId: string) {
    const plugin = getPluginContext();
    const book = plugin.annotationsNoteIndex.getBook(bookId);
    if (!book.isInReview() && book.canBeReviewed()) {
        book.startReviewing();
        return book.getReviewCard();
    } else if (book.isInReview()) {
        return book.getReviewCard();
    }
}

export function getFlashcardById(flashcardId: string, bookId: string): FrontendFlashcard {
    const plugin = getPluginContext();
    const book = plugin.annotationsNoteIndex.getBook(bookId);
    const flashcard: FrontendFlashcard = book.flashcardNote.flashcards.filter((t: Flashcard) => t.id === flashcardId).map(t => {
        return { ...t, delayBeforeReview: calculateDelayBeforeReview(t.dueDate) };
    })[0] ?? null;
    if (flashcard == null) throw new Error(`getFlashcardById: flashcard not found for id ${flashcardId}`);
    return flashcard;
}

export async function updateFlashcardSchedulingMetadata(
    flashcardId: string,
    bookId: string,
    reviewResponse: ReviewResponse
) {
    const plugin = getPluginContext();
    const book = plugin.annotationsNoteIndex.getBook(bookId);
    await book.processCardReview(flashcardId, reviewResponse);
    return true;
}

export function getSourcesForReview(): ReviewBook[] {
    const plugin = getPluginContext();
    const booksToReview = plugin.annotationsNoteIndex.getSourcesForReview();
    return booksToReview.map(t => t.getReviewStats());
}

export function resetBookReviewState(bookId: string) {
    const plugin = getPluginContext();
    const book = plugin.annotationsNoteIndex.getBook(bookId);
    book.resetReview();
}
