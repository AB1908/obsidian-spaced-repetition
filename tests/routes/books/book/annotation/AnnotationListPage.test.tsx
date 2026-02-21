import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AnnotationListPage } from "src/ui/routes/books/book/annotation/AnnotationListPage";
import type { SectionAnnotations } from "src/data/models/annotations";
import type { SourceCapabilities } from "src/data/models/sourceCapabilities";

jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useLoaderData: jest.fn(),
    useLocation: jest.fn(),
}));

const useLoaderDataMock = jest.requireMock("react-router-dom").useLoaderData as jest.Mock;
const useLocationMock = jest.requireMock("react-router-dom").useLocation as jest.Mock;

const NAVIGATION_FILTER_SESSION_KEY = "annotationNavigationFilter";

const chapterData: SectionAnnotations = {
    id: "section-1",
    title: "Chapter 1",
    annotations: [
        {
            type: "annotation",
            id: "a-1",
            calloutType: "text",
            highlight: "Unprocessed highlight",
            note: "",
            originalColor: "16711680",
        },
        {
            type: "annotation",
            id: "a-2",
            calloutType: "text",
            highlight: "Processed highlight",
            note: "",
            category: "quote",
        },
    ],
};

const moonreaderCapabilities: SourceCapabilities = {
    sourceType: "moonreader",
    cardCreationMode: "processed-category",
    showCategoryFilter: true,
    showColorFilter: true,
    supportsProcessingFlow: true,
    requiresMutationConfirmation: false,
};

const markdownCapabilities: SourceCapabilities = {
    sourceType: "direct-markdown",
    cardCreationMode: "all-no-processing",
    showCategoryFilter: false,
    showColorFilter: false,
    supportsProcessingFlow: false,
    requiresMutationConfirmation: true,
};

function getNavigationFilter() {
    const raw = sessionStorage.getItem(NAVIGATION_FILTER_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
}

describe("AnnotationListPage route context behavior", () => {
    beforeEach(() => {
        sessionStorage.clear();
        jest.clearAllMocks();
        useLoaderDataMock.mockReturnValue({ ...chapterData, sourceCapabilities: moonreaderCapabilities });
    });

    test("import flow renders filter button group", () => {
        useLocationMock.mockReturnValue({ pathname: "/import/books/1/chapters/2/annotations" });

        render(
            <MemoryRouter>
                <AnnotationListPage />
            </MemoryRouter>
        );

        expect(screen.getByRole("button", { name: "Unprocessed" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Processed" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "All" })).toBeInTheDocument();
    });

    test("MoonReader card creation hides main filter button group", () => {
        useLocationMock.mockReturnValue({ pathname: "/books/1/chapters/2/annotations" });
        useLoaderDataMock.mockReturnValue({ ...chapterData, sourceCapabilities: moonreaderCapabilities });

        render(
            <MemoryRouter>
                <AnnotationListPage />
            </MemoryRouter>
        );

        expect(screen.queryByRole("button", { name: "Unprocessed" })).not.toBeInTheDocument();
        expect(screen.queryByRole("button", { name: "Processed" })).not.toBeInTheDocument();
        expect(screen.queryByRole("button", { name: "All" })).not.toBeInTheDocument();
    });

    test("MoonReader card creation is processed/category-focused", async () => {
        useLocationMock.mockReturnValue({ pathname: "/books/1/chapters/2/annotations" });
        useLoaderDataMock.mockReturnValue({ ...chapterData, sourceCapabilities: moonreaderCapabilities });

        const { container } = render(
            <MemoryRouter>
                <AnnotationListPage />
            </MemoryRouter>
        );

        expect(screen.getByText("Processed highlight")).toBeInTheDocument();
        expect(screen.queryByText("Unprocessed highlight")).not.toBeInTheDocument();
        expect(screen.queryByText("Filter by color:")).not.toBeInTheDocument();
        expect(container.querySelector(".sr-category-buttons")).toBeInTheDocument();

        await waitFor(() => {
            expect(getNavigationFilter()).toEqual({
                mainFilter: "processed",
                categoryFilter: null,
                colorFilter: null,
            });
        });
    });

    test("MoonReader card creation category filter uses string categories", async () => {
        useLocationMock.mockReturnValue({ pathname: "/books/1/chapters/2/annotations" });
        useLoaderDataMock.mockReturnValue({ ...chapterData, sourceCapabilities: moonreaderCapabilities });

        const { container } = render(
            <MemoryRouter>
                <AnnotationListPage />
            </MemoryRouter>
        );

        const firstCategoryButton = container.querySelector(".sr-category-button") as HTMLElement;
        fireEvent.click(firstCategoryButton);

        await waitFor(() => {
            expect(getNavigationFilter()).toEqual({
                mainFilter: "processed",
                categoryFilter: "insight",
                colorFilter: null,
            });
        });
    });

    test("direct-markdown card creation remains all/no-processing", async () => {
        useLocationMock.mockReturnValue({ pathname: "/books/1/chapters/2/annotations" });
        useLoaderDataMock.mockReturnValue({ ...chapterData, sourceCapabilities: markdownCapabilities });

        const { container } = render(
            <MemoryRouter>
                <AnnotationListPage />
            </MemoryRouter>
        );

        expect(screen.queryByText("Filter by color:")).not.toBeInTheDocument();
        expect(container.querySelector(".sr-category-buttons")).not.toBeInTheDocument();
        expect(screen.getByText("Unprocessed highlight")).toBeInTheDocument();
        expect(screen.getByText("Processed highlight")).toBeInTheDocument();

        await waitFor(() => {
            expect(getNavigationFilter()).toEqual({
                mainFilter: "all",
                categoryFilter: null,
                colorFilter: null,
            });
        });
    });

    test("BUG-001 contract: import flow updates navigation filter in session storage", async () => {
        useLocationMock.mockReturnValue({ pathname: "/import/books/1/chapters/2/annotations" });

        const { container } = render(
            <MemoryRouter>
                <AnnotationListPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(getNavigationFilter()).toEqual({
                mainFilter: "unprocessed",
                categoryFilter: null,
                colorFilter: null,
            });
        });

        fireEvent.click(screen.getByRole("button", { name: "Processed" }));

        await waitFor(() => {
            expect(getNavigationFilter()).toEqual({
                mainFilter: "processed",
                categoryFilter: null,
                colorFilter: null,
            });
        });

        const firstCategoryButton = container.querySelector(".sr-category-button") as HTMLElement;
        fireEvent.click(firstCategoryButton);

        await waitFor(() => {
            expect(getNavigationFilter()).toEqual({
                mainFilter: "processed",
                categoryFilter: "insight",
                colorFilter: null,
            });
        });
    });
});
