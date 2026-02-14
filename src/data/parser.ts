import {createParsedCardFromText, ParsedCard} from "src/data/models/parsedCard";
import { CardType } from "src/types/CardType";
import {getFileContents} from "src/infrastructure/disk";

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
// todo: fix this regex because paragraphs can have arbitrary length id
const ANNOTATION_ID_REGEX = /SR:(?<annotationId>[A-Za-z0-9]{3,8})/g;
const FINGERPRINT_REGEX = /!fp:(?<fingerprint>[0-9a-f]+)/;

export interface FlashcardMetadata {
    ease: number|null;
    dueDate: string|null;
    interval: number|null;
    annotationId: string;
    flag: FLAG|null;
    fingerprint?: string;
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
    const fingerprintMatch = text.match(FINGERPRINT_REGEX);
    const fingerprint = fingerprintMatch?.groups?.fingerprint;
    if (annotationId == null) {
        throw new Error("how can this not have an annotation id");
    }
    if (scheduling === undefined) {
        // todo: refactor and ultimately write a better parser
        const parentId = text.matchAll(/<!--SR:(?<parentId>[A-Za-z0-9_]+)/g).next().value?.groups.parentId;
        return {
            flag: null,
            annotationId: parentId,
            dueDate: null,
            interval: null,
            ease: null,
            fingerprint,
        };
    } else
        return {
            flag: stringToFlag(scheduling.groups.flag),
            annotationId: annotationId,
            dueDate: scheduling.groups.dueDate,
            interval: Number(scheduling.groups.interval),
            ease: Number(scheduling.groups.ease),
            fingerprint,
        };
}

