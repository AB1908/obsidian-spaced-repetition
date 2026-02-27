import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, RouteObject } from "react-router-dom";
import { Root } from "src/ui/routes/root";
import { children } from "src/ui/routes/routes";

const mockUseMatches = jest.fn(() => []);

jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useLocation: () => ({ pathname: "/books" }),
    useNavigate: () => jest.fn(),
    useMatches: () => mockUseMatches(),
}));

function getRouteByPath(routes: RouteObject[], path: string): RouteObject | undefined {
    for (const route of routes) {
        if (route.path === path) {
            return route;
        }
        if (route.children) {
            const nested = getRouteByPath(route.children, path);
            if (nested) {
                return nested;
            }
        }
    }
    return undefined;
}

describe("Root modal title", () => {
    beforeEach(() => {
        mockUseMatches.mockReset();
        mockUseMatches.mockReturnValue([]);
    });

    test('renders with default title "Card Coverage" when no route handle defines a title', () => {
        render(
            <MemoryRouter>
                <Root handleCloseButton={jest.fn()} />
            </MemoryRouter>
        );

        expect(screen.getByText("Card Coverage")).toBeInTheDocument();
    });

    test("renders title from the deepest matched route handle", () => {
        mockUseMatches.mockReturnValue([
            {
                handle: {
                    title: () => "Card Coverage",
                },
            },
            {
                handle: {
                    title: () => "Book / Section",
                },
            },
            {
                handle: {
                    title: () => "Editing: Deepest Title",
                },
            },
        ]);

        render(
            <MemoryRouter>
                <Root handleCloseButton={jest.fn()} />
            </MemoryRouter>
        );

        expect(screen.getByText("Editing: Deepest Title")).toBeInTheDocument();
    });

    test("card editing route handle returns truncated question as title", () => {
        const editRoute = getRouteByPath(children, "/books/:bookId/flashcards/:flashcardId/edit");
        expect(editRoute).toBeDefined();
        expect(editRoute!.handle).toBeDefined();

        const title = (editRoute!.handle as any).title({
            data: {
                questionText: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
            },
        });

        expect(title).toBe("Editing: abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWX...");
    });

    test('title falls back to "Card Coverage" when handle title function throws or returns undefined', () => {
        mockUseMatches.mockReturnValue([
            {
                handle: {
                    title: () => {
                        throw new Error("bad handle");
                    },
                },
            },
        ]);

        const { rerender } = render(
            <MemoryRouter>
                <Root handleCloseButton={jest.fn()} />
            </MemoryRouter>
        );
        expect(screen.getByText("Card Coverage")).toBeInTheDocument();

        mockUseMatches.mockReturnValue([
            {
                handle: {
                    title: () => undefined,
                },
            },
        ]);

        rerender(
            <MemoryRouter>
                <Root handleCloseButton={jest.fn()} />
            </MemoryRouter>
        );
        expect(screen.getByText("Card Coverage")).toBeInTheDocument();
    });
});
