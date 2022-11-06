import {Card} from "src/scheduling";
import {LEGACY_SCHEDULING_EXTRACTOR, MULTI_SCHEDULING_EXTRACTOR} from "src/constants";
import {PluginData} from "src/main";
import {escapeRegexString} from "src/utils";

export function removeSchedTextFromCard(cardText: string) {
    return cardText.replace(/<!--SR:.+-->/gm, "");
}

function generateSchedInfoString(scheduling: RegExpMatchArray[]) {
    let schedInfo = "<!--SR:";
    for (let i = 0; i < scheduling.length; i++) {
        schedInfo += `!${scheduling[i][1]},${scheduling[i][2]},${scheduling[i][3]}`;
    }
    schedInfo += "-->";
    return schedInfo;
}

function generateCardTextWithSchedInfo(cardText: string, scheduling: RegExpMatchArray[]) {
    cardText = removeSchedTextFromCard(cardText);
    let schedInfo = generateSchedInfoString(scheduling);
    return cardText + schedInfo;
}

function generateSeparator(cardText: string, isCardCommentOnSameLine: boolean) {
    let sep: string = isCardCommentOnSameLine ? " " : "\n";
    // Override separator if last block is a codeblock
    if (cardText.endsWith("```") && sep !== "\n") {
        sep = "\n";
    }
    return sep;
}

export function generateSchedulingArray(cardSchedulingText: string, dueString: string, interval: number, ease: number, currentCard: Card) {
    console.group("input")
    console.log(arguments)
    console.groupEnd()
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
    console.group("output");
    console.log(scheduling);
    console.groupEnd();
    return scheduling;
}

function regenerateCardTextWithSchedInfo(cardText: string, sep: string, dueString: string, interval: number, ease: number, currentCard: Card) {
    // adding info to the card for the first time
    if (cardText.lastIndexOf("<!--SR:") === -1) {
        return cardText + sep + `<!--SR:!${dueString},${interval},${ease}-->`;
    } else {
        let scheduling = generateSchedulingArray(cardText, dueString, interval, ease, currentCard);
        return generateCardTextWithSchedInfo(cardText, scheduling);
    }
}

export function updateCardText(currentCard: Card, data: PluginData, dueString: string, interval: number, ease: number, isCardCommentOnSameLine: boolean = data.settings.cardCommentOnSameLine) {
    let cardText = currentCard.cardText;
    const sep = generateSeparator(cardText, isCardCommentOnSameLine);
    return regenerateCardTextWithSchedInfo(cardText, sep, dueString, interval, ease, currentCard);
}

export function updateCardInFileText(currentCard: Card, fileText: string, cardText: string) {
    const replacementRegex = new RegExp(escapeRegexString(currentCard.cardText), "gm");
    return fileText.replace(replacementRegex, () => cardText);
}