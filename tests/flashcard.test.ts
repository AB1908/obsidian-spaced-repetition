import { CardType } from "src/scheduler/scheduling";

import { generateFlashcardsArray } from "src/data/models/flashcard";

// eslint-disable-next-line @typescript-eslint/no-empty-function
jest.mock("../src/main", () => {
});

describe("createFlashcards", () => {
    test("should create a flashcard array", () => {
        const parsedCards = [
            {
                id: "aaaaaaaa",
                notePath: "sample path",
                cardText: "This is a question\n?\nThis is an answer",
                metadataText: "<!--SR:93813-->",
                lineNo: -1,
                cardType: CardType.MultiLineBasic
            }
        ];
        expect(generateFlashcardsArray(parsedCards)).toMatchInlineSnapshot(`
            [
              Flashcard {
                "annotationId": "93813",
                "answerText": "This is an answer",
                "cardType": 2,
                "context": null,
                "dueDate": null,
                "ease": null,
                "flag": null,
                "id": "0",
                "interval": null,
                "parsedCardId": "aaaaaaaa",
                "questionText": "This is a question",
                "siblings": [],
              },
            ]
        `);
    });
});
