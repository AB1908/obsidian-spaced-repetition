import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ImportDashboard } from "src/ui/routes/import/import-export";
import { ReviewBook } from "src/api"; // Assuming ReviewBook is exported from src/api
import { BookFrontmatter } from "src/data/models/sourceNote";

// Mock react-router-dom hooks
jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useLoaderData: jest.fn(),
    useNavigate: jest.fn(),
}));

// Mock the API calls
jest.mock("src/api", () => ({
    ...jest.requireActual("src/api"),
    getSourcesForReview: jest.fn(),
    getImportedBooks: jest.fn(),
    getUnimportedMrExptFiles: jest.fn(),
    importMoonReaderExport: jest.fn(),
    updateBookAnnotationsAndFrontmatter: jest.fn(),
}));

// Mock ObsidianNotice
jest.mock("src/infrastructure/obsidian-facade", () => ({
    ObsidianNotice: jest.fn(),
}));

const useLoaderDataMock = jest.requireMock("react-router-dom").useLoaderData;
const useNavigateMock = jest.requireMock("react-router-dom").useNavigate;

describe("ImportDashboard Component", () => {
    const mockNavigate = jest.fn();

    beforeEach(() => {
        useLoaderDataMock.mockClear();
        useNavigateMock.mockClear();
        mockNavigate.mockClear();
        useNavigateMock.mockReturnValue(mockNavigate);

        // Default mock loader data
        useLoaderDataMock.mockReturnValue({
            reviewBooks: [],
            importedBooks: [],
            unimportedFiles: [],
        });
    });

    it("should render the list view with no imported books initially and match snapshot", () => {
        const { container } = render(
            <MemoryRouter>
                <ImportDashboard />
            </MemoryRouter>
        );

        expect(screen.getByText("Imported Books")).toBeInTheDocument();
        expect(
            screen.getByText('No books imported yet. Click "Add new book" to get started.')
        ).toBeInTheDocument();
        expect(container).toMatchInlineSnapshot(`
            <div>
              <div
                class="sr-import-dashboard"
              >
                <div
                  style="display: flex; justify-content: space-between; align-items: center;"
                >
                  <h2>
                    Imported Books
                  </h2>
                  <button
                    class="mod-cta"
                  >
                    Add new book
                  </button>
                </div>
                <p>
                  No books imported yet. Click "Add new book" to get started.
                </p>
              </div>
            </div>
        `);
    });

    it("should render the list view with imported books and match snapshot", () => {
        const mockReviewBooks: ReviewBook[] = [
            {
                id: "book1",
                name: "Test Book One",
                pendingFlashcards: 5,
                annotationCoverage: 0.5,
                flashcardProgress: { new: 1, learning: 2, mature: 2 },
            },
            {
                id: "book2",
                name: "Test Book Two",
                pendingFlashcards: 0,
                annotationCoverage: 1,
                flashcardProgress: { new: 0, learning: 0, mature: 5 },
            },
        ];
        useLoaderDataMock.mockReturnValue({
            reviewBooks: mockReviewBooks,
            importedBooks: [],
            unimportedFiles: [],
        });

        const { container } = render(
            <MemoryRouter>
                <ImportDashboard />
            </MemoryRouter>
        );

        expect(screen.getByText("Imported Books")).toBeInTheDocument();
        expect(screen.getByText("Test Book One")).toBeInTheDocument();
        expect(screen.getByText("Test Book Two")).toBeInTheDocument();
        expect(container).toMatchInlineSnapshot(`
            <div>
              <div
                class="sr-import-dashboard"
              >
                <div
                  style="display: flex; justify-content: space-between; align-items: center;"
                >
                  <h2>
                    Imported Books
                  </h2>
                  <button
                    class="mod-cta"
                  >
                    Add new book
                  </button>
                </div>
                <div
                  class="sr-book-list"
                >
                  <div
                    class="sr-book-list-item"
                  >
                    <div
                      class="sr-book-summary"
                      style="padding: 10px 0px; cursor: pointer;"
                    >
                      <div
                        class="sr-book-title"
                      >
                        Test Book One
                      </div>
                    </div>
                  </div>
                  <div
                    class="sr-book-list-item"
                  >
                    <div
                      class="sr-book-summary"
                      style="padding: 10px 0px; cursor: pointer;"
                    >
                      <div
                        class="sr-book-title"
                      >
                        Test Book Two
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
        `);
    });

    it("should switch to the add new book view and match snapshot", () => {
        const mockUnimportedFiles = ["path/to/BookExport.mrexpt", "path/to/AnotherBook.mrexpt"];
        useLoaderDataMock.mockReturnValue({
            reviewBooks: [],
            importedBooks: [],
            unimportedFiles: mockUnimportedFiles,
        });

        const { container } = render(
            <MemoryRouter>
                <ImportDashboard />
            </MemoryRouter>
        );

        fireEvent.click(screen.getByRole("button", { name: /add new book/i }));

        expect(screen.getByText("Add New Book")).toBeInTheDocument();
        expect(screen.getByText("BookExport.mrexpt")).toBeInTheDocument();
        expect(screen.getByText("AnotherBook.mrexpt")).toBeInTheDocument();
        expect(container).toMatchInlineSnapshot(`
            <div>
              <div
                class="sr-import-add-view"
              >
                <button>
                  ← Back to Imported Books
                </button>
                <h2>
                  Add New Book
                </h2>
                <p>
                  Select a \`.mrexpt\` file to import.
                </p>
                <ul
                  class="sr-deck-tree"
                >
                  <li
                    class="tree-item-self is-clickable"
                  >
                    <div
                      class="tree-item-inner"
                    >
                      BookExport.mrexpt
                    </div>
                  </li>
                  <li
                    class="tree-item-self is-clickable"
                  >
                    <div
                      class="tree-item-inner"
                    >
                      AnotherBook.mrexpt
                    </div>
                  </li>
                </ul>
              </div>
            </div>
        `);
    });

    it("should switch back to the list view from the add new book view and match snapshot", () => {
        const { container } = render(
            <MemoryRouter>
                <ImportDashboard />
            </MemoryRouter>
        );

        // Switch to add view first
        fireEvent.click(screen.getByRole("button", { name: /add new book/i }));
        // Then click back button
        fireEvent.click(screen.getByRole("button", { name: /back to imported books/i }));

        expect(screen.getByText("Imported Books")).toBeInTheDocument();
        expect(screen.queryByText("Add New Book")).not.toBeInTheDocument();
        expect(container).toMatchInlineSnapshot(`
            <div>
              <div
                class="sr-import-dashboard"
              >
                <div
                  style="display: flex; justify-content: space-between; align-items: center;"
                >
                  <h2>
                    Imported Books
                  </h2>
                  <button
                    class="mod-cta"
                  >
                    Add new book
                  </button>
                </div>
                <p>
                  No books imported yet. Click "Add new book" to get started.
                </p>
              </div>
            </div>
        `);
    });

    it('should show "No new export files found." in add view if unimportedFiles is empty and match snapshot', () => {
        useLoaderDataMock.mockReturnValue({
            reviewBooks: [],
            importedBooks: [],
            unimportedFiles: [],
        });

        const { container } = render(
            <MemoryRouter>
                <ImportDashboard />
            </MemoryRouter>
        );

        fireEvent.click(screen.getByRole("button", { name: /add new book/i }));

        expect(screen.getByText("Add New Book")).toBeInTheDocument();
        expect(screen.getByText("No new export files found.")).toBeInTheDocument();
        expect(container).toMatchInlineSnapshot(`
            <div>
              <div
                class="sr-import-add-view"
              >
                <button>
                  ← Back to Imported Books
                </button>
                <h2>
                  Add New Book
                </h2>
                <p>
                  Select a \`.mrexpt\` file to import.
                </p>
                <p>
                  No new export files found.
                </p>
              </div>
            </div>
        `);
    });
});
