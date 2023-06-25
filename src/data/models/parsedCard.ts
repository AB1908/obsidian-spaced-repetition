import {CardType} from "src/scheduling";
import {ParsedCard} from "src/parser";
import {nanoid} from "nanoid";
import {getTFileForPath, writeCardToDisk} from "src/disk";
import {cardTextGenerator, generateCardAsStorageFormat, metadataTextGenerator} from "src/data/export/TextGenerator";

export async function createParsedCard(questionText: string, answerText: string, cardType: CardType, path: string, highlightId: string): Promise<ParsedCard> {
    const parsedCard = {
        id: nanoid(8),
        note: getTFileForPath(path),
        cardText: cardTextGenerator(questionText, answerText, cardType),
        metadataText: metadataTextGenerator(highlightId, null),
        // TODO: remove lineno
        lineNo: 0,
        cardType: cardType,
    };
    await writeCardToDisk(parsedCard.note, generateCardAsStorageFormat(parsedCard));
    this.parsedCards.push(parsedCard);
    return parsedCard;
}