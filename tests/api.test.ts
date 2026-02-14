import { createDiskMockFromFixtures } from "./helpers";
jest.mock("src/infrastructure/disk", () => {
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
        "updateCardOnDisk_missing_case.json",
        "deleteCardOnDisk.json",
        "writeCardToDisk.json",
    ]);
    return mock;
});

import { resetNanoidMock, setupNanoidMock } from "./nanoid-mock";
import { resetFixtureTransformer } from "./helpers";
setupNanoidMock();

import { AnnotationsNoteIndex } from "src/data/models/AnnotationsNote";
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
    updateAnnotationMetadata,
    softDeleteAnnotation,
    getAnnotationsForSection,
    getFlashcardsForAnnotation,
    getSourcesForReview,
    resetBookReviewState,
    getSectionTreeForBook,
    getBookChapters,
    getNotesWithoutReview,
    createFlashcardNoteForAnnotationsNote,
    getNextAnnotationId,
    getPreviousAnnotationId,
} from "src/api";
import { Index } from "src/data/models";
import { FlashcardIndex } from "src/data/models/flashcard";
import { fileTags } from "src/infrastructure/disk";
import { ReviewResponse } from "src/types/CardType";
import { getFilteredAnnotations } from "src/utils/annotation-filters";

describe("getBookById", () => {
    beforeEach(async () => {
        await newFunction();
    });

    it("should call the annotationsNoteIndex to find a book", () => {
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

    test.skip("should return a transformed annotation for a given blockId and bookId", () => {
        // TODO: Implement test logic
        expect(getAnnotationById("tWxSv_No", "t0000010")).toMatchInlineSnapshot(`
            {
              "hasFlashcards": true,
              "highlight": "> ***
            > 
            > %%",
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
              "delayBeforeReview": 0,
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
        ).rejects.toThrowErrorMatchingInlineSnapshot(`"Flashcard not found: nonexistent"`);
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
        expect(cards.some((c) => c.questionText === "question")).toBe(true);
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
// updateAnnotationMetadata
describe("updateAnnotationMetadata", () => {
    beforeEach(async () => {
        await newFunction();
    });
    test.skip("should update annotation metadata on disk", async () => {
        const result = await updateAnnotationMetadata("t0000010", "tWxSv_No", {
            category: 3,
            personalNote: "Updated note",
        });
        expect(result).toBe(true);
        const annotation = getAnnotationById("tWxSv_No", "t0000010");
        expect(annotation.category).toBe(3);
        expect(annotation.personalNote).toBe("Updated note");
    });
});
// softDeleteAnnotation
describe("softDeleteAnnotation", () => {
    beforeEach(async () => {
        await newFunction();
    });
    test.skip("should soft delete annotation and filter it from list", async () => {
        const bookId = "t0000010";
        const annotationId = "tWxSv_No";
        const sectionId = "t0000011"; // Chapter 3

        const before = getAnnotationsForSection(sectionId, bookId);
        expect(before.annotations.some((a) => a.id === annotationId)).toBe(true);

        const result = await softDeleteAnnotation(bookId, annotationId);
        expect(result).toBe(true);

        const after = getAnnotationsForSection(sectionId, bookId);
        expect(after.annotations.some((a) => a.id === annotationId)).toBe(false);
    });
});
// getAnnotationsForSection
describe("getAnnotationsForSection", () => {
    beforeEach(async () => {
        await newFunction();
    });
    test.skip("should get annotations for section", () => {
        expect(getAnnotationsForSection("t0000011", "t0000010")).toMatchInlineSnapshot(`
            {
              "annotations": [
                {
                  "flashcardCount": 4,
                  "hasFlashcards": true,
                  "highlight": "> [!quote] tekXLAu8
            > What is episodic memory?",
                  "id": "tekXLAu8",
                  "note": "",
                  "type": "",
                },
                {
                  "flashcardCount": 1,
                  "hasFlashcards": true,
                  "highlight": "> ***
            > 
            > %%",
                  "id": "tWxSv_No",
                  "note": "",
                  "type": "",
                },
              ],
              "id": "t0000011",
              "title": "Chapter 3: Pulling the rabbit out of the hat",
            }
        `);
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
// createFlashcardNoteForAnnotationsNote
describe("createFlashcardNoteForAnnotationsNote", () => {
    beforeEach(async () => {
        await newFunction();
    });

    test("should throw an error if a flashcard note already exists", async () => {
        const bookId = "t0000010";
        // This should fail because the setup in newFunction() already creates this note
        await expect(createFlashcardNoteForAnnotationsNote(bookId)).rejects.toThrow(
            "addFlashcardNoteToIndex: Untitled - Flashcards.md is already in the index"
        );
    });
});

// Navigation Behavior - Inline snapshots to document current behavior
// See: docs/bugs.md#1-navigation-ignores-ui-filters for context on filter bug
describe("Navigation: getNextAnnotationId / getPreviousAnnotationId", () => {
    beforeEach(async () => {
        await newFunction();
    });

    test("observe annotations available in test fixture", () => {
        const bookId = "t0000010";
        const sectionId = "t0000011";

        const result = getAnnotationsForSection(sectionId, bookId);

        // Capture what annotations exist and their filter-relevant properties
        const summary = {
            totalCount: result.annotations.length,
            annotations: result.annotations.map((a) => ({
                id: a.id,
                category: a.category,
                originalColor: a.originalColor,
                deleted: a.deleted,
            })),
        };

        expect(summary).toMatchInlineSnapshot(`
            {
              "annotations": [
                {
                  "category": undefined,
                  "deleted": undefined,
                  "id": "tekXLAu8",
                  "originalColor": undefined,
                },
                {
                  "category": undefined,
                  "deleted": undefined,
                  "id": "tWxSv_No",
                  "originalColor": undefined,
                },
              ],
              "totalCount": 2,
            }
        `);
    });

    test("observe forward navigation from first to second annotation", () => {
        const bookId = "t0000010";
        const sectionId = "t0000011";
        const allAnnotations = getAnnotationsForSection(sectionId, bookId).annotations;

        if (allAnnotations.length < 2) {
            expect("insufficient test data").toMatchInlineSnapshot();
            return;
        }

        const first = allAnnotations[0];
        const nextId = getNextAnnotationId(bookId, first.id, sectionId);

        expect({
            from: { id: first.id, category: first.category },
            nextId: nextId,
            nextCategory: nextId ? getAnnotationById(nextId, bookId)?.category : null,
        }).toMatchInlineSnapshot(`
            {
              "from": {
                "category": undefined,
                "id": "tekXLAu8",
              },
              "nextCategory": undefined,
              "nextId": "tWxSv_No",
            }
        `);
    });

    test("observe backward navigation from last to previous annotation", () => {
        const bookId = "t0000010";
        const sectionId = "t0000011";
        const allAnnotations = getAnnotationsForSection(sectionId, bookId).annotations;

        if (allAnnotations.length < 2) {
            expect("insufficient test data").toMatchInlineSnapshot();
            return;
        }

        const last = allAnnotations[allAnnotations.length - 1];
        const prevId = getPreviousAnnotationId(bookId, last.id, sectionId);

        expect({
            from: { id: last.id, category: last.category },
            prevId: prevId,
            prevCategory: prevId ? getAnnotationById(prevId, bookId)?.category : null,
        }).toMatchInlineSnapshot(`
            {
              "from": {
                "category": undefined,
                "id": "tWxSv_No",
              },
              "prevCategory": undefined,
              "prevId": "tekXLAu8",
            }
        `);
    });

    test("observe section boundary behavior - no next after last annotation", () => {
        const bookId = "t0000010";
        const sectionId = "t0000011";
        const allAnnotations = getAnnotationsForSection(sectionId, bookId).annotations;
        const last = allAnnotations[allAnnotations.length - 1];

        const nextId = getNextAnnotationId(bookId, last.id, sectionId);

        expect({ lastAnnotationId: last.id, nextId }).toMatchInlineSnapshot(`
            {
              "lastAnnotationId": "tWxSv_No",
              "nextId": null,
            }
        `);
    });

    test("observe section boundary behavior - no previous before first annotation", () => {
        const bookId = "t0000010";
        const sectionId = "t0000011";
        const allAnnotations = getAnnotationsForSection(sectionId, bookId).annotations;
        const first = allAnnotations[0];

        const prevId = getPreviousAnnotationId(bookId, first.id, sectionId);

        expect({ firstAnnotationId: first.id, prevId }).toMatchInlineSnapshot(`
            {
              "firstAnnotationId": "tekXLAu8",
              "prevId": null,
            }
        `);
    });
});

// Navigation Filter Bug Tests - See docs/bugs.md#1
// These tests document the current broken behavior where navigation ignores UI filters
describe("Navigation Filter Bug: getNextAnnotationId / getPreviousAnnotationId ignore category filters", () => {
    beforeEach(async () => {
        await newFunction();
    });

    describe("Setup: Create mixed processed/unprocessed annotations", () => {
        beforeEach(async () => {
            // Modify fixtures to have a mix of processed and unprocessed annotations
            const bookId = "t0000010";

            // Set first annotation as processed (category = 1)
            await updateAnnotationMetadata(bookId, "tekXLAu8", { category: 1 });

            // Leave second annotation as unprocessed (category = null/undefined)
        });

        test("verify annotations have different category states", () => {
            const bookId = "t0000010";
            const sectionId = "t0000011";
            const annotations = getAnnotationsForSection(sectionId, bookId).annotations;

            const summary = annotations.map((a) => ({
                id: a.id,
                category: a.category,
                isProcessed: a.category !== null && a.category !== undefined,
                isUnprocessed: a.category === null || a.category === undefined,
            }));

            expect(summary).toMatchInlineSnapshot();
        });
    });

    describe("Bug: Navigation ignores 'processed' filter", () => {
        beforeEach(async () => {
            const bookId = "t0000010";
            await updateAnnotationMetadata(bookId, "tekXLAu8", { category: 1 });
            // tWxSv_No remains unprocessed
        });

        test("BROKEN: getNextAnnotationId from processed annotation returns unprocessed annotation", () => {
            const bookId = "t0000010";
            const sectionId = "t0000011";
            const annotations = getAnnotationsForSection(sectionId, bookId).annotations;

            // User is viewing with "processed" filter active
            // UI shows only: tekXLAu8 (category=1)
            // UI expects: Next button disabled (no more processed annotations)

            const currentId = "tekXLAu8"; // processed
            const nextId = getNextAnnotationId(bookId, currentId, sectionId);
            const nextAnnotation = nextId ? getAnnotationById(nextId, bookId) : null;

            expect({
                currentId,
                currentCategory: 1,
                expectedNextId: null, // Should be null - no more processed annotations
                actualNextId: nextId,
                actualNextCategory: nextAnnotation?.category,
                bugDescription:
                    "Navigation returns unprocessed annotation when filter expects only processed",
            }).toMatchInlineSnapshot();
        });

        test("BROKEN: getPreviousAnnotationId from unprocessed annotation returns processed annotation", () => {
            const bookId = "t0000010";
            const sectionId = "t0000011";

            // User is viewing with "unprocessed" filter active
            // UI shows only: tWxSv_No (category=null)
            // UI expects: Previous button disabled (no unprocessed annotations before this)

            const currentId = "tWxSv_No"; // unprocessed
            const prevId = getPreviousAnnotationId(bookId, currentId, sectionId);
            const prevAnnotation = prevId ? getAnnotationById(prevId, bookId) : null;

            expect({
                currentId,
                currentCategory: null,
                expectedPrevId: null, // Should be null - no unprocessed annotations before this
                actualPrevId: prevId,
                actualPrevCategory: prevAnnotation?.category,
                bugDescription:
                    "Navigation returns processed annotation when filter expects only unprocessed",
            }).toMatchInlineSnapshot();
        });
    });

    describe("Bug: Navigation ignores 'unprocessed' filter", () => {
        beforeEach(async () => {
            const bookId = "t0000010";
            // Set both annotations as processed
            await updateAnnotationMetadata(bookId, "tekXLAu8", { category: 1 });
            await updateAnnotationMetadata(bookId, "tWxSv_No", { category: 2 });
        });

        test("BROKEN: When all annotations are processed, 'unprocessed' filter should find nothing", () => {
            const bookId = "t0000010";
            const sectionId = "t0000011";
            const annotations = getAnnotationsForSection(sectionId, bookId).annotations;

            // Apply "unprocessed" filter as UI does
            const filtered = getFilteredAnnotations(annotations, "unprocessed", null, null);

            // User views with "unprocessed" filter - UI shows nothing
            // But if they somehow get to an annotation, navigation would work incorrectly

            const firstProcessedId = "tekXLAu8";
            const nextId = getNextAnnotationId(bookId, firstProcessedId, sectionId);

            expect({
                totalAnnotations: annotations.length,
                filteredAnnotations: filtered.length,
                uiShows: "empty list (no unprocessed annotations)",
                navigationBehavior: {
                    from: firstProcessedId,
                    nextId,
                    description:
                        "Navigation would return next annotation despite filter showing empty",
                },
            }).toMatchInlineSnapshot();
        });
    });

    describe("Bug: Navigation ignores color filter", () => {
        beforeEach(async () => {
            const bookId = "t0000010";
            // Set annotations with different colors
            await updateAnnotationMetadata(bookId, "tekXLAu8", { originalColor: "#ff0000" });
            await updateAnnotationMetadata(bookId, "tWxSv_No", { originalColor: "#00ff00" });
        });

        test("BROKEN: Navigation returns annotation with wrong color when color filter active", () => {
            const bookId = "t0000010";
            const sectionId = "t0000011";
            const annotations = getAnnotationsForSection(sectionId, bookId).annotations;

            // Apply color filter as UI does
            const filtered = getFilteredAnnotations(annotations, "unprocessed", null, "#ff0000");

            // UI shows only annotations with #ff0000 color
            // But navigation doesn't respect this

            const redAnnotationId = "tekXLAu8";
            const nextId = getNextAnnotationId(bookId, redAnnotationId, sectionId);
            const nextAnnotation = nextId ? getAnnotationById(nextId, bookId) : null;

            expect({
                currentId: redAnnotationId,
                currentColor: "#ff0000",
                filteredCount: filtered.length,
                expectedNextId: null, // Should be null - no more red annotations
                actualNextId: nextId,
                actualNextColor: nextAnnotation?.originalColor,
                bugDescription: "Navigation ignores color filter",
            }).toMatchInlineSnapshot();
        });
    });

    describe("Expected behavior after fix (ADR-019)", () => {
        test("TODO: Navigation should accept filter parameter and respect it", () => {
            // After implementing ADR-019, this signature should work:
            // getNextAnnotationId(bookId, blockId, sectionId, filter?: NavigationFilter)
            //
            // Where NavigationFilter is:
            // interface NavigationFilter {
            //   mainFilter: 'all' | 'processed' | 'unprocessed';
            //   categoryFilter?: number | null;
            //   colorFilter?: string | null;
            // }

            expect({
                proposedAPI:
                    "getNextAnnotationId(bookId, blockId, sectionId, { mainFilter: 'processed' })",
                shouldReturn: "only next processed annotation, or null",
            }).toMatchInlineSnapshot(`
                {
                  "proposedAPI": "getNextAnnotationId(bookId, blockId, sectionId, { mainFilter: 'processed' })",
                  "shouldReturn": "only next processed annotation, or null",
                }
            `);
        });
    });
});

async function newFunction() {
    resetNanoidMock();
    resetFixtureTransformer();
    const mockPlugin = createMockPlugin();
    mockPlugin.fileTagsMap = fileTags();
    mockPlugin.index = new Index();
    mockPlugin.flashcardIndex = new FlashcardIndex();
    mockPlugin.annotationsNoteIndex = new AnnotationsNoteIndex();
    mockPlugin.flashcardIndex = await mockPlugin.flashcardIndex.initialize();
    mockPlugin.annotationsNoteIndex = await mockPlugin.annotationsNoteIndex.initialize(mockPlugin);
    setPlugin(mockPlugin);
}
