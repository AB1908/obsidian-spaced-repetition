import {CardType} from "src/scheduling";
import {nanoid} from "nanoid";
import {writeCardToDisk} from "src/disk";
import {cardTextGenerator, generateCardAsStorageFormat, metadataTextGenerator} from "src/data/export/TextGenerator";
import {plugin} from "src/main";

export interface ParsedCard {
    id: string,
    cardType: CardType,
    cardText: string,
    metadataText: string,
    lineNo: number,
    notePath?: string,
}

export async function createParsedCard(questionText: string, answerText: string, cardType: CardType, path: string, annotationId: string): Promise<ParsedCard> {
    const parsedCard = {
        id: nanoid(8),
        notePath: path,
        cardText: cardTextGenerator(questionText, answerText, cardType),
        metadataText: metadataTextGenerator(annotationId, null),
        // TODO: remove lineno
        lineNo: 0,
        cardType: cardType,
    };
    await writeCardToDisk(parsedCard.notePath, generateCardAsStorageFormat(parsedCard));
    plugin.parsedCards.push(parsedCard);
    return parsedCard;
}