import card from "./card.json";
import {replacedCardText} from "src/edit-utils";
import {Card} from "src/Card";
import {beforeEach} from "@jest/globals";

test("removal", () => {
    const questionText = "New question text";
    const answerText = "New answer text";
    const expectedOutput = `New question text\n?\nNew answer text\n<!--SR:!2022-11-05,5,170-->`;
    expect(replacedCardText(card as unknown as Card, {front: questionText, back: answerText}, false)).toEqual(expectedOutput);
})

describe("replacedCardText", () => {
        it.each([
            null,
            undefined,
            ""
        ])(
            `should throw an error for: %s`,
            (x => {
                const front = card.front;
                const cardText = card.cardText;
                const questionText: string | undefined | null = x;
                const answerText = "New answer text";
                expect(() => {
                    replacedCardText(card as unknown as Card, {front: questionText, back: answerText} as unknown as any, false)
                }).toThrow();
            })
        );
    }
);

let front: string;
let cardText: string;
let back: string;
let answerText: string;
let cardObj: Card;
describe("replacedCardText", () => {
    beforeEach(() => {
        cardObj = JSON.parse(JSON.stringify(card)) as unknown as Card;
        front = card.front;
        cardText = card.cardText;
        back = card.back;
        answerText = "New answer text";
    });
    it.each([
        "s",
        "this is edited text",
        "🎍🖼🧵😂🤣"
    ])(
        `should replace question text with: %s`,
        (x => {
            const questionText: string = x;
            const expectedOutput = `${x}\n?\nNew answer text\n<!--SR:!2022-11-05,5,170-->`;
            expect(replacedCardText(cardObj, {front: questionText, back: answerText}, false)).toEqual(expectedOutput);
        })
    )
})

describe("replacedCardText", () => {
    test("wrong updatedCard.back", () => {
        const updatedCard = {
            "front": "newdeck question 5",
            "back": "Answer that was edited on 2022-10-31\n<!--SR:!2022-11-05,5,170-->"
        };
        const expectedOutput = `newdeck question 5\n?\nNew answer text\n<!--SR:!2022-11-05,5,170-->`;
        expect(() => {
            replacedCardText(cardObj, updatedCard, false)
        }).toThrow();
    })
});