import {FLAG, FlashcardMetadata} from "src/data/deck";
import {CardType} from "src/scheduling";
import {nanoid} from "nanoid";

export interface Flashcard {
    id: string,
    questionText: string,
    answerText: string,
    context: string,
    cardType: number,
    siblings: string[],
    isDue: boolean,
    interval: number,
    ease: number,
    delayBeforeReview: number,
    annotationId: string,
    parsedCardId: string,
}

export abstract class AbstractFlashcard implements Flashcard {
    answerText: string;
    cardType: number;
    context: string;
    delayBeforeReview: number;
    ease: number;
    id: string;
    interval: number;
    isDue: boolean;
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
        this.delayBeforeReview = null;
        this.ease = cardMetadata?.ease;
        this.interval = cardMetadata?.interval;
        this.annotationId = cardMetadata?.annotationId || annotationId;
        this.flag = cardMetadata?.flag;
        this.isDue = false;
        this.siblings = [];
        this.parsedCardId = parsedCardId;
    }
}

export class Flashcard extends AbstractFlashcard {
    // cardMetadata and highlight ID are mutually exclusive properties. Given that there is no constructor overloading
    // probably should change this to be a union type
    constructor(parsedCardId: string, questionText: string, answerText: string, cardMetadata?: FlashcardMetadata, highlightId?: string) {
        // todo: handle other types later
        const cardType = CardType.MultiLineBasic;
        if (cardMetadata) {
            super(cardType, parsedCardId, cardMetadata);
        } else {
            super(cardType, parsedCardId, null, highlightId);
        }
        this.questionText = questionText;
        this.answerText = answerText;
    }
}