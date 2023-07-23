import {CardType} from "src/scheduling";
import {ParsedCard} from "src/data/models/parsedCard";
import {FLAG, flagToString} from "src/data/deck";

export function cardTextGenerator(questionText: string, answerText: string, cardType: CardType) {
    if (cardType == CardType.MultiLineBasic) {
        // todo: figure out how to refer to settings
        return `${questionText}\n?\n${answerText}`;
    }
}

export function metadataTextGenerator(
    annotationId: number,
    schedulingMetadata: { interval: number, ease: number, dueDate: string },
    flag: FLAG
) {
    if (schedulingMetadata === null)
        return `<!--SR:${annotationId}-->`;
    else
        return `<!--SR:${annotationId}!${flagToString(flag)},${schedulingMetadata.dueDate},${schedulingMetadata.interval},${schedulingMetadata.interval}-->`;
}

// TODO: Allow templating?
export function generateCardAsStorageFormat(parsedCard: ParsedCard) {
    return `\n${parsedCard.cardText}\n${parsedCard.metadataText}\n`;
}