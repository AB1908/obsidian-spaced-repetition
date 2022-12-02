import card from "./card.json";
import {replacedCardText} from "src/edit-utils";
import {Card} from "src/Card";

test("removal", () => {
    const front = card.front;
    const cardText = card.cardText;
    const questionText = "New question text";
    const back = card.back;
    const answerText = "New answer text";
    const expectedOutput = `New question text\n?\nNew answer text\n<!--SR:!2022-11-05,5,170-->`;
    expect(replacedCardText(front, card as unknown as Card, cardText, questionText, back, answerText, false)).toEqual(expectedOutput);
})
