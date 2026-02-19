# ADR-021: StudyNote as Unified Content Type

## Status
Proposed

## Context
The codebase has two content types — `annotation` (MoonReader highlights with callout metadata) and `paragraph` (direct markdown text blocks). These are consumed as a union `annotation | paragraph` throughout the codebase, requiring type guards (`isAnnotation`, `isParagraph`, `isAnnotationOrParagraph`) at every use site. A `transform()` function converts paragraphs into annotation-shaped objects so the UI can treat them uniformly — a leaky abstraction that hides the paragraph's true nature.

Additionally, derived state (`hasFlashcards`, `flashcardCount`) is baked into both types during parsing, coupling content representation to flashcard awareness. This makes the content model impure and harder to reason about.

## Decision
Introduce a `StudyNote` discriminated union type with a shared `StudyNoteCore` base. This replaces both `annotation` and `paragraph` as the domain's content unit.

### StudyNoteCore (shared properties)
```typescript
interface StudyNoteCore {
  id: string;
  content: string;           // the text to study (was: highlight/text)
  personalNote: string;      // user's note ("" if none)
  fingerprint: string;       // content hash for drift detection
  drifted?: boolean;         // has content changed since card creation?
}
```

### Source-specific extensions
```typescript
interface MoonReaderNote extends StudyNoteCore {
  origin: 'moonreader';
  calloutType: string;       // highlight color
  category?: number;         // processing category
  location?: string;         // page reference
}

interface MarkdownNote extends StudyNoteCore {
  origin: 'markdown';
  wasIdPresent: boolean;     // did block ID exist before us?
}

type StudyNote = MoonReaderNote | MarkdownNote;
```

### Key changes from current model
1. **`hasFlashcards` and `flashcardCount` eliminated.** These become queries against the flashcard collection (`deck.flashcardsFor(noteId)`), not properties of the note. StudyNote represents content only.
2. **`transform()` eliminated.** The UI works with `StudyNoteCore` — no conversion between types.
3. **Source-specific UI presentation** handled via optional `NoteRenderHints` provided by the source strategy, not by type branching in components.

## Consequences

**Positive:**
- UI components work with one type (`StudyNoteCore`) instead of switching on `annotation | paragraph`.
- Content model is pure — no flashcard awareness, no derived state, no coupling to review concerns.
- Type safety preserved through discriminated union — strategies can still access source-specific fields.
- Drift detection (`fingerprint`, `drifted`) is a first-class concern on the core type, available for all source types.
- Enables `flashcard.getSourceNote().drifted` pattern for checking content rot.

**Negative:**
- Migration requires updating every site that consumes `annotation` or `paragraph` types.
- `annotation` and `paragraph` interfaces become internal to their respective strategies rather than public API.

## Alternatives Considered
- **Single flat interface with optional fields:** Rejected because `calloutType` on a markdown note and `wasIdPresent` on a MoonReader note are meaningless — optional fields would accumulate as source types grow.
- **Keep `annotation | paragraph` union, fix `transform()`:** Rejected because it preserves the fundamental problem of two incompatible content types leaking through the system.

## Related
- [ADR-022: FlashcardSource Composition](ADR-022-flashcardsource-composition.md) — StudyNote is produced by SourceContent within the FlashcardSource aggregate
- [ADR-018: Source Model Architecture](ADR-018-source-model-architecture.md) — superseded by ADR-022 for the composition model
- [DEBT-031](../stories/DEBT-031-deterministic-modularization-and-domain-model-evolution.md) — parent story
- Session: [2026-02-18 Architecture Refinement](../sessions/2026-02-18-domain-model-architecture-refinement.md)
