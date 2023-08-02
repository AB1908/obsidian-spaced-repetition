import {ParsedCard} from "src/data/models/parsedCard";
import {Flashcard} from "src/data/models/flashcard";
import {parseCardText, parseMetadata} from "src/data/parser";

export function generateFlashcardsArray(parsedCardsArray: ParsedCard[]) {
    const out: Flashcard[] = [];
    for (let parsedCard of parsedCardsArray) {
        const [questionText, answerText] = parseCardText(parsedCard.cardText);
        out.push(new Flashcard(parsedCard.id, questionText, answerText, parseMetadata(parsedCard.metadataText)));
    }
    return out;
}