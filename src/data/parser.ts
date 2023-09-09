import {createParsedCardFromText, ParsedCard} from "src/data/models/parsedCard";
import {CardType} from "src/scheduler/scheduling";
import {getFileContents} from "src/data/disk";

// TODO: parameterize separators??
const CARDTEXT_REGEX = /(?<cardText>.*\n\?\n.*)\n(?<metadataText><!--SR:.*-->)/g;

export async function parseFileText(path: string) {
    const fileText = await getFileContents(path);
    const cardMatchesArray = fileText.matchAll(CARDTEXT_REGEX);
    const parsedCardsArray: ParsedCard[] = [];
    for (const card of cardMatchesArray) {
        if (card.groups === undefined) throw new Error("parseFileText: no text found");
        parsedCardsArray.push(createParsedCardFromText(card.groups.cardText, CardType.MultiLineBasic, path, card.groups.metadataText));
    }
    return parsedCardsArray;
}

export function parseCardText(text: string): [string, string] {
    const sides = text.split("\n?\n").map(t => t.trim());
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

const SCHEDULING_REGEX = /(!(?<flag>[BSL]),(?<dueDate>.{10}),(?<interval>\d+),(?<ease>\d+))/g;
// For now, annotation ids are only numerical
const ANNOTATION_ID_REGEX = /SR:(?<annotationId>[A-Za-z0-9]{3,8})/g;

export interface FlashcardMetadata {
    ease: number|null;
    dueDate: string|null;
    interval: number|null;
    annotationId: string;
    flag: FLAG|null;
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
        throw new Error("how can this not have an annotation id");
    }
    if (scheduling === undefined)
        return {
            flag: null,
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

