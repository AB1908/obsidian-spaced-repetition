import { generateSectionsTree } from "src/data/models/bookTree";
import { maturityCounts } from "src/data/models/flashcard";
import { type SourceType } from "src/data/source-discovery";
import { SourceCapabilities } from "src/data/models/sourceCapabilities";
import { getPluginContext } from "./plugin-context";

export interface frontEndBook {
    counts: {
        annotations: {
            withFlashcards: number;
            withoutFlashcards: number
        };
        flashcards: {
            new: number;
            mature: number;
            learning: number
        }
    };
    name: string;
    id: string;
    canBeReviewed: boolean;
}

export interface NotesWithoutBooks {
    name: string;
    id: string;
    tags: string[];
    sourceType: SourceType;
    requiresSourceMutationConfirmation: boolean;
}

export function getBookById(bookId: string): frontEndBook {
    const plugin = getPluginContext();
    const book = plugin.annotationsNoteIndex.getBook(bookId);
    if (book == null) {
        throw new Error("getBookById: book not found");
    }
    const { annotationsWithFlashcards, annotationsWithoutFlashcards } = book.annotationCoverage();
    return {
        id: book.id,
        name: book.name,
        canBeReviewed: book.canBeReviewed(),
        counts: {
            flashcards: maturityCounts(book.flashcardNote.flashcards || []),
            annotations: {
                withFlashcards: annotationsWithFlashcards.size,
                withoutFlashcards: annotationsWithoutFlashcards.size
            }
        }
    };
}

export function getAnnotationsNoteById(id: string) {
    const plugin = getPluginContext();
    const book = plugin.annotationsNoteIndex.getBook(id);
    if (book == null) {
        throw new Error("getBookById: book not found");
    }
    return {
        id: book.id,
        name: book.name,
    };
}

export function getSectionTreeForBook(bookId: string) {
    const plugin = getPluginContext();
    const book = plugin.annotationsNoteIndex.getBook(bookId);
    const children = generateSectionsTree(book.bookSections);
    return {
        id: book.id,
        name: book.name,
        // done: fix this type casting asap
        children: children,
        counts: {
            flashcards: maturityCounts(book.flashcardNote.flashcards || [])
        }
    };
}

export function getBookChapters(bookId: string) {
    const plugin = getPluginContext();
    const book = plugin.annotationsNoteIndex.getBook(bookId);
    const sections = book.getNavigableSections();

    return sections
        .map(heading => ({
            id: heading.id,
            name: heading.name,
            level: heading.level,
            counts: heading.counts
        }));
}

export function getSourceCapabilities(bookId: string): SourceCapabilities {
    const plugin = getPluginContext();
    const book = plugin.annotationsNoteIndex.getBook(bookId);
    return book.getSourceCapabilities();
}

// todo: expand to also include other notes and not just books
// todo: consider using the tag to fetch here??
export function getSourcesAvailableForDeckCreation(): NotesWithoutBooks[] {
    const plugin = getPluginContext();
    return plugin.annotationsNoteIndex.getSourcesWithoutFlashcards().map(sourceNote => {
        const capabilities = sourceNote.getSourceCapabilities();
        const tags = sourceNote.tags || [];
        return {
            id: sourceNote.id,
            name: sourceNote.name,
            tags,
            sourceType: capabilities.sourceType,
            requiresSourceMutationConfirmation: capabilities.requiresMutationConfirmation,
        };
    });
}

/** @deprecated Use getSourcesAvailableForDeckCreation instead. */
export const getNotesWithoutReview = getSourcesAvailableForDeckCreation;
