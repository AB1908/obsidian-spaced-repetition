import { maturityCounts } from "src/data/models/flashcard";

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

import { type ReviewResponse } from "./types/CardType";
import { CardType } from "./types/CardType";
import {
    Flashcard,
} from "src/data/models/flashcard";
import { calculateDelayBeforeReview } from "./data/utils/calculateDelayBeforeReview";
import { generateSectionsTree } from "src/data/models/bookTree";
import { BookMetadataSection, findNextHeader, isAnnotation, isHeading, isChapter, Heading, isAnnotationOrParagraph, isParagraph, BookFrontmatter, SourceNote } from "src/data/models/sourceNote";
import { findFilesByExtension, getAllFolders } from "src/infrastructure/disk";
import type SRPlugin from "src/main";
import type { annotation } from "src/data/models/annotations";
import type { FrontendFlashcard } from "src/ui/routes/books/review";
import { paragraph, addBlockIdToParagraph } from "src/data/models/paragraphs";
import { ImportedBook } from "./ui/routes/import/import-export";

let plugin: SRPlugin;
export function setPlugin(p: SRPlugin) {
    plugin = p;
}

// TODO: Cloze cards
// export class ClozeFlashcard extends AbstractFlashcard {
//     // cardMetadata and highlight ID are mutually exclusive properties. Given that there is no constructor overloading
//     // probably should change this to be a union type
//     constructor(parsedCardId: string, clozeText: string, cardMetadata?: FlashcardMetadata, highlightId?: string) {
//         const cardType = CardType.Cloze;
//         if (cardMetadata) {
//             super(cardType, parsedCardId, cardMetadata);
//         } else {
//             super(cardType, parsedCardId, null, highlightId);
//         }
//         // todo: in cloze card, we actually get cardText and need to generate question and answer
//         // todo: add siblings
//     }
// }

// WARN: NOTE THAT THESE ARE ALL USING SHALLOW COPIES!

// TODO: refactor this, not immediately apparent why we need transform
// hint: because you have paragraphs as well
export function getAnnotationById(blockId: string, bookId: string) {
    const book = plugin.sourceNoteIndex.getBook(bookId);
    return book.getAnnotation(blockId);
}

export function getNextCard(bookId: string) {
    const book = plugin.sourceNoteIndex.getBook(bookId);
    if (!book.isInReview() && book.canBeReviewed()) {
        book.startReviewing();
        return book.getReviewCard();
    } else if (book.isInReview()) {
        book.nextReviewCard();
        return book.getReviewCard();
    }
}

export async function deleteFlashcard(bookId: string, flashcardId: string) {
    const book = plugin.sourceNoteIndex.getBook(bookId);

    await book.deleteFlashcard(flashcardId);
}

export function getCurrentCard(bookId: string) {
    const book = plugin.sourceNoteIndex.getBook(bookId);
    if (!book.isInReview() && book.canBeReviewed()) {
        book.startReviewing();
        return book.getReviewCard();
    } else if (book.isInReview()) {
        return book.getReviewCard();
    }
}

export function getFlashcardById(flashcardId: string, bookId: string): FrontendFlashcard {
    const book = plugin.sourceNoteIndex.getBook(bookId);
    // todo: what do i do about this? when this function is called, it is guaranteed to be from a source note that
    // already has flashcards
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
    const book = plugin.sourceNoteIndex.getBook(bookId);
    await book.processCardReview(flashcardId, reviewResponse);
    return true;
}

export { addBlockIdToParagraph, isParagraph, isAnnotationOrParagraph };

// TODO: create abstraction
export async function createFlashcardForAnnotation(question: string, answer: string, annotationId: string, bookId: string, cardType: CardType = CardType.MultiLineBasic) {
    const book = plugin.sourceNoteIndex.getBook(bookId);
    if (cardType == CardType.MultiLineBasic) {
        await book.createFlashcard(annotationId, question, answer, cardType);
    }
    return true;
}

// TODO: create abstraction
export async function updateFlashcardContentsById(flashcardId: string, question: string, answer: string, bookId: string, cardType: CardType = CardType.MultiLineBasic) {
    const book = plugin.sourceNoteIndex.getBook(bookId);
    return await book.updateFlashcardContents(flashcardId, question, answer, cardType);
}

export async function updateAnnotationMetadata(
    bookId: string,
    annotationId: string,
    updates: Partial<annotation>
) {
    const book = plugin.sourceNoteIndex.getBook(bookId);
    return await book.updateAnnotation(annotationId, updates);
}

export async function softDeleteAnnotation(bookId: string, annotationId: string) {
    return await updateAnnotationMetadata(bookId, annotationId, { deleted: true });
}

// TODO: create abstraction
export function getAnnotationsForSection(sectionId: string, bookId: string) {
    const book = plugin.sourceNoteIndex.getBook(bookId);
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
    const book = plugin.sourceNoteIndex.getBook(bookId);
    return book.flashcardNote.flashcards.filter(t => t.parentId === annotationId);
}

// todo: this needs to become flashcard decks for review based on flashcardindex
export function getSourcesForReview(): ReviewBook[] {
    const booksToReview = plugin.sourceNoteIndex.getSourcesForReview();
    return booksToReview.map(t => t.getReviewStats());
}

export interface frontEndBook {
    counts: {
        annotations: {
            withFlashcards: number;
            withoutFlashcards: number
        };
        flashcards: {
            new: number;
            mature: number;
            learning: number
        }
    };
    name: string;
    id: string;
    canBeReviewed: boolean;
}

export function resetBookReviewState(bookId: string) {
    const book = plugin.sourceNoteIndex.getBook(bookId);
    book.resetReview();
}

export function getBookById(bookId: string): frontEndBook {
    const book = plugin.sourceNoteIndex.getBook(bookId);
    if (book == null) {
        throw new Error("getBookById: book not found");
    }
    const { annotationsWithFlashcards, annotationsWithoutFlashcards } = book.annotationCoverage();
    return {
        id: book.id,
        name: book.name,
        canBeReviewed: book.canBeReviewed(),
        counts: {
            flashcards: maturityCounts(book.flashcardNote.flashcards || []),
            annotations: {
                withFlashcards: annotationsWithFlashcards.size,
                withoutFlashcards: annotationsWithoutFlashcards.size
            }
        }
    };
}

export function getSourceNoteById(id: string) {
    const book = plugin.sourceNoteIndex.getBook(id);
    if (book == null) {
        throw new Error("getBookById: book not found");
    }
    return {
        id: book.id,
        name: book.name,
    };
}

export function getSectionTreeForBook(bookId: string) {
    const book = plugin.sourceNoteIndex.getBook(bookId);
    const children = generateSectionsTree(book.bookSections);
    return {
        id: book.id,
        name: book.name,
        // done: fix this type casting asap
        children: children,
        counts: {
            flashcards: maturityCounts(book.flashcardNote.flashcards || [])
        }
    };
}

export function getBookChapters(bookId: string) {
    const book = plugin.sourceNoteIndex.getBook(bookId);
    return book.bookSections
        .filter((section): section is Heading => isChapter(section))
        .map(heading => ({
            id: heading.id,
            name: heading.name,
            level: heading.level,
            counts: heading.counts
        }));
}

export interface NotesWithoutBooks {
    name: string;
    id: string;
}

// todo: expand to also include other notes and not just books
// todo: consider using the tag to fetch here??
export function getNotesWithoutReview(): NotesWithoutBooks[] {
    return plugin.sourceNoteIndex.getSourcesWithoutFlashcards();
}

export async function createFlashcardNoteForSourceNote(bookId: string) {
    const book = plugin.sourceNoteIndex.getBook(bookId);
    await book.createFlashcardNote();
    // todo: there is an edge case here where multiple clicks to add to multiple
    // index writes
    plugin.flashcardIndex.addFlashcardNoteToIndex(book.flashcardNote);
}

export function getBreadcrumbData(bookId: string, sectionId?: string) {
    const book = plugin.sourceNoteIndex.getBook(bookId);
    let sectionName: string | undefined;

    if (sectionId) {
        const chapter = book.bookSections.find(
            (section) => "id" in section && section.id === sectionId
        );
        if (chapter && "name" in chapter && (chapter as any).level != undefined) {
            sectionName = chapter.name;
        }
    }

        return {
            bookName: book.name,
            sectionName
        };
    }

export async function getImportedBooks(): Promise<ImportedBook[]> {
    const sourceNotes = plugin.sourceNoteIndex.getAllSourceNotes();
    const books: ImportedBook[] = [];

    for (const sourceNote of sourceNotes) {
        const frontmatter = sourceNote.getBookFrontmatter();
        if (frontmatter) {
            books.push({
                id: sourceNote.id,
                name: sourceNote.name,
                path: sourceNote.path});
        }
    }

    return books;
}

export function getImportableExports() {
    return findFilesByExtension("mrexpt");
}

export function getDestinationFolders() {
    return getAllFolders();
}

// todo: refactor and move disk related logic to appropriate layer
// also move business logic to appropriate class
export async function updateBookAnnotationsAndFrontmatter(
    annotationsPath: string,
    mrexptPath: string,
    sinceId: string
) {
    let book = plugin.sourceNoteIndex.getAllSourceNotes().find(b => b.path === annotationsPath);
    if (!book) {
        // Instantiate a temporary SourceNote if not found in index (e.g. might be a new import or filtered out)
        book = new SourceNote(annotationsPath, plugin);
    }
    
    await book.syncMoonReaderExport(mrexptPath, sinceId);
}



export function getPreviousAnnotationId(bookId: string, blockId: string, sectionId?: string) {
    const book = plugin.sourceNoteIndex.getBook(bookId);
    const index = book.bookSections.findIndex(t => t.id === blockId);
    if (index === -1) return null;

    for (let i = index - 1; i >= 0; i--) {
        const item = book.bookSections[i];
        if (isHeading(item)) {
            if (sectionId) return null;
            continue;
        }
        if (isAnnotationOrParagraph(item)) {
            const ann = item as (annotation | paragraph);
            if (ann.deleted) continue;
            return ann.id;
        }
    }
    return null;
}

export function getNextAnnotationId(bookId: string, blockId: string, sectionId?: string) {
    const book = plugin.sourceNoteIndex.getBook(bookId);
    const index = book.bookSections.findIndex(t => t.id === blockId);
    if (index === -1) return null;

    for (let i = index + 1; i < book.bookSections.length; i++) {
        const item = book.bookSections[i];
        if (isHeading(item)) {
            if (sectionId) return null;
            continue;
        }
        if (isAnnotationOrParagraph(item)) {
            const ann = item as (annotation | paragraph);
            if (ann.deleted) continue;
            return ann.id;
        }
    }
    return null;
}

export async function getUnimportedMrExptFiles(): Promise<string[]> {
    const allMrExptFiles = findFilesByExtension("mrexpt");
    const importedBooks = await getImportedBooks();
    const importedPaths = new Set(importedBooks.map(b => b.path));
    return allMrExptFiles.filter(f => !importedPaths.has(f));
}

export async function importMoonReaderExport(mrexptPath: string, destinationFolder: string) {
    return await SourceNote.createFromMoonReaderExport(mrexptPath, destinationFolder);
}