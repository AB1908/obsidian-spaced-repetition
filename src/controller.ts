import {CardType} from "src/scheduling";
import {AbstractFlashcard, Flashcard} from "src/data/models/flashcard";
import {createParsedCard, ParsedCard} from "src/data/models/parsedCard";
import {plugin} from "src/main";
import {annotation} from "src/data/import/annotations";

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

export function updateFlashcardQuestion(id: string, question: string) {
    const card = plugin.flashcards.filter((t: AbstractFlashcard) => t.id === id)[0];
    if (card === undefined) {
        return false;
    }
    card.questionText = question;
    return true;
}

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
        // TODO: Fix hardcoded path
        // TODO: error handling
        const parsedCard: ParsedCard = await createParsedCard(question, answer, cardType, "More flashcards.md", annotationId);
        card = new Flashcard(parsedCard.id, question, answer, null, annotationId);
    }
    plugin.flashcards.push(card);
    return true;
}

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