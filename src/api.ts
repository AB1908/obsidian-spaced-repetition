import { maturityCounts } from "src/data/models/flashcard";

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

export interface BookFrontmatter {
    id: string; // The ID of the SourceNote object (nanoid generated)
    path: string; // Path to the .mrexpt file
    annotationsPath: string; // Path to the Annotations.md file
    title: string;
    author: string;
    lastExportedTimestamp: number;
    lastExportedID: number;
    tags: string[];
}
import { type ReviewResponse } from "./scheduler/CardType";
import { CardType } from "./scheduler/CardType";
import {
    Flashcard,
} from "src/data/models/flashcard";
import { calculateDelayBeforeReview } from "./data/models/calculateDelayBeforeReview";
import { generateSectionsTree } from "src/data/models/bookTree";
import { BookMetadataSection, findNextHeader, isAnnotation, isHeading, isChapter, Heading } from "src/data/models/sourceNote";
import { cardTextGenerator, generateCardAsStorageFormat } from "src/data/utils/TextGenerator";
import { updateCardOnDisk, findFilesByExtension, getAllFolders, createFile, getFileContents, getMetadataForFile, updateFrontmatter, getTFileForPath, moveFile, renameFile } from "src/infrastructure/disk";
import type SRPlugin from "src/main";
import type { annotation } from "src/data/models/annotations";
import type { FrontendFlashcard } from "src/routes/review";
import { paragraph } from "src/data/models/paragraphs";
import { parseMoonReaderExport } from "./data/import/moonreader";
import { generateAnnotationMarkdown, generateMarkdownWithHeaders } from "./data/utils/annotationGenerator";
import { ObsidianNotice } from "src/obsidian-facade";

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
    const book = plugin.sourceNoteIndex.getBook(bookId);
    return transform(book.annotations().filter((t: BookMetadataSection) => t.id === blockId)[0]);
}

export function getNextCard(bookId: string) {
    const book = plugin.sourceNoteIndex.getBook(bookId);
    if (!book.isInReview() && book.canBeReviewed()) {
        book.startReviewing();
        return book.getReviewCard();
    } else if (book.isInReview()) {
        book.nextReviewCard();
        return book.getReviewCard();
    }
}

export async function deleteFlashcard(bookId: string, flashcardId: string) {
    const book = plugin.sourceNoteIndex.getBook(bookId);

    await book.deleteFlashcard(flashcardId);
}

export function getCurrentCard(bookId: string) {
    const book = plugin.sourceNoteIndex.getBook(bookId);
    if (!book.isInReview() && book.canBeReviewed()) {
        book.startReviewing();
        return book.getReviewCard();
    } else if (book.isInReview()) {
        return book.getReviewCard();
    }
}

export function getFlashcardById(flashcardId: string, bookId: string): FrontendFlashcard {
    const book = plugin.sourceNoteIndex.getBook(bookId);
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
    const book = plugin.sourceNoteIndex.getBook(bookId);
    await book.processCardReview(flashcardId, reviewResponse);
    return true;
}

export function addBlockIdToParagraph(block: paragraph) {
    return `${block.text} ^${block.id}`;
}


// TODO: create abstraction
export async function createFlashcardForAnnotation(question: string, answer: string, annotationId: string, bookId: string, cardType: CardType = CardType.MultiLineBasic) {
    const book = plugin.sourceNoteIndex.getBook(bookId);
    if (cardType == CardType.MultiLineBasic) {
        await book.createFlashcard(annotationId, question, answer, cardType);
    }
    return true;
}

// TODO: create abstraction
export async function updateFlashcardContentsById(flashcardId: string, question: string, answer: string, bookId: string, cardType: CardType = CardType.MultiLineBasic) {
    const book = plugin.sourceNoteIndex.getBook(bookId);
    if (cardType == CardType.MultiLineBasic) {
        // TODO: Fix hardcoded path, should come from deckNote obj
        // TODO: error handling
        // todo: refactor
        let flashcardCopy: Flashcard;
        book.flashcardNote.flashcards.forEach((t,i) => {
            if (t.id === flashcardId) {
                flashcardCopy = t;
            }
        });
        const parsedCardCopy = book.flashcardNote.parsedCards.filter(t => t.id === flashcardCopy.parsedCardId)[0];
        const originalCardAsStorageFormat = generateCardAsStorageFormat(parsedCardCopy);
        parsedCardCopy.cardText = cardTextGenerator(question, answer, cardType);

        const updatedCardAsStorageFormat = generateCardAsStorageFormat(parsedCardCopy);
        await updateCardOnDisk(parsedCardCopy.notePath, originalCardAsStorageFormat, updatedCardAsStorageFormat);
        book.flashcardNote.parsedCards.forEach((value, index) => {
            if (value.id === parsedCardCopy.id) {
                book.flashcardNote.parsedCards[index] = parsedCardCopy;
            }
        });
        book.flashcardNote.flashcards.forEach((t, i) => {
            if (t.id === flashcardId) {
                flashcardCopy.questionText = question;
                flashcardCopy.answerText = answer;
                book.flashcardNote.flashcards[i] = flashcardCopy;
            }
        });
    }
    return true;
}

export async function updateAnnotationMetadata(
    bookId: string,
    annotationId: string,
    updates: Partial<annotation>
) {
    const book = plugin.sourceNoteIndex.getBook(bookId);
    return await book.updateAnnotation(annotationId, updates);
}

export async function softDeleteAnnotation(bookId: string, annotationId: string) {
    return await updateAnnotationMetadata(bookId, annotationId, { deleted: true });
}

export function isParagraph(section: BookMetadataSection): section is paragraph {
    return (section as paragraph).wasIdPresent !== undefined;
}

export function isAnnotationOrParagraph(section: BookMetadataSection): section is (annotation|paragraph) {
    return isAnnotation(section) || isParagraph(section);
}

function transform(p: paragraph|annotation): annotation {
    if (isAnnotation(p)) {
        return p;
    } else {
        return {
            id: p.id,
            type: "",
            note: "",
            highlight: p.text,
            hasFlashcards: p.hasFlashcards
        };
    }
}

// TODO: create abstraction
export function getAnnotationsForSection(sectionId: string, bookId: string) {
    const book = plugin.sourceNoteIndex.getBook(bookId);
    const selectedSectionIndex = book.bookSections.findIndex(t => sectionId === t.id);
    const selectedSection = book.bookSections[selectedSectionIndex];
    // todo: shouldn't this throw an error since this is an impossible condition to reach?
    if ((!selectedSection) || (!isHeading(selectedSection))) {
        return null;
    }
    let nextHeadingIndex = findNextHeader(selectedSection, book.bookSections);
    // todo: write a test for this
    if (nextHeadingIndex == -1) {
        // if no next heading, we want to extract till end of file
        nextHeadingIndex = book.bookSections.length;
    }
    // todo: refactor to unify isAnnotationOrParagraph usage
    let annotations = book.bookSections
        .slice(selectedSectionIndex, nextHeadingIndex)
        .filter((t): t is (annotation|paragraph) => isAnnotationOrParagraph(t));

    // WTF is this???
    const flashcardCountForAnnotation: Record<string, number> = {};
    for (const id of book.flashcardNote.flashcards.map(t => t.parentId)) {
        flashcardCountForAnnotation[id] = flashcardCountForAnnotation[id] ? flashcardCountForAnnotation[id] + 1 : 1;
    }

    annotations = annotations.map(t => {
        return {
            ...transform(t),
            flashcardCount: flashcardCountForAnnotation[t.id] || 0
        };
    }).filter(t => !t.deleted);

    return {
        id: sectionId,
        title: selectedSection.name,
        annotations: annotations
    };
}

export function getFlashcardsForAnnotation(annotationId: string, bookId: string) {
    const book = plugin.sourceNoteIndex.getBook(bookId);
    return book.flashcardNote.flashcards.filter(t => t.parentId === annotationId);
}

// todo: this needs to become flashcard decks for review based on flashcardindex
export function getSourcesForReview(): ReviewBook[] {
    // todo: refactor
    const booksToReview = plugin.sourceNoteIndex.getSourcesForReview();
    return booksToReview.map(t => {
        t.resetReview();
        const {annotationsWithFlashcards, annotationsWithoutFlashcards} = t.annotationCoverage();
        const annotationsWithFlashcardsCount = annotationsWithFlashcards.size;
        const annotationsWithoutFlashcardsCount = annotationsWithoutFlashcards.size;
        const progress = maturityCounts(t.flashcardNote.flashcards || []);
        let annotationCoverage = annotationsWithFlashcardsCount/(annotationsWithFlashcardsCount+annotationsWithoutFlashcardsCount);
        return {
            id: t.id,
            name: t.name,
            pendingFlashcards: t.reviewDeck.length,
            annotationCoverage: annotationCoverage,
            flashcardProgress: progress
        };
    });
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
    const book = plugin.sourceNoteIndex.getBook(bookId);
    book.resetReview();
}

export function getBookById(bookId: string): frontEndBook {
    const book = plugin.sourceNoteIndex.getBook(bookId);
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

export function getSectionTreeForBook(bookId: string) {
    const book = plugin.sourceNoteIndex.getBook(bookId);
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
    const book = plugin.sourceNoteIndex.getBook(bookId);
    return book.bookSections
        .filter((section): section is Heading => isChapter(section))
        .map(heading => ({
            id: heading.id,
            name: heading.name,
            level: heading.level,
            counts: heading.counts
        }));
}

export interface NotesWithoutBooks {
    name: string;
    id: string;
}

// todo: expand to also include other notes and not just books
// todo: consider using the tag to fetch here??
export function getNotesWithoutReview(): NotesWithoutBooks[] {
    return plugin.sourceNoteIndex.getSourcesWithoutFlashcards();
}

export async function createFlashcardNoteForSourceNote(bookId: string) {
    const book = plugin.sourceNoteIndex.getBook(bookId);
    await book.createFlashcardNote();
    // todo: there is an edge case here where multiple clicks to add to multiple
    // index writes
    plugin.flashcardIndex.addFlashcardNoteToIndex(book.flashcardNote);
}

export function getBreadcrumbData(bookId: string, sectionId?: string) {
    const book = plugin.sourceNoteIndex.getBook(bookId);
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

export async function getImportedBooks(): Promise<BookFrontmatter[]> {
    const sourceNotes = plugin.sourceNoteIndex.getAllSourceNotes();
    const books: BookFrontmatter[] = [];

    for (const sourceNote of sourceNotes) {
        try {
            const metadata = getMetadataForFile(sourceNote.path);
            const frontmatter = metadata?.frontmatter;

            if (frontmatter) {
                if (
                    frontmatter.path &&
                    frontmatter.title &&
                    frontmatter.lastExportedTimestamp !== undefined &&
                    frontmatter.lastExportedID !== undefined
                ) {
                    books.push({
                        id: sourceNote.id, // Assign SourceNote's ID
                        path: frontmatter.path, // This is the mrexpt path
                        annotationsPath: sourceNote.path, // This is the Annotations.md path
                        title: frontmatter.title,
                        author: frontmatter.author || "",
                        lastExportedTimestamp: frontmatter.lastExportedTimestamp,
                        lastExportedID: frontmatter.lastExportedID,
                        tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
                    });
                } else {
                    console.warn(`Skipping malformed frontmatter in ${sourceNote.path}`);
                }
            }
        } catch (e) {
            console.error(`Error processing source note ${sourceNote.path}:`, e);
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
    const mrexptContent = await getFileContents(mrexptPath);
    const newAnnotations = parseMoonReaderExport(mrexptContent, sinceId);

    if (newAnnotations.length === 0) {
        new ObsidianNotice("No new annotations found.");
        return;
    }

    // Append new annotations markdown to the file
    const newAnnotationsMarkdown = generateMarkdownWithHeaders(newAnnotations);
    const tfile = getTFileForPath(annotationsPath);
    await app.vault.append(tfile, '\n' + newAnnotationsMarkdown); // Add a newline before appending

    // Find the new highest ID among all annotations
    const allAnnotations = parseMoonReaderExport(mrexptContent);
    const newLastExportedID = Math.max(...allAnnotations.map(ann => parseInt(ann.id, 10)));

    // Update frontmatter values using the new disk utility
    await updateFrontmatter(annotationsPath, {
        lastExportedTimestamp: Date.now(),
        lastExportedID: newLastExportedID,
    });

    new ObsidianNotice(`Updated ${newAnnotations.length} new annotations.`);
}



export async function getUnimportedMrExptFiles(): Promise<string[]> {
    const allMrExptFiles = findFilesByExtension("mrexpt");
    const importedBooks = await getImportedBooks();
    const importedPaths = new Set(importedBooks.map(b => b.path));
    return allMrExptFiles.filter(f => !importedPaths.has(f));
}

export async function importMoonReaderExport(mrexptPath: string, destinationFolder: string) {
    const content = await getFileContents(mrexptPath);
    const annotations = parseMoonReaderExport(content);

    if (annotations.length === 0) {
        throw new Error("No annotations found in the export file.");
    }

    const lastExportedID = Math.max(...annotations.map(ann => parseInt(ann.id, 10)));

    const fileName = mrexptPath.split("/").pop();
    const newMrexptPath = `${destinationFolder}/${fileName}`;
    await moveFile(mrexptPath, newMrexptPath);
    const annotationsPath = `${destinationFolder}/Annotations.md`;
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