import {CardType} from "src/scheduling";
import {ParsedCard} from "src/data/models/parsedCard";

export function cardTextGenerator(questionText: string, answerText: string, cardType: CardType) {
    if (cardType == CardType.MultiLineBasic) {
        // todo: figure out how to refer to settings
        return `${questionText}\n?\n${answerText}`;
    }
}

export function metadataTextGenerator(highlightId: string, schedulingMetadata: {
    interval: number,
    ease: number,
    dueDate: string
}) {
    if (schedulingMetadata === null)
        return `<!--SR:${highlightId}-->`;
    else
        return `<!--SR:${highlightId}${schedulingMetadata.dueDate},${schedulingMetadata.interval},${schedulingMetadata.interval}-->`;
}

// TODO: Allow templating?
export function generateCardAsStorageFormat(parsedCard: ParsedCard) {
    return `\n${parsedCard.cardText}\n${parsedCard.metadataText}\n`;
}