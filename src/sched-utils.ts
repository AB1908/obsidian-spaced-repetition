import {LEGACY_SCHEDULING_EXTRACTOR, MULTI_SCHEDULING_EXTRACTOR} from "src/constants";
import {escapeRegexString} from "src/utils";
import {Card} from "src/Card";

export function removeSchedTextFromCard(cardText: string, separator?: string) {
    return cardText.replace(new RegExp((separator??"")+"<!--SR:.+-->", "gm"), "");
}

function generateSchedInfoString(scheduling: RegExpMatchArray[]) {
    let schedInfo = "<!--SR:";
    for (let i = 0; i < scheduling.length; i++) {
        schedInfo += `!${scheduling[i][1]},${scheduling[i][2]},${scheduling[i][3]}`;
    }
    schedInfo += "-->";
    return schedInfo;
}

function generateCardTextWithSchedInfo(cardText: string, scheduling: RegExpMatchArray[], sep: string) {
    cardText = removeSchedTextFromCard(cardText, sep);
    let schedInfo = generateSchedInfoString(scheduling);
    return cardText + sep + schedInfo;
}

export function generateSeparator(cardText: string, isCardCommentOnSameLine: boolean) {
    let sep: string = isCardCommentOnSameLine ? " " : "\n";
    // Override separator if last block is a codeblock
    if (cardText.endsWith("```") && sep !== "\n") {
        sep = "\n";
    }
    return sep;
}

export function generateSchedulingArray(cardSchedulingText: string, dueString: string, interval: number, ease: number, currentCard: Card) {
    let scheduling: RegExpMatchArray[] = [
        ...cardSchedulingText.matchAll(MULTI_SCHEDULING_EXTRACTOR),
    ];
    if (scheduling.length === 0) {
        scheduling = [...cardSchedulingText.matchAll(LEGACY_SCHEDULING_EXTRACTOR)];
    }

    const currCardSched: RegExpMatchArray = ["0", dueString, interval.toString(), ease.toString()];
    if (currentCard.isDue) {
        scheduling[currentCard.siblingIdx] = currCardSched;
    } else {
        scheduling.push(currCardSched);
    }
    return scheduling;
}

function regenerateCardTextWithSchedInfo(cardText: string, sep: string, dueString: string, interval: number, ease: number, currentCard: Card) {
    // adding info to the card for the first time
    if (cardText.lastIndexOf("<!--SR:") === -1) {
        return cardText + sep + `<!--SR:!${dueString},${interval},${ease}-->`;
    } else {
        let scheduling = generateSchedulingArray(cardText, dueString, interval, ease, currentCard);
        return generateCardTextWithSchedInfo(cardText, scheduling, sep);
    }
}

export function updateCardText(currentCard: Card, dueString: string, interval: number, ease: number, isCardCommentOnSameLine: boolean) {
    let cardText = currentCard.cardText;
    const sep = generateSeparator(cardText, isCardCommentOnSameLine);
    return regenerateCardTextWithSchedInfo(cardText, sep, dueString, interval, ease, currentCard);
}

export function updateCardInFileText(currentCard: Card, fileText: string, cardText: string) {
    console.group("input")
    console.groupEnd()
    const replacementRegex = new RegExp(escapeRegexString(currentCard.cardText), "gm");
    console.group("output");
    console.groupEnd();
    return fileText.replace(replacementRegex, () => cardText);
}