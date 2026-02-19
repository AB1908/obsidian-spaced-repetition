# Domain Model Architecture Refinement (2026-02-18)

## Purpose
Captures the full reasoning chain from initial plan through disagreements to refined architecture for DEBT-031 Phase B+. This session built on the earlier [context handoff](2026-02-18-domain-modeling-context-handoff.md) and produced ADRs, a revised plan, and updated stories.

## Starting Point
The earlier handoff session identified `AnnotationsNote` (671 lines) as a god object with 6+ mixed responsibilities and `api.ts` (536 lines) with leaked business logic. A composition model with `FlashcardSource` aggregate was proposed. This session stress-tested that model.

## Initial Plan (v1) — What Was Proposed

A `FlashcardSource` aggregate composing:
- `ContentStructure` — parsed sections + queries + navigation
- `FlashcardNote` — card CRUD + persistence (existing)
- `ReviewSession` — review state machine (extracted)
- `ISourceStrategy` — source-type behavior (existing, read-only)

With `api.ts` decomposed into `src/application/` modules and naming migration from book-centric to source-agnostic terms.

## Disagreements and Refinements

### 1. FlashcardSource was too tightly coupled

**Problem:** v1 stuffed everything inside FlashcardSource as composed children, treating it as a single aggregate owning content, cards, and review. But the real relationship is:

```
FlashcardSource → produces → Flashcards → collected into → FlashcardDeck → creates → ReviewSession
```

**Resolution:** FlashcardDeck is a separate concept. It's a read-only view over FlashcardNote that knows how to produce ReviewSessions. Currently 1:1 with sources, but this seam enables multi-source decks later.

### 2. ContentStructure was the wrong abstraction

**Problem:** "ContentStructure" was too generic. The content is strategy-produced and strategy-variable — MoonReader exports have chapters with colored annotations, markdown files have paragraphs under H2 headers.

**Resolution:** Renamed to `SourceContent`. Emphasizes that it's the parsed representation of a specific source's content, with the strategy determining what that content looks like. The strategy also determines how to *write back* to the source.

### 3. Strategy interface was read-only but sources need writes

**Problem:** `ISourceStrategy` only had `sync()`, `extract()`, `getNavigableSections()`. But block ID injection only applies to markdown. Annotation rendering only applies to MoonReader callouts. The strategy should own format-specific writes.

**Resolution:** Strategy expands to include write operations:
```typescript
interface ISourceStrategy {
  // Read
  extract(): Promise<StudyNote[]>;
  sync?(sinceId?: string): Promise<StudyNote[]>;
  getNavigableSections(sections: ContentSection[]): Heading[];

  // Write
  renderNote(note: StudyNote): string;
  ensureBlockIds?(path: string): Promise<void>;
  mutateNote?(path: string, original: StudyNote, updated: StudyNote): Promise<boolean>;

  readonly requiresMutationConfirmation: boolean;
}
```

### 4. hasFlashcards/flashcardCount are derived state

**Problem:** v1 kept `hasFlashcards` and `flashcardCount` on StudyNote (inherited from the current `annotation` and `paragraph` types). These are computed from the relationship between notes and flashcards.

**Resolution:** Eliminated from StudyNote. Becomes a query: `deck.flashcardsFor(noteId).length`. StudyNote stays pure — represents content only.

### 5. StudyNote should be a discriminated union, not a flat interface

**Problem:** v1 proposed a single `StudyNote` interface with optional fields for source-specific metadata. This means `calloutType` exists on markdown notes (always undefined) and `wasIdPresent` exists on MoonReader notes (meaningless).

**Resolution:** Discriminated union with shared core:
```typescript
interface StudyNoteCore {
  id: string;
  content: string;
  personalNote: string;
  fingerprint: string;
  drifted?: boolean;
}

interface MoonReaderNote extends StudyNoteCore {
  origin: 'moonreader';
  calloutType: string;
  category?: number;
  location?: string;
}

interface MarkdownNote extends StudyNoteCore {
  origin: 'markdown';
  wasIdPresent: boolean;
}

type StudyNote = MoonReaderNote | MarkdownNote;
```

UI works with `StudyNoteCore` — no branching. Source-specific presentation via optional `NoteRenderHints` from strategy.

### 6. FlashcardDeck should not have CRUD methods

**Problem:** v1 put `createCard`, `deleteCard`, `updateCard` on FlashcardDeck. But the deck is a view/collection, not a persistence layer.

**Resolution:** FlashcardDeck is read-only. CRUD stays on FlashcardNote. FlashcardSource coordinates creation (ensures block IDs via strategy, then tells FlashcardNote to persist).

### 7. ReviewSession should be a pure state machine

**Problem:** Current `processCardReview()` calls `flashcardNote.updateCardSchedule()` — mixing state transition with IO.

**Resolution:** ReviewSession returns scheduling intents, caller handles persistence:
```typescript
class ReviewSession {
  processReview(flashcardId, response): SchedulingUpdate {
    // Pure computation — returns what should change
    return schedulingMetadataForResponse(response, card);
  }
}
// Caller:
const update = session.processReview(cardId, response);
await flashcardNote.updateCardSchedule(cardId, update);
```

### 8. Hidden "FlashcardStorageStrategy" seam

**Problem:** FlashcardNote owns storage format (`Q?\nA\n<!--SR:...-->`), parsing, and persistence. If format changes (YAML, JSON, SQLite for React Native), everything changes.

**Resolution:** Note the seam but don't extract yet. Only one storage format exists. Design should make future extraction easy — FlashcardNote's format logic should be in clearly separable private methods.

## Footguns Discovered

1. **Tree builder fails silently on H2-only content.** `generateTree()` returns `filter(level == 1)` — empty for H2-only docs. MarkdownSourceStrategy compensates but the tree and navigation disagree about roots.

2. **Index population is a parsing side effect.** `bookSections()` calls `plugin.index.addToAnnotationIndex()` during parse. Makes SourceContent hard to test in isolation.

3. **`transform()` is a leaky abstraction.** Converts paragraphs to annotation shape for UI. StudyNote union type eliminates this — UI works with StudyNoteCore.

4. **FlashcardNote linking via string path is fragile.** `parentPath` matched against `AnnotationsNote.path`. File moves break the link. Manual patching in `createFlashcardNoteForAnnotationsNote`.

5. **`isDue()` uses string date comparison.** `dueDate <= moment().format("YYYY-MM-DD")` — works by lexicographic accident. Fragile for timezone-aware scheduling.

6. **Heading hierarchy is strategy-dependent but tree building is strategy-agnostic.** Tree builder assumes H1→H2→H3→H4. Strategy should either produce its own tree or provide a `rootLevel` hint.

## Architecture Direction Considered

### Direction A: Strategy-heavy composition (selected)
- FlashcardSource composes SourceContent, FlashcardDeck, FlashcardNote
- Strategies own both read and write operations
- ReviewSession is pure state machine
- UI works with StudyNoteCore uniformly

### Direction B: Functional core with thin shells
- Pure data types + pure functions, thin IO shells
- Maximum testability but major paradigm shift from OOP codebase
- Rejected: migration cost too high for current codebase style

### Direction C: Event-sourced / command pattern
- Commands + events + handlers
- Perfect for sync/undo but massive over-engineering
- Rejected: wrong scale for this system

## Settled Architecture (v2)

```
FlashcardSource (aggregate root)
  ├── id, name, path, tags
  ├── sourceContent: SourceContent
  │     ├── notes: StudyNote[]              // unified type (discriminated union)
  │     ├── headings: Heading[]
  │     ├── strategy: ISourceStrategy       // read + write + render hints
  │     └── queries (getNote, coverage, prev/next navigation)
  ├── deck: FlashcardDeck                   // read-only view over FlashcardNote
  │     └── createReviewSession(): ReviewSession (pure state machine)
  ├── flashcardNote: FlashcardNote          // persistence, format-aware
  └── coordination
        └── createFlashcard() — ensures block IDs via strategy, then delegates to FlashcardNote
```

### Key principles
1. **StudyNote is the domain's content unit.** UI never sees `annotation` or `paragraph` directly.
2. **Strategy owns format.** Read and write. Each strategy handles its own content shape.
3. **FlashcardDeck is a view.** Read-only collection. Creates ReviewSessions. No persistence.
4. **ReviewSession is pure.** Returns intents, never does IO.
5. **Derived state is computed, not stored.** hasFlashcards is a query, not a property.
6. **FlashcardStorageStrategy is a noted seam.** Not extracted yet, but design enables future extraction.

## Open Questions for Future Sessions
1. How should the tree builder handle strategy-specific root levels?
2. Should SourceContent.parse() return notes separately from index population?
3. When does FlashcardStorageStrategy get extracted (React Native milestone)?
4. How does multi-source FlashcardDeck change the review UI?

## Assets Created This Session
- Session log: `docs/sessions/2026-02-18-domain-model-architecture-refinement.md` (this file)
- ADR-021: StudyNote unified content type
- ADR-022: FlashcardSource composition with strategy-owned writes
- ADR-023: FlashcardDeck and pure ReviewSession
- Updated plan: `docs/plans/DEBT-031-domain-model-realignment.md`
- Updated story: DEBT-031 (acceptance criteria and plan link updated)

## Cross-References
- Prior session: [Domain Modeling Context Handoff](2026-02-18-domain-modeling-context-handoff.md)
- Story: [DEBT-031](../stories/DEBT-031-deterministic-modularization-and-domain-model-evolution.md)
- Plan: [Domain Model Realignment Plan](../plans/DEBT-031-domain-model-realignment.md)
- ADR-018: [Source Model Architecture](../decisions/ADR-018-source-model-architecture.md) (superseded by ADR-022)
- ADR-021: [StudyNote Unified Content Type](../decisions/ADR-021-studynote-unified-content-type.md)
- ADR-022: [FlashcardSource Composition](../decisions/ADR-022-flashcardsource-composition.md)
- ADR-023: [FlashcardDeck and Pure ReviewSession](../decisions/ADR-023-flashcarddeck-and-pure-reviewsession.md)
