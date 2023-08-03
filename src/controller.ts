import {CardType, ReviewResponse} from "src/scheduler/scheduling";
import {AbstractFlashcard, Flashcard, schedulingMetadataForResponse} from "src/data/models/flashcard";
import {createParsedCard, ParsedCard} from "src/data/models/parsedCard";
import {plugin} from "src/main";
import {annotation} from "src/data/import/annotations";
import {generateCardAsStorageFormat, metadataTextGenerator, SchedulingMetadata} from "src/data/export/TextGenerator";
import {updateCardOnDisk} from "src/data/import/disk";
import {ReviewBook} from "src/routes/notes-home-page";
import {maturityCounts} from "src/data/deck";

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

export function getAnnotationById(id: string) {
    return plugin.annotations.filter((t: annotation)=> t.id === id)[0];
}

export function getFlashcardById(id: string) {
    return plugin.flashcards.filter((t: AbstractFlashcard) => t.id === id)[0] ?? null;
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

function updateFlashcards(id: string, reviewResponse: ReviewResponse) {
    let updatedSchedulingMetadata;
    let flashcard;
    plugin.flashcards.forEach((card: Flashcard, index: number, array: Flashcard[]) => {
        if (card.id == id) {
            updatedSchedulingMetadata = schedulingMetadataForResponse(reviewResponse, {
                interval: card.interval,
                ease: card.ease,
                dueDate: card.dueDate
            });
            array[index] = {...card, ...updatedSchedulingMetadata};
            flashcard = array[index];
        }
    });
    return {updatedSchedulingMetadata, flashcard};
}

// write to disk first
// then updated parsed card index
// though that state might go out of sync depending on how fast we call it
// todo: debounce?
// todo: think differently?
async function updateParsedCards(flashcard: Flashcard, updatedSchedulingMetadata: SchedulingMetadata) {
    const parsedCardCopy = plugin.parsedCards.filter((card: ParsedCard) => card.id === flashcard.parsedCardId)[0];
    const originalCardOnDisk = generateCardAsStorageFormat(parsedCardCopy);
    parsedCardCopy.metadataText = metadataTextGenerator(flashcard.annotationId, updatedSchedulingMetadata, flashcard.flag);
    const newCardOnDisk = generateCardAsStorageFormat(parsedCardCopy);
    // todo: store the original card
    // then update the card on disk
    // then update parsed Card
    // encapsulate into class?

    const writeSuccessful = await updateCardOnDisk(parsedCardCopy.notePath, originalCardOnDisk, newCardOnDisk);
    if (writeSuccessful) {
        plugin.parsedCards.forEach((value, index, array) => {
            if (value.id === parsedCardCopy.id) {
                array[index] = parsedCardCopy;
            }
        });
        return true;
    }
    else {
        return false;
    }
}

export async function updateFlashcardSchedulingMetadata(
    id: string,
    reviewResponse: ReviewResponse,
) {
    const {flashcard, updatedSchedulingMetadata} = updateFlashcards(id, reviewResponse);

    return await updateParsedCards(flashcard, updatedSchedulingMetadata);
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

export async function createFlashcardForHighlight(question: string, answer: string, annotationId: string, cardType: CardType) {
    let card;
    if (cardType == CardType.MultiLineBasic) {
        // TODO: Fix hardcoded path, should come from deckNote obj
        // TODO: error handling
        const parsedCard: ParsedCard = await createParsedCard(question, answer, cardType, "More flashcards.md", annotationId);
        plugin.parsedCards.push(parsedCard);
        card = new Flashcard(parsedCard.id, question, answer, null, annotationId);
        plugin.flashcards.push(card);
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

export function getAnnotationsForSection(sectionId: string) {

}

export function getFlashcardsForAnnotation(annotationId: string) {

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

export function getBookById(id: string) {
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
    }
}