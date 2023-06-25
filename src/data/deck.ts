import {parse, ParsedCard} from "src/parser";
import {SRSettings} from "src/settings";
import {AbstractFlashcard} from "src/data/models/flashcard";

export function createFlashcardsFromText(parsedCards: ParsedCard[]): AbstractFlashcard[] {
    const flashcards: AbstractFlashcard[] = [];
    for (let card of parsedCards) {
        // const flashcard = new Flashcard(card.questionText, card.answerText, )
        // flashcards.push()
    }
    return;
}

export function createParsedCardsArray(fileText: string, settings: SRSettings) {
    this.parsedCards = [...parse(fileText, settings)]
}

export function createFlashcardsArray() {

}

export function parseFlashcardText(text: string) {
    return;
}

export enum FLAG {
    SUSPEND,
    BURY
}

const SCHEDULING_REGEX = /(!(?<flag>[BS]),(?<dueDate>.{10}),(?<interval>\d),(?<ease>\d+))/g;
const HIGHLIGHTID_REGEX = /SR:(?<highlightId>[A-Za-z0-9]{8})/g;

export interface FlashcardMetadata {
    ease: number;
    dueDate: string;
    interval: number;
    highlightId: string;
    flag: FLAG;
}

export function parseMetadata(text: string): FlashcardMetadata {
    const scheduling = text.matchAll(SCHEDULING_REGEX).next().value;
    const highlightId = text.matchAll(HIGHLIGHTID_REGEX).next().value;
    if (highlightId === undefined) return null;
    if (scheduling === undefined)
        return {
            flag: null,
            highlightId: highlightId.groups.highlightId,
            dueDate: null,
            interval: null,
            ease: null
        };
    else
        return {
            flag: scheduling.groups.flag === "S" ? FLAG.SUSPEND : FLAG.BURY,
            highlightId: highlightId.groups.highlightId,
            dueDate: scheduling.groups.dueDate,
            interval: Number(scheduling.groups.interval),
            ease: Number(scheduling.groups.ease),
        };
}