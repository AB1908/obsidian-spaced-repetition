import {TFile} from "obsidian";
import {Card, CardType} from "src/scheduling";

export function createCard(i: number, scheduling: RegExpMatchArray[], note: TFile, lineNo: number, front: string, back: string, cardText: string, context: string, cardType: CardType, siblings: Card[]) {
    const cardObj: Card = {
        isDue: i < scheduling.length,
        note,
        lineNo,
        front,
        back,
        cardText,
        context,
        cardType,
        siblingIdx: i,
        siblings,
    };
    return cardObj;
}

class CardClass {

}