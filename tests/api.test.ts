import { createFlashcardForAnnotation, getFlashcardById } from "src/api";
import { plugin } from "src/main";
import { FlashcardIndex } from "src/data/models/flashcard";
import { SourceNoteIndex } from "src/data/models/sourceNoteIndex";
import { SourceNote } from "src/data/models/sourceNote";

jest.mock("../src/data/disk");

jest.mock("../src/utils", () => {
    // Require the original module to not be mocked...

    return {
        __esModule: true, // Use it when dealing with esModules
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        calculateDelayBeforeReview: jest.fn((due: string) => 63836018),
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
        plugin.flashcardIndex.flashcards.set("pBri5QNB", {
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
            answerText: "Cued recall is where we cue recall by presenting some information.",
        });
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
            answerText: "Cued recall is where we cue recall by presenting some information.",
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
    beforeEach(() => {
        plugin.sourceNoteIndex = new SourceNoteIndex();
        const sourceNote = new SourceNote("", plugin);
        const dummy = {
            id: "pJ41e1uy",
            name: "Untitled",
            path: "Untitled.md",
            bookSections: [
                {
                    name: "Chapter 3: Pulling the rabbit out of the hat",
                    level: 1,
                    id: "r2FcVjTT",
                    children: [],
                    counts: { with: 1, without: 1 },
                },
                {
                    name: "Relating study and test",
                    level: 2,
                    id: "GEfKkXJr",
                    children: [],
                    counts: { with: 1, without: 1 },
                },
                {
                    id: "hjhjhlkap",
                    text: "What is episodic memory?\nNO one knows ",
                    wasIdPresent: true,
                    hasFlashcards: true,
                },
                {
                    id: "tmi3ktJd",
                    text: "I have some other text here.\nThis has no block id.\nLet's see what happens. ",
                    wasIdPresent: true,
                    hasFlashcards: false,
                },
            ],
            reviewIndex: -1,
            reviewDeck: [
                {
                    id: "LeC_5_EY",
                    cardType: 2,
                    context: null,
                    dueDate: null,
                    ease: null,
                    interval: null,
                    parentId: "hjhjhlkap",
                    flag: null,
                    siblings: [],
                    parsedCardId: "otKiSuq6",
                    questionText: "New",
                    answerText: "Card not",
                },
                {
                    id: "4b_3dWUq",
                    cardType: 2,
                    context: null,
                    dueDate: "2024-03-20",
                    ease: 250,
                    interval: 3,
                    parentId: "hjhjhlka",
                    flag: "L",
                    siblings: [],
                    parsedCardId: "bOsz5kFs",
                    questionText: "asfsf",
                    answerText: "324",
                },
                {
                    id: "OIGhPCil",
                    cardType: 2,
                    context: null,
                    dueDate: null,
                    ease: null,
                    interval: null,
                    parentId: "hjhjhlkap",
                    flag: null,
                    siblings: [],
                    parsedCardId: "xstuDSZY",
                    questionText: "rider",
                    answerText: "nigga",
                },
            ],
            plugin: null,
            flashcardNote: {
                path: "Untitled - Flashcards.md",
                flashcards: [
                    {
                        id: "OIGhPCil",
                        cardType: 2,
                        context: null,
                        dueDate: null,
                        ease: null,
                        interval: null,
                        parentId: "hjhjhlkap",
                        flag: null,
                        siblings: [],
                        parsedCardId: "xstuDSZY",
                        questionText: "rider",
                        answerText: "nigga",
                    },
                    {
                        id: "4b_3dWUq",
                        cardType: 2,
                        context: null,
                        dueDate: "2024-03-20",
                        ease: 250,
                        interval: 3,
                        parentId: "hjhjhlka",
                        flag: "L",
                        siblings: [],
                        parsedCardId: "bOsz5kFs",
                        questionText: "asfsf",
                        answerText: "324",
                    },
                    {
                        id: "LeC_5_EY",
                        cardType: 2,
                        context: null,
                        dueDate: null,
                        ease: null,
                        interval: null,
                        parentId: "hjhjhlkap",
                        flag: null,
                        siblings: [],
                        parsedCardId: "otKiSuq6",
                        questionText: "New",
                        answerText: "Card not",
                    },
                ],
                parentPath: "Untitled.md",
                parsedCards: [
                    {
                        id: "xstuDSZY",
                        notePath: "Untitled - Flashcards.md",
                        cardText: "rider\n?\nnigga",
                        metadataText: "<!--SR:hjhjhlkap-->",
                        lineNo: -1,
                        cardType: 2,
                    },
                    {
                        id: "bOsz5kFs",
                        notePath: "Untitled - Flashcards.md",
                        cardText: "asfsf\n?\n324",
                        metadataText: "<!--SR:hjhjhlkap!L,2024-03-20,3,250-->",
                        lineNo: -1,
                        cardType: 2,
                    },
                    {
                        id: "otKiSuq6",
                        notePath: "Untitled - Flashcards.md",
                        cardText: "New\n?\nCard not",
                        metadataText: "<!--SR:hjhjhlkap-->",
                        lineNo: -1,
                        cardType: 2,
                    },
                ],
            },
            tags: ["review/book", "review/note"],
        };
        Object.keys(dummy).forEach((key) => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            sourceNote[key] = dummy[key];
        });
        plugin.sourceNoteIndex.sourceNotes.push(sourceNote);
    });
    test("should create a new flashcard", async () => {
        const card = {
            id: "pBri5QNB",
            cardType: 2,
            context: null,
            dueDate: "2023-09-02",
            ease: 250,
            interval: 2,
            delayBeforeReview: 63836018,
            annotationId: "hjhjhlkap",
            flag: "L",
            siblings: [],
            parsedCardId: "u-72tWEW",
            questionText: "What is cued recall?",
            answerText: "Cued recall is where we cue recall by presenting some information.",
        };
        const bookId = "pJ41e1uy";
        await createFlashcardForAnnotation(
            card.questionText,
            card.answerText,
            card.annotationId,
            bookId
        );
        // console.log(plugin.notesWithFlashcards);
        expect(plugin.sourceNoteIndex).toMatchInlineSnapshot(`
            SourceNoteIndex {
              "sourceNotes": [
                SourceNote {
                  "bookSections": [
                    {
                      "children": [],
                      "counts": {
                        "with": 1,
                        "without": 1,
                      },
                      "id": "r2FcVjTT",
                      "level": 1,
                      "name": "Chapter 3: Pulling the rabbit out of the hat",
                    },
                    {
                      "children": [],
                      "counts": {
                        "with": 1,
                        "without": 1,
                      },
                      "id": "GEfKkXJr",
                      "level": 2,
                      "name": "Relating study and test",
                    },
                    {
                      "hasFlashcards": true,
                      "id": "hjhjhlkap",
                      "text": "What is episodic memory?
            NO one knows ",
                      "wasIdPresent": true,
                    },
                    {
                      "hasFlashcards": false,
                      "id": "tmi3ktJd",
                      "text": "I have some other text here.
            This has no block id.
            Let's see what happens. ",
                      "wasIdPresent": true,
                    },
                  ],
                  "flashcardNote": {
                    "flashcards": [
                      {
                        "answerText": "nigga",
                        "cardType": 2,
                        "context": null,
                        "dueDate": null,
                        "ease": null,
                        "flag": null,
                        "id": "OIGhPCil",
                        "interval": null,
                        "parentId": "hjhjhlkap",
                        "parsedCardId": "xstuDSZY",
                        "questionText": "rider",
                        "siblings": [],
                      },
                      {
                        "answerText": "324",
                        "cardType": 2,
                        "context": null,
                        "dueDate": "2024-03-20",
                        "ease": 250,
                        "flag": "L",
                        "id": "4b_3dWUq",
                        "interval": 3,
                        "parentId": "hjhjhlka",
                        "parsedCardId": "bOsz5kFs",
                        "questionText": "asfsf",
                        "siblings": [],
                      },
                      {
                        "answerText": "Card not",
                        "cardType": 2,
                        "context": null,
                        "dueDate": null,
                        "ease": null,
                        "flag": null,
                        "id": "LeC_5_EY",
                        "interval": null,
                        "parentId": "hjhjhlkap",
                        "parsedCardId": "otKiSuq6",
                        "questionText": "New",
                        "siblings": [],
                      },
                      Flashcard {
                        "answerText": "Cued recall is where we cue recall by presenting some information.",
                        "cardType": 2,
                        "context": null,
                        "dueDate": null,
                        "ease": null,
                        "flag": null,
                        "id": "2",
                        "interval": null,
                        "parentId": "hjhjhlkap",
                        "parsedCardId": "1",
                        "questionText": "What is cued recall?",
                        "siblings": [],
                      },
                    ],
                    "parentPath": "Untitled.md",
                    "parsedCards": [
                      {
                        "cardText": "rider
            ?
            nigga",
                        "cardType": 2,
                        "id": "xstuDSZY",
                        "lineNo": -1,
                        "metadataText": "<!--SR:hjhjhlkap-->",
                        "notePath": "Untitled - Flashcards.md",
                      },
                      {
                        "cardText": "asfsf
            ?
            324",
                        "cardType": 2,
                        "id": "bOsz5kFs",
                        "lineNo": -1,
                        "metadataText": "<!--SR:hjhjhlkap!L,2024-03-20,3,250-->",
                        "notePath": "Untitled - Flashcards.md",
                      },
                      {
                        "cardText": "New
            ?
            Card not",
                        "cardType": 2,
                        "id": "otKiSuq6",
                        "lineNo": -1,
                        "metadataText": "<!--SR:hjhjhlkap-->",
                        "notePath": "Untitled - Flashcards.md",
                      },
                      {
                        "cardText": "What is cued recall?
            ?
            Cued recall is where we cue recall by presenting some information.",
                        "cardType": 2,
                        "id": "1",
                        "lineNo": -1,
                        "metadataText": "<!--SR:hjhjhlkap-->",
                        "notePath": "Untitled - Flashcards.md",
                      },
                    ],
                    "path": "Untitled - Flashcards.md",
                  },
                  "id": "pJ41e1uy",
                  "name": "Untitled",
                  "path": "Untitled.md",
                  "plugin": null,
                  "reviewDeck": [
                    {
                      "answerText": "Card not",
                      "cardType": 2,
                      "context": null,
                      "dueDate": null,
                      "ease": null,
                      "flag": null,
                      "id": "LeC_5_EY",
                      "interval": null,
                      "parentId": "hjhjhlkap",
                      "parsedCardId": "otKiSuq6",
                      "questionText": "New",
                      "siblings": [],
                    },
                    {
                      "answerText": "324",
                      "cardType": 2,
                      "context": null,
                      "dueDate": "2024-03-20",
                      "ease": 250,
                      "flag": "L",
                      "id": "4b_3dWUq",
                      "interval": 3,
                      "parentId": "hjhjhlka",
                      "parsedCardId": "bOsz5kFs",
                      "questionText": "asfsf",
                      "siblings": [],
                    },
                    {
                      "answerText": "nigga",
                      "cardType": 2,
                      "context": null,
                      "dueDate": null,
                      "ease": null,
                      "flag": null,
                      "id": "OIGhPCil",
                      "interval": null,
                      "parentId": "hjhjhlkap",
                      "parsedCardId": "xstuDSZY",
                      "questionText": "rider",
                      "siblings": [],
                    },
                  ],
                  "reviewIndex": -1,
                  "tags": [
                    "review/book",
                    "review/note",
                  ],
                },
              ],
            }
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
