import { createDiskMockFromFixtures, resetFixtureTransformer } from "./helpers";
import { resetNanoidMock, setupNanoidMock } from "./nanoid-mock";

jest.mock("src/infrastructure/disk", () => {
    return createDiskMockFromFixtures([
        "filePathsWithTag_flashcards.json",
        "getMetadataForFile_Atomic-Habits_Annotations.json",
        "getFileContents_Atomic-Habits_Annotations.json",
        "getTFileForPath_Atomic-Habits_Annotations.json",
        "getFileContents_Atomic-Habits_Flashcards.json",
        "getAnnotationFilePath_Atomic-Habits_Flashcards.json",
        "getFileContents_Clippings_Claude-s-Constitution_Flashcards.json",
        "getAnnotationFilePath_Clippings_Claude-s-Constitution_Flashcards.json",
        "getFileContents_Memory-A-Very-Short-Introduction_Flashcards.json",
        "getAnnotationFilePath_Memory-A-Very-Short-Introduction_Flashcards.json",
        "getFileContents_Untitled-Flashcards.json",
        "getAnnotationFilePath_Untitled-Flashcards.json",
        "getMetadataForFile_constitution.json",
        "getFileContents_constitution.json",
        "getTFileForPath_constitution.json",
    ]);
});

setupNanoidMock();

import { AnnotationsNoteIndex } from "src/data/models/AnnotationsNote";
import { createMockPlugin } from "./__mocks__/plugin";
import { getSourcesAvailableForDeckCreation, getSourcesForReview, setPlugin } from "src/api";
import { Index } from "src/data/models";
import { FlashcardIndex } from "src/data/models/flashcard";

describe("BUG-008 source naming policy", () => {
    beforeEach(async () => {
        await setupNamingWorld();
    });

    test("MoonReader source uses meaningful title instead of generic Annotations basename", () => {
        const reviewSources = getSourcesForReview().map((source) => ({
            id: source.id,
            name: source.name,
        }));

        expect(reviewSources).toEqual(
            expect.arrayContaining([expect.objectContaining({ name: "Atomic Habits" })])
        );
        expect(reviewSources.map((source) => source.name)).not.toContain("Annotations");
    });

    test("direct-markdown source keeps basename label for deck creation list", () => {
        expect(getSourcesAvailableForDeckCreation()).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    name: "constitution",
                    sourceType: "direct-markdown",
                    requiresSourceMutationConfirmation: true,
                }),
            ])
        );
    });
});

async function setupNamingWorld() {
    resetNanoidMock();
    resetFixtureTransformer();

    const mockPlugin = createMockPlugin();
    // Seed only source-tag map entries needed for this contract.
    mockPlugin.fileTagsMap = new Map([
        ["Atomic Habits/Annotations.md", ["review/book"]],
        ["constitution.md", ["clippings"]],
    ]);
    mockPlugin.index = new Index();
    mockPlugin.flashcardIndex = new FlashcardIndex();
    mockPlugin.annotationsNoteIndex = new AnnotationsNoteIndex();
    mockPlugin.flashcardIndex = await mockPlugin.flashcardIndex.initialize();
    mockPlugin.annotationsNoteIndex = await mockPlugin.annotationsNoteIndex.initialize(mockPlugin);
    setPlugin(mockPlugin as any);
}
