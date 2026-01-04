import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ChapterList } from "src/ui/components/ChapterList";

// Mock the useLoaderData hook from react-router-dom
jest.mock("react-router", () => ({
    ...jest.requireActual("react-router"),
    useLoaderData: jest.fn(),
}));

// Import the mocked hook to control its return value
const useLoaderDataMock = jest.requireMock("react-router").useLoaderData;

describe("ChapterList Component", () => {
    it("should render a list of chapters and match snapshot", () => {
        // Provide the mock data that the component expects
        const mockChapters = [
            {
                id: "t0000011",
                name: "Chapter 3: Pulling the rabbit out of the hat",
            },
            {
                id: "t0000012",
                name: "Chapter 4: Another Chapter",
            },
        ];

        useLoaderDataMock.mockReturnValue(mockChapters);

        const { container } = render(
            <MemoryRouter>
                <ChapterList />
            </MemoryRouter>
        );

        // Assert that the component renders correctly
        expect(
            screen.getByText("Chapter 3: Pulling the rabbit out of the hat")
        ).toBeInTheDocument();
        expect(screen.getByText("Chapter 4: Another Chapter")).toBeInTheDocument();

        // Create an inline snapshot
        expect(container).toMatchInlineSnapshot(`
            <div>
              <p>
                Add flashcards from:
              </p>
              <div
                class="chapter-tree"
              >
                <ul
                  class="sr-chapter-list"
                >
                  <li
                    class="tree-item-self is-clickable"
                  >
                    <a
                      class="tree-item-inner"
                      href="/t0000011/annotations"
                    >
                      Chapter 3: Pulling the rabbit out of the hat
                    </a>
                  </li>
                  <li
                    class="tree-item-self is-clickable"
                  >
                    <a
                      class="tree-item-inner"
                      href="/t0000012/annotations"
                    >
                      Chapter 4: Another Chapter
                    </a>
                  </li>
                </ul>
              </div>
            </div>
        `);
    });

    it("should render nothing if there are no chapters and match snapshot", () => {
        // Test the empty state
        useLoaderDataMock.mockReturnValue([]);

        const { container } = render(
            <MemoryRouter>
                <ChapterList />
            </MemoryRouter>
        );

        // Create an inline snapshot for the empty state
        expect(container).toMatchInlineSnapshot(`
            <div>
              <p>
                Add flashcards from:
              </p>
              <div
                class="chapter-tree"
              >
                <ul
                  class="sr-chapter-list"
                />
              </div>
            </div>
        `);
    });
});
