import { CardType } from "src/scheduler/scheduling";
import { generateFlashcardsArray } from "src/data/models/flashcard";
import { mocked } from "jest-mock";
import { nanoid } from "nanoid";

// eslint-disable-next-line @typescript-eslint/no-empty-function
jest.mock("../src/main", () => {});

const mockedNanoid = mocked(nanoid, true);

describe("createFlashcards", () => {
    beforeEach(async () => {
        let value = 0;
        mockedNanoid.mockImplementation((_size?: number) => (value++).toString());
    });
    test("should create a flashcard array", () => {
        const parsedCards = [
            {
                id: "aaaaaaaa",
                notePath: "sample path",
                cardText: "This is a question\n?\nThis is an answer",
                metadataText: "<!--SR:93813-->",
                lineNo: -1,
                cardType: CardType.MultiLineBasic,
            },
        ];
        expect(generateFlashcardsArray(parsedCards)).toMatchInlineSnapshot(`
            [
              Flashcard {
                "answerText": "This is an answer",
                "cardType": 2,
                "context": null,
                "dueDate": null,
                "ease": null,
                "flag": null,
                "id": "0",
                "interval": null,
                "parentId": "93813",
                "parsedCardId": "aaaaaaaa",
                "questionText": "This is a question",
                "siblings": [],
              },
            ]
        `);
    });
    afterEach(() => {
       jest.resetAllMocks();
    });
});
