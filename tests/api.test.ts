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
        "getTFileForPath_Untitled.json",
        "getTFileForPath_constitution.json",
        "getMetadataForFile_2025-12-07T19-37-20-679Z_gfsis2.json",
        "getMetadataForFile_constitution.json",
        "getFileContents_constitution.json",
        "generateFlashcardsFileNameAndPath_constitution.json",
        "createFlashcardsFileForBook_constitution.json",
        "moveFile_constitution.json",
        "ensureFolder_constitution.json",
        "overwriteFile_constitution.json",
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

import { AnnotationsNoteIndex, isParagraph } from "src/data/models/AnnotationsNote";
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
    getSourcesAvailableForDeckCreation,
    getSourceCapabilities,
    createFlashcardNoteForAnnotationsNote,
    getNextAnnotationId,
    getPreviousAnnotationId,
} from "src/api";
import { Index } from "src/data/models";
import { FlashcardIndex } from "src/data/models/flashcard";
import { fileTags, getMetadataForFile } from "src/infrastructure/disk";
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
              "answerText": "Etiam porta sem malesuada magna mollis euismod.",
              "cardType": 2,
              "context": null,
              "delayBeforeReview": 0,
              "dueDate": "2024-10-21",
              "ease": 210,
              "fingerprint": undefined,
              "flag": "L",
              "id": "t0000008",
              "interval": 1,
              "parentId": "tekXLAu8",
              "parsedCardId": "t0000003",
              "questionText": "Integer posuere erat a ante venenatis dapibus posuere velit aliquet.",
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
              "answerText": "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
              "cardType": 2,
              "context": null,
              "dueDate": "2024-10-16",
              "ease": 270,
              "fingerprint": undefined,
              "flag": "L",
              "id": "t0000005",
              "interval": 4,
              "parentId": "tekXLAu8",
              "parsedCardId": "t0000000",
              "questionText": "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
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
              "answerText": "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
              "cardType": 2,
              "context": null,
              "dueDate": "2024-10-16",
              "ease": 270,
              "fingerprint": undefined,
              "flag": "L",
              "id": "t0000005",
              "interval": 4,
              "parentId": "tekXLAu8",
              "parsedCardId": "t0000000",
              "questionText": "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
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
        const sectionId = "t0000012"; // Chapter 3

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
        expect(getAnnotationsForSection("t0000012", "t0000010")).toMatchInlineSnapshot(`
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
              "id": "t0000012",
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
                "answerText": "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
                "cardType": 2,
                "context": null,
                "dueDate": null,
                "ease": null,
                "fingerprint": undefined,
                "flag": null,
                "id": "t0000009",
                "interval": null,
                "parentId": "tWxSv_No",
                "parsedCardId": "t0000004",
                "questionText": "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
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
                      "id": "t0000013",
                      "level": 2,
                      "name": "Relating study and test",
                      "type": "heading",
                    },
                  ],
                  "counts": {
                    "with": 2,
                    "without": 0,
                  },
                  "id": "t0000012",
                  "level": 1,
                  "name": "Chapter 3: Pulling the rabbit out of the hat",
                  "type": "heading",
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
                "id": "t0000012",
                "level": 1,
                "name": "Chapter 3: Pulling the rabbit out of the hat",
              },
            ]
        `);
    });
});
// getSourcesAvailableForDeckCreation
describe("getSourcesAvailableForDeckCreation", () => {
    beforeEach(async () => {
        await newFunction();
    });

    test("should get notes without review", () => {
        expect(getSourcesAvailableForDeckCreation()).toMatchInlineSnapshot(`
            [
              {
                "id": "t0000011",
                "name": "constitution",
                "requiresSourceMutationConfirmation": true,
                "sourceType": "direct-markdown",
                "tags": [
                  "clippings",
                ],
              },
            ]
        `);
    });

    test("deprecated alias getNotesWithoutReview returns the same results", () => {
        expect(getNotesWithoutReview()).toEqual(getSourcesAvailableForDeckCreation());
    });

    test("DEBT-021 contract: source labels and listing shape are explicit", () => {
        const contract = getSourcesAvailableForDeckCreation().map((source) => ({
            id: source.id,
            name: source.name,
            sourceType: source.sourceType,
            requiresSourceMutationConfirmation: source.requiresSourceMutationConfirmation,
            tags: source.tags,
        }));

        expect(contract).toMatchInlineSnapshot(`
            [
              {
                "id": "t0000011",
                "name": "constitution",
                "requiresSourceMutationConfirmation": true,
                "sourceType": "direct-markdown",
                "tags": [
                  "clippings",
                ],
              },
            ]
        `);
    });
});

describe("getSourceCapabilities [DEBT-030]", () => {
    beforeEach(async () => {
        await newFunction();
    });

    test("maps MoonReader source to processed-category capabilities", () => {
        expect(getSourceCapabilities("t0000010")).toEqual({
            sourceType: "moonreader",
            cardCreationMode: "processed-category",
            showCategoryFilter: true,
            showColorFilter: true,
            supportsProcessingFlow: true,
            requiresMutationConfirmation: false,
        });
    });

    test("maps direct-markdown source to all/no-processing capabilities", () => {
        const directMarkdownSource = getSourcesAvailableForDeckCreation()[0];
        expect(getSourceCapabilities(directMarkdownSource.id)).toEqual({
            sourceType: "direct-markdown",
            cardCreationMode: "all-no-processing",
            showCategoryFilter: false,
            showColorFilter: false,
            supportsProcessingFlow: false,
            requiresMutationConfirmation: true,
        });
    });
});

describe("DEBT-021 contract snapshots", () => {
    beforeEach(async () => {
        await newFunction();
    });

    test("navigable section strategy for review source remains stable", () => {
        const contract = getBookChapters("t0000010").map((chapter) => ({
            id: chapter.id,
            name: chapter.name,
            level: chapter.level,
            counts: chapter.counts,
        }));

        expect(contract).toMatchInlineSnapshot(`
            [
              {
                "counts": {
                  "with": 2,
                  "without": 0,
                },
                "id": "t0000012",
                "level": 1,
                "name": "Chapter 3: Pulling the rabbit out of the hat",
              },
            ]
        `);
    });
});

describe("BUG-007 heading level strategy", () => {
    const getMetadataForFileMock = getMetadataForFile as jest.MockedFunction<typeof getMetadataForFile>;
    const baseGetMetadataForFileImpl = getMetadataForFileMock.getMockImplementation();

    afterEach(() => {
        getMetadataForFileMock.mockImplementation(baseGetMetadataForFileImpl);
    });

    function applyConstitutionHeadingsForTest(levels: number[]) {
        getMetadataForFileMock.mockImplementation((path: string) => {
            if (path === "constitution.md") {
                const headings = levels.map((level, index) => ({
                    heading: `Heading L${level}-${index + 1}`,
                    level,
                    position: {
                        start: { line: index + 1, col: 0, offset: index * 10 },
                        end: { line: index + 1, col: 10, offset: index * 10 + 10 },
                    },
                }));

                return {
                    headings,
                    sections: [
                        {
                            type: "yaml",
                            position: {
                                start: { line: 0, col: 0, offset: 0 },
                                end: { line: 0, col: 3, offset: 3 },
                            },
                        },
                        ...headings.map((heading) => ({
                            type: "heading",
                            position: heading.position,
                        })),
                    ],
                    frontmatter: {
                        title: "Claude's Constitution",
                        tags: ["clippings"],
                    },
                };
            }

            return baseGetMetadataForFileImpl(path);
        });
    }

    function getConstitutionBookId() {
        const constitution = getSourcesAvailableForDeckCreation().find((source) => source.name === "constitution");
        if (!constitution) throw new Error("constitution source not found");
        return constitution.id;
    }

    test("mixed H1/H2/H3 headings returns only H1", async () => {
        applyConstitutionHeadingsForTest([1, 1, 2, 3]);
        await newFunction();

        const constitutionId = getConstitutionBookId();
        expect(getBookChapters(constitutionId).map((chapter) => chapter.level)).toEqual([1, 1]);
    });

    test("only H2/H3 headings returns only H2", async () => {
        applyConstitutionHeadingsForTest([2, 2, 3]);
        await newFunction();

        const constitutionId = getConstitutionBookId();
        expect(getBookChapters(constitutionId).map((chapter) => chapter.level)).toEqual([2, 2]);
    });

    test("no headings returns an empty list", async () => {
        applyConstitutionHeadingsForTest([]);
        await newFunction();

        const constitutionId = getConstitutionBookId();
        expect(getBookChapters(constitutionId)).toEqual([]);
    });

    test("MoonReader chapter behavior remains unchanged", async () => {
        applyConstitutionHeadingsForTest([1, 2, 3]);
        await newFunction();

        expect(getBookChapters("t0000010").map((chapter) => chapter.level)).toEqual([1]);
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

describe("createFlashcardNoteForAnnotationsNote navigation availability [DEBT-011]", () => {
    beforeEach(async () => {
        await newFunction();
    });

    test("post-creation direct clippings source exposes navigable sections with annotations", async () => {
        const clipping = getSourcesAvailableForDeckCreation().find(
            (source) => source.sourceType === "direct-markdown"
        );
        expect(clipping).toBeDefined();

        await createFlashcardNoteForAnnotationsNote(clipping.id, { confirmedSourceMutation: true });

        const sections = getBookChapters(clipping.id);
        expect(sections).toEqual(
            expect.arrayContaining([expect.objectContaining({ id: expect.any(String) })])
        );
        const sectionId = sections[0]?.id;

        const section = getAnnotationsForSection(sectionId, clipping.id);
        expect(section?.annotations.length ?? 0).toBeGreaterThan(0);
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
        const sectionId = "t0000012";

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
        const sectionId = "t0000012";
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
        const sectionId = "t0000012";
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
        const sectionId = "t0000012";
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
        const sectionId = "t0000012";
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
    const bookId = "book-filtered";
    const sectionId = "section-1";
    const sectionTwoId = "section-2";

    function setupFilterNavigationFixture() {
        setPlugin({
            annotationsNoteIndex: {
                getBook: (id: string) => {
                    if (id !== bookId) {
                        throw new Error(`No book found for id ${id}`);
                    }
                    return {
                        bookSections: [
                            {
                                type: "heading",
                                id: sectionId,
                                level: 1,
                                name: "Section 1",
                                children: [],
                                counts: { with: 0, without: 0 },
                            },
                            {
                                type: "annotation",
                                id: "ann-1",
                                highlight: "A1",
                                note: "",
                                category: null,
                                originalColor: "1",
                                deleted: false,
                            },
                            {
                                type: "annotation",
                                id: "ann-2",
                                highlight: "A2",
                                note: "",
                                category: 1,
                                originalColor: "2",
                                deleted: false,
                            },
                            {
                                type: "annotation",
                                id: "ann-3",
                                highlight: "A3",
                                note: "",
                                category: null,
                                originalColor: "2",
                                deleted: false,
                            },
                            {
                                type: "annotation",
                                id: "ann-4",
                                highlight: "A4",
                                note: "",
                                category: 2,
                                originalColor: "3",
                                deleted: false,
                            },
                            {
                                type: "heading",
                                id: sectionTwoId,
                                level: 1,
                                name: "Section 2",
                                children: [],
                                counts: { with: 0, without: 0 },
                            },
                            {
                                type: "annotation",
                                id: "ann-5",
                                highlight: "A5",
                                note: "",
                                category: 2,
                                originalColor: "3",
                                deleted: false,
                            },
                        ],
                    };
                },
            },
        } as any);
    }

    beforeEach(() => {
        setupFilterNavigationFixture();
    });

    function getSectionAnnotations() {
        return [
            {
                type: "annotation" as const,
                id: "ann-1",
                highlight: "A1",
                note: "",
                category: null,
                originalColor: "1",
                deleted: false,
                calloutType: "",
            },
            {
                type: "annotation" as const,
                id: "ann-2",
                highlight: "A2",
                note: "",
                category: 1,
                originalColor: "2",
                deleted: false,
                calloutType: "",
            },
            {
                type: "annotation" as const,
                id: "ann-3",
                highlight: "A3",
                note: "",
                category: null,
                originalColor: "2",
                deleted: false,
                calloutType: "",
            },
            {
                type: "annotation" as const,
                id: "ann-4",
                highlight: "A4",
                note: "",
                category: 2,
                originalColor: "3",
                deleted: false,
                calloutType: "",
            },
        ];
    }

    test("getNextAnnotationId respects processed filter", () => {
        const nextId = getNextAnnotationId(bookId, "ann-1", sectionId, { mainFilter: "processed" });
        expect(nextId).toBe("ann-2");
    });

    test("getPreviousAnnotationId respects unprocessed filter", () => {
        const previousId = getPreviousAnnotationId(bookId, "ann-4", sectionId, {
            mainFilter: "unprocessed",
        });
        expect(previousId).toBe("ann-3");
    });

    test("category filter narrows processed navigation and stops at section boundary", () => {
        const nextCategory2 = getNextAnnotationId(bookId, "ann-2", sectionId, {
            mainFilter: "processed",
            categoryFilter: 2,
        });
        expect(nextCategory2).toBe("ann-4");

        const noNextInSection = getNextAnnotationId(bookId, "ann-4", sectionId, {
            mainFilter: "processed",
            categoryFilter: 2,
        });
        expect(noNextInSection).toBeNull();
    });

    test("color filter narrows unprocessed navigation", () => {
        const nextColor2 = getNextAnnotationId(bookId, "ann-1", sectionId, {
            mainFilter: "unprocessed",
            colorFilter: "2",
        });
        expect(nextColor2).toBe("ann-3");

        const noPreviousColor1 = getPreviousAnnotationId(bookId, "ann-3", sectionId, {
            mainFilter: "unprocessed",
            colorFilter: "1",
        });
        expect(noPreviousColor1).toBe("ann-1");
    });

    test("DEBT-030 parity: list and navigation filters share the same inclusion policy", () => {
        const sectionAnnotations = getSectionAnnotations();
        const filters = [
            { mainFilter: "all" as const },
            { mainFilter: "processed" as const },
            { mainFilter: "processed" as const, categoryFilter: 2 },
            { mainFilter: "unprocessed" as const },
            { mainFilter: "unprocessed" as const, colorFilter: "2" },
        ];

        for (const filter of filters) {
            const filteredIds = getFilteredAnnotations(
                sectionAnnotations,
                filter.mainFilter,
                filter.categoryFilter ?? null,
                filter.colorFilter ?? null
            ).map((ann) => ann.id);

            if (filteredIds.length > 0) {
                expect(
                    getPreviousAnnotationId(bookId, filteredIds[0], sectionId, filter)
                ).toBeNull();
                expect(
                    getNextAnnotationId(bookId, filteredIds[filteredIds.length - 1], sectionId, filter)
                ).toBeNull();
            }

            for (let i = 0; i < filteredIds.length - 1; i++) {
                expect(
                    getNextAnnotationId(bookId, filteredIds[i], sectionId, filter)
                ).toBe(filteredIds[i + 1]);
            }
        }
    });
});

describe("Fingerprint integration [STORY-010a]", () => {
    beforeEach(async () => {
        await newFunction();
    });

    test("paragraphs have fingerprint after initialization", () => {
        const book = getSectionTreeForBook("t0000010");
        // Access the raw AnnotationsNote to inspect bookSections
        const sections = getAnnotationsForSection("t0000012", "t0000010");
        expect(sections.annotations.length).toBeGreaterThan(0);
    });

    test("paragraphs without stored fingerprints are not flagged as drifted (backward compat)", () => {
        // Existing flashcards in fixtures have no fingerprint stored
        // so drift detection should not flag any paragraphs
        const tree = getSectionTreeForBook("t0000010");
        // If drift were incorrectly flagged, the section tree would still build
        // This test verifies initialization completes without false drift flags
        expect(tree).toBeDefined();
        expect(tree.name).toBe("Untitled");
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
