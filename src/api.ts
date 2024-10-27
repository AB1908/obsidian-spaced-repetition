import { CardType, type ReviewResponse } from "src/scheduler/scheduling";
import { Flashcard, maturityCounts } from "src/data/models/flashcard";
import { generateSectionsTree } from "src/data/models/bookTree";
import {
    BookMetadataSection,
    findNextHeader,
    isAnnotation,
    isHeading,
} from "src/data/models/sourceNote";
import { plugin } from "src/main";
import type { annotation } from "src/data/models/annotations";
import type { ReviewBook } from "src/routes/notes-home-page";
import type { FrontendFlashcard } from "src/routes/review";
import type { paragraph } from "src/data/models/paragraphs";
import { calculateDelayBeforeReview } from "src/utils";

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
    const book = plugin.index.sourceNoteIndex.getBook(bookId);
    return transform(book.annotations().filter((t: BookMetadataSection) => t.id === blockId)[0]);
}

export function getNextCard(bookId: string | undefined) {
    if (!bookId) throw new Error(`getNextCard: book not found`);
    const book = plugin.index.sourceNoteIndex.getBook(bookId);
    if (!book.isInReview() && book.canBeReviewed()) {
        book.startReviewing();
        return book.getReviewCard();
    } else if (book.isInReview()) {
        book.nextReviewCard();
        return book.getReviewCard();
    }
}

export async function deleteFlashcard(bookId: string | undefined, flashcardId: string | undefined) {
    if (!bookId) throw new Error(`deleteFlashcard: book doesn't exist`);
    if (!flashcardId) throw new Error(`deleteFlashcard: can't delete a flashcard that doesn't exist`);
    const book = plugin.index.sourceNoteIndex.getBook(bookId);

    await book.deleteFlashcard(flashcardId);
}

export function getCurrentCard(bookId: string) {
    const book = plugin.index.sourceNoteIndex.getBook(bookId);
    if (!book.isInReview() && book.canBeReviewed()) {
        book.startReviewing();
        return book.getReviewCard();
    } else if (book.isInReview()) {
        return book.getReviewCard();
    }
}

export function getFlashcardById(flashcardId: string, bookId: string): FrontendFlashcard {
    // todo: what do i do about this? when this function is called, it is guaranteed to be from a source note that
    // already has flashcards
    const flashcard: Flashcard | undefined = plugin.index.flashcardIndex.flashcards.get(flashcardId);
    if (flashcard == undefined) throw new Error(`getFlashcardById: flashcard not found for id ${flashcardId}`);
    return {
        ...flashcard,
        delayBeforeReview: calculateDelayBeforeReview(flashcard.dueDate)
    };
}

export async function updateFlashcardSchedulingMetadata(
    flashcardId: string,
    bookId: string,
    reviewResponse: ReviewResponse
) {
    const book = plugin.index.sourceNoteIndex.getBook(bookId);
    await book.processCardReview(flashcardId, reviewResponse);
    return true;
}

export function addBlockIdToParagraph(block: paragraph) {
    return `${block.text} ^${block.id}`;
}


// TODO: create abstraction
export async function createFlashcardForAnnotation(question: string, answer: string, annotationId: string, bookId: string, cardType: CardType = CardType.MultiLineBasic) {
    const book = plugin.index.sourceNoteIndex.getBook(bookId);
    if (cardType == CardType.MultiLineBasic) {
        return await book.createFlashcard(annotationId, question, answer, cardType);
    }
}

// TODO: create abstraction
export async function updateFlashcardContentsById(flashcardId: string, question: string, answer: string, bookId: string, cardType: CardType = CardType.MultiLineBasic) {
    const book = plugin.index.sourceNoteIndex.getBook(bookId);
    if (cardType == CardType.MultiLineBasic) {
        // TODO: Fix hardcoded path, should come from deckNote obj
        // TODO: error handling
        // todo: refactor
        const newFlashcard = await book.updateFlashcardContents(flashcardId, question, answer, cardType);
        plugin.index.flashcardIndex.flashcards.set(flashcardId, newFlashcard);
    }
    return true;
}

export function isParagraph(section: BookMetadataSection): section is paragraph {
    return (section as paragraph).wasIdPresent !== undefined;
}

export function isAnnotationOrParagraph(section: BookMetadataSection): section is (annotation|paragraph) {
    return isAnnotation(section) || isParagraph(section);
}

function transform(p: paragraph|annotation): annotation {
    if (isAnnotation(p)) {
        return p;
    } else {
        return {
            id: p.id,
            type: "",
            note: "",
            highlight: p.text,
            hasFlashcards: p.hasFlashcards
        };
    }
}

// TODO: create abstraction
export function getAnnotationsForSection(sectionId: string, bookId: string) {
    const book = plugin.index.sourceNoteIndex.getBook(bookId);
    const selectedSectionIndex = book.bookSections.findIndex(t => sectionId === t.id);
    const selectedSection = book.bookSections[selectedSectionIndex];
    // todo: shouldn't this throw an error since this is an impossible condition to reach?
    if ((!selectedSection) || (!isHeading(selectedSection))) {
        return null;
    }
    let nextHeadingIndex = findNextHeader(selectedSection, book.bookSections);
    // todo: write a test for this
    if (nextHeadingIndex == -1) {
        // if no next heading, we want to extract till end of file
        nextHeadingIndex = book.bookSections.length;
    }
    // todo: refactor to unify isAnnotationOrParagraph usage
    let annotations = book.bookSections
        .slice(selectedSectionIndex, nextHeadingIndex)
        .filter((t): t is (annotation|paragraph) => isAnnotationOrParagraph(t));

    // WTF is this???
    const flashcardCountForAnnotation: Record<string, number> = {};
    for (const id of book.flashcardNote.flashcards.map(t => t.parentId)) {
        flashcardCountForAnnotation[id] = flashcardCountForAnnotation[id] ? flashcardCountForAnnotation[id] + 1 : 1;
    }

    annotations = annotations.map(t => {
        return {
            ...transform(t),
            flashcardCount: flashcardCountForAnnotation[t.id] || 0
        };
    });

    return {
        id: sectionId,
        title: selectedSection.name,
        annotations: annotations
    };
}

export function getFlashcardsForAnnotation(annotationId: string, bookId: string) {
    const book = plugin.index.sourceNoteIndex.getBook(bookId);
    return book.flashcardNote.flashcards.filter(t => t.parentId === annotationId);
}

export function getSourcesForReview(): ReviewBook[] {
    // todo: refactor
    const booksToReview = plugin.index.sourceNoteIndex.getSourcesForReview();
    return booksToReview.map(t => {
        t.resetReview();
        const {annotationsWithFlashcards, annotationsWithoutFlashcards} = t.annotationCoverage();
        const annotationsWithFlashcardsCount = annotationsWithFlashcards.size;
        const annotationsWithoutFlashcardsCount = annotationsWithoutFlashcards.size;
        const progress = maturityCounts(t.flashcardNote.flashcards || []);
        const annotationCoverage = annotationsWithFlashcardsCount/(annotationsWithFlashcardsCount+annotationsWithoutFlashcardsCount);
        return {
            id: t.id,
            name: t.name,
            pendingFlashcards: t.reviewDeck.length,
            annotationCoverage: annotationCoverage,
            flashcardProgress: progress
        };
    });
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
    const book = plugin.index.sourceNoteIndex.getBook(bookId);
    book.resetReview();
}

export function getBookById(bookId: string): frontEndBook {
    const book = plugin.index.sourceNoteIndex.getBook(bookId);
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

export function getSectionTreeForBook(bookId: string) {
    const book = plugin.index.sourceNoteIndex.getBook(bookId);
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

export interface NotesWithoutBooks {
    name: string;
    id: string;
}

// todo: expand to also include other notes and not just books
// todo: consider using the tag to fetch here??
export function getNotesWithoutReview(): NotesWithoutBooks[] {
    return plugin.index.sourceNoteIndex.getSourcesWithoutFlashcards();
}

export async function createFlashcardNoteForSourceNote(bookId: string) {
    const book = plugin.index.sourceNoteIndex.getBook(bookId);
    await book.createFlashcardNote();
    // todo: there is an edge case here where multiple clicks to add to multiple
    // index writes
    plugin.index.flashcardIndex.addFlashcardNoteToIndex(book.flashcardNote);
}