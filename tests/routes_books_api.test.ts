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
import { setPlugin } from "src/api";
import { Index } from "src/data/models";
import { FlashcardIndex } from "src/data/models/flashcard";
import { fileTags } from "src/infrastructure/disk";

// Import the functions under test
import { getPreviousAnnotationIdForSection, getNextAnnotationIdForSection } from "src/ui/routes/books/api";

describe("Route API: Navigation Logic", () => {
    beforeEach(async () => {
        await setupTestEnv();
    });

    test("getPreviousAnnotationIdForSection should return previous ID", () => {
        const bookId = "t0000010";
        const sectionId = "t0000011"; // Chapter 3
        const annotationId = "tWxSv_No"; // The second annotation in fixture

        // Expected previous is "tekXLAu8" (the first annotation)
        expect(getPreviousAnnotationIdForSection(bookId, sectionId, annotationId)).toBe("tekXLAu8");
    });

    test("getNextAnnotationIdForSection should return next ID", () => {
        const bookId = "t0000010";
        const sectionId = "t0000011"; // Chapter 3
        const annotationId = "tekXLAu8"; // The first annotation

        // Expected next is "tWxSv_No"
        expect(getNextAnnotationIdForSection(bookId, sectionId, annotationId)).toBe("tWxSv_No");
    });
    
    test("should return null when no previous/next", () => {
        const bookId = "t0000010";
        const sectionId = "t0000011";
        
        // First item, no previous
        expect(getPreviousAnnotationIdForSection(bookId, sectionId, "tekXLAu8")).toBeNull();
        
        // Last item, no next
        expect(getNextAnnotationIdForSection(bookId, sectionId, "tWxSv_No")).toBeNull();
    });
});

async function setupTestEnv() {
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
