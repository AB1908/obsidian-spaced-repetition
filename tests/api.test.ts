import { createFlashcardForAnnotation, getFlashcardById } from "src/api";
import { plugin } from "src/main";
import { FlashcardIndex } from "src/data/models/flashcard";

jest.mock("../src/data/disk", () => {
    return {
        // eslint-disable-next-line @typescript-eslint/no-empty-function,@typescript-eslint/no-unused-vars
        writeCardToDisk: (path: string, text: string) => {
        }
    };
});

jest.mock("../src/data/models/flashcard", () => {
    // Require the original module to not be mocked...
    const originalModule = jest.requireActual<typeof import("../src/data/models/flashcard")>(
        "../src/data/models/flashcard"
    );

    return {
        __esModule: true, // Use it when dealing with esModules
        ...originalModule,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        calculateDelayBeforeReview: jest.fn((due: string) => 63836018)
    };
});

jest.mock("../src/main", () => {
       return {
        __esModule: true, // Use it when dealing with esModules
        plugin: { flashcardIndex: null },
    };
});



describe("getFlashcardById", () => {
    beforeEach(() => {
        plugin.flashcardIndex = new FlashcardIndex();
        plugin.flashcardIndex.flashcards = new Map();
        plugin.flashcardIndex.flashcards.set("pBri5QNB",
            {
                id: "pBri5QNB",
                cardType: 2,
                context: null,
                dueDate: "2023-09-02",
                ease: 250,
                interval: 2,
                annotationId: "5769",
                flag: "L",
                siblings: [],
                parsedCardId: "u-72tWEW",
                questionText: "What is cued recall?",
                answerText:
                    "Cued recall is where we cue recall by presenting some information."
            }
        );
    });
    test("retrieves a flashcard successfully", () => {
        expect(getFlashcardById("pBri5QNB", "ibJ6QFl4")).toStrictEqual({
            id: "pBri5QNB",
            cardType: 2,
            context: null,
            dueDate: "2023-09-02",
            ease: 250,
            interval: 2,
            delayBeforeReview: 63836018,
            annotationId: "5769",
            flag: "L",
            siblings: [],
            parsedCardId: "u-72tWEW",
            questionText: "What is cued recall?",
            answerText: "Cued recall is where we cue recall by presenting some information."
        });
        expect(() => getFlashcardById("aaaa", "ibJ6QFl4")).toThrowError();
    });
});

// describe("updateFlashcardQuestion", () => {
//     let mockThis: any;
//     let boundUpdate: any;
//
//     beforeEach(() => {
//         mockThis = {
//             flashcards: flashcards()
//         };
//         boundUpdate = updateFlashcardQuestion.bind(mockThis);
//     });
//
//     test("should update the questionText of the flashcard with the given id", () => {
//         const updatedQuestion = "What is your age?";
//         const id = "yjlML2s9W";
//
//         expect(boundUpdate(id, updatedQuestion)).toBe(true);
//         expect(mockThis.flashcards[0].questionText).toBe(updatedQuestion);
//     });
//
//     test("should return false if the flashcard with the given id does not exist", () => {
//         const nonExistingId = "3";
//         const updatedQuestion = "What is your age?";
//
//         expect(boundUpdate(nonExistingId, updatedQuestion)).toBe(false);
//     });
// });
//
// describe("updateFlashcardAnswer", () => {
//     let mockThis: any;
//     let boundUpdate: any;
//
//     beforeEach(() => {
//         mockThis = {
//             flashcards: flashcards()
//         };
//         boundUpdate = updateFlashcardAnswer.bind(mockThis);
//     });
//
//     test("should update the questionText of the flashcard with the given id", () => {
//         const updatedAnswer = "What is your age?";
//         const id = "yjlML2s9W";
//
//         expect(boundUpdate(id, updatedAnswer)).toBe(true);
//         expect(mockThis.flashcards[0].answerText).toBe(updatedAnswer);
//     });
//
//     test("should return false if the flashcard with the given id does not exist", () => {
//         const nonExistingId = "3";
//         const updatedQuestion = "What is your age?";
//
//         expect(boundUpdate(nonExistingId, updatedQuestion)).toBe(false);
//     });
// });

describe("createFlashcardForAnnotation", () => {
    test("should create a new flashcard", async () => {
        const card = {
            id: "pBri5QNB",
            cardType: 2,
            context: null,
            dueDate: "2023-09-02",
            ease: 250,
            interval: 2,
            delayBeforeReview: 63836018,
            annotationId: "5769",
            flag: "L",
            siblings: [],
            parsedCardId: "u-72tWEW",
            questionText: "What is cued recall?",
            answerText: "Cued recall is where we cue recall by presenting some information."
        };
        const bookId = "ibJ6QFl4";
        await createFlashcardForAnnotation(
            card.questionText,
            card.answerText,
            card.annotationId,
            bookId
        );
        // console.log(plugin.notesWithFlashcards);
        expect(plugin.notesWithFlashcards).toMatchInlineSnapshot(`
            [
              {
                "flashcards": [
                  {
                    "annotationId": "5769",
                    "answerText": "Cued recall is where we cue recall by presenting some information.",
                    "cardType": 2,
                    "context": null,
                    "dueDate": "2023-09-02",
                    "ease": 250,
                    "flag": "L",
                    "id": "pBri5QNB",
                    "interval": 2,
                    "parsedCardId": "u-72tWEW",
                    "questionText": "What is cued recall?",
                    "siblings": [],
                  },
                  Flashcard {
                    "annotationId": "5769",
                    "answerText": "Cued recall is where we cue recall by presenting some information.",
                    "cardType": 2,
                    "context": null,
                    "dueDate": undefined,
                    "ease": undefined,
                    "flag": undefined,
                    "id": "1",
                    "interval": undefined,
                    "parsedCardId": "0",
                    "questionText": "What is cued recall?",
                    "siblings": [],
                  },
                ],
                "flashcardsPath": "Memory - A Very Short Introduction/Flashcards.md",
                "id": "ibJ6QFl4",
                "name": "Memory - A Very Short Introduction",
                "parsedCards": [
                  {
                    "cardText": "What is cued recall?
            ?
            Cued recall is where we cue recall by presenting some information.",
                    "cardType": 2,
                    "id": "u-72tWEW",
                    "lineNo": -1,
                    "metadataText": "<!--SR:5769!L,2023-09-02,2,250-->",
                    "notePath": "Memory - A Very Short Introduction/Flashcards.md",
                  },
                  {
                    "cardText": "What is cued recall?
            ?
            Cued recall is where we cue recall by presenting some information.",
                    "cardType": 2,
                    "id": "0",
                    "lineNo": -1,
                    "metadataText": "<!--SR:5769-->",
                    "notePath": "Memory - A Very Short Introduction/Flashcards.md",
                  },
                ],
              },
            ]
        `);
    });
});

// describe("deleteFlashcard", () => {
//     let mockThis: any;
//     let boundDelete: typeof deleteFlashcardById;
//
//     beforeEach(() => {
//         mockThis = {
//             flashcards: flashcards()
//         };
//         boundDelete = deleteFlashcardById.bind(mockThis);
//     });
//
//     test("should delete an existing flashcard", () => {
//         const id = "yjlML2s9W";
//         expect(boundDelete(id)).toBe(true);
//         expect(mockThis.flashcards).toStrictEqual([]);
//     });
//
//     test("should return false if flashcard doesn't exist", () => {
//         const id = "aaaa";
//         expect(boundDelete(id)).toBe(false);
//         expect(mockThis.flashcards).toStrictEqual(flashcards());
//     });
//
//     test("should throw an error when trying to delete from an empty flashcard array", () => {
//         mockThis.flashcards = [];
//         boundDelete = deleteFlashcardById.bind(mockThis);
//         const id = "aaaa";
//         expect(() => boundDelete(id)).toThrow();
//     });
// });
