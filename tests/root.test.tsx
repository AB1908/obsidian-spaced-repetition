import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Root } from "src/ui/routes/root";
import { ModalTitleProvider } from "src/ui/modals/ModalTitleContext";

// Mock react-router-dom hooks
jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useLocation: () => ({ pathname: "/books" }), // Mock initial path
    useNavigate: () => jest.fn(),
    useParams: () => ({ bookId: "mockBook", sectionId: "mockSection" }),
}));

// Mock getBreadcrumbData from api
jest.mock("src/api", () => ({
    getBreadcrumbData: jest.fn(() => ({ bookName: "Mock Book", sectionName: "Mock Section" })),
}));

describe("Root Component", () => {
    test("renders successfully within ModalTitleProvider and displays title", () => {
        render(
            <MemoryRouter>
                <ModalTitleProvider>
                    <Root handleCloseButton={jest.fn()} />
                </ModalTitleProvider>
            </MemoryRouter>
        );

        // Assert that the component renders and displays the expected title
        expect(screen.getByText("Mock Book / Mock Section")).toBeInTheDocument();
        // Negative assertion using queryByText
        expect(screen.queryByText("Edit Personal Note")).not.toBeInTheDocument();
        
        // Assert that setIcon was called
        const { setIcon } = require("src/infrastructure/obsidian-facade");
        expect(setIcon).toHaveBeenCalledWith(
            expect.any(HTMLDivElement),
            "arrow-left"
        );
    });

    test("renders with default title if no bookId is present", () => {
        const rr = require("react-router-dom");
        jest.spyOn(rr, 'useParams').mockReturnValue({});
        
        render(
            <MemoryRouter>
                <ModalTitleProvider>
                    <Root handleCloseButton={jest.fn()} />
                </ModalTitleProvider>
            </MemoryRouter>
        );

        expect(screen.getByText("Card Coverage")).toBeInTheDocument();
    });
});