import {HeadingCache, SectionCache} from "obsidian";
import {Flashcard} from "src/data/models/flashcard";
import {AnnotationWithFlashcard, BookMetadataSections, Heading} from "src/data/models/book";
import {createParsedCardFromText, ParsedCard} from "src/data/models/parsedCard";
import {CardType} from "src/scheduling";
import {parseCardText, parseMetadata} from "src/data/deck";
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

export function generateFlashcardsArray(parsedCardsArray: ParsedCard[]) {
    const out: Flashcard[] = [];
    for (let parsedCard of parsedCardsArray) {
        const [questionText, answerText] = parseCardText(parsedCard.cardText);
        out.push(new Flashcard(parsedCard.id, questionText, answerText, parseMetadata(parsedCard.metadataText)));
    }
    return out;
}