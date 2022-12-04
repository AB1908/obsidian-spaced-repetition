import {CardType} from "src/scheduling";
import type {SRSettings} from "src/settings";

export interface parsedCard {
    cardType: CardType,
    cardText: string,
    lineNo: number
}

/**
 * Returns flashcards found in `text`
 *
 * @param text - The text to extract flashcards from
 * @settings SRSettings - The plugin's settings
 * @returns An array of [CardType, card text, line number] tuples
 */
export function parse( text: string, settings: SRSettings) : parsedCard[] {
    let cardText = "";
    let cardType: CardType | null = null;
    let lineNo = 0;
    let parsedCards: parsedCard[] = [];
    const {
        singlelineCardSeparator,
        singlelineReversedCardSeparator,
        multilineCardSeparator,
        multilineReversedCardSeparator,
        convertHighlightsToClozes,
        convertBoldTextToClozes,
        convertCurlyBracketsToClozes
    } = settings;

    const lines: string[] = text.split("\n");
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].length === 0) {
            if (cardType) {
                parsedCards.push({cardType, cardText, lineNo})
                cardType = null;
            }

            cardText = "";
            continue;
        } else if (lines[i].startsWith("<!--") && !lines[i].startsWith("<!--SR:")) {
            while (i + 1 < lines.length && !lines[i].includes("-->")) i++;
            i++;
            continue;
        }

        if (cardText.length > 0) {
            cardText += "\n";
        }
        cardText += lines[i];

        if (
            lines[i].includes(singlelineReversedCardSeparator) ||
            lines[i].includes(singlelineCardSeparator)
        ) {
            cardType = lines[i].includes(singlelineReversedCardSeparator)
                ? CardType.SingleLineReversed
                : CardType.SingleLineBasic;
            cardText = lines[i];
            lineNo = i;
            if (i + 1 < lines.length && lines[i + 1].startsWith("<!--SR:")) {
                cardText += "\n" + lines[i + 1];
                i++;
            }
            parsedCards.push({cardType, cardText, lineNo})
            cardType = null;
            cardText = "";
        } else if (
            cardType === null &&
            ((convertHighlightsToClozes && /==.*?==/gm.test(lines[i])) ||
                (convertBoldTextToClozes && /\*\*.*?\*\*/gm.test(lines[i])) ||
                (convertCurlyBracketsToClozes && /{{.*?}}/gm.test(lines[i])))
        ) {
            cardType = CardType.Cloze;
            lineNo = i;
        } else if (lines[i] === multilineCardSeparator) {
            cardType = CardType.MultiLineBasic;
            lineNo = i;
        } else if (lines[i] === multilineReversedCardSeparator) {
            cardType = CardType.MultiLineReversed;
            lineNo = i;
        } else if (lines[i].startsWith("```") || lines[i].startsWith("~~~")) {
            const codeBlockClose = lines[i].match(/`+|~+/)[0];
            while (i + 1 < lines.length && !lines[i + 1].startsWith(codeBlockClose)) {
                i++;
                cardText += "\n" + lines[i];
            }
            cardText += "\n" + codeBlockClose;
            i++;
        }
    }

    if (cardType && cardText) {
        parsedCards.push({cardType, cardText, lineNo})
    }

    return parsedCards;
}
