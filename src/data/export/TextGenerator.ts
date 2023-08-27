import {CardType} from "src/scheduler/scheduling";
import {ParsedCard} from "src/data/models/parsedCard";

import {FLAG, flagToString} from "src/data/parser";

export function cardTextGenerator(questionText: string, answerText: string, cardType: CardType) {
    if (cardType == CardType.MultiLineBasic) {
        // todo: figure out how to refer to settings
        return `${questionText}\n?\n${answerText}`;
    } else {
        throw new Error("cardTextGenerator: Not implemented");
    }
}

export interface SchedulingMetadata {
    interval: number;
    ease: number;
    dueDate: string;
}

export function metadataTextGenerator(
    annotationId: string,
    schedulingMetadata: SchedulingMetadata,
    flag = FLAG.LEARNING
) {
    // TODO: the default param doesn't get set for some weird reason
    if (flag === null) {
        flag = FLAG.LEARNING;
    }
    if (schedulingMetadata === null)
        return `<!--SR:${annotationId}-->`;
    else
        return `<!--SR:${annotationId}!${flag},${schedulingMetadata.dueDate},${schedulingMetadata.interval},${schedulingMetadata.ease}-->`;
}

// TODO: Allow templating?
export function generateCardAsStorageFormat(parsedCard: ParsedCard) {
    return `\n${parsedCard.cardText}\n${parsedCard.metadataText}\n`;
}