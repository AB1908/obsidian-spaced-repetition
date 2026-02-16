import { createDiskMockFromFixtures, resetFixtureTransformer } from "./helpers";
import { resetNanoidMock, setupNanoidMock } from "./nanoid-mock";

jest.mock("src/infrastructure/disk", () => {
    return createDiskMockFromFixtures([
        "filePathsWithTag_empty.json",
        "fileTags_clippings_constitution.json",
        "getMetadataForFile_constitution.json",
        "getFileContents_constitution.json",
        "getParentOrFilename_constitution_root.json",
        "getParentOrFilename_constitution_folder.json",
        "generateFlashcardsFileNameAndPath_constitution.json",
        "createFlashcardsFileForBook_constitution.json",
        "moveFile_constitution.json",
        "ensureFolder_constitution.json",
        "overwriteFile_constitution.json",
    ]);
});

setupNanoidMock();

import * as disk from "src/infrastructure/disk";
import { AnnotationsNoteIndex } from "src/data/models/AnnotationsNote";
import { createMockPlugin } from "./__mocks__/plugin";
import { createFlashcardNoteForAnnotationsNote, getSourcesAvailableForDeckCreation, setPlugin } from "src/api";
import { Index } from "src/data/models";
import { FlashcardIndex } from "src/data/models/flashcard";
import { fileTags } from "src/infrastructure/disk";

let plugin: ReturnType<typeof createMockPlugin>;

describe("clippings deck creation flow [STORY-013]", () => {
    beforeEach(async () => {
        jest.clearAllMocks();
        plugin = await setupClippingsWorld();
    });

    test("getSourcesAvailableForDeckCreation marks clipping source as requiring mutation confirmation", () => {
        expect(getSourcesAvailableForDeckCreation()).toMatchInlineSnapshot(`
            [
              {
                "id": "t0000000",
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

    test("source name remains file basename before and after source folderization", async () => {
        const source = getSourcesAvailableForDeckCreation()[0];
        expect(source.name).toBe("constitution");

        await createFlashcardNoteForAnnotationsNote(source.id, { confirmedSourceMutation: true });
        const book = plugin.annotationsNoteIndex.getBook(source.id);

        expect(book.path).toBe("constitution/constitution.md");
        expect(book.name).toBe("constitution");
    });

    test("createFlashcardNoteForAnnotationsNote blocks clipping source when confirmation is missing", async () => {
        const bookId = getSourcesAvailableForDeckCreation()[0].id;
        await expect(createFlashcardNoteForAnnotationsNote(bookId))
            .rejects
            .toThrowErrorMatchingInlineSnapshot(
                `"createFlashcardNoteForAnnotationsNote: source mutation confirmation required for clipping source"`
            );
    });

    test("createFlashcardNoteForAnnotationsNote mutates and folderizes selected clipping source when confirmed", async () => {
        const bookId = getSourcesAvailableForDeckCreation()[0].id;
        await createFlashcardNoteForAnnotationsNote(bookId, { confirmedSourceMutation: true });

        expect(getSourcesAvailableForDeckCreation()).toMatchInlineSnapshot(`[]`);

        const diskSummary = {
            ensureFolder: (disk.ensureFolder as jest.Mock).mock.calls,
            moveFile: (disk.moveFile as jest.Mock).mock.calls,
            createFlashcardsFileForBook: (disk.createFlashcardsFileForBook as jest.Mock).mock.calls,
            overwriteFileCalled: (disk.overwriteFile as jest.Mock).mock.calls.length,
            overwritePath: (disk.overwriteFile as jest.Mock).mock.calls[0]?.[0],
            overwriteHasBlockIds: ((disk.overwriteFile as jest.Mock).mock.calls[0]?.[1] || "").includes("^"),
        };

        expect(diskSummary).toMatchInlineSnapshot(`
            {
              "createFlashcardsFileForBook": [
                [
                  "constitution/constitution.md",
                  "constitution/Flashcards.md",
                ],
              ],
              "ensureFolder": [
                [
                  "constitution",
                ],
              ],
              "moveFile": [
                [
                  "constitution.md",
                  "constitution/constitution.md",
                ],
              ],
              "overwriteFileCalled": 1,
              "overwriteHasBlockIds": true,
              "overwritePath": "constitution.md",
            }
        `);
    });
});

async function setupClippingsWorld() {
    resetNanoidMock();
    resetFixtureTransformer();

    const mockPlugin = createMockPlugin();
    mockPlugin.fileTagsMap = fileTags();
    mockPlugin.index = new Index();
    mockPlugin.flashcardIndex = new FlashcardIndex();
    mockPlugin.annotationsNoteIndex = new AnnotationsNoteIndex();
    mockPlugin.flashcardIndex = await mockPlugin.flashcardIndex.initialize();
    mockPlugin.annotationsNoteIndex = await mockPlugin.annotationsNoteIndex.initialize(mockPlugin);
    setPlugin(mockPlugin as any);
    return mockPlugin;
}
