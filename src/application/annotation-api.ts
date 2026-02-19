import { CardType } from "src/types/CardType";
import type { annotation } from "src/data/models/annotations";
import { isHeading } from "src/data/models";
import { isAnnotationOrParagraph, isParagraph } from "src/data/models/sections/guards";
import { addBlockIdToParagraph } from "src/data/models/paragraphs";
import { getPluginContext } from "./plugin-context";

export function getAnnotationById(blockId: string, bookId: string) {
    const plugin = getPluginContext();
    const book = plugin.annotationsNoteIndex.getBook(bookId);
    return book.getAnnotation(blockId);
}

// TODO: create abstraction
export async function createFlashcardForAnnotation(
    question: string,
    answer: string,
    annotationId: string,
    bookId: string,
    cardType: CardType = CardType.MultiLineBasic
) {
    const plugin = getPluginContext();
    const book = plugin.annotationsNoteIndex.getBook(bookId);
    if (cardType == CardType.MultiLineBasic) {
        await book.createFlashcard(annotationId, question, answer, cardType);
    }
    return true;
}

// TODO: create abstraction
export async function updateFlashcardContentsById(
    flashcardId: string,
    question: string,
    answer: string,
    bookId: string,
    cardType: CardType = CardType.MultiLineBasic
) {
    const plugin = getPluginContext();
    const book = plugin.annotationsNoteIndex.getBook(bookId);
    return await book.updateFlashcardContents(flashcardId, question, answer, cardType);
}

export async function updateAnnotationMetadata(
    bookId: string,
    annotationId: string,
    updates: Partial<annotation>
) {
    const plugin = getPluginContext();
    const book = plugin.annotationsNoteIndex.getBook(bookId);
    return await book.updateAnnotation(annotationId, updates);
}

export async function softDeleteAnnotation(bookId: string, annotationId: string) {
    return await updateAnnotationMetadata(bookId, annotationId, { deleted: true });
}

// TODO: create abstraction
export function getAnnotationsForSection(sectionId: string, bookId: string) {
    const plugin = getPluginContext();
    const book = plugin.annotationsNoteIndex.getBook(bookId);
    const selectedSectionIndex = book.bookSections.findIndex(t => sectionId === t.id);
    const selectedSection = book.bookSections[selectedSectionIndex];

    // todo: shouldn't this throw an error since this is an impossible condition to reach?
    if ((!selectedSection) || (!isHeading(selectedSection))) {
        return null;
    }

    const annotations = book.getProcessedAnnotations(sectionId);

    return {
        id: sectionId,
        title: selectedSection.name,
        annotations: annotations
    };
}

export function getFlashcardsForAnnotation(annotationId: string, bookId: string) {
    const plugin = getPluginContext();
    const book = plugin.annotationsNoteIndex.getBook(bookId);
    return book.flashcardNote.flashcards.filter(t => t.parentId === annotationId);
}

export { addBlockIdToParagraph, isParagraph, isAnnotationOrParagraph };
