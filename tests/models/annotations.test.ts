import { isAnnotationProcessed } from "src/data/models/annotations";
import { createDiskMockFromFixtures } from "../helpers";
import { SourceNoteIndex } from "src/data/models/sourceNote";
import { createMockPlugin } from "../__mocks__/plugin";
import { FlashcardIndex } from "src/data/models/flashcard";
import { fileTags } from "src/infrastructure/disk";
import { Index } from "src/data/models";

jest.mock("src/infrastructure/disk", () => {
    const mock = createDiskMockFromFixtures([
        "getFileContents_test-book-with-annotations.json",
        "getMetadataForFile_test-book-with-annotations.json",
    ]);
    return mock;
});

describe("isAnnotationProcessed", () => {
    test("should return true if annotation has a category", () => {
        const annotation = { id: "1", type: "note", highlight: "hi", note: "", category: 1 };
        expect(isAnnotationProcessed(annotation)).toBe(true);
    });

    test("should return false if annotation has no category", () => {
        const annotation = { id: "2", type: "note", highlight: "hi", note: "" };
        expect(isAnnotationProcessed(annotation)).toBe(false);
    });

    test("should return false if category is null", () => {
        const annotation = { id: "3", type: "note", highlight: "hi", note: "", category: null };
        expect(isAnnotationProcessed(annotation)).toBe(false);
    });
});

describe("SourceNote.getProcessedAnnotations", () => {
    let mockPlugin: any;
    let sourceNote: any; // Using 'any' for simplicity in test setup

    beforeEach(async () => {
        mockPlugin = createMockPlugin();
        mockPlugin.fileTagsMap = new Map([
            ["test-book-with-annotations.md", ["review/book"]]
        ]);
        mockPlugin.index = new Index();
        mockPlugin.flashcardIndex = new FlashcardIndex();
        mockPlugin.sourceNoteIndex = new SourceNoteIndex();

        // Mimic initialization flow for the source note
        // In a real scenario, this would involve a SourceNoteIndex which manages SourceNotes
        // For this test, we create a SourceNote directly
        sourceNote = new (SourceNoteIndex as any)(mockPlugin).sourceNotes[0]; // Accessing the first SourceNote directly
        sourceNote.path = "test-book-with-annotations.md";
        sourceNote.id = "test-book-id"; // Manually set ID
        sourceNote.name = "Test Book with Annotations";
        sourceNote.plugin = mockPlugin;
        sourceNote.flashcardNote = { flashcards: [] }; // Mock empty flashcardNote for now
        
        await sourceNote.initialize(); // This will trigger bookSections and getProcessedAnnotations internally
    });

    test("should correctly set isProcessed flag based on annotation category", async () => {
        const processedAnnotations = sourceNote.getProcessedAnnotations();

        const annotation1 = processedAnnotations.find(a => a.id === "annotation-1");
        expect(annotation1?.isProcessed).toBe(true);
        expect(annotation1?.category).toBe(1);

        const annotation2 = processedAnnotations.find(a => a.id === "annotation-2");
        expect(annotation2?.isProcessed).toBe(false);
        expect(annotation2?.category).toBeUndefined();

        const annotation3 = processedAnnotations.find(a => a.id === "annotation-3");
        expect(annotation3?.isProcessed).toBe(true);
        expect(annotation3?.category).toBe(2);

        const annotation4 = processedAnnotations.find(a => a.id === "annotation-4");
        expect(annotation4?.isProcessed).toBe(false);
        expect(annotation4?.category).toBeUndefined();
    });
});
