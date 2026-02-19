# Domain Model Realignment Plan (v2)

## Context

The domain models have drifted from their original intent. `AnnotationsNote` (671 lines) is a god object mixing 6+ responsibilities. `api.ts` (536 lines) contains leaked business logic. Naming is book-centric ("bookSections", "frontbook", "getBookChapters") despite supporting non-book markdown sources. The `Source` class exists as a 26-line stub, competing with `AnnotationsNote` for the same conceptual role.

This plan establishes sane domain boundaries that map to internalized domain concepts, support extensibility (new source types, multi-source decks), and set the foundation for shipping velocity.

**v2 changes:** Revised based on architecture discussion — introduces StudyNote unified type, FlashcardDeck as read-only view, pure ReviewSession, strategy-owned writes, and eliminates derived state from content models.

---

## Architectural Decisions

This plan is governed by three ADRs:
- [ADR-021: StudyNote Unified Content Type](../decisions/ADR-021-studynote-unified-content-type.md)
- [ADR-022: FlashcardSource Composition with Strategy-Owned Writes](../decisions/ADR-022-flashcardsource-composition.md)
- [ADR-023: FlashcardDeck and Pure ReviewSession](../decisions/ADR-023-flashcarddeck-and-pure-reviewsession.md)

---

## Target Architecture

```
FlashcardSource (aggregate root, ~100 lines)
  ├── id, name, path, tags
  ├── sourceContent: SourceContent
  │     ├── notes: StudyNote[]              // unified type (ADR-021)
  │     ├── headings: Heading[]
  │     ├── strategy: ISourceStrategy       // read + write (ADR-022)
  │     └── queries: getNote, coverage, prev/next navigation
  ├── deck: FlashcardDeck                   // read-only view (ADR-023)
  │     └── createReviewSession(): ReviewSession (pure state machine)
  ├── flashcardNote: FlashcardNote          // persistence (unchanged)
  └── coordination
        ├── createFlashcard() — strategy ensures block IDs, FlashcardNote persists
        └── getNoteForFlashcard() — lookup for drift detection
```

### Key Principles
1. **StudyNote is the domain's content unit.** UI sees `StudyNoteCore`, never `annotation` or `paragraph` directly.
2. **Strategy owns format.** Read and write. Each strategy handles its own content shape.
3. **FlashcardDeck is a view.** Read-only collection over FlashcardNote. Creates ReviewSessions.
4. **ReviewSession is pure.** Returns scheduling intents, never does IO.
5. **Derived state is computed, not stored.** `hasFlashcards` is a query (`deck.flashcardsFor(noteId)`), not a property.
6. **FlashcardStorageStrategy is a noted seam.** Not extracted yet, but FlashcardNote's format logic should be separable.

### Component Sketches

#### StudyNote (ADR-021)
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

#### ISourceStrategy (expanded — ADR-022)
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

  // Policy
  readonly requiresMutationConfirmation: boolean;
}
```

#### SourceContent (~150 lines)
```typescript
class SourceContent {
  readonly notes: StudyNote[];
  readonly headings: Heading[];

  static parse(metadata, fileText, strategy): SourceContent

  getNote(id: string): StudyNote
  getNotesForSection(sectionId?: string): StudyNote[]
  coverage(flashcards: Flashcard[]): CoverageResult
  getPreviousNoteId(noteId, sectionId?, filter?): string | null
  getNextNoteId(noteId, sectionId?, filter?): string | null
}
```

**Note:** `parse()` returns data only — no global index mutation. Caller populates indexes.

#### FlashcardDeck (~30 lines — ADR-023)
```typescript
class FlashcardDeck {
  constructor(private flashcardNote: FlashcardNote)

  get flashcards(): Flashcard[]
  flashcardsFor(noteId: string): Flashcard[]
  createReviewSession(): ReviewSession
  getStats(): DeckStats
}
```

#### ReviewSession (~70 lines — ADR-023)
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

  // Pure — returns intent, no IO
  processReview(flashcardId, response): SchedulingUpdate
}
```

#### FlashcardSource (~100 lines)
```typescript
class FlashcardSource {
  readonly id: string;
  readonly name: string;
  path: string;
  tags: string[];

  readonly sourceContent: SourceContent;
  readonly deck: FlashcardDeck;
  readonly flashcardNote: FlashcardNote;
  readonly strategy: ISourceStrategy;

  // Coordination
  async createFlashcard(noteId, q, a, type): Promise<void>
  async deleteFlashcard(id): Promise<void>
  async updateFlashcardContents(id, q, a, type): Promise<boolean>
  async updateNote(id, updates): Promise<boolean>

  // Queries
  getNoteForFlashcard(flashcard: Flashcard): StudyNote | null
  getSourceCapabilities(): SourceCapabilities
  getNavigableSections(): Heading[]
  canBeReviewed(): boolean
}
```

---

## Naming Migration

| Current | Proposed | Rationale |
|---------|----------|-----------|
| `AnnotationsNote` | `FlashcardSource` | Source-agnostic, describes the aggregate |
| `AnnotationsNoteIndex` | `FlashcardSourceIndex` | Follows aggregate |
| `bookSections` (field) | `sourceContent.notes` + `sourceContent.headings` | Accessed via SourceContent |
| `BookMetadataSection` | `ContentSection` | Not book-specific |
| `annotation \| paragraph` | `StudyNote` | Unified content type (ADR-021) |
| `BookFrontmatter` | `MoonReaderFrontmatter` | Only MR sources have this shape |
| `book` (interface) | `SourceSummary` | It's a summary view |
| `frontbook` (interface) | `SourceIdentity` | It's id + name + path + sections |
| `frontEndBook` (in api.ts) | `SourceDetail` | Detail view DTO |
| `ReviewBook` (in api.ts) | `ReviewableSource` | Generic |
| `getBookById` | `getSourceById` | Generic |
| `getBookChapters` | `getNavigableSections` | Not all sources have chapters |
| `getBookFrontmatter()` | `getMoonReaderFrontmatter()` | Accurate scope |

**Migration mechanics:** `type AnnotationsNote = FlashcardSource` + `@deprecated` aliases. Remove after all consumers migrated.

---

## api.ts Decomposition

Split into focused modules, `api.ts` becomes a barrel re-export:

| Module | Functions | ~Lines |
|--------|-----------|--------|
| `src/application/review.ts` | `getNextCard`, `getCurrentCard`, `resetReviewState`, `updateFlashcardSchedulingMetadata`, `getSourcesForReview` | 50 |
| `src/application/cards.ts` | `createFlashcardForNote`, `updateFlashcardContents`, `deleteFlashcard`, `getFlashcardById`, `getFlashcardsForNote` | 50 |
| `src/application/sources.ts` | `getSourceById`, `getSectionTree`, `getNavigableSections`, `getBreadcrumbData`, `getSourceCapabilities`, `getSourcesAvailableForDeckCreation`, `getNotesForSection`, `getNoteById` | 80 |
| `src/application/navigation.ts` | `getPreviousNoteId`, `getNextNoteId` → delegates to SourceContent | 20 |
| `src/application/import.ts` | `importMoonReaderExport`, `updateAnnotationsAndFrontmatter`, `getImportedBooks`, `getUnimportedMrExptFiles`, `getImportableExports`, `getDestinationFolders` | 100 |
| `src/application/onboarding.ts` | `createFlashcardNoteForSource`, `ensureSourceInOwnFolder` | 40 |

---

## disk.ts Business Logic Extraction

Two functions with leaked domain logic:

1. **`createFlashcardsFileForBook`** → `FlashcardNote.generateInitialContent(sourcePath): string`
2. **`generateFlashcardsFileNameAndPath`** → `FlashcardNote.derivePathFromSource(sourcePath): {filename, path}`

---

## Known Footguns to Address

1. **Tree builder fails on H2-only content.** `generateTree()` returns `filter(level == 1)` — empty for H2-only docs. Strategy should provide `rootLevel` hint or produce its own tree.
2. **Index population as parsing side effect.** `bookSections()` mutates global annotation index. `SourceContent.parse()` must return data only.
3. **Path-based FlashcardNote linking is fragile.** `parentPath` string matching breaks on file moves. FlashcardSource should manage path stability.
4. **`isDue()` string date comparison.** Works by lexicographic accident. Note as tech debt for timezone-aware scheduling.

---

## Phased Execution

### Phase 1: Extract ReviewSession + FlashcardDeck
**Creates:** `src/data/models/ReviewSession.ts`, `src/data/models/FlashcardDeck.ts`
**Modifies:** `AnnotationsNote.ts` (replace review state with `deck: FlashcardDeck`)
**Key change:** `processReview()` becomes pure (returns `SchedulingUpdate`). Caller handles persistence.
**Test impact:** Zero breakage on API surface. New isolated unit tests.

### Phase 2: Introduce StudyNote + expand ISourceStrategy
**Creates:** `src/data/models/StudyNote.ts`
**Modifies:** `ISourceStrategy.ts` (add write methods), `MarkdownSourceStrategy.ts`, `MoonReaderStrategy.ts`, `annotations.ts`, `paragraphs.ts`
**Key change:** Strategies produce `StudyNote[]` instead of `annotation[]`. Write methods added.
**Test impact:** Fixture updates needed for new type shape.

### Phase 3: Extract SourceContent + move navigation
**Creates:** `src/data/models/SourceContent.ts`
**Modifies:** `AnnotationsNote.ts` (replace `bookSections` + queries with `sourceContent: SourceContent`), `api.ts` (navigation delegates to SourceContent)
**Key change:** Parse returns data, no index side effects. Navigation moves to model layer.
**Test impact:** `book.test.ts` import changes. `api.test.ts` stays green.

### Phase 4: Rename AnnotationsNote → FlashcardSource + naming migration
**Modifies:** `AnnotationsNote.ts` → `FlashcardSource.ts`, add deprecated aliases
**Test impact:** Import path updates. Barrel re-exports for backwards compat.

### Phase 5: Decompose api.ts into application modules
**Creates:** `src/application/{review,cards,sources,navigation,import,onboarding}.ts`
**Modifies:** `api.ts` becomes barrel re-export
**Test impact:** Imports continue working via barrel.

### Phase 6: Extract disk.ts business logic + remove Source stub
**Modifies:** `disk.ts`, `FlashcardNote` (add static methods)
**Deletes:** `src/data/models/Source.ts`
**Test impact:** Minimal.

---

## Extensibility Analysis

| Extension Vector | How This Architecture Handles It |
|-----------------|----------------------------------|
| **New source type** (PDF, Kindle) | New `ISourceStrategy` implementation. FlashcardSource and SourceContent are source-agnostic. Strategy owns format reads/writes. |
| **New card type** (cloze, image) | Extend `CardType` enum + `AbstractFlashcard` subclass. Orthogonal to source decomposition. |
| **New review algorithm** | `ReviewSession` takes scheduling function. Pure state machine — swap without touching aggregate. |
| **Multi-source decks** | `FlashcardDeck` doesn't care about source provenance. Future `CompositeDeck` aggregates multiple decks. ReviewSession receives `Flashcard[]`. |
| **Alternative storage** (React Native) | FlashcardStorageStrategy seam in FlashcardNote. Format logic in separable private methods. |

---

## Verification

After each phase:
1. `npm test` — full suite passes
2. `npm run build` — compiler passes
3. Manual smoke: navigate to source, browse notes, create card, review card
4. `git diff --stat` — only expected files changed

---

## Key Files

- `src/data/models/AnnotationsNote.ts` — god object to decompose (671 lines)
- `src/api.ts` — facade to decompose (536 lines)
- `src/data/models/flashcard.ts` — FlashcardNote stays as-is (well-scoped)
- `src/data/models/ISourceStrategy.ts` — expand with write methods
- `src/data/models/annotations.ts` — `annotation` type becomes internal to MoonReaderStrategy
- `src/data/models/paragraphs.ts` — `paragraph` type becomes internal to MarkdownSourceStrategy
- `src/infrastructure/disk.ts` — extract 2 business functions
- `src/data/models/Source.ts` — remove (26-line stub)
- `tests/api.test.ts` — largest test file, must stay green throughout

## Related
- Story: [DEBT-031](../stories/DEBT-031-deterministic-modularization-and-domain-model-evolution.md)
- Session: [2026-02-18 Architecture Refinement](../sessions/2026-02-18-domain-model-architecture-refinement.md)
- Prior session: [2026-02-18 Domain Modeling Context Handoff](../sessions/2026-02-18-domain-modeling-context-handoff.md)
- ADR-018 (superseded by ADR-022)
