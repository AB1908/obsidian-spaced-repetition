import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { PersonalNotePage } from "src/ui/routes/import/personal-note";
import * as obsidianFacade from "src/infrastructure/obsidian-facade";
import * as api from "src/api";

// Mock react-router-dom hooks
jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useLoaderData: jest.fn(),
    useParams: jest.fn(),
    useNavigate: jest.fn(),
}));

// Mock API functions
jest.mock("src/api", () => ({
    ...jest.requireActual("src/api"),
    getAnnotationById: jest.fn(),
    updateAnnotationMetadata: jest.fn().mockResolvedValue(true), // Mock resolved value
    softDeleteAnnotation: jest.fn().mockResolvedValue(true), // Mock resolved value
}));

// Mock Obsidian setIcon
jest.mock("src/infrastructure/obsidian-facade", () => ({
    ...jest.requireActual("src/infrastructure/obsidian-facade"),
    setIcon: jest.fn(),
}));

const useLoaderDataMock = jest.requireMock("react-router-dom").useLoaderData;
const useParamsMock = jest.requireMock("react-router-dom").useParams;
const useNavigateMock = jest.requireMock("react-router-dom").useNavigate;
const setIconMock = jest.spyOn(obsidianFacade, "setIcon");

describe("PersonalNotePage Component", () => {
    const mockNavigate = jest.fn();
    const mockBookId = "book123";
    const mockAnnotationId = "anno456";
    let confirmSpy: jest.SpyInstance;

    beforeEach(() => {
        useLoaderDataMock.mockClear();
        useParamsMock.mockClear();
        useNavigateMock.mockClear();
        setIconMock.mockClear();
        mockNavigate.mockClear();
        jest.spyOn(api, "updateAnnotationMetadata").mockResolvedValue(true);
        jest.spyOn(api, "softDeleteAnnotation").mockResolvedValue(true);

        useParamsMock.mockReturnValue({ bookId: mockBookId, annotationId: mockAnnotationId });
        useNavigateMock.mockReturnValue(mockNavigate);

        // Mock window.confirm
        confirmSpy = jest.spyOn(window, "confirm").mockReturnValue(true);
    });

    afterEach(() => {
        jest.restoreAllMocks();
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
                  style="display: flex; justify-content: space-between; align-items: center;"
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
                  <button
                    class="mod-warning"
                    title="Delete Annotation"
                  >
                    <div />
                  </button>
                </div>
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

        const { container } = render(
            <MemoryRouter>
                <PersonalNotePage />
            </MemoryRouter>
        );

        expect(screen.getByText("Edit Personal Note")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Enter your own note here...")).toBeInTheDocument();
        expect(setIconMock).toHaveBeenCalledTimes(7); // 6 category icons + 1 delete icon
        expect(container).toMatchInlineSnapshot(`
            <div>
              <div
                class="sr-personal-note-page"
              >
                <div
                  style="display: flex; justify-content: space-between; align-items: center;"
                >
                  <div
                    style="display: flex; align-items: center; gap: 10px;"
                  >
                    <h2>
                      Edit Personal Note
                    </h2>
                  </div>
                  <button
                    class="mod-warning"
                    title="Delete Annotation"
                  >
                    <div />
                  </button>
                </div>
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
