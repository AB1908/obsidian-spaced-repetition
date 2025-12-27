import * as api from "src/api";
import * as disk from "src/data/disk";

// Mock disk module manually to allow spying
jest.mock("src/data/disk", () => ({
    findFilesByExtension: jest.fn(),
    getAllFolders: jest.fn(),
    getFileContents: jest.fn(),
    moveFile: jest.fn(),
    renameFile: jest.fn(),
    createFile: jest.fn(),
}));

describe("API Import Orchestrator", () => {
    beforeAll(() => {
        // Mock global app for api.ts side effects
        (global as any).app = {
            vault: {
                getAbstractFileByPath: jest.fn()
            }
        };
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("importMoonReaderExport should move file and create annotations", async () => {
        // Setup Mocks
        (disk.getFileContents as jest.Mock).mockResolvedValue(`#
123
Gatsby
Path
LPath
Chapter 1
0
0
0
0
0
Highlight Text
Note Text`);
        (global as any).app.vault.getAbstractFileByPath.mockReturnValue(null); // No existing file

        // Act
        const result = await api.importMoonReaderExport("Attachments/Gatsby.mrexpt", "Books/Fiction");

        // Assert
        expect(result).toBe("Books/Fiction/Annotations.md");

        // Verify File Move
        expect(disk.moveFile).toHaveBeenCalledWith("Attachments/Gatsby.mrexpt", "Books/Fiction/Gatsby.mrexpt");

        // Verify Annotation Creation
        expect(disk.createFile).toHaveBeenCalledWith(
            "Books/Fiction/Annotations.md",
            expect.stringContaining("# Annotations for Gatsby")
        );
        expect(disk.createFile).toHaveBeenCalledWith(
            "Books/Fiction/Annotations.md",
            expect.stringContaining("> Highlight Text")
        );
    });

    test("importMoonReaderExport should archive existing annotations", async () => {
        // Setup Mocks
        (disk.getFileContents as jest.Mock).mockResolvedValue("#\n123\n...\n");
        (global as any).app.vault.getAbstractFileByPath.mockReturnValue({}); // File exists

        // Act
        await api.importMoonReaderExport("Attachments/Gatsby.mrexpt", "Books/Fiction");

        // Assert
        expect(disk.renameFile).toHaveBeenCalledWith("Books/Fiction/Annotations.md", "Annotations_old.md");
    });
    
    test("getImportableExports should delegate to disk", () => {
        (disk.findFilesByExtension as jest.Mock).mockReturnValue(["a.mrexpt"]);
        expect(api.getImportableExports()).toEqual(["a.mrexpt"]);
        expect(disk.findFilesByExtension).toHaveBeenCalledWith("mrexpt");
    });
});
