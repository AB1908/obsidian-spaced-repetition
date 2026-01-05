import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { createDiskMockFromFixtures, resetFixtureTransformer } from "../../helpers";
import { PersonalNotePage } from "src/ui/routes/import/personal-note";
import * as obsidianFacade from "src/infrastructure/obsidian-facade";
import * as api from "src/api";
import { setupNanoidMock, resetNanoidMock } from "../../nanoid-mock";
import { createMockPlugin } from "../../__mocks__/plugin";
import { Index } from "src/data/models";
import { FlashcardIndex } from "src/data/models/flashcard";
import { SourceNoteIndex } from "src/data/models/sourceNote";
import { fileTags } from "src/infrastructure/disk";
import { setPlugin } from "src/api";

setupNanoidMock();

async function initializePlugin() {
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
    return mockPlugin;
}

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

// Mock react-router-dom hooks
jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useLoaderData: jest.fn(),
    useParams: jest.fn(),
    useNavigate: jest.fn(),
    useLocation: jest.fn(),
}));

// Mock API functions
jest.mock("src/api", () => ({
    ...jest.requireActual("src/api"),
    getAnnotationById: jest.fn(),
    updateAnnotationMetadata: jest.fn().mockResolvedValue(true), // Mock resolved value
    softDeleteAnnotation: jest.fn().mockResolvedValue(true), // Mock resolved value
}));

jest.mock("src/ui/routes/books/api", () => ({
    getPreviousAnnotationIdForSection: jest.fn(),
    getNextAnnotationIdForSection: jest.fn(),
}));

import { getNextAnnotationIdForSection, getPreviousAnnotationIdForSection } from "src/ui/routes/books/api";

// Mock Obsidian setIcon
jest.mock("src/infrastructure/obsidian-facade", () => ({
    ...jest.requireActual("src/infrastructure/obsidian-facade"),
    setIcon: jest.fn(),
}));

const useLoaderDataMock = jest.requireMock("react-router-dom").useLoaderData;
const useParamsMock = jest.requireMock("react-router-dom").useParams;
const useNavigateMock = jest.requireMock("react-router-dom").useNavigate;
const useLocationMock = jest.requireMock("react-router-dom").useLocation;
const setIconMock = jest.spyOn(obsidianFacade, "setIcon");
const getPreviousAnnotationIdForSectionMock = getPreviousAnnotationIdForSection as jest.Mock;
const getNextAnnotationIdForSectionMock = getNextAnnotationIdForSection as jest.Mock;

describe("PersonalNotePage Component", () => {
    const mockNavigate = jest.fn();
    let mockBookId: string;
    let mockAnnotationId: string;
    let confirmSpy: jest.SpyInstance;

    beforeEach(async () => {
        const plugin = await initializePlugin();
        const book = plugin.sourceNoteIndex.getAllSourceNotes()[0];
        mockBookId = book.id;
        mockAnnotationId = book.annotations()[0].id;

        useLoaderDataMock.mockClear();
        useParamsMock.mockClear();
        useNavigateMock.mockClear();
        useLocationMock.mockClear();
        setIconMock.mockClear();
        mockNavigate.mockClear();
        getPreviousAnnotationIdForSectionMock.mockReset();
        getNextAnnotationIdForSectionMock.mockReset();
        jest.spyOn(api, "updateAnnotationMetadata").mockResolvedValue(true);
        jest.spyOn(api, "softDeleteAnnotation").mockResolvedValue(true);

        useParamsMock.mockReturnValue({
            bookId: mockBookId,
            annotationId: mockAnnotationId,
            sectionId: "mock-section-id",
        });
        useNavigateMock.mockReturnValue(mockNavigate);
        useLocationMock.mockReturnValue({
            pathname: "/import/books/1/chapters/2/annotations/3/personal-note",
        });

        // Mock window.confirm
        confirmSpy = jest.spyOn(window, "confirm").mockReturnValue(true);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("should render navigation correctly for the FIRST annotation (only next enabled)", () => {
        const mockAnnotation = { id: "1", highlight: "H", note: "N" };
        useLoaderDataMock.mockReturnValue({ annotation: mockAnnotation, bookId: mockBookId });
        getPreviousAnnotationIdForSectionMock.mockReturnValue(null);
        getNextAnnotationIdForSectionMock.mockReturnValue("2");

        const { container } = render(
            <MemoryRouter>
                <PersonalNotePage />
            </MemoryRouter>
        );

        const navControls = container.querySelectorAll(".annotation-nav");
        expect(navControls[0]).not.toHaveClass("is-clickable"); // Previous disabled
        expect(navControls[1]).toHaveClass("is-clickable"); // Next enabled
    });

    it("should render navigation correctly for a MIDDLE annotation (both enabled)", () => {
        const mockAnnotation = { id: "2", highlight: "H", note: "N" };
        useLoaderDataMock.mockReturnValue({ annotation: mockAnnotation, bookId: mockBookId });
        getPreviousAnnotationIdForSectionMock.mockReturnValue("1");
        getNextAnnotationIdForSectionMock.mockReturnValue("3");

        const { container } = render(
            <MemoryRouter>
                <PersonalNotePage />
            </MemoryRouter>
        );

        const navControls = container.querySelectorAll(".annotation-nav");
        expect(navControls[0]).toHaveClass("is-clickable");
        expect(navControls[1]).toHaveClass("is-clickable");
    });

    it("should render navigation correctly for the LAST annotation (only previous enabled)", () => {
        const mockAnnotation = { id: "3", highlight: "H", note: "N" };
        useLoaderDataMock.mockReturnValue({ annotation: mockAnnotation, bookId: mockBookId });
        getPreviousAnnotationIdForSectionMock.mockReturnValue("2");
        getNextAnnotationIdForSectionMock.mockReturnValue(null);

        const { container } = render(
            <MemoryRouter>
                <PersonalNotePage />
            </MemoryRouter>
        );

        const navControls = container.querySelectorAll(".annotation-nav");
        expect(navControls[0]).toHaveClass("is-clickable");
        expect(navControls[1]).not.toHaveClass("is-clickable"); // Next disabled
    });

    it("should save changes and navigate when next is clicked", async () => {
        const mockAnnotation = { id: "1", highlight: "H", note: "N", personalNote: "Initial" };
        useLoaderDataMock.mockReturnValue({ annotation: mockAnnotation, bookId: mockBookId });
        getPreviousAnnotationIdForSectionMock.mockReturnValue(null);
        getNextAnnotationIdForSectionMock.mockReturnValue("2");
        const updateAnnotationMetadataMock = jest.spyOn(api, "updateAnnotationMetadata");

        const { container } = render(
            <MemoryRouter>
                <PersonalNotePage />
            </MemoryRouter>
        );

        fireEvent.change(screen.getByPlaceholderText("Enter your own note here..."), {
            target: { value: "Changed" },
        });

        const nextButton = container.querySelectorAll(".annotation-nav.is-clickable")[0];
        fireEvent.click(nextButton);

        await waitFor(() => {
            expect(updateAnnotationMetadataMock).toHaveBeenCalledWith(
                mockBookId,
                "1",
                expect.objectContaining({ personalNote: "Changed" })
            );
            expect(mockNavigate).toHaveBeenCalledWith(expect.stringContaining("2/personal-note"), {
                replace: true,
            });
        });
    });

    it("should render correctly with a personal note, category, and highlight color and match snapshot", () => {
        const mockAnnotation = {
            id: mockAnnotationId,
            highlight: "This is a test highlight.",
            note: "This is a test note.",
            personalNote: "My personal thoughts on this highlight.",
            category: 2,
            originalColor: 16711680, // Red color
        };
        useLoaderDataMock.mockReturnValue({ annotation: mockAnnotation, bookId: mockBookId });
        getPreviousAnnotationIdForSectionMock.mockReturnValue("prev");
        getNextAnnotationIdForSectionMock.mockReturnValue("next");

        const { container } = render(
            <MemoryRouter>
                <PersonalNotePage />
            </MemoryRouter>
        );

        expect(screen.getByText("Edit Personal Note")).toBeInTheDocument();
        expect(
            screen.getByDisplayValue("My personal thoughts on this highlight.")
        ).toBeInTheDocument();
        expect(setIconMock).toHaveBeenCalledWith(expect.any(HTMLDivElement), "lightbulb"); // Check that icons are set
        expect(container).toMatchInlineSnapshot(`
            <div>
              <div
                class="sr-personal-note-page"
              >
                <div
                  style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;"
                >
                  <div
                    style="display: flex; align-items: center; gap: 10px;"
                  >
                    <div
                      style="width: 20px; height: 20px; background-color: rgba(255, 0, 0, 0); border-radius: 4px;"
                      title="Original highlight color: #FF000000"
                    />
                    <h2>
                      Edit Personal Note
                    </h2>
                  </div>
                  <div>
                    <button
                      class="mod-warning"
                      title="Delete Annotation"
                    >
                      <div />
                    </button>
                  </div>
                </div>
                <div
                  class="sr-annotation"
                >
                  <div
                    class="annotation-nav is-clickable"
                  >
                    <div />
                  </div>
                  <div
                    style="width: 100%;"
                  >
                    <blockquote
                      class="sr-blockquote-annotation"
                    >
                      <p>
                        This is a test highlight.
                      </p>
                    </blockquote>
                    <blockquote
                      class="sr-blockquote-note"
                    >
                      <p>
                        This is a test note.
                      </p>
                    </blockquote>
                  </div>
                  <div
                    class="annotation-nav is-clickable"
                  >
                    <div />
                  </div>
                </div>
                <div
                  class="sr-personal-note-input-container"
                  style="margin-top: 20px;"
                >
                  <textarea
                    placeholder="Enter your own note here..."
                    style="width: 100%; min-height: 100px; padding: 10px; border-radius: 4px;"
                  >
                    My personal thoughts on this highlight.
                  </textarea>
                </div>
                <div
                  class="sr-category-buttons"
                  style="display: flex; justify-content: space-around; margin-top: 20px;"
                >
                  <div
                    class="sr-category-button is-clickable "
                    style="padding: 10px; border: 2px solid; border-radius: 4px; background-color: transparent;"
                  >
                    <div />
                  </div>
                  <div
                    class="sr-category-button is-clickable "
                    style="padding: 10px; border: 2px solid; border-radius: 4px; background-color: transparent;"
                  >
                    <div />
                  </div>
                  <div
                    class="sr-category-button is-clickable is-active"
                    style="padding: 10px; border: 2px solid; border-radius: 4px;"
                  >
                    <div />
                  </div>
                  <div
                    class="sr-category-button is-clickable "
                    style="padding: 10px; border: 2px solid; border-radius: 4px; background-color: transparent;"
                  >
                    <div />
                  </div>
                  <div
                    class="sr-category-button is-clickable "
                    style="padding: 10px; border: 2px solid; border-radius: 4px; background-color: transparent;"
                  >
                    <div />
                  </div>
                  <div
                    class="sr-category-button is-clickable "
                    style="padding: 10px; border: 2px solid; border-radius: 4px; background-color: transparent;"
                  >
                    <div />
                  </div>
                </div>
                <div
                  style="margin-top: 20px; display: flex; gap: 10px;"
                >
                  <button
                    class="mod-cta"
                  >
                    Save
                  </button>
                  <button>
                    Back
                  </button>
                </div>
              </div>
            </div>
        `);
    });

    it("should render correctly with no personal note, category, or highlight color and match snapshot", () => {
        const mockAnnotation = {
            id: mockAnnotationId,
            highlight: "Another highlight.",
            note: "Another note.",
            personalNote: "",
            category: undefined,
            originalColor: undefined,
        };
        useLoaderDataMock.mockReturnValue({ annotation: mockAnnotation, bookId: mockBookId });
        getPreviousAnnotationIdForSectionMock.mockReturnValue("prev");
        getNextAnnotationIdForSectionMock.mockReturnValue("next");

        const { container } = render(
            <MemoryRouter>
                <PersonalNotePage />
            </MemoryRouter>
        );

        expect(screen.getByText("Edit Personal Note")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Enter your own note here...")).toBeInTheDocument();
        expect(setIconMock).toHaveBeenCalledTimes(9); // 6 category icons + 1 delete icon + 2 nav icons
        expect(container).toMatchInlineSnapshot(`
            <div>
              <div
                class="sr-personal-note-page"
              >
                <div
                  style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;"
                >
                  <div
                    style="display: flex; align-items: center; gap: 10px;"
                  >
                    <h2>
                      Edit Personal Note
                    </h2>
                  </div>
                  <div>
                    <button
                      class="mod-warning"
                      title="Delete Annotation"
                    >
                      <div />
                    </button>
                  </div>
                </div>
                <div
                  class="sr-annotation"
                >
                  <div
                    class="annotation-nav is-clickable"
                  >
                    <div />
                  </div>
                  <div
                    style="width: 100%;"
                  >
                    <blockquote
                      class="sr-blockquote-annotation"
                    >
                      <p>
                        Another highlight.
                      </p>
                    </blockquote>
                    <blockquote
                      class="sr-blockquote-note"
                    >
                      <p>
                        Another note.
                      </p>
                    </blockquote>
                  </div>
                  <div
                    class="annotation-nav is-clickable"
                  >
                    <div />
                  </div>
                </div>
                <div
                  class="sr-personal-note-input-container"
                  style="margin-top: 20px;"
                >
                  <textarea
                    placeholder="Enter your own note here..."
                    style="width: 100%; min-height: 100px; padding: 10px; border-radius: 4px;"
                  />
                </div>
                <div
                  class="sr-category-buttons"
                  style="display: flex; justify-content: space-around; margin-top: 20px;"
                >
                  <div
                    class="sr-category-button is-clickable "
                    style="padding: 10px; border: 2px solid; border-radius: 4px; background-color: transparent;"
                  >
                    <div />
                  </div>
                  <div
                    class="sr-category-button is-clickable "
                    style="padding: 10px; border: 2px solid; border-radius: 4px; background-color: transparent;"
                  >
                    <div />
                  </div>
                  <div
                    class="sr-category-button is-clickable "
                    style="padding: 10px; border: 2px solid; border-radius: 4px; background-color: transparent;"
                  >
                    <div />
                  </div>
                  <div
                    class="sr-category-button is-clickable "
                    style="padding: 10px; border: 2px solid; border-radius: 4px; background-color: transparent;"
                  >
                    <div />
                  </div>
                  <div
                    class="sr-category-button is-clickable "
                    style="padding: 10px; border: 2px solid; border-radius: 4px; background-color: transparent;"
                  >
                    <div />
                  </div>
                  <div
                    class="sr-category-button is-clickable "
                    style="padding: 10px; border: 2px solid; border-radius: 4px; background-color: transparent;"
                  >
                    <div />
                  </div>
                </div>
                <div
                  style="margin-top: 20px; display: flex; gap: 10px;"
                >
                  <button
                    class="mod-cta"
                  >
                    Save
                  </button>
                  <button>
                    Back
                  </button>
                </div>
              </div>
            </div>
        `);
    });

    it("should handle category click and update state", async () => {
        const mockAnnotation = {
            id: mockAnnotationId,
            highlight: "Highlight",
            note: "Note",
            personalNote: "",
            category: undefined,
            originalColor: undefined,
        };
        useLoaderDataMock.mockReturnValue({ annotation: mockAnnotation, bookId: mockBookId });

        const { container } = render(
            <MemoryRouter>
                <PersonalNotePage />
            </MemoryRouter>
        );

        const categoryButtons = container.querySelectorAll(".sr-category-button");
        fireEvent.click(categoryButtons[0]);

        await waitFor(() => {
            expect(categoryButtons[0]).toHaveClass("is-active");
        });

        fireEvent.click(categoryButtons[0]);
        await waitFor(() => {
            expect(categoryButtons[0]).not.toHaveClass("is-active");
        });
    });

    it("should call updateAnnotationMetadata and navigate on save", async () => {
        const mockAnnotation = {
            id: mockAnnotationId,
            highlight: "Highlight",
            note: "Note",
            personalNote: "Initial note",
            category: 1,
            originalColor: undefined,
        };
        useLoaderDataMock.mockReturnValue({ annotation: mockAnnotation, bookId: mockBookId });
        const updateAnnotationMetadataMock = jest.spyOn(api, "updateAnnotationMetadata");

        const { container } = render(
            <MemoryRouter>
                <PersonalNotePage />
            </MemoryRouter>
        );

        fireEvent.change(screen.getByPlaceholderText("Enter your own note here..."), {
            target: { value: "New note" },
        });
        const categoryButtons = container.querySelectorAll(".sr-category-button");
        fireEvent.click(categoryButtons[0]); // Click first category

        fireEvent.click(screen.getByRole("button", { name: "Save" }));

        await waitFor(() => {
            expect(updateAnnotationMetadataMock).toHaveBeenCalledWith(
                mockBookId,
                mockAnnotationId,
                { personalNote: "New note", category: 0 }
            );
            expect(mockNavigate).toHaveBeenCalledWith(-1);
        });
    });

    it("should call softDeleteAnnotation and navigate on delete", async () => {
        const mockAnnotation = {
            id: mockAnnotationId,
            highlight: "Highlight",
            note: "Note",
            personalNote: "",
            category: undefined,
            originalColor: undefined,
        };
        useLoaderDataMock.mockReturnValue({ annotation: mockAnnotation, bookId: mockBookId });
        const softDeleteAnnotationMock = jest.spyOn(api, "softDeleteAnnotation");

        render(
            <MemoryRouter>
                <PersonalNotePage />
            </MemoryRouter>
        );

        fireEvent.click(screen.getByTitle("Delete Annotation")); // Click delete button

        await waitFor(() => {
            expect(confirmSpy).toHaveBeenCalledWith(
                "Are you sure you want to delete this annotation?"
            );
            expect(softDeleteAnnotationMock).toHaveBeenCalledWith(mockBookId, mockAnnotationId);
            expect(mockNavigate).toHaveBeenCalledWith(-1);
        });
    });
});