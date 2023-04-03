import React from "react";
import { render, screen } from "@testing-library/react";
import { TestComponent } from "src/ui/components/book-list";
import { ChapterList } from "src/ui/components/chapters-list";

describe("TestComponent", () => {
    test("renders a list of books correctly", () => {
        const books = [
            { id: 1, title: "The Great Gatsby", author: "F. Scott Fitzgerald", year: 1925 },
            { id: 2, title: "To Kill a Mockingbird", author: "Harper Lee", year: 1960 },
        ];
        const { container } = render(<TestComponent bookList={books} />);
        const child = container as HTMLElement;

        expect(child).toMatchInlineSnapshot(`
            <div>
              <p>
                Add flashcards from:
              </p>
              <ul>
                <li>
                  The Great Gatsby
                </li>
                <li>
                  To Kill a Mockingbird
                </li>
              </ul>
            </div>
        `);
    });
});

describe("ChapterList", () => {
    test("should render a list of chapters correctly", () => {
        const chapters = [
            { id: 1, title: "Chapter 1" },
            { id: 2, title: "Chapter 2" },
        ];
        const { container } = render(<ChapterList chapterList={chapters} />);
        const child = container as HTMLElement;

        expect(child).toMatchInlineSnapshot(`
            <div>
              <p>
                Add flashcards from:
              </p>
              <ul>
                <li>
                  Chapter 1
                </li>
                <li>
                  Chapter 2
                </li>
              </ul>
            </div>
        `);
    });
});
