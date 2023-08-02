import {CardType, ReviewResponse, schedule} from "src/scheduling";
import {AbstractFlashcard, Flashcard} from "src/data/models/flashcard";
import {createParsedCard, ParsedCard} from "src/data/models/parsedCard";
import {plugin} from "src/main";
import {annotation} from "src/data/import/annotations";
import {generateCardAsStorageFormat, metadataTextGenerator, SchedulingMetadata} from "src/data/export/TextGenerator";
import {updateCardOnDisk} from "src/disk";
import {moment} from "obsidian";
import {ReviewBook} from "src/routes/notes-home-page";
import {counts} from "src/data/deck";

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

export function getAnnotationById(id: number) {
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

export function calculateDelayBeforeReview(due: string) {
    return Math.abs(moment().valueOf() - moment(due).valueOf());
}

// todo: move into controller?
// todo: rename to update card?
export function schedulingMetadataForResponse(
    clickedResponse: ReviewResponse,
    schedulingMetadata: SchedulingMetadata,
): SchedulingMetadata {
    // const flashcard = getFlashcardById(flashcardId);
    // take the response received
    // use that to update flashcard internal state
    // that will take care of writing to disk
    // so this should be a relatively lean method
    // don't forget to update siblings?
    let schedObj;
    // is new card
    if (schedulingMetadata.dueDate === null) {
        // todo: move default settings down into schedule()?
        schedObj = schedule(
            clickedResponse,
            1.0,
            plugin.data.settings.baseEase,
            0,
            plugin.data.settings,
        );
    } else {
        schedObj = schedule(
            clickedResponse,
            schedulingMetadata.interval,
            schedulingMetadata.ease,
            calculateDelayBeforeReview(schedulingMetadata.dueDate),
            plugin.data.settings,
        );
    }
    const {interval, ease} = schedObj;
    // todo: parameterize format? nah
    const due = moment(Date.now() + interval * 24 * 3600 * 1000).format("YYYY-MM-DD");
    return {interval, ease, dueDate: due};
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
            counts: counts(t.flashcards)
        }
    });
    console.log(books);
    return books;
}