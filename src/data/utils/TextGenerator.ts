import { CardType } from "src/types/CardType";
import { ParsedCard } from "src/data/models/parsedCard";

import { FLAG } from "src/data/parser";

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
    schedulingMetadata: SchedulingMetadata | null,
    flag = FLAG.LEARNING,
    fingerprint?: string
) {
    // TODO: the default param doesn't get set for some weird reason
    if (flag === null) {
        flag = FLAG.LEARNING;
    }
    const fpSuffix = fingerprint ? `!fp:${fingerprint}` : "";
    if (schedulingMetadata === null)
        return `<!--SR:${annotationId}${fpSuffix}-->`;
    else
        return `<!--SR:${annotationId}!${flag},${schedulingMetadata.dueDate},${schedulingMetadata.interval},${schedulingMetadata.ease}${fpSuffix}-->`;
}

// TODO: Allow templating?
export function generateCardAsStorageFormat(parsedCard: ParsedCard) {
    return `\n${parsedCard.cardText}\n${parsedCard.metadataText}\n`;
}