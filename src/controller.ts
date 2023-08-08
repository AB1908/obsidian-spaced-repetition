import {CardType, ReviewResponse} from "src/scheduler/scheduling";
import {AbstractFlashcard, Flashcard, maturityCounts, schedulingMetadataForResponse} from "src/data/models/flashcard";
import {createParsedCard, ParsedCard} from "src/data/models/parsedCard";
import {plugin} from "src/main";
import {annotation} from "src/data/import/annotations";
import {generateCardAsStorageFormat, metadataTextGenerator, SchedulingMetadata} from "src/data/export/TextGenerator";
import {updateCardOnDisk} from "src/data/import/disk";
import {ReviewBook} from "src/routes/notes-home-page";

import {AnnotationCount, bookTree, generateSectionsTree} from "src/data/models/bookTree";
import {findNextHeader, isAnnotation, isHeading} from "src/data/models/book";

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

export function getAnnotationById(annotationId: string, bookId: string) {
    const book = plugin.notesWithFlashcards.filter(t=>t.id === bookId)[0];
    if (!book) {
        return null;
    }

    return book.annotations().filter((t: annotation)=> t.id === annotationId)[0];
}

export function getNextCard(bookId: string) {
    console.log(bookId);
    const book = plugin.notesWithFlashcards.filter(t=>t.id === bookId)[0];
    if (!book) {
        new Error("You should have a book id here");
    }
    if (!book.isInReview() && book.canBeReviewed()) {
        book.startReviewing();
        return book.getReviewCard();
    } else if (book.isInReview()) {
        book.nextReviewCard();
        return book.getReviewCard();
    }
}

export function getFlashcardById(flashcardId: string, bookId: string): FrontendFlashcard {
    const book = plugin.notesWithFlashcards.filter(t=>t.id === bookId)[0];
    if (!book) {
        return null;
    }
    return book.flashcards.filter((t: Flashcard) => t.id === flashcardId)[0] ?? null;
}

// TODO: add logic to update in storage
export function updateFlashcardQuestion(id: string, question: string) {
    const card = plugin.flashcards.filter((t: AbstractFlashcard) => t.id === id)[0];
    if (card === undefined) {
        return false;
    }
    card.questionText = question;
    return true;
}

export async function updateFlashcardSchedulingMetadata(
    flashcardId: string,
    bookId: string,
    reviewResponse: ReviewResponse,
) {
    const book = plugin.notesWithFlashcards.filter(t=>t.id === bookId)[0];
    if (!book) {
        return null;
    }

    return await book.updateFlashcard(flashcardId, reviewResponse).updateParsedCard(flashcardId);
}

// TODO: add logic to update in storage
export function updateFlashcardAnswer(id: string, answer: string) {
    const card = plugin.flashcards.filter((t: AbstractFlashcard) => t.id === id)[0];
    if (card === undefined) {
        return false;
    }
    // TODO: add logic to update parsed card as well
    card.answerText = answer;
    return true;
}

export async function createFlashcardForAnnotation(question: string, answer: string, annotationId: string, bookId: string, cardType: CardType = CardType.MultiLineBasic) {
    let card;
    const book = plugin.notesWithFlashcards.filter(t=>t.id === bookId)[0];
    if (!book) {
        return null;
    }
    if (cardType == CardType.MultiLineBasic) {
        // TODO: Fix hardcoded path, should come from deckNote obj
        // TODO: error handling
        const parsedCard: ParsedCard = await createParsedCard(question, answer, cardType, book.flashcardsPath, annotationId);
        book.parsedCards.push(parsedCard);
        card = new Flashcard(parsedCard.id, question, answer, null, annotationId);
        book.flashcards.push(card);
    }
    return true;
}

// TODO: add logic to remove from storage
export function deleteFlashcardById(id: string) {
    if (plugin.flashcards.length == 0) {
        throw new Error("Array of flashcards is empty!")
    }
    if (plugin.flashcards.findIndex((f: AbstractFlashcard) => f.id === id) == -1) {
        return false;
    }
    plugin.flashcards = plugin.flashcards.filter((f: AbstractFlashcard) => f.id !== id);
    return true;
}

export function getAnnotationsForSection(sectionId: string, bookId: string) {
    const book = plugin.notesWithFlashcards.filter(t=>t.id === bookId)[0];
    if (!book) {
        return null;
    }
    const selectedSectionIndex = book.bookSections.findIndex(t=>sectionId === t.id);
    const selectedSection = book.bookSections[selectedSectionIndex];
    if ((!selectedSection) || (!isHeading(selectedSection))) {
        return null;
    }
    const nextHeadingIndex = findNextHeader(book.bookSections, selectedSection);
    let annotations = book.bookSections.slice(selectedSectionIndex, nextHeadingIndex).filter((t): t is annotation=>isAnnotation(t));

    const flashcardCountForAnnotation: Record<string, number> = {};
    for (const id of book.flashcards.map(t=>t.annotationId)) {
        flashcardCountForAnnotation[id] = flashcardCountForAnnotation[id] ? flashcardCountForAnnotation[id] + 1 : 1;
    }

    annotations = annotations.map(t=> {
        return {
            ...t,
            flashcardCount: flashcardCountForAnnotation[t.id] || 0,
        }
    });

    return {
        id: sectionId,
        title: selectedSection.name,
        annotations: annotations
    };
}

export function getFlashcardsForAnnotation(annotationId: string, bookId: string) {
    const book = plugin.notesWithFlashcards.filter(t=>t.id === bookId)[0];
    if (!book) {
        return;
    }
    return book.flashcards.filter(t=>t.annotationId === annotationId);
}

export function getBooks(): ReviewBook[]{
    let books = plugin.notesWithFlashcards.map(t=> {
        return {
            id: t.id,
            name: t.name,
            counts: maturityCounts(t.flashcards)
        }
    });
    return books;
}

interface frontEndBook {
    counts: {
        annotations: { withFlashcards: number; withoutFlashcards: number };
        flashcards: { new: number; mature: number; learning: number }
    };
    name: string;
    id: string;
}

export function getBookById(id: string): frontEndBook {
    const book = plugin.notesWithFlashcards.filter(t=>t.id === id)[0];
    if (!book) {
        return;
    }
    const annotationsWithFlashcards = new Set(...book.flashcards.map(t=>t.annotationId));
    const annotationsWithoutFlashcards = new Set<string>();
    for (let annotation of book.annotations()) {
        if (!annotationsWithFlashcards.has(annotation.id)) {
            annotationsWithoutFlashcards.add(annotation.id);
        }
    }
    return {
        id: book.id,
        name: book.name,
        counts: {
            flashcards: maturityCounts(book.flashcards),
            annotations: {
                withFlashcards: annotationsWithFlashcards.size,
                withoutFlashcards: annotationsWithoutFlashcards.size
            }
        }
    };
}

export function getSectionTreeForBook(id: string) {
    const book = plugin.notesWithFlashcards.filter(t=>t.id === id)[0];
    if (!book) {
        return;
    }
    let children = generateSectionsTree(book.bookSections);
    return {
        id: book.id,
        name: book.name,
        children: children,
        counts: {
            sections: AnnotationCount(bookTree(book.id, book.name, children)),
            flashcards: maturityCounts(book.flashcards),
        }
    };
}