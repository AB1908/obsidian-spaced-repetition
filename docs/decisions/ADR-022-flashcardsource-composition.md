# ADR-022: FlashcardSource Composition with Strategy-Owned Writes

## Status
Proposed (supersedes ADR-018)

## Context
ADR-018 proposed separating `AnnotationsNote` into a `Source` shell + `AnnotationsNote` content model + `ISourceStrategy` interface. Since then, several problems emerged:

1. The `Source` class became a 26-line stub that duplicates responsibility with `AnnotationsNote`.
2. `ISourceStrategy` is read-only but sources require format-specific writes (block ID injection for markdown, callout rendering for MoonReader).
3. `AnnotationsNote` remains a 671-line god object mixing content parsing, review state, flashcard lifecycle, navigation, and policy.
4. Review state is embedded in the source model, making multi-source deck reviews impossible.
5. Business logic leaked into `api.ts` (navigation predicates, source mutation orchestration) and `disk.ts` (file naming conventions, frontmatter templates).

## Decision
Replace `AnnotationsNote` with a `FlashcardSource` aggregate that composes focused components. Expand `ISourceStrategy` to own both read and write operations.

### Composition structure
```
FlashcardSource (aggregate root, ~100 lines)
  ├── id, name, path, tags
  ├── sourceContent: SourceContent
  │     ├── notes: StudyNote[]              (see ADR-021)
  │     ├── headings: Heading[]
  │     ├── strategy: ISourceStrategy       (read + write)
  │     └── queries: getNote, coverage, prev/next navigation
  ├── deck: FlashcardDeck                   (see ADR-023)
  │     └── createReviewSession()
  ├── flashcardNote: FlashcardNote          (persistence, unchanged)
  └── coordination: createFlashcard(), getNoteForFlashcard()
```

### Expanded ISourceStrategy
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

Each strategy handles its own format — MoonReaderStrategy knows callout syntax, MarkdownSourceStrategy knows block ID injection. FlashcardSource coordinates without knowing format details.

### SourceContent
Replaces the `bookSections()` free function and query methods currently on `AnnotationsNote`. Owns the parsed content and navigation:

```typescript
class SourceContent {
  readonly notes: StudyNote[];
  readonly headings: Heading[];

  static parse(metadata, fileText, strategy, index): SourceContent

  getNote(id: string): StudyNote
  getNotesForSection(sectionId?: string): StudyNote[]
  coverage(flashcards: Flashcard[]): CoverageResult
  getPreviousNoteId(noteId, sectionId?, filter?): string | null
  getNextNoteId(noteId, sectionId?, filter?): string | null
}
```

### What gets removed
- `Source` class (26-line stub) — its purpose is fulfilled by FlashcardSource
- `transform()` function — replaced by StudyNote unified type
- `book`, `frontbook` interfaces — replaced by source-agnostic types
- `hasFlashcards`/`flashcardCount` on content types — becomes queries against FlashcardDeck

### FlashcardSource coordination
FlashcardSource is the one place that knows about both source content and flashcard persistence:

```typescript
class FlashcardSource {
  async createFlashcard(noteId, q, a, type): Promise<void> {
    const note = this.sourceContent.getNote(noteId);
    // Strategy handles format-specific prep
    if (this.strategy.ensureBlockIds) {
      await this.strategy.ensureBlockIds(this.path);
    }
    // FlashcardNote handles persistence
    await this.flashcardNote.createCard(noteId, q, a, type, note.fingerprint);
  }

  getNoteForFlashcard(flashcard: Flashcard): StudyNote | null {
    return this.sourceContent.getNote(flashcard.parentId);
  }
}
```

### Noted seam: FlashcardStorageStrategy
FlashcardNote currently owns storage format (`Q?\nA\n<!--SR:...-->`). A `FlashcardStorageStrategy` interface could abstract this for alternative backends (JSON, SQLite for React Native). **Not extracted in this iteration** — only one format exists. Design should keep format logic in clearly separable private methods within FlashcardNote to enable future extraction.

## Consequences

**Positive:**
- Each model has one job: SourceContent = content queries, FlashcardDeck = card collection + review, FlashcardNote = persistence, ReviewSession = pure state machine.
- Strategy owns format knowledge for both reads and writes — no format-specific conditionals in FlashcardSource.
- Multi-source decks become possible: FlashcardDeck doesn't care where flashcards came from.
- Navigation logic moves from `api.ts` to SourceContent where it belongs.
- `Source` stub eliminated — no competing models for the same concept.

**Negative:**
- Largest refactor surface in the codebase. Every test touching `AnnotationsNote` needs updates.
- More types to navigate (StudyNote, SourceContent, FlashcardDeck, ReviewSession, FlashcardSource).
- Coordination on FlashcardSource can become a thin delegation layer — must resist adding logic there.

**Risks:**
- Strategy interface expansion may cause interface bloat as source types grow. Mitigate with optional methods (`ensureBlockIds?`, `mutateNote?`) and interface segregation if needed.
- SourceContent.parse() currently mutates global annotation index as a side effect. Must be resolved — parse should return data, caller populates indexes.

## Alternatives Considered
- **Functional core + thin shells:** Maximum testability but major paradigm shift from current OOP style. Migration cost too high.
- **Event-sourced command pattern:** Clean separation of intent from effects, good for sync/undo. Over-engineering for current scale.
- **Minimal extraction (ReviewSession only):** Lowest risk but doesn't address the core coupling problems or enable extensibility.
- **Keep ADR-018 as-is:** `Source` + `AnnotationsNote` + read-only `ISourceStrategy`. Rejected because the Source stub proved unnecessary and write delegation is needed.

## Related
- [ADR-018: Source Model Architecture](ADR-018-source-model-architecture.md) — superseded by this ADR
- [ADR-021: StudyNote Unified Content Type](ADR-021-studynote-unified-content-type.md)
- [ADR-023: FlashcardDeck and Pure ReviewSession](ADR-023-flashcarddeck-and-pure-reviewsession.md)
- [DEBT-031](../stories/DEBT-031-deterministic-modularization-and-domain-model-evolution.md) — parent story
- Plan: [Domain Model Realignment](../plans/DEBT-031-domain-model-realignment.md)
- Session: [2026-02-18 Architecture Refinement](../sessions/2026-02-18-domain-model-architecture-refinement.md)
