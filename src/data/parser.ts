import {HeadingCache, SectionCache} from "obsidian";
import {AbstractFlashcard, Flashcard} from "src/data/models/flashcard";
import {AnnotationWithFlashcard, BookMetadataSections, Heading} from "src/data/models/book";
import {createParsedCardFromText, ParsedCard} from "src/data/models/parsedCard";
import {CardType} from "src/scheduling";
import {getFileContents} from "src/disk";

// TODO: refactor
// TODO: think about heading collisions as there may be multiple chapters with same name
// TODO: don't need to nest paragraphs I think
// TODO: fix type
export function generateTree(sections: any[]) {
    let i = 0;
    let prevHeader;
    while (i<sections.length) {
        let each = sections[i];
        if ("heading" in each) {
            if (!("children" in each)) {
                each.children = [];
            }
        } else {
            prevHeader = findPreviousHeader(sections, each);
            if (prevHeader != null) {
                sections[prevHeader].children.push(each);
            }
        }
        i++;
    }

    // successively attach lower level headers to higher ones
    // TODO: remove hardcoded headers and find the deepest header dynamically?
    // May be unnecessary since no book is going to have like a 5 level header... right??
    for (let headingLevel = 4; headingLevel > 1; headingLevel--) {
        let sectionIndex = 0;
        while (sectionIndex<sections.length) {
            let each = sections[sectionIndex];
            if (("heading" in each) && (each.level == headingLevel)) {
                prevHeader = findPreviousHeader(sections, each);
                sections[prevHeader].children.push(each);
            }
            sectionIndex++;
        }
    }
    return sections.filter(t=>"heading" in t && t.level == 1);
}

export function findPreviousHeader(sections: (SectionCache|HeadingCache)[], section: SectionCache|HeadingCache) {
    let start = sections.indexOf(section);
    // top level headers don't have a parent
    // TODO: consider changing this to -1 so we have a consistent return type
    if (('level' in section) && ((section as HeadingCache).level == 1)) return null;
    while (start >= 0) {
        if (section == sections[start]) start--;
        if ("level" in sections[start]) {
            if ((sections[start] as HeadingCache).level == (section as HeadingCache).level) start--;
        }
        if ("heading" in sections[start])
            return start;
        start--;
    }
    return null;
}

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

export function isHeading(section: (AnnotationWithFlashcard|Heading)): section is Heading {
    return "level" in section;
}

// TODO: why did I make this? Where do I need it?
export function generateSectionsTree(sections: (AnnotationWithFlashcard|Heading)[]) {
    const headings: Heading[] = sections.filter((t): t is Heading => isHeading(t));
    return generateTree(headings);
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
    let sides = text.split("?").map(t => t.trim());
    if (sides.length < 2) {
        return;
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

export function generateFlashcardsArray(parsedCardsArray: ParsedCard[]) {
    const out: Flashcard[] = [];
    for (let parsedCard of parsedCardsArray) {
        const [questionText, answerText] = parseCardText(parsedCard.cardText);
        out.push(new Flashcard(parsedCard.id, questionText, answerText, parseMetadata(parsedCard.metadataText)));
    }
    return out;
}