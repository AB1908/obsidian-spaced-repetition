import { getFileContents, getMetadataForFile } from "src/infrastructure/disk";
import type { AnnotationsNoteDependencies } from "src/data/utils/dependencies";
import type { FlashcardSourceStrategy } from "../FlashcardSourceStrategy";
import type { BookMetadataSections } from "../sections/types";
import { bookSections } from "../sections/book-sections";
import { detectDriftedSections } from "./drift-detection";
import { shuffledReviewDeck } from "./review-deck";
import { readBookFrontmatter } from "./frontmatter";
import { resolveSourceDisplayName } from "./source-name";
import { resolveSourceStrategy } from "./source-strategy";
import type { Flashcard, FlashcardNote } from "src/data/models/flashcard";

export interface InitializedSourceState {
    flashcardNote: FlashcardNote | null;
    bookSections: BookMetadataSections;
    name: string;
    tags: string[];
    strategy: FlashcardSourceStrategy;
    reviewDeck: Flashcard[];
}

export async function initializeSourceState(
    sourcePath: string,
    sourceId: string,
    plugin: AnnotationsNoteDependencies
): Promise<InitializedSourceState> {
    const flashcardNote = plugin.flashcardIndex.flashcardNotes.filter(t => t.parentPath === sourcePath)[0] || null;

    const sections = bookSections(
        getMetadataForFile(sourcePath),
        await getFileContents(sourcePath),
        flashcardNote?.flashcards || [],
        plugin
    );

    if (flashcardNote) {
        detectDriftedSections(sections, flashcardNote.flashcards);
    }

    const name = resolveSourceDisplayName(sourcePath, sourceId);

    if (!plugin.fileTagsMap.has(sourcePath)) {
        throw new Error(`sourceNoteInitialize: ${sourcePath} does not have tags`);
    }

    const tags = plugin.fileTagsMap.get(sourcePath) as string[];
    const strategy = resolveSourceStrategy(sourcePath, tags, !!readBookFrontmatter(sourcePath, sourceId));
    const reviewDeck = shuffledReviewDeck(flashcardNote?.flashcards || []);

    return {
        flashcardNote,
        bookSections: sections,
        name,
        tags,
        strategy,
        reviewDeck,
    };
}
