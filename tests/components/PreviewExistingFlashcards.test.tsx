import React from "react";
import { render, screen } from "@testing-library/react";
import { RouterProvider, createMemoryRouter } from "react-router-dom";
import { PreviewExistingFlashcards } from "src/ui/components/PreviewExistingFlashcards";
import { Flashcard } from "src/data/models/flashcard";

// Mock react-router-dom hooks
jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useLoaderData: jest.fn(),
    useParams: jest.fn(),
}));

const useLoaderDataMock = jest.requireMock("react-router-dom").useLoaderData;
const useParamsMock = jest.requireMock("react-router-dom").useParams;

// A simple router setup that provides the necessary context
const createTestRouter = (element: React.ReactElement) => {
    const routes = [
        {
            path: "/",
            element: element,
        },
    ];
    return createMemoryRouter(routes);
};

describe("PreviewExistingFlashcards Component", () => {
    beforeEach(() => {
        useLoaderDataMock.mockClear();
        useParamsMock.mockClear();
        useParamsMock.mockReturnValue({
            bookId: "test-book",
            chapterId: "test-chapter",
            annotationId: "test-annotation",
        });
    });

    it("should render a list of flashcards and match snapshot", () => {
        const mockFlashcards: Partial<Flashcard>[] = [
            { id: "fc1", questionText: "What is the first mock question?" },
            { id: "fc2", questionText: "What is the second mock question?" },
        ];
        useLoaderDataMock.mockReturnValue(mockFlashcards);

        const router = createTestRouter(<PreviewExistingFlashcards />);
        const { container } = render(<RouterProvider router={router} />);

        expect(screen.getByText("Existing questions:")).toBeInTheDocument();
        expect(screen.getByText("What is the first mock question?")).toBeInTheDocument();

        expect(container).toMatchInlineSnapshot(`
            <div>
              <div
                class="sr-flashcard-preview"
              >
                <p>
                  Existing questions:
                </p>
                <ul
                  class="sr-flashcard-tree"
                >
                  <li
                    class="sr-flashcard tree-item-self is-clickable"
                  >
                    <a
                      href="/fc1"
                    >
                      What is the first mock question?
                    </a>
                    <form
                      action="/"
                      method="post"
                    >
                      <button
                        name="flashcardId"
                        value="fc1"
                      >
                        <div />
                      </button>
                    </form>
                  </li>
                  <li
                    class="sr-flashcard tree-item-self is-clickable"
                  >
                    <a
                      href="/fc2"
                    >
                      What is the second mock question?
                    </a>
                    <form
                      action="/"
                      method="post"
                    >
                      <button
                        name="flashcardId"
                        value="fc2"
                      >
                        <div />
                      </button>
                    </form>
                  </li>
                </ul>
                <a
                  href="/new"
                >
                  <button>
                    Create New Cards
                  </button>
                </a>
              </div>
            </div>
        `);
    });

    it("should render only the create button if there are no flashcards and match snapshot", () => {
        useLoaderDataMock.mockReturnValue([]);

        const router = createTestRouter(<PreviewExistingFlashcards />);
        const { container } = render(<RouterProvider router={router} />);

        expect(screen.queryByText("Existing questions:")).not.toBeInTheDocument();
        expect(screen.getByText("Create New Cards")).toBeInTheDocument();

        expect(container).toMatchInlineSnapshot(`
            <div>
              <div
                class="sr-flashcard-preview"
              >
                <a
                  href="/new"
                >
                  <button>
                    Create New Cards
                  </button>
                </a>
              </div>
            </div>
        `);
    });
});
