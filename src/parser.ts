import {CardType} from "src/scheduling";
import type {SRSettings} from "src/settings";
import {nanoid} from "nanoid";
import {AbstractFlashcard} from "src/controller";

export interface ParsedCard {
    id: string,
    cardType: CardType,
    cardText: string,
    metadataText: string,
    lineNo: number
}

/**
 * Returns flashcards found in `text`
 *
 * @param text - The text to extract flashcards from
 * @param settings - The plugin's settings
 * @returns An array of [CardType, card text, line number] tuples
 */
export function parse(text: string, settings: SRSettings) : ParsedCard[] {
    let cardText = "";
    let cardType: CardType | null = null;
    let lineNo = 0;
    let parsedCards: ParsedCard[] = [];
    const {
        singlelineCardSeparator,
        singlelineReversedCardSeparator,
        multilineCardSeparator,
        multilineReversedCardSeparator,
        convertHighlightsToClozes,
        convertBoldTextToClozes,
        convertCurlyBracketsToClozes
    } = settings;
    let metadataText = "";

    const lines: string[] = text.split("\n");
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].length === 0) {
            if (cardType) {
                parsedCards.push({id: nanoid(8), cardType, cardText, lineNo, metadataText})
                cardType = null;
            }

            cardText = "";
            continue;
        } else if (lines[i].startsWith("<!--") && !lines[i].startsWith("<!--SR:")) {
            cardText = lines[i];
            while (i + 1 < lines.length && !lines[i].includes("-->")) i++;
            i++;
            continue;
        }

        if (lines[i].startsWith("<!--SR:")) {
            metadataText = lines[i];
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
                metadataText = lines[i+1];
                i++;
            }
            parsedCards.push({id: nanoid(8), cardType, cardText, lineNo, metadataText})
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
        parsedCards.push({id: nanoid(8), cardType, cardText, lineNo, metadataText: metadataText})
    }

    return parsedCards;
}
