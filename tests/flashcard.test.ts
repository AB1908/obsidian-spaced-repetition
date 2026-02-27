import { CardType } from "src/types/CardType";

import { FLAG } from "src/data/parser";
import { generateFlashcardsArray, FlashcardNote } from "src/data/models/flashcard";
import { metadataTextGenerator } from "src/data/utils/TextGenerator";
import { deleteCardOnDisk, updateCardOnDisk } from "src/infrastructure/disk";

// eslint-disable-next-line @typescript-eslint/no-empty-function
jest.mock("../src/main", () => {});

jest.mock("nanoid", () => ({
    nanoid: () => "deterministic-id",
}));

jest.mock("src/infrastructure/disk", () => ({
    getAnnotationFilePath: jest.fn(),
    updateCardOnDisk: jest.fn(),
    deleteCardOnDisk: jest.fn(),
    writeCardToDisk: jest.fn(),
    filePathsWithTag: jest.fn(),
    getFileContents: jest.fn(),
}));

describe("createFlashcards", () => {
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
                "fingerprint": undefined,
                "flag": null,
                "id": "deterministic-id",
                "interval": null,
                "parentId": "93813",
                "parsedCardId": "aaaaaaaa",
                "questionText": "This is a question",
                "siblings": [],
              },
            ]
        `);
    });
});

describe("FlashcardNote", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("should keep in-memory contents unchanged when disk update fails", async () => {
        (updateCardOnDisk as jest.Mock).mockResolvedValue(false);
        const note = new FlashcardNote("test-note.md");
        note.parsedCards = [{
            id: "parsed-1",
            notePath: "test-note.md",
            cardText: "old question\n?\nold answer",
            metadataText: metadataTextGenerator("parent-id", null, FLAG.LEARNING),
            lineNo: 1,
            cardType: CardType.MultiLineBasic,
        }];
        note.flashcards = generateFlashcardsArray(note.parsedCards);
        const originalParsedCard = note.parsedCards[0];
        const originalQuestion = note.flashcards[0].questionText;
        const originalAnswer = note.flashcards[0].answerText;

        await note.updateCardContents(
            note.flashcards[0].id,
            "new question",
            "new answer",
            CardType.MultiLineBasic
        );

        expect(note.flashcards[0].questionText).toBe(originalQuestion);
        expect(note.flashcards[0].answerText).toBe(originalAnswer);
        expect(note.parsedCards[0].cardText).toBe(originalParsedCard.cardText);
    });

    test("should keep in-memory cards unchanged when disk delete fails", async () => {
        (deleteCardOnDisk as jest.Mock).mockResolvedValue(false);
        const note = new FlashcardNote("test-note.md");
        note.parsedCards = [{
            id: "parsed-1",
            notePath: "test-note.md",
            cardText: "old question\n?\nold answer",
            metadataText: metadataTextGenerator("parent-id", null, FLAG.LEARNING),
            lineNo: 1,
            cardType: CardType.MultiLineBasic,
        }];
        note.flashcards = generateFlashcardsArray(note.parsedCards);
        const initialFlashcardCount = note.flashcards.length;
        const initialParsedCount = note.parsedCards.length;

        await note.deleteCard(note.flashcards[0].id);

        expect(note.flashcards).toHaveLength(initialFlashcardCount);
        expect(note.parsedCards).toHaveLength(initialParsedCount);
    });
});
