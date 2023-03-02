import {TFile} from "obsidian";
import {CardType} from "src/scheduling";

export class Card {
    isDue: boolean;
    interval?: number;
    ease?: number;
    delayBeforeReview?: number;
    // note
    note: TFile;
    lineNo: number;
    // visuals
    front: string;
    back: string;
    cardText: string;
    context: string;
    clozeInsertionAt: number;
    // types
    cardType: CardType;
    // information for sibling cards
    siblingIdx: number;
    siblings: Card[];

    constructor(i: number, scheduling: RegExpMatchArray[], note: TFile, lineNo: number, front: string, back: string, cardText: string, context: string, cardType: CardType, siblings: Card[], clozeInsertionAt: number) {
        this.isDue = i < scheduling.length;
        this.note = note;
        this.lineNo = lineNo;
        this.front = front;
        this.back = back;
        this.cardText = cardText;
        this.context = context;
        this.cardType = cardType;
        this.siblings = siblings;
        this.siblingIdx = i;
        this.clozeInsertionAt = clozeInsertionAt;
    }
}