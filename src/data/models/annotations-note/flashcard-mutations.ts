import { type Flashcard, type FlashcardNote } from "src/data/models/flashcard";
import { addBlockIdToParagraph } from "src/data/models/paragraphs";
import { isParagraph } from "../sections/guards";
import type { BookMetadataSections } from "../sections/types";
import { updateCardOnDisk } from "src/infrastructure/disk";
import { CardType } from "src/types/CardType";

export async function createFlashcardForAnnotation(
    sourcePath: string,
    bookSections: BookMetadataSections,
    flashcardNote: FlashcardNote,
    annotationId: string,
    question: string,
    answer: string,
    cardType: CardType.MultiLineBasic
) {
    const block = bookSections.filter(t => t.id === annotationId)[0];
    if (isParagraph(block) && !block.wasIdPresent) {
        const text = addBlockIdToParagraph(block);
        await updateCardOnDisk(sourcePath, block.text, text);
    }
    const fingerprint = isParagraph(block) ? block.fingerprint : undefined;
    await flashcardNote.createCard(annotationId, question, answer, cardType, fingerprint);
}

export async function deleteFlashcardById(
    flashcardNote: FlashcardNote,
    reviewDeck: Flashcard[],
    flashcardId: string
) {
    await flashcardNote.deleteCard(flashcardId);
    return reviewDeck.filter(t => t.id !== flashcardId);
}

export async function updateFlashcardContentsByType(
    flashcardNote: FlashcardNote,
    flashcardId: string,
    question: string,
    answer: string,
    cardType: CardType = CardType.MultiLineBasic
) {
    if (cardType === CardType.MultiLineBasic) {
        await flashcardNote.updateCardContents(flashcardId, question, answer, cardType);
    }
    return true;
}
