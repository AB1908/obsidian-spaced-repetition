# DEBT-013: Source Polymorphism — Markdown vs MoonReader Annotation Exports

## Status
Backlog

## Description

The plugin has two distinct source types that share the `AnnotationsNote` model. The strategy pattern has been partially implemented, but vocabulary and boundary issues remain.

### Current State

Two source types exist:
1. **MoonReader annotation exports** (`review/book` or `review/note` tag) — file is a structured Moon Reader export. A separate flashcard sidecar is created.
2. **Direct markdown sources** (`clippings` tag) — file is a regular markdown note. Block IDs are injected, the file is moved to its own folder, and a flashcard sidecar is created.

The **strategy pattern is now implemented** via `FlashcardSourceStrategy` (`src/data/models/FlashcardSourceStrategy.ts`), with concrete classes:
- `MoonReaderStrategy` (`src/data/models/strategies/MoonReaderStrategy.ts`)
- `MarkdownSourceStrategy` (`src/data/models/strategies/MarkdownSourceStrategy.ts`)

Strategy is resolved by `resolveSourceStrategy()` in `src/data/models/annotations-note/source-strategy.ts`, which delegates to `getSourceType()` in `src/data/source-discovery.ts`.

`AnnotationsNote.getNavigableSections()` delegates to `this.strategy.getNavigableSections()`, which now returns chapters for MoonReader sources and appropriate headings for markdown sources.

### Remaining Issues

**Vocabulary drift in `AnnotationsNote`:**
- `bookSections`, `getBookFrontmatter()`, `book.id`, `getBook()` — still use book-metaphor naming
- `AnnotationsNote` struct implements `frontbook` interface (in `annotations-note/types.ts`), which is annotated with `// TODO: this is not really a "book" per se`
- `SourceRecord` type alias exists in `types.ts` but is not yet used in place of `frontbook`
- `AnnotationsNoteIndex.getBook()` returns an `AnnotationsNote` — the method name is still book-flavoured

**Stub abstraction in `Source.ts`:**
- `FlashcardSource` / `Source` class in `src/data/models/Source.ts` exists as a stub with a `getAnnotationsNotePath()` that returns `""` and is unused. `ISourceStrategy` in `src/data/models/ISourceStrategy.ts` is a backward-compat alias. Neither is consumed anywhere in the production code path.

**Deck creation mutation lives in application layer:**
- `addBlockIdsToParagraphs` and `ensureDirectMarkdownSourceInOwnFolder` in `src/application/deck-creation-helpers.ts` operate on raw file contents and metadata — markdown-source-specific mutation logic that has no home in the strategy or model.

**`frontbook` interface name** leaks the book metaphor into the type system. `SourceRecord` alias was added as a future replacement but is not yet used.

### Where Behavior Still Diverges
- After `createFlashcardNote()`, `AnnotationsNote.bookSections` may still be empty for markdown sources if the initialize cycle does not re-run after block ID injection and file move.
- `getNavigableSections()` now delegates to the strategy, so this is improved. But `getAnnotation()` still calls `toAnnotationLike()` on paragraphs, which is a shim rather than proper polymorphism.

## Acceptance Criteria
- [x] Analyse both source paths end-to-end (creation, parsing, navigation, flashcard generation) — see plan
- [x] Document where behavior diverges and where it converges — strategy pattern implemented
- [x] Propose model design with tradeoff analysis — composition/strategy (ADR-018 confirmed)
- [ ] Remove or replace the `FlashcardSource`/`Source` stub in `src/data/models/Source.ts`
- [ ] Replace `frontbook` / `getBook()` vocabulary with source-neutral names
- [ ] Move markdown-source mutation helpers out of application layer into the strategy or a dedicated domain module
- [ ] Consider migration path for existing vault data

## Plan
[Source Model Seam Repair](../plans/DEBT-011-source-model-seam-repair.md) — PRs 2-4 address this story's concerns

## Likely Touchpoints
- `src/data/models/annotations-note/AnnotationsNote.ts` — `frontbook` impl, `getBookFrontmatter()`, book-metaphor methods
- `src/data/models/annotations-note/types.ts` — `frontbook`, `SourceRecord`, `book` interfaces
- `src/data/models/annotations-note/AnnotationsNoteIndex.ts` — `getBook()`, `sourceNotes`
- `src/data/models/annotations-note/source-strategy.ts` — strategy resolution
- `src/data/models/FlashcardSourceStrategy.ts` — strategy interface
- `src/data/models/strategies/MarkdownSourceStrategy.ts` — markdown strategy implementation
- `src/data/models/strategies/MoonReaderStrategy.ts` — MoonReader strategy implementation
- `src/data/models/Source.ts` — stub `FlashcardSource`/`Source` class (unused, should be removed)
- `src/data/models/ISourceStrategy.ts` — backward-compat alias (should be removed)
- `src/application/deck-creation-helpers.ts` — `addBlockIdsToParagraphs`, `ensureDirectMarkdownSourceInOwnFolder`
- `src/data/source-discovery.ts` — `SourceType`, `getSourceType()`

## Related
- [DEBT-001](DEBT-001-inconsistent-data-models.md) — discriminated union (PR 1 prerequisite)
- [DEBT-006](DEBT-006-disk-business-logic.md) — disk.ts boundary (related extraction targets)
- [STORY-013](../archive/stories/STORY-013-markdown-deck-creation-source-chooser.md) — introduced the markdown source path
