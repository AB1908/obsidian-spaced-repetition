import { CardType } from "src/types/CardType";
import {nanoid} from "nanoid";
import {writeCardToDisk} from "src/infrastructure/disk";
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

export interface CreateParsedCardOptions {
    flag?: FLAG;
    fingerprint?: string;
}

// New cards default to LEARNING — the scheduler promotes them after first review
export async function createParsedCard(
    questionText: string,
    answerText: string,
    cardType: CardType,
    path: string,
    annotationId: string,
    options?: CreateParsedCardOptions
): Promise<ParsedCard> {
    const flag = options?.flag ?? FLAG.LEARNING;
    const parsedCard = {
        id: nanoid(8),
        notePath: path,
        cardText: cardTextGenerator(questionText, answerText, cardType),
        metadataText: metadataTextGenerator(annotationId, null, flag, options?.fingerprint),
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