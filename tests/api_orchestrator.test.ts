import * as api from "src/api";
import * as disk from "src/infrastructure/disk";

// Mock disk module manually to allow spying
jest.mock("src/infrastructure/disk", () => ({
    findFilesByExtension: jest.fn(),
    getAllFolders: jest.fn(),
    getFileContents: jest.fn(),
    moveFile: jest.fn(),
    renameFile: jest.fn(),
    createFile: jest.fn(),
    getParentFolderPathAndName: jest.fn().mockReturnValue({ name: "Fiction", path: "Books/Fiction" }),
}));

describe("API Import Orchestrator", () => {
    beforeAll(() => {
        // Mock global app for api.ts side effects
        (global as any).app = {
            vault: {
                getAbstractFileByPath: jest.fn(),
            },
        };
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("importMoonReaderExport should move file and create annotations", async () => {
        // Setup Mocks: 16 fields total after '#'
        (disk.getFileContents as jest.Mock).mockResolvedValue(`
#
123
Gatsby
path
lpath
chapter
p1
100
characters
-16711681
1609459200000
field11
Note Text
Highlight Text
field14
field15
field16
`);
        (global as any).app.vault.getAbstractFileByPath.mockReturnValue(null); // No existing file

        // Act
        const result = await api.importMoonReaderExport(
            "Attachments/Gatsby.mrexpt",
            "Books/Fiction"
        );

        // Assert
        expect(result).toBe("Books/Fiction/Annotations.md");

        // Verify File Move
        expect(disk.moveFile).toHaveBeenCalledWith(
            "Attachments/Gatsby.mrexpt",
            "Books/Fiction/Gatsby.mrexpt"
        );

        // Verify Annotation Creation
        expect(disk.createFile).toHaveBeenCalledWith(
            "Books/Fiction/Annotations.md",
            expect.any(String)
        );

        // Snapshot the generated markdown content for review
        const createdFileContent = (disk.createFile as jest.Mock).mock.calls[0][1];
        // We allow dynamic timestamp by replacing it in the comparison if needed, 
        // but for inline snapshot we can just update it.
        expect(createdFileContent).toContain('title: "Gatsby"');
        expect(createdFileContent).toContain('path: "Books/Fiction/Gatsby.mrexpt"');
        expect(createdFileContent).toContain('> Highlight Text');
        expect(createdFileContent).toContain('> Note Text');
    });

    test("importMoonReaderExport should archive existing annotations", async () => {
        // Setup Mocks: 16 fields total after '#'
        (disk.getFileContents as jest.Mock).mockResolvedValue(`
#
123
Gatsby
path
lpath
chapter
p1
100
characters
-16711681
1609459200000
field11
Note Text
Highlight Text
field14
field15
field16
`);
        (global as any).app.vault.getAbstractFileByPath.mockReturnValue({}); // File exists

        // Act
        await api.importMoonReaderExport("Attachments/Gatsby.mrexpt", "Books/Fiction");

        // Assert
        expect(disk.renameFile).toHaveBeenCalledWith(
            "Books/Fiction/Annotations.md",
            "Annotations_old.md"
        );
    });

    test("getImportableExports should delegate to disk", () => {
        (disk.findFilesByExtension as jest.Mock).mockReturnValue(["a.mrexpt"]);
        expect(api.getImportableExports()).toEqual(["a.mrexpt"]);
        expect(disk.findFilesByExtension).toHaveBeenCalledWith("mrexpt");
    });
});
