import { maturityCounts } from "src/data/models/flashcard";
import { nanoid, customAlphabet } from "nanoid";

const blockId = customAlphabet("0123456789abcdef", 6);

export interface ReviewBook {
    id: string;
    name: string;
    pendingFlashcards: number;
    annotationCoverage: number;
    flashcardProgress: ReturnType<typeof maturityCounts>;
}

export interface FlashCount {
    mature: number;
    new: number;
    learning: number;
}

import { type ReviewResponse } from "./types/CardType";
import { CardType } from "./types/CardType";
import {
    Flashcard,
} from "src/data/models/flashcard";
import { calculateDelayBeforeReview } from "./data/utils/calculateDelayBeforeReview";
import { generateSectionsTree } from "src/data/models/bookTree";
import { BookMetadataSection, findNextHeader, isAnnotation, isHeading, isChapter, Heading, isAnnotationOrParagraph, isParagraph, BookFrontmatter, AnnotationsNote, Source, MoonReaderStrategy } from "src/data/models";
import { ensureFolder, findFilesByExtension, getAllFolders, getFileContents, getMetadataForFile, getParentOrFilename, moveFile, renameFile, createFile, updateFrontmatter, overwriteFile } from "src/infrastructure/disk";
import type SRPlugin from "src/main";
import type { annotation } from "src/data/models/annotations";
import type { FrontendFlashcard } from "src/ui/routes/books/review";
import { paragraph, addBlockIdToParagraph } from "src/data/models/paragraphs";
import { ImportedBook } from "./ui/routes/import/import-export";
import { generateMarkdownWithHeaders } from "src/data/utils/annotationGenerator";
import { ObsidianNotice } from "src/infrastructure/obsidian-facade";
import { getSourceType, hasTag, type SourceType } from "src/data/source-discovery";

let plugin: SRPlugin;
export function setPlugin(p: SRPlugin) {
    plugin = p;
}

// TODO: Cloze cards
// export class ClozeFlashcard extends AbstractFlashcard {
//     // cardMetadata and highlight ID are mutually exclusive properties. Given that there is no constructor overloading
//     // probably should change this to be a union type
//     constructor(parsedCardId: string, clozeText: string, cardMetadata?: FlashcardMetadata, highlightId?: string) {
//         const cardType = CardType.Cloze;
//         if (cardMetadata) {
//             super(cardType, parsedCardId, cardMetadata);
//         } else {
//             super(cardType, parsedCardId, null, highlightId);
//         }
//         // todo: in cloze card, we actually get cardText and need to generate question and answer
//         // todo: add siblings
//     }
// }

// WARN: NOTE THAT THESE ARE ALL USING SHALLOW COPIES!

// TODO: refactor this, not immediately apparent why we need transform
// hint: because you have paragraphs as well
export function getAnnotationById(blockId: string, bookId: string) {
    const book = plugin.annotationsNoteIndex.getBook(bookId);
    return book.getAnnotation(blockId);
}

export function getNextCard(bookId: string) {
    const book = plugin.annotationsNoteIndex.getBook(bookId);
    if (!book.isInReview() && book.canBeReviewed()) {
        book.startReviewing();
        return book.getReviewCard();
    } else if (book.isInReview()) {
        book.nextReviewCard();
        return book.getReviewCard();
    }
}

export async function deleteFlashcard(bookId: string, flashcardId: string) {
    const book = plugin.annotationsNoteIndex.getBook(bookId);

    await book.deleteFlashcard(flashcardId);
}

export function getCurrentCard(bookId: string) {
    const book = plugin.annotationsNoteIndex.getBook(bookId);
    if (!book.isInReview() && book.canBeReviewed()) {
        book.startReviewing();
        return book.getReviewCard();
    } else if (book.isInReview()) {
        return book.getReviewCard();
    }
}

export function getFlashcardById(flashcardId: string, bookId: string): FrontendFlashcard {
    const book = plugin.annotationsNoteIndex.getBook(bookId);
    // todo: what do i do about this? when this function is called, it is guaranteed to be from a source note that
    // already has flashcards
    const flashcard: FrontendFlashcard = book.flashcardNote.flashcards.filter((t: Flashcard) => t.id === flashcardId).map(t => {
        return { ...t, delayBeforeReview: calculateDelayBeforeReview(t.dueDate) };
    })[0] ?? null;
    if (flashcard == null) throw new Error(`getFlashcardById: flashcard not found for id ${flashcardId}`);
    return flashcard;
}

export async function updateFlashcardSchedulingMetadata(
    flashcardId: string,
    bookId: string,
    reviewResponse: ReviewResponse
) {
    const book = plugin.annotationsNoteIndex.getBook(bookId);
    await book.processCardReview(flashcardId, reviewResponse);
    return true;
}

export { addBlockIdToParagraph, isParagraph, isAnnotationOrParagraph };

// TODO: create abstraction
export async function createFlashcardForAnnotation(question: string, answer: string, annotationId: string, bookId: string, cardType: CardType = CardType.MultiLineBasic) {
    const book = plugin.annotationsNoteIndex.getBook(bookId);
    if (cardType == CardType.MultiLineBasic) {
        await book.createFlashcard(annotationId, question, answer, cardType);
    }
    return true;
}

// TODO: create abstraction
export async function updateFlashcardContentsById(flashcardId: string, question: string, answer: string, bookId: string, cardType: CardType = CardType.MultiLineBasic) {
    const book = plugin.annotationsNoteIndex.getBook(bookId);
    return await book.updateFlashcardContents(flashcardId, question, answer, cardType);
}

export async function updateAnnotationMetadata(
    bookId: string,
    annotationId: string,
    updates: Partial<annotation>
) {
    const book = plugin.annotationsNoteIndex.getBook(bookId);
    return await book.updateAnnotation(annotationId, updates);
}

export async function softDeleteAnnotation(bookId: string, annotationId: string) {
    return await updateAnnotationMetadata(bookId, annotationId, { deleted: true });
}

// TODO: create abstraction
export function getAnnotationsForSection(sectionId: string, bookId: string) {
    const book = plugin.annotationsNoteIndex.getBook(bookId);
    const selectedSectionIndex = book.bookSections.findIndex(t => sectionId === t.id);
    const selectedSection = book.bookSections[selectedSectionIndex];
    
    // todo: shouldn't this throw an error since this is an impossible condition to reach?
    if ((!selectedSection) || (!isHeading(selectedSection))) {
        return null;
    }

    const annotations = book.getProcessedAnnotations(sectionId);

    return {
        id: sectionId,
        title: selectedSection.name,
        annotations: annotations
    };
}

export function getFlashcardsForAnnotation(annotationId: string, bookId: string) {
    const book = plugin.annotationsNoteIndex.getBook(bookId);
    return book.flashcardNote.flashcards.filter(t => t.parentId === annotationId);
}

// todo: this needs to become flashcard decks for review based on flashcardindex
export function getSourcesForReview(): ReviewBook[] {
    const booksToReview = plugin.annotationsNoteIndex.getSourcesForReview();
    return booksToReview.map(t => t.getReviewStats());
}

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

export function resetBookReviewState(bookId: string) {
    const book = plugin.annotationsNoteIndex.getBook(bookId);
    book.resetReview();
}

export function getBookById(bookId: string): frontEndBook {
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
    const book = plugin.annotationsNoteIndex.getBook(bookId);
    const chapterSections = book.bookSections.filter((section): section is Heading => isChapter(section));
    const hasMoonReaderFrontmatter = !!book.getBookFrontmatter();
    const isDirectClipping = hasTag(book.tags || [], "clippings") && !hasMoonReaderFrontmatter;

    const sections = chapterSections.length === 0 && isDirectClipping
        ? book.bookSections.filter((section): section is Heading => isHeading(section))
        : chapterSections;

    return sections
        .map(heading => ({
            id: heading.id,
            name: heading.name,
            level: heading.level,
            counts: heading.counts
        }));
}

// TODO(DEBT-008): follow up on naming/typing for this DTO (e.g. rename away from NotesWithoutBooks).
export interface NotesWithoutBooks {
    name: string;
    id: string;
    tags: string[];
    sourceType: SourceType;
    requiresSourceMutationConfirmation: boolean;
}

function requiresSourceMutationConfirmation(tags: string[] = [], hasMoonReaderFrontmatter: boolean): boolean {
    return hasTag(tags, "clippings") && !hasMoonReaderFrontmatter;
}

// todo: expand to also include other notes and not just books
// todo: consider using the tag to fetch here??
export function getSourcesAvailableForDeckCreation(): NotesWithoutBooks[] {
    return plugin.annotationsNoteIndex.getSourcesWithoutFlashcards().map(sourceNote => {
        const hasMoonReaderFrontmatter = !!sourceNote.getBookFrontmatter();
        const tags = sourceNote.tags || [];
        return {
            id: sourceNote.id,
            name: sourceNote.name,
            tags,
            sourceType: getSourceType(tags, hasMoonReaderFrontmatter),
            requiresSourceMutationConfirmation: requiresSourceMutationConfirmation(tags, hasMoonReaderFrontmatter),
        };
    });
}

/** @deprecated Use getSourcesAvailableForDeckCreation instead. */
export const getNotesWithoutReview = getSourcesAvailableForDeckCreation;

async function addBlockIdsToParagraphs(path: string) {
    const metadata = getMetadataForFile(path);
    const paragraphSections = metadata?.sections?.filter(section => section.type === "paragraph");
    if (!paragraphSections?.length) return;

    const lines = (await getFileContents(path)).split("\n");
    let updated = false;

    for (const section of paragraphSections) {
        if (section.id) continue;
        const endLine = section.position.end.line;
        lines[endLine] = `${lines[endLine]} ^${blockId()}`;
        updated = true;
    }

    if (updated) {
        await overwriteFile(path, lines.join("\n"));
    }
}

async function ensureDirectMarkdownSourceInOwnFolder(sourcePath: string): Promise<string> {
    const pathParts = sourcePath.split("/");
    const fileName = pathParts[pathParts.length - 1];
    const parentPath = pathParts.length > 1 ? pathParts.slice(0, -1).join("/") : "";
    const baseName = fileName.replace(/\.md$/i, "");
    const ownFolderPath = parentPath ? `${parentPath}/${baseName}` : baseName;
    const targetPath = `${ownFolderPath}/${fileName}`;

    if (sourcePath === targetPath) return sourcePath;

    await ensureFolder(ownFolderPath);
    await moveFile(sourcePath, targetPath);
    return targetPath;
}

export async function createFlashcardNoteForAnnotationsNote(bookId: string, opts?: { confirmedSourceMutation?: boolean }) {
    const book = plugin.annotationsNoteIndex.getBook(bookId);
    const hasMoonReaderFrontmatter = !!book.getBookFrontmatter();
    const sourceRequiresMutationConfirmation = requiresSourceMutationConfirmation(book.tags || [], hasMoonReaderFrontmatter);

    if (sourceRequiresMutationConfirmation) {
        if (!opts?.confirmedSourceMutation) {
            throw new Error("createFlashcardNoteForAnnotationsNote: source mutation confirmation required for clipping source");
        }

        const oldPath = book.path;
        await addBlockIdsToParagraphs(oldPath);
        const newPath = await ensureDirectMarkdownSourceInOwnFolder(oldPath);

        if (newPath !== oldPath) {
            const tags = plugin.fileTagsMap.get(oldPath) || book.tags || [];
            plugin.fileTagsMap.delete(oldPath);
            plugin.fileTagsMap.set(newPath, tags);
            book.path = newPath;
            book.name = getParentOrFilename(newPath);
        }
    }

    await book.createFlashcardNote();
    // todo: there is an edge case here where multiple clicks to add to multiple
    // index writes
    plugin.flashcardIndex.addFlashcardNoteToIndex(book.flashcardNote);
}

export function getBreadcrumbData(bookId: string, sectionId?: string) {
    const book = plugin.annotationsNoteIndex.getBook(bookId);
    let sectionName: string | undefined;

    if (sectionId) {
        const chapter = book.bookSections.find(
            (section) => "id" in section && section.id === sectionId
        );
        if (chapter && "name" in chapter && (chapter as any).level != undefined) {
            sectionName = chapter.name;
        }
    }

        return {
            bookName: book.name,
            sectionName
        };
    }

export async function getImportedBooks(): Promise<ImportedBook[]> {
    const sourceNotes = plugin.annotationsNoteIndex.getAllAnnotationsNotes();
    const books: ImportedBook[] = [];

    for (const sourceNote of sourceNotes) {
        const frontmatter = sourceNote.getBookFrontmatter();
        if (frontmatter) {
            books.push({
                id: sourceNote.id,
                name: sourceNote.name,
                path: sourceNote.path});
        }
    }

    return books;
}

export function getImportableExports() {
    return findFilesByExtension("mrexpt");
}

export function getDestinationFolders() {
    return getAllFolders();
}

// todo: refactor and move disk related logic to appropriate layer
// also move business logic to appropriate class
export async function updateBookAnnotationsAndFrontmatter(
    annotationsPath: string,
    mrexptPath: string,
    sinceId: string
) {
    let book = plugin.annotationsNoteIndex.getAllAnnotationsNotes().find(b => b.path === annotationsPath);
    if (!book) {
        // Instantiate a temporary AnnotationsNote if not found in index (e.g. might be a new import or filtered out)
        book = new AnnotationsNote(annotationsPath, plugin);
    }
    
    const strategy = new MoonReaderStrategy(mrexptPath);
    const newAnnotations = await strategy.sync(sinceId);

    if (newAnnotations.length === 0) {
        new ObsidianNotice("No new annotations found.");
        return;
    }

    // Append new annotations markdown to the file
    const newAnnotationsMarkdown = generateMarkdownWithHeaders(newAnnotations);
    const tfile = getTFileForPath(annotationsPath);
    // @ts-ignore
    await app.vault.append(tfile, '\n' + newAnnotationsMarkdown); // Add a newline before appending

    // Find the new highest ID among all annotations
    const allAnnotations = await strategy.extract();
    const newLastExportedID = Math.max(...allAnnotations.map(ann => parseInt(ann.id, 10)));

    // Update frontmatter values using the new disk utility
    await updateFrontmatter(annotationsPath, {
        lastExportedTimestamp: Date.now(),
        lastExportedID: newLastExportedID,
    });

    new ObsidianNotice(`Updated ${newAnnotations.length} new annotations.`);
}



export interface NavigationFilter {
    mainFilter?: "all" | "processed" | "unprocessed";
    categoryFilter?: number | null;
    colorFilter?: string | null;
}

function matchesNavigationFilter(ann: annotation | paragraph, filter?: NavigationFilter) {
    if (ann.deleted) return false;
    if (!filter) return true;

    const mainFilter = filter.mainFilter ?? "all";
    const category = ann.category;
    const isProcessed = category !== undefined && category !== null;

    if (mainFilter === "processed") {
        if (filter.categoryFilter !== undefined && filter.categoryFilter !== null) {
            return category === filter.categoryFilter;
        }
        return isProcessed;
    }

    if (mainFilter === "unprocessed") {
        if (isProcessed) return false;
        if (filter.colorFilter) {
            return ann.originalColor === filter.colorFilter;
        }
        return true;
    }

    return true;
}

export function getPreviousAnnotationId(
    bookId: string,
    blockId: string,
    sectionId?: string,
    filter?: NavigationFilter
) {
    const book = plugin.annotationsNoteIndex.getBook(bookId);
    const index = book.bookSections.findIndex(t => t.id === blockId);
    if (index === -1) return null;

    for (let i = index - 1; i >= 0; i--) {
        const item = book.bookSections[i];
        if (isHeading(item)) {
            if (sectionId) return null;
            continue;
        }
        if (isAnnotationOrParagraph(item)) {
            const ann = item as (annotation | paragraph);
            if (!matchesNavigationFilter(ann, filter)) continue;
            return ann.id;
        }
    }
    return null;
}

export function getNextAnnotationId(
    bookId: string,
    blockId: string,
    sectionId?: string,
    filter?: NavigationFilter
) {
    const book = plugin.annotationsNoteIndex.getBook(bookId);
    const index = book.bookSections.findIndex(t => t.id === blockId);
    if (index === -1) return null;

    for (let i = index + 1; i < book.bookSections.length; i++) {
        const item = book.bookSections[i];
        if (isHeading(item)) {
            if (sectionId) return null;
            continue;
        }
        if (isAnnotationOrParagraph(item)) {
            const ann = item as (annotation | paragraph);
            if (!matchesNavigationFilter(ann, filter)) continue;
            return ann.id;
        }
    }
    return null;
}

export async function getUnimportedMrExptFiles(): Promise<string[]> {
    const allMrExptFiles = findFilesByExtension("mrexpt");
    const importedBooks = await getImportedBooks();
    const importedPaths = new Set(importedBooks.map(b => b.path));
    return allMrExptFiles.filter(f => !importedPaths.has(f));
}

export async function importMoonReaderExport(mrexptPath: string, destinationFolder: string) {
    const strategy = new MoonReaderStrategy(mrexptPath);
    const annotations = await strategy.extract();

    if (annotations.length === 0) {
        throw new Error("No annotations found in the export file.");
    }

    const lastExportedID = Math.max(...annotations.map(ann => parseInt(ann.id, 10)));

    const fileName = mrexptPath.split("/").pop();
    const newMrexptPath = `${destinationFolder}/${fileName}`;
    await moveFile(mrexptPath, newMrexptPath);
    const annotationsPath = `${destinationFolder}/Annotations.md`;
    // @ts-ignore
    const existingFile = app.vault.getAbstractFileByPath(annotationsPath);
    if (existingFile) {
        await renameFile(annotationsPath, "Annotations_old.md");
    }

    const bookTitle = annotations.find(ann => ann.title)?.title || "Unknown Book";

    const frontmatter = `---
path: "${newMrexptPath}"
title: "${bookTitle}"
author: ""
lastExportedTimestamp: ${Date.now()}
lastExportedID: ${lastExportedID}
tags:
  - "review/book"
---
`;

    const markdown = generateMarkdownWithHeaders(annotations);
    await createFile(annotationsPath, frontmatter + markdown);

    return annotationsPath;
}
