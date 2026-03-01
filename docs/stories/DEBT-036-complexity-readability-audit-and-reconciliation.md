# DEBT-036: Complexity and readability audit with branch-state reconciliation

## Status
Ready

## Epic
None

## User Story
As a maintainer, I want to reduce architectural complexity and naming drift while reconciling branch/main state deterministically, so that implementation intent and runtime behavior stay aligned.

## Acceptance Criteria
- [ ] Branch-state reconciliation is completed and verified (planned commit state matches effective `main` runtime state for current refactor slices).
- [ ] Review flow ownership is finalized: review session state machine and persistence boundaries are explicit and test-covered.
- [ ] `AnnotationsNote` responsibilities are reduced by extracting at least one mixed concern into a focused module.
- [ ] `settings.ts` is split into focused units (schema/defaults/UI construction), preserving behavior and tests.
- [ ] Naming drift at the API boundary is reduced (legacy aliases documented, canonical names clear).
- [ ] Dead/placeholder abstractions are either removed or explicitly marked as deprecated with migration notes.
- [ ] A lightweight complexity report format is added to execution semantic logs (size/churn hotspots + unresolved risk markers).

## Context
Audit snapshot identified the following risks. Some have been partially addressed; current state is noted.

### 1. Review Flow Responsibility (High)
`AnnotationsNote` in `src/data/models/annotations-note/AnnotationsNote.ts` still holds the review session state machine directly (`reviewIndex`, `reviewDeck`, `startReviewing()`, `isInReview()`, `getReviewCard()`, `nextReviewCard()`, `finishReviewing()`, `resetReview()`). Several concerns have been extracted into focused modules:
- `src/data/models/annotations-note/review-deck.ts` — `shuffledReviewDeck()`
- `src/data/models/annotations-note/review-mutations.ts` — `processFlashcardReview()`
- `src/data/models/annotations-note/review-stats.ts` — `computeReviewStats()`

But the state machine (`reviewIndex`, start/next/finish) remains embedded in `AnnotationsNote` alongside identity, annotation querying, persistence orchestration, and flashcard mutations. The review session lifecycle has no dedicated owner.

### 2. `AnnotationsNote` Mixed-Concern Aggregate (High)
`AnnotationsNote` coordinates: source identity (`id`, `name`, `path`, `tags`), source state initialization (`initialize()`), annotation querying (`getAnnotation()`, `getProcessedAnnotations()`), coverage computation (`annotationCoverage()`), flashcard mutation delegation (`createFlashcard()`, `deleteFlashcard()`, `updateFlashcardContents()`), review session state machine (see above), strategy resolution (`strategy`, `resolveStrategy()`), and flashcard note creation (`createFlashcardNote()`). This is a classic god class — high cognitive load and regression risk.

### 3. Naming Drift at API Boundaries (High)
Book/source term intermixing remains at multiple layers:
- `AnnotationsNoteIndex.getBook()` returns an `AnnotationsNote` — method name is book-flavoured
- `frontbook` interface in `annotations-note/types.ts` (has `// TODO: this is not really a "book" per se` comment)
- `SourceRecord` type alias exists but is not yet used
- `bookSections`, `getBookFrontmatter()` field/method names on `AnnotationsNote`
- `getBookById`, `getBookChapters`, `getSectionTreeForBook` in `src/application/source-api.ts`

### 4. `settings.ts` is Oversized (Medium)
`src/settings.ts` contains: the `SRSettings` interface, `DEFAULT_SETTINGS` object, `applySettingsUpdate` debounce helper, and the full `SRSettingTab` class with `display()` rendering 700+ lines of Obsidian `Setting` calls. Schema, defaults, and UI rendering concerns are all in one 746-line file.

### 5. Dead/Placeholder Abstractions (Medium)
- `src/data/models/Source.ts` — `FlashcardSource` / `Source` stub with `getAnnotationsNotePath()` returning `""`, unused in production code
- `src/data/models/ISourceStrategy.ts` — backward-compat alias pointing to `FlashcardSourceStrategy`, also unused in production code
- Both exist with backward-compat comments but have no active callers

## Deterministic Follow-up Slices

### Slice A: Branch-State Reconciliation
- Verify effective `main` runtime matches any prior worktree/branch refactor outputs.
- Record expected vs actual topology in an execution log.

### Slice B: Review Responsibility Boundary
- Extract review session state machine from `AnnotationsNote` into a dedicated `ReviewSession` or equivalent module.
- Finalize pure review session ownership and application-layer persistence boundaries.
- Add/maintain explicit contract tests for lifecycle + scheduling intent.

### Slice C: Settings Decomposition
- Split `src/settings.ts` into schema/defaults module and UI rendering module.
- Keep compatibility surface stable for plugin loading and tests.

### Slice D: API Naming and Dead Abstraction Cleanup
- Replace `getBook()` with source-neutral name in `AnnotationsNoteIndex`
- Replace `frontbook` with `SourceRecord` across `annotations-note/types.ts` and all usages
- Remove `Source.ts` and `ISourceStrategy.ts` stubs (or document non-negotiable reason for keeping)
- Deprecate or remove `getNotesWithoutReview` alias from `src/api.ts`

## Likely Touchpoints
- `src/data/models/annotations-note/AnnotationsNote.ts` — review state machine, book-metaphor methods
- `src/data/models/annotations-note/AnnotationsNoteIndex.ts` — `getBook()` naming
- `src/data/models/annotations-note/types.ts` — `frontbook`, `SourceRecord`, `book` interfaces
- `src/data/models/annotations-note/review-deck.ts` — `shuffledReviewDeck`
- `src/data/models/annotations-note/review-mutations.ts` — `processFlashcardReview`
- `src/data/models/annotations-note/review-stats.ts` — `computeReviewStats`
- `src/data/models/Source.ts` — dead stub
- `src/data/models/ISourceStrategy.ts` — dead stub
- `src/application/source-api.ts` — `getBookById`, `getBookChapters`, `getSectionTreeForBook` naming
- `src/api.ts` — deprecated exports
- `src/settings.ts` — monolithic settings file
- `tests/api.test.ts`, `tests/api_orchestrator.test.ts` — review and source API tests

## Related
- `docs/stories/DEBT-031-deterministic-modularization-and-domain-model-evolution.md`
- `docs/guides/workflow.md`
- `docs/guides/work-organization.md`
- [DEBT-013](DEBT-013-source-polymorphism.md) — book metaphor cleanup
- [DEBT-022](DEBT-022-api-module-decomposition-for-verifiability.md) — API decomposition
