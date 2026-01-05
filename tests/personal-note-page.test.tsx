import React from 'react';
import { render, screen } from '@testing-library/react';
import { PersonalNotePage } from 'src/ui/routes/import/personal-note';
import { getAnnotationById, updateAnnotationMetadata, softDeleteAnnotation } from 'src/api';
import { setIcon } from 'obsidian'; // Import the mocked setIcon function
import '@testing-library/jest-dom';

const mockUseLoaderData = jest.fn();
const mockUseNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
    useLoaderData: () => mockUseLoaderData(),
    useNavigate: () => mockUseNavigate,
    useParams: () => ({ bookId: 'book-1', annotationId: '123' }),
}));

jest.mock('src/api', () => ({
    getAnnotationById: jest.fn(),
    updateAnnotationMetadata: jest.fn(),
    softDeleteAnnotation: jest.fn(),
    getAnnotationsForSection: jest.fn(),
    getPreviousAnnotationId: jest.fn(),
    getNextAnnotationId: jest.fn()
}));

jest.mock('obsidian', () => ({
    setIcon: jest.fn(),
}));

const mockAnnotation = {
    id: '123',
    highlight: 'This is a highlight.',
    note: 'This is a note.',
    originalColor: '-256', // Yellow
    personalNote: '',
    category: null,
};

describe('PersonalNotePage', () => {
    beforeEach(() => {
        // Reset mocks before each test
        mockUseLoaderData.mockClear();
        mockUseNavigate.mockClear();
        (getAnnotationById as jest.Mock).mockClear();
        (updateAnnotationMetadata as jest.Mock).mockClear();
        (softDeleteAnnotation as jest.Mock).mockClear();
        (setIcon as jest.Mock).mockClear();
    });

    it('should display the highlight color swatch when originalColor is present', async () => {
        mockUseLoaderData.mockReturnValue({ annotation: mockAnnotation, bookId: 'book-1' });

        render(<PersonalNotePage />);

        // Check for the presence of the main heading to ensure component is rendered
        await screen.findByText('Edit Personal Note');

        const colorSwatch = screen.getByTitle('Original highlight color: #FFFF00FF');
        expect(colorSwatch).toBeInTheDocument();
        expect(colorSwatch).toHaveStyle('background-color: rgba(255, 255, 0, 1)');
    });

    it('should not display the color swatch if originalColor is not present', async () => {
        const annotationWithoutColor = { ...mockAnnotation, originalColor: undefined };
        mockUseLoaderData.mockReturnValue({ annotation: annotationWithoutColor, bookId: 'book-1' });

        render(<PersonalNotePage />);

        // Check for the presence of the main heading to ensure component is rendered
        await screen.findByText('Edit Personal Note');

        const colorSwatch = screen.queryByTitle(/Original highlight color/);
        expect(colorSwatch).not.toBeInTheDocument();
    });

    it('should render HighlightBlock and NoteBlock with correct text', async () => {
        mockUseLoaderData.mockReturnValue({ annotation: mockAnnotation, bookId: 'book-1' });

        render(<PersonalNotePage />);

        expect(screen.getByText(mockAnnotation.highlight)).toBeInTheDocument();
        expect(screen.getByText(mockAnnotation.note)).toBeInTheDocument();
    });
});
