import {
    createFlashcardForAnnotation, createFlashcardNoteForSourceNote,
    getAnnotationById,
    getFlashcardById,
    getNotesWithoutReview,
    getSectionTreeForBook
} from "src/api";
import { plugin } from "src/main";
import { Index } from "src/data/models";
import { writeCardToDisk } from "src/data/disk";

jest.mock("src/data/disk");

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
        plugin: { index: null },
    };
});

describe("getFlashcardById", () => {
    beforeEach(async () => {
        // todo: can't figure out a way to reset nanoid automatically
        const nanoid = require("nanoid");
        let value = 0;
        nanoid.nanoid.mockImplementation((size?) => (value++).toString());
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

jest.mock("nanoid", () => {
    return { nanoid: jest.fn() };
});

describe("createFlashcardForAnnotation", () => {
    beforeEach(async () => {
        jest.resetAllMocks();
        // todo: fix ts error
        const nanoid = require("nanoid");
        let value = 0;
        nanoid.nanoid.mockImplementation((size?) => (value++).toString());
        // let {writeCardToDisk} = require("src/data/disk");
        // writeCardToDisk = diskMock.mockImplementation(async (path, text) => {console.log("hello there")});
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
        const nanoid = require("nanoid");
        let value = 0;
        nanoid.nanoid.mockImplementation((size?) => (value++).toString());
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
        const nanoid = require("nanoid");
        let value = 0;
        nanoid.nanoid.mockImplementation((size?) => (value++).toString());
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
        const nanoid = require("nanoid");
        let value = 0;
        nanoid.nanoid.mockImplementation((size?) => (value++).toString());
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
        const nanoid = require("nanoid");
        let value = 0;
        nanoid.nanoid.mockImplementation((size?) => (value++).toString());
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
