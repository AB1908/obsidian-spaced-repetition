import {AbstractFlashcard, Flashcard} from "src/data/models/flashcard";
import {BookMetadataSections} from "src/data/models/book";
import {createParsedCardFromText, ParsedCard} from "src/data/models/parsedCard";
import {CardType} from "src/scheduler/scheduling";
import {getFileContents} from "src/data/import/disk";

// adds a hasFlashcard:true for every annotation that has a flashcard
export function addFlashcardState(flashcards: Flashcard[], bookSections: BookMetadataSections) {
    const out = [];
    for (let metadataSection of bookSections) {
        // if (flashcards.filter(t=> metadataSection.id === t.id) !== undefined)
        //     out.push({...bookSections, hasFlashcard: true})
        // else
        //     out.push({...bookSections, hasFlashcard: false})
        // TODO: logic for this is incorrect, should be checking against metadata. Fix
        out.push({...bookSections, hasFlashcard: flashcards.some(t=>t.id === metadataSection.id)})
    }
    return out;
}

// TODO: parameterize separators??
const CARDTEXT_REGEX = /(?<cardText>.*\n\?\n.*)\n(?<metadataText><!--SR:.*-->)/g;

export async function parseFileText(path: string) {
    const fileText = await getFileContents(path);
    const cardMatchesArray = fileText.matchAll(CARDTEXT_REGEX);
    const parsedCardsArray: ParsedCard[] = [];
    for (let card of cardMatchesArray) {
        parsedCardsArray.push(createParsedCardFromText(card.groups.cardText, CardType.MultiLineBasic, path, card.groups.metadataText));
    }
    return parsedCardsArray;
}

export function createFlashcardsFromParsedCards(parsedCards: ParsedCard[]): AbstractFlashcard[] {
    for (let card of parsedCards) {
        const [questionText, answerText] = parseCardText(card.cardText);
        const flashcard = new Flashcard(card.id, questionText, answerText, parseMetadata(card.metadataText))
        this.flashcards.push(flashcard)
    }
    return;
}

export function parseCardText(text: string): [string, string] {
    let sides = text.split("\n?\n").map(t => t.trim());
    if (sides.length < 2) {
        new Error(`parseCardText: no card text found in ${text}`);
    }
    return [sides[0], sides[1]];
}

export enum FLAG {
    SUSPEND = "S",
    BURY = "B",
    LEARNING = "L"
}

export function flagToString(flag: FLAG): string {
    return flag;
}

const SCHEDULING_REGEX = /(!(?<flag>[BSL]),(?<dueDate>.{10}),(?<interval>\d+),(?<ease>\d+))/g;
// For now, annotation ids are only numerical
const ANNOTATION_ID_REGEX = /SR:(?<annotationId>[A-Za-z0-9]{3,8})/g;

export interface FlashcardMetadata {
    ease: number|null;
    dueDate: string|null;
    interval: number|null;
    annotationId: string;
    flag: FLAG;
}

// Couldn't find a concise way of doing this that was more readable
function stringToFlag(flag: string): FLAG {
    switch (flag) {
        case "S":
            return FLAG.SUSPEND;
        case "B":
            return FLAG.BURY;
        case "L":
            return FLAG.LEARNING;
        default:
            throw new Error("stringToFlag: incorrect character encountered");
    }
}

export function parseMetadata(text: string): FlashcardMetadata {
    const scheduling = text.matchAll(SCHEDULING_REGEX).next().value;
    const annotationId = text.matchAll(ANNOTATION_ID_REGEX).next().value?.groups?.annotationId;
    if (annotationId == null) {
        new Error("how can this not have an annotation id");
        console.error(text);
    }
    if (scheduling === undefined)
        return {
            flag: "",
            annotationId: annotationId,
            dueDate: null,
            interval: null,
            ease: null
        };
    else
        return {
            flag: stringToFlag(scheduling.groups.flag),
            annotationId: annotationId,
            dueDate: scheduling.groups.dueDate,
            interval: Number(scheduling.groups.interval),
            ease: Number(scheduling.groups.ease),
        };
}

