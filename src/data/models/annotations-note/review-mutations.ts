import { schedulingMetadataForResponse, type FlashcardNote } from "src/data/models/flashcard";
import type { ReviewResponse } from "src/types/CardType";

export async function processFlashcardReview(
    flashcardNote: FlashcardNote,
    flashcardId: string,
    reviewResponse: ReviewResponse
) {
    const card = flashcardNote.flashcards.find(t => t.id === flashcardId);
    if (!card) throw new Error(`processCardReview: card ${flashcardId} not found`);

    const updatedSchedulingMetadata = schedulingMetadataForResponse(reviewResponse, {
        interval: card.interval,
        ease: card.ease,
        dueDate: card.dueDate,
    });
    await flashcardNote.updateCardSchedule(flashcardId, updatedSchedulingMetadata);
}
