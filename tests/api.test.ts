/* eslint-disable quotes */
import {
    createFlashcardForAnnotation,
    createFlashcardNoteForSourceNote,
    getAnnotationById,
    getAnnotationsForSection,
    getBookById,
    getFlashcardById,
    getFlashcardsForAnnotation,
    getNotesWithoutReview,
    getSectionTreeForBook,
    getSourcesForReview,
    updateFlashcardContentsById,
} from "src/api";
import { plugin } from "src/main";
import { Index } from "src/data/models";
import { updateCardOnDisk, writeCardToDisk } from "src/data/disk";

jest.mock("src/data/disk");

jest.mock("../src/utils", () => {
    // Require the original module to not be mocked...

    return {
        __esModule: true, // Use it when dealing with esModules
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        calculateDelayBeforeReview: jest.fn((_due: string) => 63836018),
    };
});

jest.mock("../src/main", () => {
    return {
        __esModule: true, // Use it when dealing with esModules
        plugin: { index: null },
    };
});

describe("getFlashcardById", () => {
    beforeEach(async () => {
        // todo: can't figure out a way to reset nanoid automatically
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const nanoid = require("nanoid");
        let value = 0;
        nanoid.nanoid.mockImplementation((_size?: number) => (value++).toString());
        plugin.index = new Index();
        await plugin.index.initialize(plugin);
    });
    test("retrieves a flashcard successfully", () => {
        expect(getFlashcardById("2", "ibJ6QFl4")).toMatchInlineSnapshot(
            {},
            `
            {
              "answerText": "Plateau of Latent Potential",
              "cardType": 2,
              "context": null,
              "delayBeforeReview": 63836018,
              "dueDate": "2023-09-10",
              "ease": 230,
              "flag": "L",
              "id": "2",
              "interval": 6,
              "parentId": "15538",
              "parsedCardId": "0",
              "questionText": "For a habit to persist, you need to keep at it long enough to break through a barrier. What is this barrier called?",
              "siblings": [],
            }
        `
        );
        expect(() => getFlashcardById("aaaa", "ibJ6QFl4")).toThrowError();
    });
    afterEach(() => {
        jest.resetAllMocks();
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
    beforeEach(async () => {
        jest.resetAllMocks();
        // todo: fix ts error
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const nanoid = require("nanoid");
        let value = 0;
        nanoid.nanoid.mockImplementation((_size?: number) => (value++).toString());
        plugin.index = new Index();
        await plugin.index.initialize(plugin);
    });

    test("should write a flashcard to the right file", async () => {
        const flashcardId = await createFlashcardForAnnotation(
            "add block id?",
            "true",
            "tmi3ktJd",
            "84"
        );
        expect(flashcardId).toMatchInlineSnapshot(`"151"`);
        expect(writeCardToDisk).toHaveBeenCalled();
        expect(writeCardToDisk).toHaveBeenCalledWith(
            "Untitled - Flashcards.md",
            "\nadd block id?\n?\ntrue\n<!--SR:tmi3ktJd-->\n"
        );
        // @ts-expect-error because if flashcardId is undefined, then the expect from earlier
        // should fail anyway
        expect(plugin.index.flashcardIndex.flashcards.get(flashcardId)).toMatchInlineSnapshot(`
            Flashcard {
              "answerText": "true",
              "cardType": 2,
              "context": null,
              "dueDate": null,
              "ease": null,
              "flag": null,
              "id": "151",
              "interval": null,
              "parentId": "tmi3ktJd",
              "parsedCardId": "150",
              "questionText": "add block id?",
              "siblings": [],
            }
        `);
    });

    afterEach(() => {
        jest.resetAllMocks();
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

describe("getAnnotationById", () => {
    beforeEach(async () => {
        // todo: can't figure out a way to reset nanoid automatically
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const nanoid = require("nanoid");
        let value = 0;
        nanoid.nanoid.mockImplementation((_size?: number) => (value++).toString());
        plugin.index = new Index();
        await plugin.index.initialize(plugin);
    });
    test("retrieves paragraph correctly", () => {
        expect(getAnnotationById("tmi3ktJd", "84")).toMatchInlineSnapshot(`
            {
              "hasFlashcards": true,
              "highlight": "I have some other text here.
            This has no block id.
            Let's see what happens. ",
              "id": "tmi3ktJd",
              "note": "",
              "type": "",
            }
        `);
    });
    test("fails to retrieve annotation", () => {
        expect(() => getAnnotationById("abcd", "82")).toThrowError();
    });
    test("retrieves annotation correctly", () => {
        expect(getAnnotationById("15551", "82")).toMatchInlineSnapshot(`
            {
              "hasFlashcards": false,
              "highlight": "Problem #3: Goals restrict your happiness.",
              "id": "15551",
              "note": "",
              "type": "notes",
            }
        `);
    });
    afterEach(() => {
        jest.resetAllMocks();
    });
});

describe("getSectionTreeForBook", () => {
    beforeEach(async () => {
        // todo: can't figure out a way to reset nanoid automatically
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const nanoid = require("nanoid");
        let value = 0;
        nanoid.nanoid.mockImplementation((_size?: number) => (value++).toString());
        plugin.index = new Index();
        await plugin.index.initialize(plugin);
        global.structuredClone = (val) => JSON.parse(JSON.stringify(val));
    });
    test("generates correct JSON for book tree", () => {
        expect(getSectionTreeForBook("83")).toMatchSnapshot();
    });
    afterEach(() => {
        jest.resetAllMocks();
    });
});

describe("getNotesWithoutReview", () => {
    beforeEach(async () => {
        // todo: can't figure out a way to reset nanoid automatically
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const nanoid = require("nanoid");
        let value = 0;
        nanoid.nanoid.mockImplementation((_size?: number) => (value++).toString());
        plugin.index = new Index();
        await plugin.index.initialize(plugin);
        global.structuredClone = (val) => JSON.parse(JSON.stringify(val));
    });
    test("lists notes that don't have flashcards", () => {
        expect(getNotesWithoutReview()).toMatchInlineSnapshot(`[]`);
    });
    test.todo("write test case with different initial state");
    afterEach(() => {
        jest.resetAllMocks();
    });
});

describe.skip("createFlashcardNoteForSourceNote", () => {
    beforeEach(async () => {
        // todo: can't figure out a way to reset nanoid automatically
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const nanoid = require("nanoid");
        let value = 0;
        nanoid.nanoid.mockImplementation((_size?: number) => (value++).toString());
        plugin.index = new Index();
        await plugin.index.initialize(plugin);
        global.structuredClone = (val) => JSON.parse(JSON.stringify(val));
    });
    test("lists notes that don't have flashcards", () => {
        expect(createFlashcardNoteForSourceNote("82")).toMatchInlineSnapshot(`[]`);
    });
    test.todo("write test case with different initial state");
    afterEach(() => {
        jest.resetAllMocks();
    });
});

describe("getBookById", () => {
    beforeEach(async () => {
        // todo: can't figure out a way to reset nanoid automatically
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const nanoid = require("nanoid");
        let value = 0;
        nanoid.nanoid.mockImplementation((_size?: number) => (value++).toString());
        plugin.index = new Index();
        await plugin.index.initialize(plugin);
        global.structuredClone = (val) => JSON.parse(JSON.stringify(val));
    });
    test("retrieves a book correctly", () => {
        expect(getBookById("82")).toMatchInlineSnapshot(`
            {
              "canBeReviewed": true,
              "counts": {
                "annotations": {
                  "withFlashcards": 2,
                  "withoutFlashcards": 5,
                },
                "flashcards": {
                  "learning": 2,
                  "mature": 0,
                  "new": 0,
                },
              },
              "id": "82",
              "name": "Atomic Habits",
            }
        `);
    });
    test("fails if book does not exist", () => {
        expect(() => getBookById("asdf")).toThrowErrorMatchingInlineSnapshot(
            `"No book found for id asdf"`
        );
    });
    afterEach(() => {
        jest.resetAllMocks();
    });
});

describe("getFlashcardsForAnnotation", () => {
    beforeEach(async () => {
        // todo: can't figure out a way to reset nanoid automatically
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const nanoid = require("nanoid");
        let value = 0;
        nanoid.nanoid.mockImplementation((_size?: number) => (value++).toString());
        plugin.index = new Index();
        await plugin.index.initialize(plugin);
        global.structuredClone = (val) => JSON.parse(JSON.stringify(val));
    });
    test("retrieves all flashcards for an annotation", () => {
        expect(getFlashcardsForAnnotation("hjhjhlkap", "84")).toMatchInlineSnapshot(`
            [
              Flashcard {
                "answerText": "homie",
                "cardType": 2,
                "context": null,
                "dueDate": null,
                "ease": null,
                "flag": null,
                "id": "78",
                "interval": null,
                "parentId": "hjhjhlkap",
                "parsedCardId": "74",
                "questionText": "ryder",
                "siblings": [],
              },
              Flashcard {
                "answerText": "Card not",
                "cardType": 2,
                "context": null,
                "dueDate": null,
                "ease": null,
                "flag": null,
                "id": "80",
                "interval": null,
                "parentId": "hjhjhlkap",
                "parsedCardId": "76",
                "questionText": "New",
                "siblings": [],
              },
            ]
        `);
    });
    test("returns empty array if there are no annotations", () => {
        expect(getFlashcardsForAnnotation("hlksdjfa", "84")).toMatchInlineSnapshot(`[]`);
    });
    test("throws error if book not found", () => {
        expect(() =>
            getFlashcardsForAnnotation("hlksdjfa", "askd")
        ).toThrowErrorMatchingInlineSnapshot(`"No book found for id askd"`);
    });
    afterEach(() => {
        jest.resetAllMocks();
    });
});

describe("getAnnotationsForSection", () => {
    beforeEach(async () => {
        // todo: can't figure out a way to reset nanoid automatically
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const nanoid = require("nanoid");
        let value = 0;
        nanoid.nanoid.mockImplementation((_size?: number) => (value++).toString());
        plugin.index = new Index();
        await plugin.index.initialize(plugin);
        global.structuredClone = (val) => JSON.parse(JSON.stringify(val));
    });
    test("lists notes that don't have flashcards", () => {
        expect(getAnnotationsForSection("89", "82")).toMatchInlineSnapshot(`
            {
              "annotations": [
                {
                  "flashcardCount": 0,
                  "hasFlashcards": false,
                  "highlight": "What’s the difference between systems and goals? It’s a distinction I first learned from Scott Adams, the cartoonist behind the Dilbert comic. Goals are about the results you want to achieve. Systems are about the processes that lead to those results.",
                  "id": "15544",
                  "note": "#research",
                  "type": "notes",
                },
                {
                  "flashcardCount": 0,
                  "hasFlashcards": false,
                  "highlight": "Problem #1: Winners and losers have the same goals.",
                  "id": "15548",
                  "note": "",
                  "type": "notes",
                },
                {
                  "flashcardCount": 0,
                  "hasFlashcards": false,
                  "highlight": "Problem #2: Achieving a goal is only a momentary change.",
                  "id": "15550",
                  "note": "",
                  "type": "notes",
                },
                {
                  "flashcardCount": 0,
                  "hasFlashcards": false,
                  "highlight": "Problem #3: Goals restrict your happiness.",
                  "id": "15551",
                  "note": "",
                  "type": "notes",
                },
              ],
              "id": "89",
              "title": "FORGET ABOUT GOALS, FOCUS ON SYSTEMS INSTEAD",
            }
        `);
    });
    test("returns null if there are no annotations for that section", () => {
        expect(getAnnotationsForSection("askdf", "82")).toMatchInlineSnapshot(`null`);
    });
    test("throws an error if book not found", () => {
        expect(() =>
            getAnnotationsForSection("askdf", "293102")
        ).toThrowErrorMatchingInlineSnapshot(`"No book found for id 293102"`);
    });
    afterEach(() => {
        jest.resetAllMocks();
    });
});

describe("getSourcesForReview", () => {
    beforeEach(async () => {
        // todo: can't figure out a way to reset nanoid automatically
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const nanoid = require("nanoid");
        let value = 0;
        nanoid.nanoid.mockImplementation((_size?: number) => (value++).toString());
        plugin.index = new Index();
        await plugin.index.initialize(plugin);
        global.structuredClone = (val) => JSON.parse(JSON.stringify(val));
    });
    test("should list flashcard decks json", () => {
        expect(getSourcesForReview()).toMatchInlineSnapshot(`
            [
              {
                "annotationCoverage": 0.2857142857142857,
                "flashcardProgress": {
                  "learning": 2,
                  "mature": 0,
                  "new": 0,
                },
                "id": "82",
                "name": "Atomic Habits",
                "pendingFlashcards": 2,
              },
              {
                "annotationCoverage": 0.11475409836065574,
                "flashcardProgress": {
                  "learning": 14,
                  "mature": 21,
                  "new": 0,
                },
                "id": "83",
                "name": "Memory - A Very Short Introduction",
                "pendingFlashcards": 32,
              },
              {
                "annotationCoverage": 1,
                "flashcardProgress": {
                  "learning": 1,
                  "mature": 0,
                  "new": 3,
                },
                "id": "84",
                "name": "Untitled",
                "pendingFlashcards": 4,
              },
            ]
        `);
    });
});

describe("updateFlashcardContentsById", () => {
    beforeEach(async () => {
        // todo: can't figure out a way to reset nanoid automatically
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const nanoid = require("nanoid");
        let value = 0;
        nanoid.nanoid.mockImplementation((_size?: number) => (value++).toString());
        plugin.index = new Index();
        await plugin.index.initialize(plugin);
        global.structuredClone = (val) => JSON.parse(JSON.stringify(val));
    });
    test("should update a flashcard", async () => {
        const initialFlashcardCount = plugin.index.flashcardIndex.flashcards.size;
        await updateFlashcardContentsById("2", "New question", "new answer", "82");
        expect(plugin.index.flashcardIndex.flashcards.get("2")).toMatchInlineSnapshot(`
            Flashcard {
              "answerText": "new answer",
              "cardType": 2,
              "context": null,
              "dueDate": "2023-09-10",
              "ease": 230,
              "flag": "L",
              "id": "2",
              "interval": 6,
              "parentId": "15538",
              "parsedCardId": "0",
              "questionText": "New question",
              "siblings": [],
            }
        `);
        expect(updateCardOnDisk).toHaveBeenCalledWith(
            "Atomic Habits/Flashcards.md", `
For a habit to persist, you need to keep at it long enough to break through a barrier. What is this barrier called?
?
Plateau of Latent Potential
<!--SR:15538!L,2023-09-10,6,230-->
`, `
New question
?
new answer
<!--SR:15538!L,2023-09-10,6,230-->
`
        );
        expect(plugin.index.flashcardIndex.flashcards.size).toEqual(initialFlashcardCount);
    });
});
