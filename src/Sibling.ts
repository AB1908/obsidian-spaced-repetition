import {SRSettings} from "src/settings";

export function generateClozeSiblingMatches(settings: SRSettings, cardText: string): [string, string][] {
    return findSiblingMatches(generateSiblings(settings, cardText), cardText);
}

export function singleLineBasicSiblingMatches(cardText: string, settings: SRSettings): [string, string] {
    let idx = cardText.indexOf(settings.singlelineCardSeparator);
    return [
        cardText.substring(0, idx),
        cardText.substring(idx + settings.singlelineCardSeparator.length),
    ];
}

export function singleLineReversedSiblingMatches(cardText: string, settings: SRSettings): [string, string][] {
    let idx = cardText.indexOf(settings.singlelineReversedCardSeparator);
    const side1: string = cardText.substring(0, idx),
        side2: string = cardText.substring(
            idx + settings.singlelineReversedCardSeparator.length
        );
    return [[side1, side2], [side2, side1]];
}

export function multiLineBasicSiblingMatches(cardText: string, settings: SRSettings): [string, string] {
    let idx = cardText.indexOf("\n" + settings.multilineCardSeparator + "\n");
    return [
        cardText.substring(0, idx),
        cardText.substring(idx + 2 + settings.multilineCardSeparator.length),
    ];
}

export function multiLineReversedSiblingMatches(cardText: string, settings: SRSettings): [string, string][] {
    let idx = cardText.indexOf("\n" + settings.multilineReversedCardSeparator + "\n");
    const side1: string = cardText.substring(0, idx),
        side2: string = cardText.substring(
            idx + 2 + settings.multilineReversedCardSeparator.length
        );
    return [[side1, side2], [side2, side1]];
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
        `${cardText.substring(0, deletionStart)}<span style='color:#2196f3'>[...]</span>${cardText.substring(deletionEnd)}`;
    return front
        .replace(/==/gm, "")
        .replace(/\*\*/gm, "")
        .replace(/{{/gm, "")
        .replace(/}}/gm, "");
}

function generateClozeBack(back: string, cardText: string, deletionStart: number, deletionEnd: number) {
    back =
        cardText.substring(0, deletionStart) +
        "<span style='color:#2196f3'>" +
        cardText.substring(deletionStart, deletionEnd) +
        "</span>" +
        cardText.substring(deletionEnd);
    return back
        .replace(/==/gm, "")
        .replace(/\*\*/gm, "")
        .replace(/{{/gm, "")
        .replace(/}}/gm, "");
}

function findSiblingMatches(siblings: RegExpMatchArray[], cardText: string): [string, string][] {
    let front: string;
    let back: string;
    let matches: [string, string][] = [];
    for (const m of siblings) {
        const deletionStart: number = m.index,
            deletionEnd: number = deletionStart + m[0].length;
        front = generateClozeFront(cardText, deletionStart, deletionEnd);
        back = generateClozeBack(back, cardText, deletionStart, deletionEnd);
        matches.push([front, back]);
    }
    return matches;
}