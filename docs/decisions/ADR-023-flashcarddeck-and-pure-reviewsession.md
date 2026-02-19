# ADR-023: FlashcardDeck as Read-Only View and ReviewSession as Pure State Machine

## Status
Proposed

## Context
Currently, review state lives inside `AnnotationsNote`: `reviewIndex`, `reviewDeck`, `startReviewing()`, `nextReviewCard()`, `processCardReview()`, etc. This creates three problems:

1. **Coupling:** Review logic is inseparable from source content. You can't review flashcards without loading the entire AnnotationsNote.
2. **IO in state machine:** `processCardReview()` directly calls `flashcardNote.updateCardSchedule()`, mixing state transitions with file writes. Impossible to test scheduling logic without mocking disk.
3. **Single-source lock-in:** Review deck is built from one source's flashcards. Multi-source decks (reviewing cards from multiple books in one session) require review to be source-independent.

## Decision
Extract two models from `AnnotationsNote`:

### FlashcardDeck — read-only view over FlashcardNote
```typescript
class FlashcardDeck {
  constructor(private flashcardNote: FlashcardNote)

  get flashcards(): Flashcard[]
  flashcardsFor(noteId: string): Flashcard[]
  createReviewSession(): ReviewSession
  getStats(): DeckStats
}
```

FlashcardDeck is a **view**, not a persistence layer. It does not have CRUD methods — card creation, deletion, and updates go through FlashcardNote directly (coordinated by FlashcardSource). The deck provides:
- Read access to the flashcard collection
- A factory for ReviewSession (filters due cards, shuffles)
- Statistics (coverage, maturity counts)

### ReviewSession — pure state machine
```typescript
class ReviewSession {
  private deck: Flashcard[];
  private index: number;

  constructor(dueCards: Flashcard[])

  start(): void
  isActive(): boolean
  currentCard(): Flashcard | null
  advance(): void
  finish(): void
  reset(): void

  // Pure computation — returns scheduling intent, no IO
  processReview(flashcardId: string, response: ReviewResponse): SchedulingUpdate
}
```

`processReview()` returns a `SchedulingUpdate` value. The caller (application layer or FlashcardSource) persists it:
```typescript
const update = session.processReview(cardId, response);
await flashcardNote.updateCardSchedule(cardId, update);
```

This makes ReviewSession testable without any mocking — feed it cards, assert state transitions and scheduling outputs.

### Multi-source deck path
FlashcardDeck takes a `FlashcardNote` (1:1 with source today). For multi-source decks, a future `CompositeDeck` can aggregate flashcards from multiple FlashcardNotes:
```typescript
class CompositeDeck {
  constructor(private decks: FlashcardDeck[])
  createReviewSession(): ReviewSession  // merges due cards from all decks
}
```

ReviewSession doesn't change — it receives `Flashcard[]` and doesn't care about provenance.

## Consequences

**Positive:**
- ReviewSession is testable without disk mocking (pure computation + state transitions).
- FlashcardDeck establishes the seam for multi-source reviews without premature implementation.
- Clear separation: FlashcardNote = persistence, FlashcardDeck = collection/view, ReviewSession = runtime state.
- `AnnotationsNote` loses ~100 lines of review logic, getting closer to single responsibility.

**Negative:**
- Introduces an additional type (FlashcardDeck) that today is a thin wrapper. Adds ~30 lines of code for a concept that only pays off when multi-source reviews arrive.
- Callers of `processReview()` now need to handle persistence themselves instead of it being automatic. This is intentional (pure state machine) but shifts responsibility.

## Alternatives Considered
- **Extract ReviewSession only, skip FlashcardDeck:** Lower cost, still decouples review state. Rejected because FlashcardDeck is the natural home for `createReviewSession()` and establishing the multi-source seam is cheap now.
- **Keep review on AnnotationsNote, just extract to separate file:** Preserves coupling. Rejected because file splitting without boundary changes doesn't solve the testability or multi-source problems.
- **FlashcardDeck with CRUD methods:** Rejected. The deck is a view, not a persistence layer. CRUD belongs on FlashcardNote. Adding CRUD to the deck conflates collection management with data access.

## Related
- [ADR-022: FlashcardSource Composition](ADR-022-flashcardsource-composition.md) — FlashcardDeck and ReviewSession are components within FlashcardSource
- [ADR-021: StudyNote Unified Content Type](ADR-021-studynote-unified-content-type.md)
- [DEBT-031](../stories/DEBT-031-deterministic-modularization-and-domain-model-evolution.md) — parent story
- Session: [2026-02-18 Architecture Refinement](../sessions/2026-02-18-domain-model-architecture-refinement.md)
