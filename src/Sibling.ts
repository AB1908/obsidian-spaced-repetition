import {SRSettings} from "src/settings";
import type {CardSides} from "src/DeckBuilder";

export function generateClozeSiblingMatches(settings: SRSettings, cardText: string): CardSides[] {
    return findSiblingMatches(generateSiblings(settings, cardText), cardText);
}

export function singleLineBasicSiblingMatches(cardText: string, settings: SRSettings): CardSides[] {
    let idx = cardText.indexOf(settings.singlelineCardSeparator);
    return [{
        front: cardText.substring(0, idx),
        back: cardText.substring(idx + settings.singlelineCardSeparator.length),
    }];
}

export function singleLineReversedSiblingMatches(cardText: string, settings: SRSettings): CardSides[] {
    let idx = cardText.indexOf(settings.singlelineReversedCardSeparator);
    const side1: string = cardText.substring(0, idx),
        side2: string = cardText.substring(
            idx + settings.singlelineReversedCardSeparator.length
        );
    return [{front: side1, back: side2}, {front: side2, back: side1}];
}

export function multiLineBasicSiblingMatches(cardText: string, settings: SRSettings): CardSides[] {
    let idx = cardText.indexOf("\n" + settings.multilineCardSeparator + "\n");
    return [{
        front: cardText.substring(0, idx),
        back: cardText.substring(idx + 2 + settings.multilineCardSeparator.length),
    }];
}

export function multiLineReversedSiblingMatches(cardText: string, settings: SRSettings): CardSides[] {
    let idx = cardText.indexOf("\n" + settings.multilineReversedCardSeparator + "\n");
    const side1: string = cardText.substring(0, idx),
        side2: string = cardText.substring(
            idx + 2 + settings.multilineReversedCardSeparator.length
        );
    return [{front: side1, back: side2}, {front: side2, back: side1}];
}

function generateSiblings(settings: SRSettings, cardText: string) {
    const siblings: RegExpMatchArray[] = [];
    if (settings.convertHighlightsToClozes) {
        siblings.push(...cardText.matchAll(/==(.*?)==/gm));
    }
    if (settings.convertBoldTextToClozes) {
        siblings.push(...cardText.matchAll(/\*\*(.*?)\*\*/gm));
    }
    if (settings.convertCurlyBracketsToClozes) {
        siblings.push(...cardText.matchAll(/{{(.*?)}}/gm));
    }
    siblings.sort((a, b) => {
        if (a.index < b.index) {
            return -1;
        }
        if (a.index > b.index) {
            return 1;
        }
        return 0;
    });
    return siblings;
}

export function generateClozeFront(cardText: string, deletionStart: number, deletionEnd: number) {
    let front =
        [`${cardText.substring(0, deletionStart)}`,`${cardText.substring(deletionEnd)}`].map(t=> removeOtherClozes(t));;
    // todo: add comment about why front0len
    return {frontArray: front, insertAt: front[0].length};
}

function removeOtherClozes(text: string) {
    return text
        .replace(/==/gm, "")
        .replace(/\*\*/gm, "")
        .replace(/{{/gm, "")
        .replace(/}}/gm, "");
}

function findSiblingMatches(siblings: RegExpMatchArray[], cardText: string): CardSides[] {
    let matches: CardSides[] = [];
    for (const sibling of siblings) {
        const deletionStart: number = sibling.index,
            deletionEnd: number = deletionStart + sibling[0].length;
        const {frontArray, insertAt} = generateClozeFront(cardText, deletionStart, deletionEnd);
        matches.push({front: frontArray.join(""), back: sibling[1], clozeInsertionAt: insertAt});
    }
    return matches;
}