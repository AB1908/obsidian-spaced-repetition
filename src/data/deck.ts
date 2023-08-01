import {parse} from "src/parser";
import {SRSettings} from "src/settings";
import {AbstractFlashcard, Flashcard} from "src/data/models/flashcard";
import {ParsedCard} from "src/data/models/parsedCard";
import {plugin} from "src/main";

export function createFlashcardsFromParsedCards(parsedCards: ParsedCard[]): AbstractFlashcard[] {
    for (let card of parsedCards) {
        const [questionText, answerText] = parseCardText(card.cardText);
        const flashcard = new Flashcard(card.id, questionText, answerText, parseMetadata(card.metadataText))
        this.flashcards.push(flashcard)
    }
    return;
}

export function parseCardText(text: string): [string, string] {
    let sides = text.split("?").map(t => t.trim());
    if (sides.length < 2) {
        return;
    }
    return [sides[0], sides[1]];
}

export function createParsedCardsArray(fileText: string, settings: SRSettings) {
    plugin.parsedCards = [...parse(fileText, settings)]
}

export enum FLAG {
    SUSPEND = "S",
    BURY = "B",
    LEARNING = "L"
}

export function flagToString(flag: FLAG): string {
    return flag;
}

const SCHEDULING_REGEX = /(!(?<flag>[BSL]),(?<dueDate>.{10}),(?<interval>\d),(?<ease>\d+))/g;
// For now, annotation ids are only numerical
const ANNOTATION_ID_REGEX = /SR:(?<annotationId>[A-Za-z0-9]{5,8})!/g;

export interface FlashcardMetadata {
    ease: number;
    dueDate: string;
    interval: number;
    annotationId: string;
    flag: FLAG;
}

// Couldn't find a concise way of doing this that was more readable
function stringToFlag(flag: string): FLAG {
    switch (flag) {
        case "S": return FLAG.SUSPEND;
        case "B": return FLAG.BURY;
        case "L": return FLAG.LEARNING;
        default: throw new Error("stringToFlag: incorrect character encountered");
    }
}

export function parseMetadata(text: string): FlashcardMetadata {
    const scheduling = text.matchAll(SCHEDULING_REGEX).next().value;
    const annotationId = text.matchAll(ANNOTATION_ID_REGEX).next().value;
    if (!(annotationId)) return null;
    if (scheduling === undefined)
        return {
            flag: null,
            annotationId: annotationId.groups.annotationId,
            dueDate: null,
            interval: null,
            ease: null
        };
    else
        return {
            flag: stringToFlag(scheduling.groups.flag),
            annotationId: annotationId.groups.annotationId,
            dueDate: scheduling.groups.dueDate,
            interval: Number(scheduling.groups.interval),
            ease: Number(scheduling.groups.ease),
        };
}

export function counts(flashcards: Flashcard[])  {
    let newCount = 0, mature = 0, learning = 0;
    flashcards.forEach(t => {
        if (t.interval >= 32) {
            mature += 1;
        } else if (t.interval && t.interval < 32) {
            learning += 1;
        } else {
        // } if (!t.interval) {
            newCount += 1;
        }
    });
    return {mature, learning, new: newCount};
}
