import {CardType} from "src/scheduler/scheduling";
import {nanoid} from "nanoid";
import {writeCardToDisk} from "src/data/disk";
import {cardTextGenerator, generateCardAsStorageFormat, metadataTextGenerator} from "src/data/utils/TextGenerator";
import {FLAG} from "src/data/parser";

export interface ParsedCard {
    id: string,
    cardType: CardType,
    cardText: string,
    metadataText: string,
    lineNo: number,
    notePath: string,
}

// Note that this creates a learning card by default
// todo: fix metadatatext
export async function createParsedCard(
    questionText: string,
    answerText: string,
    cardType: CardType,
    path: string,
    annotationId: string,
    flag: FLAG = FLAG.LEARNING
): Promise<ParsedCard> {
    const parsedCard = {
        id: nanoid(8),
        notePath: path,
        cardText: cardTextGenerator(questionText, answerText, cardType),
        metadataText: metadataTextGenerator(annotationId, null, flag),
        // TODO: remove lineno
        lineNo: -1,
        cardType: cardType,
    };
    await writeCardToDisk(parsedCard.notePath, generateCardAsStorageFormat(parsedCard));
    return parsedCard;
}

export function createParsedCardFromText(
    cardText: string,
    cardType: CardType,
    path: string,
    metadataText: string,
): ParsedCard {
    return {
        id: nanoid(8),
        notePath: path,
        cardText: cardText,
        metadataText: metadataText,
        // TODO: remove lineno
        lineNo: -1,
        cardType: cardType,
    };
}