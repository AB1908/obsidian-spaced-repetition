# DEBT-031 Phase 1: Extract ReviewSession

## Context

DEBT-031 plans a 6-phase domain model realignment. Phase 1 (ReviewSession extraction) has **zero overlap** with STORY-016's touchpoints and can ship independently without merge conflicts.

STORY-016 touches: `annotation-categories.ts`, `settings.ts`, `metadataSerializer.ts`, `annotations.ts`, `personal-note.tsx`, `useAnnotationEditor.ts`, `category-filter.tsx`, `annotation-filters.ts`

Phase 1 touches: `AnnotationsNote.ts`, `review-api.ts`, and new `ReviewSession.ts`. No intersection.

Review-related code is already partially factored into helpers (`review-mutations.ts`, `review-deck.ts`, `review-stats.ts`), but the session state (`reviewIndex`, `reviewDeck`) and lifecycle methods (`startReviewing`, `nextReviewCard`, `finishReviewing`, etc.) still live on AnnotationsNote.

---

## What Changes

### New file: `src/data/models/ReviewSession.ts` (~50 lines)

Owns session state machine. Pure — no IO.

```typescript
import type { Flashcard } from "src/data/models/flashcard";
import { schedulingMetadataForResponse } from "src/data/models/flashcard";
import type { ReviewResponse } from "src/types/CardType";
import { shuffledReviewDeck } from "./annotations-note/review-deck";

export interface SchedulingUpdate {
  flashcardId: string;
  schedulingMetadata: { interval: number; ease: number; dueDate: string };
}

export class ReviewSession {
  private deck: Flashcard[];
  private index: number; // -1 = not active

  constructor(flashcards: Flashcard[]) {
    this.deck = shuffledReviewDeck(flashcards);
    this.index = -1;
  }

  start(): void { this.index = 0; }
  isActive(): boolean { return this.index !== -1; }

  currentCard(): Flashcard | null {
    if (!this.isActive() || this.index >= this.deck.length) return null;
    return this.deck[this.index];
  }

  advance(): void {
    this.index++;
    if (this.index >= this.deck.length) this.finish();
  }

  finish(): void { this.index = -1; }

  canStart(): boolean { return this.deck.length > 0; }
  get pendingCount(): number { return this.deck.length; }

  /** Pure — returns scheduling intent, caller persists via FlashcardNote */
  processReview(flashcardId: string, response: ReviewResponse): SchedulingUpdate {
    const card = this.deck.find(c => c.id === flashcardId);
    if (!card) throw new Error(`ReviewSession: card ${flashcardId} not found`);
    return {
      flashcardId,
      schedulingMetadata: schedulingMetadataForResponse(response, {
        interval: card.interval,
        ease: card.ease,
        dueDate: card.dueDate,
      }),
    };
  }

  regenerate(flashcards: Flashcard[]): void {
    this.deck = shuffledReviewDeck(flashcards);
    this.index = -1;
  }

  removeCard(flashcardId: string): void {
    this.deck = this.deck.filter(c => c.id !== flashcardId);
  }
}
```

### Modified: `src/data/models/annotations-note/AnnotationsNote.ts`

Replace `reviewIndex`, `reviewDeck`, and 8 review methods with `review: ReviewSession`.

**Remove fields:** `reviewIndex`, `reviewDeck`
**Add field:** `review: ReviewSession`

**Remove methods:** `startReviewing`, `isInReview`, `getReviewCard`, `nextReviewCard`, `finishReviewing`, `processCardReview`, `generateReviewDeck`, `resetReview`, `canBeReviewed`

**Keep on AnnotationsNote:** `getReviewStats()` — it combines review state with annotation coverage (coordination concern). Updated to use `this.review.*`.

**Before/after on AnnotationsNote:**

| Before | After |
|--------|-------|
| `this.reviewIndex = -1` | `this.review = new ReviewSession(...)` |
| `this.reviewDeck = []` | (managed inside ReviewSession) |
| `book.startReviewing()` | `book.review.start()` |
| `book.isInReview()` | `book.review.isActive()` |
| `book.getReviewCard()` | `book.review.currentCard()` |
| `book.nextReviewCard()` | `book.review.advance()` |
| `book.canBeReviewed()` | `book.review.canStart()` |
| `book.resetReview()` | `book.review.regenerate(flashcards)` |
| `book.processCardReview(id, resp)` | Pure: `book.review.processReview(id, resp)` returns `SchedulingUpdate` |

### Modified: `src/application/review-api.ts`

Update callers to use `book.review.*`. The key change: `processCardReview` becomes two steps:

```typescript
// Before (IO hidden inside model)
await book.processCardReview(flashcardId, reviewResponse);

// After (caller owns IO)
const update = book.review.processReview(flashcardId, reviewResponse);
await book.flashcardNote.updateCardSchedule(update.flashcardId, update.schedulingMetadata);
```

### Modified: `src/data/models/annotations-note/initialize-state.ts`

Returns `ReviewSession` instead of `reviewDeck: Flashcard[]`. Caller assigns to `this.review`.

### Remove import: `review-mutations.ts`

No longer needed — `processFlashcardReview` replaced by `ReviewSession.processReview` (pure) + caller persistence. The file can be deleted.

---

## Files Summary

| File | Action |
|------|--------|
| `src/data/models/ReviewSession.ts` | **Create** (~50 lines) |
| `src/data/models/annotations-note/AnnotationsNote.ts` | **Modify** — replace review state with `review: ReviewSession` |
| `src/application/review-api.ts` | **Modify** — use `book.review.*`, handle `SchedulingUpdate` |
| `src/data/models/annotations-note/initialize-state.ts` | **Modify** — return ReviewSession |
| `src/data/models/annotations-note/review-mutations.ts` | **Delete** (logic moved to ReviewSession.processReview) |
| `src/data/models/annotations-note/review-deck.ts` | **Keep** (reused by ReviewSession constructor) |
| `src/data/models/annotations-note/review-stats.ts` | **Keep** (called from getReviewStats) |
| `tests/api.test.ts` | **Update** — existing review tests should pass with minor import changes |
| `tests/models/review-session.test.ts` | **Create** — pure unit tests, no mocking needed |

---

## What This Enables

- **Testable review logic** — ReviewSession is a pure state machine, testable without disk mocks
- **Multi-source decks (future)** — ReviewSession takes `Flashcard[]`, doesn't care about source
- **Clean IO boundary** — `SchedulingUpdate` intent pattern makes persistence explicit
- **Smaller AnnotationsNote** — removes ~70 lines and 2 fields from the god object

---

## Verification

1. `npm test` — all 38 suites pass (review tests in `api.test.ts` still green)
2. `npm run build` — compiler passes
3. New unit tests for ReviewSession cover: start/advance/finish lifecycle, processReview returns correct SchedulingUpdate, regenerate resets state, removeCard during active session
4. Manual smoke: open plugin, navigate to a source with due cards, review a card, verify scheduling persists
