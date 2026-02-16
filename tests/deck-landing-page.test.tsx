import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { createMemoryRouter, RouterProvider } from "react-router-dom";

import { createDiskMockFromFixtures, resetFixtureTransformer } from "./helpers";
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
        "getTFileForPath_Untitled.json",
        "getMetadataForFile_2025-12-07T19-37-20-679Z_gfsis2.json",
    ]);
    return mock;
});

import { setupNanoidMock, resetNanoidMock } from "./nanoid-mock";
setupNanoidMock();

import { DeckLandingPage, BookButtons, deckLoader } from "src/ui/routes/books/book";
import { ChapterList, chapterLoader } from "src/ui/components/ChapterList";
import { setPlugin } from "src/api";
import { createMockPlugin } from "./__mocks__/plugin";
import { Index } from "src/data/models";
import { FlashcardIndex } from "src/data/models/flashcard";
import { AnnotationsNoteIndex } from "src/data/models/AnnotationsNote";
import { fileTags } from "src/infrastructure/disk";

async function initializePlugin() {
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

describe("DeckLandingPage Navigation", () => {
    beforeEach(async () => {
        await initializePlugin();
    });

    test("should render the deck preview and navigate to the chapter list", async () => {
        const bookId = "t0000010";
        const routes = [
            {
                path: "/books/:bookId",
                element: <DeckLandingPage />,
                loader: deckLoader,
                children: [
                    {
                        index: true,
                        element: <BookButtons />,
                        loader: deckLoader,
                    },
                    {
                        path: "chapters",
                        element: <ChapterList />,
                        loader: chapterLoader,
                    },
                ],
            },
        ];

        const router = createMemoryRouter(routes, {
            initialEntries: [`/books/${bookId}`],
        });

        const { container } = render(<RouterProvider router={router} />);

        await screen.findByText("Create New Cards");

        // Initial snapshot
        expect(container).toMatchInlineSnapshot(`
            <div>
              <h3>
                Untitled
              </h3>
              <h4>
                <div
                  class="tree-item-flair-outer"
                >
                  <span>
                    <span
                      aria-label="MATURE"
                      class="tree-item-flair sr-deck-counts due-cards"
                    >
                      1
                    </span>
                    <span
                      aria-label="NEW"
                      class="tree-item-flair sr-deck-counts new-cards"
                    >
                      1
                    </span>
                    <span
                      aria-label="LEARNING"
                      class="tree-item-flair sr-deck-counts total-cards"
                    >
                      3
                    </span>
                  </span>
                </div>
              </h4>
              <h4>
                <span
                  class="tree-item-flair sr-deck-counts "
                >
                  0
                </span>
                <span
                  class="tree-item-flair sr-deck-counts "
                >
                  2
                </span>
              </h4>
              <p>
                <a
                  href="/books/t0000010/chapters"
                >
                  <button>
                    Create New Cards
                  </button>
                </a>
                <button>
                  Review
                </button>
              </p>
            </div>
        `);

        fireEvent.click(screen.getByText("Create New Cards"));

        await waitFor(() => screen.getByText("Add flashcards from:"));

        expect(
            screen.getByText("Chapter 3: Pulling the rabbit out of the hat")
        ).toBeInTheDocument();

        // Snapshot after navigation
        expect(container).toMatchInlineSnapshot(`
            <div>
              <h3>
                Untitled
              </h3>
              <h4>
                <div
                  class="tree-item-flair-outer"
                >
                  <span>
                    <span
                      aria-label="MATURE"
                      class="tree-item-flair sr-deck-counts due-cards"
                    >
                      1
                    </span>
                    <span
                      aria-label="NEW"
                      class="tree-item-flair sr-deck-counts new-cards"
                    >
                      1
                    </span>
                    <span
                      aria-label="LEARNING"
                      class="tree-item-flair sr-deck-counts total-cards"
                    >
                      3
                    </span>
                  </span>
                </div>
              </h4>
              <h4>
                <span
                  class="tree-item-flair sr-deck-counts "
                >
                  0
                </span>
                <span
                  class="tree-item-flair sr-deck-counts "
                >
                  2
                </span>
              </h4>
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
                      href="/books/t0000010/chapters/t0000012/annotations"
                    >
                      Chapter 3: Pulling the rabbit out of the hat
                    </a>
                  </li>
                </ul>
              </div>
            </div>
        `);
    });
});
