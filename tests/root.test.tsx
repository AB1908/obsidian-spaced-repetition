import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Root } from "src/ui/routes/root";

const mockUseMatches = jest.fn(() => []);
jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useLocation: () => ({ pathname: "/books" }),
    useNavigate: () => jest.fn(),
    useMatches: () => mockUseMatches(),
}));

describe("Root Component", () => {
    beforeEach(() => {
        mockUseMatches.mockReturnValue([]);
    });

    test("renders with default title without route params", () => {
        render(
            <MemoryRouter>
                <Root handleCloseButton={jest.fn()} />
            </MemoryRouter>
        );

        expect(screen.getByText("Card Coverage")).toBeInTheDocument();
        const { setIcon } = require("src/infrastructure/obsidian-facade");
        expect(setIcon).toHaveBeenCalledWith(
            expect.any(HTMLDivElement),
            "arrow-left"
        );
    });

    test("renders title from deepest matched route handle", () => {
        mockUseMatches.mockReturnValue([
            {},
            {
                handle: {
                    title: () => "Mock Book / Mock Section"
                },
                data: {
                    bookName: "Mock Book",
                    sectionName: "Mock Section",
                }
            }
        ]);

        render(
            <MemoryRouter>
                <Root handleCloseButton={jest.fn()} />
            </MemoryRouter>
        );

        expect(screen.getByText("Mock Book / Mock Section")).toBeInTheDocument();
    });
});
