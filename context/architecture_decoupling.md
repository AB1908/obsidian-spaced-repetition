# Architecture Plan: Decoupling Annotations and Flashcards

## Goal
Separate the `AnnotationsNote` domain (source text/structure) from the `FlashcardNote` domain (study data) and the `ReviewSession` (transient user state).

## Current State (The Problem)
`AnnotationsNote` currently acts as a facade for everything:
- It holds the `FlashcardNote` reference (`flashcardNote: FlashcardNote | null`).
- It manages the `reviewDeck` and `reviewIndex` (transient session state).
- It proxies CRUD operations (`createFlashcard`, `deleteFlashcard`, `updateFlashcardContents`).
- It calculates metrics that depend on flashcard data (`annotationCoverage`, `getReviewStats`).
- **Mixed Responsibility:** `createFlashcard` in `AnnotationsNote` also handles adding block IDs to paragraphs (`addBlockIdToParagraph`) in the source note, mixing source modification with flashcard creation.

### Specific Coupled Methods to be Removed/Moved:
- **Review Session:** `startReviewing`, `isInReview`, `getReviewCard`, `nextReviewCard`, `finishReviewing`, `processCardReview`, `generateReviewDeck`, `shuffleReviewDeck`, `resetReview`.
- **CRUD Proxies:** `createFlashcard`, `deleteFlashcard`, `updateFlashcardContents`, `createFlashcardNote`.
- **Metrics:** `annotationCoverage`, `getReviewStats`.

## Proposed Architecture

### 1. AnnotationsNote (Refined)
**Responsibility:** strictly readonly access to source text and structure.
- **Properties:** `id`, `name`, `path`, `bookSections`, `tags`.
- **Methods:** `getAnnotation(id)`, `getSection(id)`.
- **Removed:** `flashcardNote`, `reviewDeck`, `createFlashcard`, `startReviewing`.

### 2. FlashcardNote (Elevated)
**Responsibility:** Persistence and management of the flashcard file.
- Already exists but will be accessed directly by the API/Service layer, not via `AnnotationsNote`.
- **Methods:** `createCard`, `deleteCard`, `updateCardSchedule`.

### 3. ReviewSession (New Model)
**Responsibility:** Managing the active study session.
- **Properties:** `queue` (Flashcard[]), `currentIndex`, `metrics`.
- **Methods:** `next()`, `submitReview(answer)`.
- **Lifecycle:** Created when a user starts a review; destroyed when finished.

### 4. API Layer (Orchestrator)
The `src/api.ts` layer will coordinate these models instead of delegating everything to one.

**Example - Creating a Flashcard:**
*Current:*
```typescript
plugin.annotationsNoteIndex.getBook(bookId).createFlashcard(...);
```
*Proposed:*
```typescript
// 1. Get the source context (for the question/quote)
const source = annotationsIndex.get(bookId);
const annotation = source.getAnnotation(annId);

// 2. Get (or create) the flashcard storage
let deck = flashcardIndex.getBySourceId(bookId);
if (!deck) deck = await flashcardFactory.createFor(source);

// 3. Perform operation
await deck.createCard({
    question: annotation.text,
    answer: ...
});
```

## Refactoring Roadmap

### Phase 1: Service/Index decoupling
- [ ] Expose `FlashcardIndex` capabilities to look up notes by their "Source ID" (parent book).
- [ ] Update `api.ts` to fetch `FlashcardNote` directly from `FlashcardIndex` instead of accessing `book.flashcardNote`.

### Phase 2: Extract CRUD Logic
- [ ] Move `createFlashcard`, `deleteFlashcard`, etc. calls in `api.ts` to use the `FlashcardNote` directly.
- [ ] Remove proxy methods from `AnnotationsNote`.

### Phase 3: Extract Review State
- [ ] Create `ReviewSession` class.
- [ ] Update `api.ts` to instantiate a session when `startReview` is called.
- [ ] Remove `reviewDeck`, `reviewIndex`, `getReviewStats` from `AnnotationsNote`.

### Phase 4: Cleanup
- [ ] Remove `flashcardNote` property from `AnnotationsNote`.
- [ ] Fix all resulting TypeScript errors (which will naturally resolve many "Object is possibly null" issues).
