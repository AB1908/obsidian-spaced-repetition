import {nanoid} from "nanoid";
import {CardType} from "src/scheduling";
import {ParsedCard} from "src/parser";
import {getTFileForPath, writeCardToDisk} from "src/disk";
import {cardTextGenerator, generateCardAsStorageFormat, metadataTextGenerator} from "src/data/export/TextGenerator";
import {AbstractFlashcard, Flashcard} from "src/data/models/flashcard";

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

export function getHighlightById(id: string) {
    return;
}

export function getFlashcardById(id: string) {
    return this.flashcards.filter((t: AbstractFlashcard) => t.id === id)[0] ?? null;
}

export function updateFlashcardQuestion(id: string, question: string) {
    const card = this.flashcards.filter((t: AbstractFlashcard) => t.id === id)[0];
    if (card === undefined) {
        return false;
    }
    card.questionText = question;
    return true;
}

export function updateFlashcardAnswer(id: string, answer: string) {
    const card = this.flashcards.filter((t: AbstractFlashcard) => t.id === id)[0];
    if (card === undefined) {
        return false;
    }
    card.answerText = answer;
    return true;
}

export async function createParsedCard(questionText: string, answerText: string, cardType: CardType, path: string, highlightId: string): Promise<ParsedCard> {
    const parsedCard = {
        id: nanoid(8),
        note: getTFileForPath(path),
        cardText: cardTextGenerator(questionText, answerText, cardType),
        metadataText: metadataTextGenerator(highlightId, null),
        // TODO: remove lineno
        lineNo: 0,
        cardType: cardType,
    };
    await writeCardToDisk(parsedCard.note, generateCardAsStorageFormat(parsedCard));
    this.parsedCards.push(parsedCard);
    return parsedCard;
}

export async function createFlashcardForHighlight(question: string, answer: string, highlightId: string, cardType: CardType) {
    let card;
    if (cardType == CardType.MultiLineBasic) {
        // TODO: Fix path
        const parsedCard: ParsedCard = await createParsedCard(question, answer, cardType, "", highlightId);
        card = new Flashcard(parsedCard.id, question, answer, null, highlightId);
    }
    this.flashcards.push(card);
    return true;
}

export function deleteFlashcardById(id: string) {
    if (this.flashcards.length == 0) {
        throw new Error("Array of flashcards is empty!")
    }
    if (this.flashcards.findIndex((f: AbstractFlashcard) => f.id === id) == -1) {
        return false;
    }
    this.flashcards = this.flashcards.filter((f: AbstractFlashcard) => f.id !== id);
    return true;
}