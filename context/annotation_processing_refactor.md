# Annotation Processing Refactor and API Plan

## Refactor: Decoupling Annotation Processing

**Goal:** Deduplicate annotation processing logic and centralize it within the `SourceNote` model.

**Changes:**
1.  **Moved Helper Functions:** `isParagraph`, `isAnnotationOrParagraph`, `transform` (now internal/private where possible), and `addBlockIdToParagraph` were moved from `src/api.ts` to `src/data/models/sourceNote.ts` and `src/data/models/paragraphs.ts`.
2.  **New `SourceNote` Methods:**
    *   `getProcessedAnnotations(sectionId?: string)`: Replaces the logic previously in `getAnnotationsForSection` in `api.ts`. It handles fetching annotations for a specific section or the whole book if no section is provided (implicit in current usage, but extensible).
    *   `getAnnotation(annotationId: string)`: Retrieves a single annotation by ID, handling the transformation.
3.  **Updated `api.ts`:** `getAnnotationsForSection` now delegates to `SourceNote.getProcessedAnnotations`. `getAnnotationById` delegates to `SourceNote.getAnnotation`.

## Feature: `getReviewBooks` API

**Goal:** Add a new API endpoint `getReviewBooks` to `src/api.ts` that returns a list of books available for review, distinct from the scheduling-based `getSourcesForReview`.

**Current State:**
*   `getSourcesForReview` currently returns `ReviewBook[]` based on `plugin.sourceNoteIndex.getSourcesForReview()`, which filters for notes with flashcards.
*   The request implies we might want a broader list or a specific "ReviewBook" structure for a different purpose (perhaps browsing books to create flashcards vs. reviewing existing ones?).

**Clarification Needed:**
*   The user prompt mentioned: "Add an API to api.ts that returns a ReviewBook[] like getSourcesForReview." and "One of the problems in the current implementation is that when creating flashcards, we are not using the list of processed annotations found in book.bookSections."
*   This suggests the new API might be for *creating* flashcards (i.e., finding books with annotations that *don't* have flashcards yet, or just listing all books with their annotation status).
*   Let's assume the goal is to expose `ReviewBook` data for *all* books, or a filtered subset relevant for creation, maximizing reusability of the `ReviewBook` interface.

**Plan:**
1.  **Verify `ReviewBook` Interface:** Ensure it captures necessary data (coverage, counts).
2.  **Implement `getReviewBooks`:**
    *   Likely should retrieve all source notes.
    *   Map them to `ReviewBook` format.
    *   This will allow the UI to display a list of books with their "Flashcard Coverage" (annotations with cards vs. total annotations).

**Next Steps:**
1.  Implement `getReviewBooks` in `src/api.ts`.
2.  Ensure it uses the `SourceNote` methods to calculate coverage efficiently (which `annotationCoverage` already does).
