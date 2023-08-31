import {ParsedCard} from "src/data/models/parsedCard";
import {Flashcard} from "src/data/models/flashcard";
import {parseCardText, parseMetadata} from "src/data/parser";

export function createFlashcard(parsedCard: ParsedCard, questionText: string, answerText: string) {
    return new Flashcard(parsedCard.id, questionText, answerText, parseMetadata(parsedCard.metadataText));
}

export function generateFlashcardsArray(parsedCardsArray: ParsedCard[]) {
    const out: Flashcard[] = [];
    for (const parsedCard of parsedCardsArray) {
        const [questionText, answerText] = parseCardText(parsedCard.cardText);
        out.push(createFlashcard(parsedCard, questionText, answerText));
    }
    return out;
}