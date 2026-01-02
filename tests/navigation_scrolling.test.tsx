import React from "react";
import { render } from "@testing-library/react";
import { FlashcardHighlights as AnnotationList, SectionAnnotations } from "../src/ui/routes/flashcard-highlights";
import { AnnotationWithOutlet } from "../src/ui/routes/books/annotation-with-outlet";
import { annotation } from "../src/data/models/annotations";
import { MemoryRouter, Route, Routes } from "react-router-dom";

// Mock scrollIntoView
const mockScrollIntoView = jest.fn();
window.HTMLElement.prototype.scrollIntoView = mockScrollIntoView;

// Mock API and Loaders
jest.mock("../src/api", () => ({
    getAnnotationById: jest.fn(),
    getAnnotationsForSection: jest.fn(),
}));

// Mock useLoaderData since we are rendering components directly
jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useLoaderData: jest.fn(),
    useRouteLoaderData: jest.fn(),
    useParams: jest.fn().mockReturnValue({}),
}));

describe("Scroll State Logic", () => {
    beforeEach(() => {
        mockScrollIntoView.mockClear();
        sessionStorage.clear();
        jest.clearAllMocks();
    });

    test("AnnotationWithOutlet saves ID to sessionStorage on mount", () => {
        const mockAnnotation = { 
            id: "123", 
            highlight: "text", 
            note: "note" 
        } as annotation;

        // Mock hook return values
        const rr = require("react-router-dom");
        rr.useLoaderData.mockReturnValue(mockAnnotation);
        rr.useRouteLoaderData.mockReturnValue({ annotations: [] }); // mocking parent data

        render(
            <MemoryRouter>
                <AnnotationWithOutlet />
            </MemoryRouter>
        );

        expect(sessionStorage.getItem('scrollToAnnotation')).toBe("123");
    });

    test("AnnotationList reads ID from sessionStorage and scrolls", () => {
        const mockData: SectionAnnotations = {
            id: "sec1",
            title: "Title",
            annotations: [
                { id: "A", highlight: "H1", note: "", type: "text", flashcardCount: 0 },
                { id: "B", highlight: "H2", note: "", type: "text", flashcardCount: 0 }
            ]
        };

        // Setup storage state
        sessionStorage.setItem('scrollToAnnotation', 'B');

        // Mock hook return values
        const rr = require("react-router-dom");
        rr.useLoaderData.mockReturnValue(mockData);

        render(
            <MemoryRouter>
                <AnnotationList />
            </MemoryRouter>
        );

        // Verify scrollIntoView was called
        // Note: We need to ensure the element exists in the DOM for getElementById to work.
        // render() puts it in the container.
        const element = document.getElementById("B");
        expect(element).not.toBeNull();
        expect(mockScrollIntoView).toHaveBeenCalled();
        expect(sessionStorage.getItem('scrollToAnnotation')).toBeNull(); // Should be cleared
    });
});
