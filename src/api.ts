import type SRPlugin from "src/main";
import { setPluginContext } from "src/application/plugin-context";

export function setPlugin(p: SRPlugin) {
    setPluginContext(p);
}

export type { FlashCount, ReviewBook } from "src/application/review-api";
export {
    deleteFlashcard,
    getCurrentCard,
    getFlashcardById,
    getNextCard,
    getSourcesForReview,
    resetBookReviewState,
    updateFlashcardSchedulingMetadata,
} from "src/application/review-api";

export type { NotesWithoutBooks, frontEndBook } from "src/application/source-api";
export {
    getAnnotationsNoteById,
    getBookById,
    getBookChapters,
    getNotesWithoutReview,
    getSectionTreeForBook,
    getSourceCapabilities,
    getSourcesAvailableForDeckCreation,
} from "src/application/source-api";

export {
    getDestinationFolders,
    getImportableExports,
    getImportedBooks,
    getUnimportedMrExptFiles,
    importMoonReaderExport,
    updateBookAnnotationsAndFrontmatter,
} from "src/application/import-api";

export {
    addBlockIdToParagraph,
    createFlashcardForAnnotation,
    getAnnotationById,
    getAnnotationsForSection,
    getFlashcardsForAnnotation,
    isAnnotationOrParagraph,
    isParagraph,
    softDeleteAnnotation,
    updateAnnotationMetadata,
    updateFlashcardContentsById,
} from "src/application/annotation-api";
export { createFlashcardNoteForAnnotationsNote } from "src/application/deck-api";

export type { NavigationFilter } from "src/application/navigation-api";
export { getBreadcrumbData, getNextAnnotationId, getPreviousAnnotationId } from "src/application/navigation-api";
