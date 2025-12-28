import { createDiskMockFromFixtures } from "./helpers";
jest.mock("src/data/disk", () => {
    const mock = createDiskMockFromFixtures([
        "createFlashcardsFileForBook.json",
        "generateFlashcardsFileNameAndPath_2025-12-16T20-02-00_s93m1.json",
        "getAnnotationFilePath_2025-13-12T17-25-00_si3m1.json",
        "getMetadataForFile_2025-12-07T19-37-22-036Z_kzjn5y.json",
        "getFileContents_2025-12-07T19-37-21-944Z_bcx627.json",
        "getFileContents_2025-12-07T19-37-22-044Z_radb6f.json",
        "filePathsWithTag_2025-12-07T19-37-20-520Z_kx3kvy.json",
        "fileTags_2025-12-07T19-37-20-516Z_u0wrbc.json",
        "getParentOrFilename_2025-12-07T19-37-22-046Z_j780r6.json",
        "getMetadataForFile_2025-12-07T19-37-20-679Z_gfsis2.json",
        "updateCardOnDisk_2025-12-25T10-00-00_aaaaa.json",
        "updateCardOnDisk_2025-12-25T10-00-01_bbbbb.json",
        "updateCardOnDisk_2025-12-25T10-00-02_ccccc.json",
        "deleteCardOnDisk.json",
        "writeCardToDisk.json",
    ]);
    return mock;
});

import { resetNanoidMock, setupNanoidMock } from "./nanoid-mock";
import { resetFixtureTransformer } from "./helpers";
setupNanoidMock();

import { SourceNoteIndex } from "src/data/models/sourceNote";
import { createMockPlugin } from "./__mocks__/plugin";
import {
    deleteFlashcard,
    getAnnotationById,
    getBookById,
    getFlashcardById,
    getNextCard,
    setPlugin,
    getCurrentCard,
    updateFlashcardSchedulingMetadata,
    addBlockIdToParagraph,
    createFlashcardForAnnotation,
    updateFlashcardContentsById,
    getAnnotationsForSection,
    getFlashcardsForAnnotation,
    getSourcesForReview,
    resetBookReviewState,
    getSectionTreeForBook,
    getBookChapters,
    getNotesWithoutReview,
    createFlashcardNoteForSourceNote,
} from "src/api";
import { Index } from "src/data/models";
import { FlashcardIndex } from "src/data/models/flashcard";
import { fileTags } from "src/data/disk";
import { ReviewResponse } from "src/scheduler/CardType";

describe("getBookById", () => {
    beforeEach(async () => {
        await newFunction();
    });

    it("should call the sourceNoteIndex to find a book", () => {
        expect(getBookById("t0000010")).toEqual({
            id: "t0000010",
            name: "Untitled",
            canBeReviewed: true,
            counts: {
                flashcards: {
                    mature: 1,
                    learning: 3,
                    new: 1,
                },
                annotations: {
                    withFlashcards: 2,
                    withoutFlashcards: 0,
                },
            },
        });
    });

    it("should handle when a book is not found", () => {
        const bookId = "nonexistent";
        expect(() => getBookById(bookId)).toThrow(`No book found for id ${bookId}`);
    });
});

describe("getAnnotationById", () => {
    beforeEach(async () => {
        await newFunction();
    });

    test("should return a transformed annotation for a given blockId and bookId", () => {
        // TODO: Implement test logic
        expect(getAnnotationById("tWxSv_No", "t0000010")).toMatchInlineSnapshot(`
            {
              "hasFlashcards": true,
              "highlight": "I have some other text here.
            This has no block id.
            Let's see what happens. ",
              "id": "tWxSv_No",
              "note": "",
              "type": "",
            }
        `);
    });
});

describe("getFlashcardById", () => {
    beforeEach(async () => {
        await newFunction();
    });

    test("should return", () => {
        // TODO: Implement test logic
        expect(getFlashcardById("t0000008", "t0000010")).toMatchInlineSnapshot(`
            {
              "answerText": "b",
              "cardType": 2,
              "context": null,
              "delayBeforeReview": 35686800000,
              "dueDate": "2024-10-21",
              "ease": 210,
              "flag": "L",
              "id": "t0000008",
              "interval": 1,
              "parentId": "tekXLAu8",
              "parsedCardId": "t0000003",
              "questionText": "a",
              "siblings": [],
            }
        `);
    });
});

// getNextCard
describe("getNextCard", () => {
    let randomSpy: any;

    beforeEach(async () => {
        randomSpy = jest.spyOn(Math, "random").mockReturnValue(0.5);
        await newFunction();
    });

    afterEach(() => {
        randomSpy.mockRestore();
    });

    test("should get next card", () => {
        expect(getNextCard("t0000010")).toMatchInlineSnapshot(`
            Flashcard {
              "answerText": "homie",
              "cardType": 2,
              "context": null,
              "dueDate": "2024-10-16",
              "ease": 270,
              "flag": "L",
              "id": "t0000005",
              "interval": 4,
              "parentId": "tekXLAu8",
              "parsedCardId": "t0000000",
              "questionText": "ryder",
              "siblings": [],
            }
        `);
    });
});
// deleteFlashcard
describe("deleteFlashcard", () => {
    beforeEach(async () => {
        await newFunction();
    });
    test("should delete flashcard", async () => {
        const result = await deleteFlashcard("t0000010", "t0000008");
        expect(result).toBeUndefined();
    });

    test("should throw when deleting non-existent flashcard", async () => {
        await expect(
            deleteFlashcard("t0000010", "nonexistent")
        ).rejects.toThrowErrorMatchingInlineSnapshot(
            `"Cannot read properties of undefined (reading 'parsedCardId')"`
        );
    });
});
// getCurrentCard
describe("getCurrentCard", () => {
    let randomSpy: any;

    beforeEach(async () => {
        randomSpy = jest.spyOn(Math, "random").mockReturnValue(0.5);
        await newFunction();
    });

    afterEach(() => {
        randomSpy.mockRestore();
    });

    test("should get current card", () => {
        expect(getCurrentCard("t0000010")).toMatchInlineSnapshot(`
            Flashcard {
              "answerText": "homie",
              "cardType": 2,
              "context": null,
              "dueDate": "2024-10-16",
              "ease": 270,
              "flag": "L",
              "id": "t0000005",
              "interval": 4,
              "parentId": "tekXLAu8",
              "parsedCardId": "t0000000",
              "questionText": "ryder",
              "siblings": [],
            }
        `);
    });
});
// updateFlashcardSchedulingMetadata
describe("updateFlashcardSchedulingMetadata", () => {
    beforeEach(async () => {
        await newFunction();
    });
    test("should update flashcard scheduling metadata", async () => {
        const result = await updateFlashcardSchedulingMetadata(
            "t0000008",
            "t0000010",
            ReviewResponse.Easy
        );
        expect(result).toMatchInlineSnapshot(`true`);
    });
});
// addBlockIdToParagraph
describe("addBlockIdToParagraph", () => {
    beforeEach(async () => {
        await newFunction();
    });
    test("should add block id to paragraph", () => {
        expect(
            addBlockIdToParagraph({
                id: "tWxSv_No",
                text: "This is some text",
                wasIdPresent: false,
                hasFlashcards: false,
            })
        ).toMatchInlineSnapshot(`"This is some text ^tWxSv_No"`);
    });
});
// createFlashcardForAnnotation
describe("createFlashcardForAnnotation", () => {
    beforeEach(async () => {
        await newFunction();
    });
    test("should create flashcard for annotation", async () => {
        const result = await createFlashcardForAnnotation(
            "question",
            "answer",
            "tWxSv_No",
            "t0000010"
        );
        expect(result).toBe(true);
        const cards = getFlashcardsForAnnotation("tWxSv_No", "t0000010");
        expect(cards.some(c => c.questionText === "question")).toBe(true);
    });
});
// updateFlashcardContentsById
describe("updateFlashcardContentsById", () => {
    beforeEach(async () => {
        await newFunction();
    });
    test("should update flashcard contents by id", async () => {
        const result = await updateFlashcardContentsById(
            "t0000008", // Corrected flashcard ID
            "new question",
            "new answer",
            "t0000010"
        );
        expect(result).toBe(true);

        const updatedCard = getFlashcardById("t0000008", "t0000010");
        expect(updatedCard.questionText).toBe("new question");
        expect(updatedCard.answerText).toBe("new answer");
    });
});
// getAnnotationsForSection
describe("getAnnotationsForSection", () => {
    beforeEach(async () => {
        await newFunction();
    });
    test("should get annotations for section", () => {
        expect(getAnnotationsForSection("tWxSv_No", "t0000010")).toMatchInlineSnapshot(`null`);
    });
});
// getFlashcardsForAnnotation
describe("getFlashcardsForAnnotation", () => {
    beforeEach(async () => {
        await newFunction();
    });
    test("should get flashcards for annotation", () => {
        expect(getFlashcardsForAnnotation("tWxSv_No", "t0000010")).toMatchInlineSnapshot(`
            [
              Flashcard {
                "answerText": "fixture answer",
                "cardType": 2,
                "context": null,
                "dueDate": null,
                "ease": null,
                "flag": null,
                "id": "t0000009",
                "interval": null,
                "parentId": "tWxSv_No",
                "parsedCardId": "t0000004",
                "questionText": "this is a fixture question",
                "siblings": [],
              },
            ]
        `);
    });
});
// getSourcesForReview
describe("getSourcesForReview", () => {
    beforeEach(async () => {
        await newFunction();
    });
    test("should get sources for review", () => {
        expect(getSourcesForReview()).toMatchInlineSnapshot(`
            [
              {
                "annotationCoverage": 1,
                "flashcardProgress": {
                  "learning": 3,
                  "mature": 1,
                  "new": 1,
                },
                "id": "t0000010",
                "name": "Untitled",
                "pendingFlashcards": 5,
              },
            ]
        `);
    });
});
// resetBookReviewState
describe("resetBookReviewState", () => {
    beforeEach(async () => {
        await newFunction();
    });
    test("should reset book review state", () => {
        expect(resetBookReviewState("t0000010")).toMatchInlineSnapshot(`undefined`);
    });
});
// getSectionTreeForBook
describe("getSectionTreeForBook", () => {
    beforeEach(async () => {
        await newFunction();
    });
    test("should get section tree for book", () => {
        expect(getSectionTreeForBook("t0000010")).toMatchInlineSnapshot(`
            {
              "children": [
                {
                  "children": [
                    {
                      "children": [],
                      "counts": {
                        "with": 2,
                        "without": 0,
                      },
                      "id": "t0000012",
                      "level": 2,
                      "name": "Relating study and test",
                    },
                  ],
                  "counts": {
                    "with": 2,
                    "without": 0,
                  },
                  "id": "t0000011",
                  "level": 1,
                  "name": "Chapter 3: Pulling the rabbit out of the hat",
                },
              ],
              "counts": {
                "flashcards": {
                  "learning": 3,
                  "mature": 1,
                  "new": 1,
                },
              },
              "id": "t0000010",
              "name": "Untitled",
            }
        `);
    });
});
// getBookChapters
describe("getBookChapters", () => {
    beforeEach(async () => {
        await newFunction();
    });
    test("should get flat list of chapters for book", () => {
        expect(getBookChapters("t0000010")).toMatchInlineSnapshot(`
            [
              {
                "counts": {
                  "with": 2,
                  "without": 0,
                },
                "id": "t0000011",
                "level": 1,
                "name": "Chapter 3: Pulling the rabbit out of the hat",
              },
            ]
        `);
    });
});
// getNotesWithoutReview
describe("getNotesWithoutReview", () => {
    beforeEach(async () => {
        await newFunction();
    });
    test("should get notes without review", () => {
        expect(getNotesWithoutReview()).toMatchInlineSnapshot(`[]`);
    });
});
// createFlashcardNoteForSourceNote
describe("createFlashcardNoteForSourceNote", () => {
    beforeEach(async () => {
        await newFunction();
    });

    test("should throw an error if a flashcard note already exists", async () => {
        const bookId = "t0000010";
        // This should fail because the setup in newFunction() already creates this note
        await expect(createFlashcardNoteForSourceNote(bookId)).rejects.toThrow(
            "addFlashcardNoteToIndex: Untitled - Flashcards.md is already in the index"
        );
    });
});

async function newFunction() {
    resetNanoidMock();
    resetFixtureTransformer();
    const mockPlugin = createMockPlugin();
    mockPlugin.fileTagsMap = fileTags();
    mockPlugin.index = new Index();
    mockPlugin.flashcardIndex = new FlashcardIndex();
    mockPlugin.sourceNoteIndex = new SourceNoteIndex();
    mockPlugin.flashcardIndex = await mockPlugin.flashcardIndex.initialize();
    mockPlugin.sourceNoteIndex = await mockPlugin.sourceNoteIndex.initialize(mockPlugin);
    setPlugin(mockPlugin);
}
