import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ChooseCardType } from "src/ui/components/ChooseCardType";

describe("ChooseCardType Component", () => {
    it("should render the card type options and match snapshot", () => {
        const { container } = render(
            <MemoryRouter>
                <ChooseCardType />
            </MemoryRouter>
        );

        // Assert that the visible link is rendered
        expect(screen.getByText("Regular")).toBeInTheDocument();

        // Create an inline snapshot
        expect(container).toMatchInlineSnapshot(`
            <div>
              <p>
                Which type of flashcard?
              </p>
              <ol>
                <a
                  href="/regular"
                >
                  <li>
                    Regular
                  </li>
                </a>
              </ol>
            </div>
        `);
    });
});
