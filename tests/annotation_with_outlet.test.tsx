import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom'; // Explicit import
import { BrowserRouter } from 'react-router-dom';
import type { annotation } from "src/data/models/annotations";
import type { SectionAnnotations } from "src/routes/highlights";

// Mock react-router-dom hooks
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useLoaderData: jest.fn(),
    useRouteLoaderData: jest.fn(),
    useParams: jest.fn(),
    useLocation: jest.fn(),
}));

// Mock obsidian setIcon
jest.mock('obsidian', () => ({
    setIcon: jest.fn(),
}));

// Import pathGenerator from its new utility file
import { pathGenerator } from 'src/utils/path-generators';

// Import component under test
import { AnnotationWithOutlet, AnnotationLoaderParams } from '../src/routes/annotation-with-outlet';

// Mock data
const mockAnnotation: annotation = {
    id: 'test-annotation-id',
    type: 'text',
    highlight: 'This is the highlighted text.',
    note: 'This is the user\'s personal note about the highlight.',
    flashcardCount: 0,
};

const mockAnnotationsList: SectionAnnotations = {
    id: 'test-section-id',
    title: 'Test Section',
    annotations: [
        { id: 'prev-annotation', type: 'text', highlight: 'prev', note: 'prev note', flashcardCount: 0 },
        mockAnnotation,
        { id: 'next-annotation', type: 'text', highlight: 'next', note: 'next note', flashcardCount: 0 },
    ],
};

const mockUseLoaderData = require('react-router-dom').useLoaderData;
const mockUseRouteLoaderData = require('react-router-dom').useRouteLoaderData;
const mockUseParams = require('react-router-dom').useParams;
const mockUseLocation = require('react-router-dom').useLocation;

describe('AnnotationWithOutlet', () => {
    let pathGeneratorSpy: jest.SpyInstance;

    beforeEach(() => {
        mockUseLoaderData.mockReturnValue(mockAnnotation);
        mockUseRouteLoaderData.mockReturnValue(mockAnnotationsList);
        mockUseParams.mockReturnValue({
            bookId: 'test-book-id',
            sectionId: 'test-section-id',
            annotationId: 'test-annotation-id',
        } as AnnotationLoaderParams);
        mockUseLocation.mockReturnValue({ pathname: '/test-path' });
        jest.clearAllMocks(); // Clear mocks before each test

        // Spy on the imported pathGenerator function
        pathGeneratorSpy = jest.spyOn(require('src/utils/path-generators'), 'pathGenerator')
            .mockReturnValue('/mocked-path');
    });

    afterEach(() => {
        pathGeneratorSpy.mockRestore();
    });

    test('renders HighlightBlock by default', () => {
        render(
            <BrowserRouter>
                <AnnotationWithOutlet />
            </BrowserRouter>
        );

        expect(screen.getByText(mockAnnotation.highlight)).toBeInTheDocument();
        expect(screen.queryByText(mockAnnotation.note)).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Highlight/i })).toHaveAttribute('aria-pressed', 'true');
        expect(screen.getByRole('button', { name: /Note/i })).toHaveAttribute('aria-pressed', 'false');
    });

    test('switches to NoteBlock when Note button is clicked', () => {
        render(
            <BrowserRouter>
                <AnnotationWithOutlet />
            </BrowserRouter>
        );

        // Click the 'Note' button
        fireEvent.click(screen.getByRole('button', { name: /Note/i }));

        expect(screen.getByText(mockAnnotation.note)).toBeInTheDocument();
        expect(screen.queryByText(mockAnnotation.highlight)).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Highlight/i })).toHaveAttribute('aria-pressed', 'false');
        expect(screen.getByRole('button', { name: /Note/i })).toHaveAttribute('aria-pressed', 'true');
    });

    test('switches back to HighlightBlock when Highlight button is clicked', () => {
        render(
            <BrowserRouter>
                <AnnotationWithOutlet />
            </BrowserRouter>
        );

        // Switch to Note first
        fireEvent.click(screen.getByRole('button', { name: /Note/i }));
        // Then switch back to Highlight
        fireEvent.click(screen.getByRole('button', { name: /Highlight/i }));

        expect(screen.getByText(mockAnnotation.highlight)).toBeInTheDocument();
        expect(screen.queryByText(mockAnnotation.note)).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Highlight/i })).toHaveAttribute('aria-pressed', 'true');
        expect(screen.getByRole('button', { name: /Note/i })).toHaveAttribute('aria-pressed', 'false');
    });

    test('does not render NoteBlock if annotation has no note', () => {
        mockUseLoaderData.mockReturnValue({ ...mockAnnotation, note: '' }); // Override note to be empty
        render(
            <BrowserRouter>
                <AnnotationWithOutlet />
            </BrowserRouter>
        );

        fireEvent.click(screen.getByRole('button', { name: /Note/i }));

        expect(screen.queryByText(mockAnnotation.note)).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Highlight/i })).toHaveAttribute('aria-pressed', 'false');
        expect(screen.getByRole('button', { name: /Note/i })).toHaveAttribute('aria-pressed', 'true'); // Still pressed, but content is empty
    });
});