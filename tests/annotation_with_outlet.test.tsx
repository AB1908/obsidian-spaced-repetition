import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom'; // Explicit import
import { BrowserRouter } from 'react-router-dom';
import type { annotation } from "src/data/models/annotations";

// Mock react-router-dom hooks
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useLoaderData: jest.fn(),
    useParams: jest.fn(),
    useLocation: jest.fn(),
}));

// Mock obsidian setIcon
jest.mock('obsidian', () => ({
    setIcon: jest.fn(),
}));

// Mock the new API module
jest.mock('src/ui/routes/books/api', () => ({
    getPreviousAnnotationIdForSection: jest.fn(),
    getNextAnnotationIdForSection: jest.fn(),
    // We need to keep the original interface for types to work, but Jest mocks the module content
}));

// Import pathGenerator from its new utility file
import { pathGenerator } from 'src/utils/path-generators';

// Import component under test
import { AnnotationWithOutlet, AnnotationLoaderParams } from '../src/ui/routes/books/annotation-with-outlet';
import { getNextAnnotationIdForSection, getPreviousAnnotationIdForSection } from 'src/ui/routes/books/api';

// Mock data
const mockAnnotation: annotation = {
    id: 'test-annotation-id',
    type: 'text',
    highlight: 'This is the highlighted text.',
    note: 'This is the user\'s personal note about the highlight.',
    flashcardCount: 0,
};

const mockUseLoaderData = require('react-router-dom').useLoaderData;
const mockUseParams = require('react-router-dom').useParams;
const mockUseLocation = require('react-router-dom').useLocation;
const mockGetPreviousAnnotationId = getPreviousAnnotationIdForSection as jest.Mock;
const mockGetNextAnnotationId = getNextAnnotationIdForSection as jest.Mock;

describe('AnnotationWithOutlet', () => {
    let pathGeneratorSpy: jest.SpyInstance;

    beforeEach(() => {
        mockUseLoaderData.mockReturnValue(mockAnnotation);
        mockUseParams.mockReturnValue({
            bookId: 'test-book-id',
            sectionId: 'test-section-id',
            annotationId: 'test-annotation-id',
        } as AnnotationLoaderParams);
        mockUseLocation.mockReturnValue({ pathname: '/test-path' });
        
        mockGetPreviousAnnotationId.mockReturnValue('prev-annotation');
        mockGetNextAnnotationId.mockReturnValue('next-annotation');

        jest.clearAllMocks(); // Clear mocks before each test

        // Spy on the imported pathGenerator function
        pathGeneratorSpy = jest.spyOn(require('src/utils/path-generators'), 'pathGenerator')
            .mockReturnValue('/mocked-path');
    });

    afterEach(() => {
        pathGeneratorSpy.mockRestore();
    });

    test('renders both HighlightBlock and NoteBlock simultaneously', () => {
        render(
            <BrowserRouter>
                <AnnotationWithOutlet />
            </BrowserRouter>
        );

        expect(screen.getByText(mockAnnotation.highlight)).toBeInTheDocument();
        expect(screen.getByText(mockAnnotation.note)).toBeInTheDocument();
        
        // Ensure toggle buttons are NOT present
        expect(screen.queryByRole('button', { name: /Highlight/i })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /Note/i })).not.toBeInTheDocument();
    });

    test('does not render NoteBlock if annotation has no note', () => {
        mockUseLoaderData.mockReturnValue({ ...mockAnnotation, note: '' }); // Override note to be empty
        render(
            <BrowserRouter>
                <AnnotationWithOutlet />
            </BrowserRouter>
        );

        expect(screen.getByText(mockAnnotation.highlight)).toBeInTheDocument();
        expect(screen.queryByText(mockAnnotation.note)).not.toBeInTheDocument();
    });
});

        