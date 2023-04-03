import React from "react";
import { render, screen } from "@testing-library/react";
import { TestComponent } from "src/ui/components/book-list";

describe("MyComponent", () => {
    test("renders a div element", () => {
        const books = [
            { id: 1, title: "The Great Gatsby", author: "F. Scott Fitzgerald", year: 1925 },
            { id: 2, title: "To Kill a Mockingbird", author: "Harper Lee", year: 1960 },
            { id: 3, title: "1984", author: "George Orwell", year: 1949 },
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
                <li>
                  1984
                </li>
              </ul>
            </div>
        `);
    });
});
