import {CardType, ReviewResponse, schedule} from "src/scheduler/scheduling";
import {nanoid} from "nanoid";
import {FLAG, FlashcardMetadata} from "src/data/parser";
import {moment} from "obsidian";
import {SchedulingMetadata} from "src/data/export/TextGenerator";
import {plugin} from "src/main";

export interface Flashcard {
    id: string,
    questionText: string,
    answerText: string,
    context: string,
    cardType: number,
    siblings: string[],
    interval: number,
    ease: number,
    dueDate: string,
    annotationId: string,
    // this is to update the card so I can keep this object simple
    parsedCardId: string,
}

export abstract class AbstractFlashcard implements Flashcard {
    answerText: string;
    cardType: number;
    context: string;
    dueDate: string;
    ease: number;
    id: string;
    interval: number;
    questionText: string;
    siblings: string[];
    annotationId: string;
    flag: FLAG;
    parsedCardId: string;

    // cardMetadata and highlight ID are mutually exclusive properties. Given that there is no constructor overloading
    // probably should change this to be a union type
    protected constructor(cardType: CardType, parsedCardId: string, cardMetadata?: FlashcardMetadata, annotationId?: string) {
        // this.questionText = questionText;
        // this.answerText = answerText;
        this.id = nanoid(8);
        this.cardType = cardType;
        this.context = null;
        this.dueDate = cardMetadata?.dueDate;
        this.ease = cardMetadata?.ease;
        this.interval = cardMetadata?.interval;
        this.annotationId = cardMetadata?.annotationId || annotationId;
        this.flag = cardMetadata?.flag;
        this.siblings = [];
        this.parsedCardId = parsedCardId;
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

    isDue() {
        return this.dueDate === null || this.dueDate <= moment().format("YYYY-MM-DD");
    }
}

// todo: move into controller?
export function calculateDelayBeforeReview(due: string) {
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
            plugin.data.settings,
        );
    } else {
        schedObj = schedule(
            clickedResponse,
            schedulingMetadata.interval,
            schedulingMetadata.ease,
            calculateDelayBeforeReview(schedulingMetadata.dueDate),
            plugin.data.settings,
        );
    }
    const {interval, ease} = schedObj;
    // todo: parameterize format? nah
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