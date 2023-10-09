import { CardType, ReviewResponse, schedule } from "src/scheduler/scheduling";
import { nanoid } from "nanoid";
import { FLAG, FlashcardMetadata, parseCardText, parseMetadata } from "src/data/parser";
import { moment } from "obsidian";
import { SchedulingMetadata } from "src/data/utils/TextGenerator";
import { plugin } from "src/main";
import { ParsedCard } from "src/data/models/parsedCard";
import {getAnnotationFilePath, SourceNote} from "src/data/models/sourceNote";
import { filePathsWithTag } from "src/data/disk";

export interface AbstractFlashcard {
    id: string,
    questionText: string,
    answerText: string,
    context: string,
    cardType: number,
    siblings: string[],
    interval: number,
    ease: number,
    dueDate: string,
    parentId: string,
    // this is to update the card so that I can avoid nesting additional objects inside this one
    parsedCardId: string,
}

export abstract class AbstractFlashcard implements AbstractFlashcard {
    answerText: string;
    cardType: number;
    context: string;
    dueDate: string;
    ease: number;
    id: string;
    interval: number;
    questionText: string;
    siblings: string[];
    // todo: rename
    parentId: string;
    flag: FLAG;
    parsedCardId: string;

    // cardMetadata and highlight ID are mutually exclusive properties. Given that there is no constructor overloading
    // probably should change this to be a union type
    protected constructor(cardType: CardType, parsedCardId: string, cardMetadata?: FlashcardMetadata, annotationId?: string) {
        this.id = nanoid(8);
        this.cardType = cardType;
        this.context = null;
        this.dueDate = cardMetadata?.dueDate;
        this.ease = cardMetadata?.ease;
        this.interval = cardMetadata?.interval;
        this.parentId = cardMetadata?.annotationId || annotationId;
        this.flag = cardMetadata?.flag;
        this.siblings = [];
        this.parsedCardId = parsedCardId;
    }

    isDue() {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return this.dueDate === null || this.dueDate <= moment().format("YYYY-MM-DD");
    }
}

export class Flashcard extends AbstractFlashcard {
    // cardMetadata and highlight ID are mutually exclusive properties. Given that there is no constructor overloading
    // probably should change this to be a union type
    constructor(parsedCardId: string, questionText: string, answerText: string, cardMetadata?: FlashcardMetadata, annotationId?: string) {
        // todo: handle other types later
        const cardType = CardType.MultiLineBasic;
        if (cardMetadata) {
            super(cardType, parsedCardId, cardMetadata);
        } else {
            super(cardType, parsedCardId, null, annotationId);
        }
        this.questionText = questionText;
        this.answerText = answerText;
    }
}

// todo: move into controller?
export function calculateDelayBeforeReview(due: string) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return Math.abs(moment().valueOf() - moment(due).valueOf());
}

// todo: rename to update card?
export function schedulingMetadataForResponse(
    clickedResponse: ReviewResponse,
    schedulingMetadata: SchedulingMetadata,
): SchedulingMetadata {
    // const flashcard = getFlashcardById(flashcardId);
    // take the response received
    // use that to update flashcard internal state
    // that will take care of writing to disk
    // so this should be a relatively lean method
    // don't forget to update siblings?
    let schedObj;
    // is new card
    if (schedulingMetadata.dueDate === null) {
        // todo: move default settings down into schedule()?
        schedObj = schedule(
            clickedResponse,
            1.0,
            plugin.data.settings.baseEase,
            0,
        );
    } else {
        schedObj = schedule(
            clickedResponse,
            schedulingMetadata.interval,
            schedulingMetadata.ease,
            calculateDelayBeforeReview(schedulingMetadata.dueDate),
        );
    }
    const {interval, ease} = schedObj;
    // todo: parameterize format? nah
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const due = moment(Date.now() + interval * 24 * 3600 * 1000).format("YYYY-MM-DD");
    return {interval, ease, dueDate: due};
}

export function maturityCounts(flashcards: Flashcard[]) {
    let newCount = 0, mature = 0, learning = 0;
    flashcards.forEach(t => {
        if (t.interval >= 32) {
            mature += 1;
        } else if (t.interval && t.interval < 32) {
            learning += 1;
        } else {
            // } if (!t.interval) {
            newCount += 1;
        }
    });
    return {mature, learning, new: newCount};
}

export function createFlashcard(parsedCard: ParsedCard, questionText: string, answerText: string) {
    return new Flashcard(parsedCard.id, questionText, answerText, parseMetadata(parsedCard.metadataText));
}

export function generateFlashcardsArray(parsedCardsArray: ParsedCard[]) {
    const out: Flashcard[] = [];
    for (const parsedCard of parsedCardsArray) {
        const [questionText, answerText] = parseCardText(parsedCard.cardText);
        out.push(createFlashcard(parsedCard, questionText, answerText));
    }
    return out;
}