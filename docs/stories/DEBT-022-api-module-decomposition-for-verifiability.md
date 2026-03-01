# DEBT-022: Decompose `api.ts` into Verifiable Modules

## Status
Ready

## Epic
None

## Description
`src/api.ts` has been substantially decomposed since this story was first written. The file is now a thin re-export facade: it imports from focused modules in `src/application/` and re-exports them under the original flat API surface. However, the facade itself still carries stale exports and the decomposition is not yet complete.

### Current State of Decomposition

`src/api.ts` now re-exports from:
- `src/application/review-api.ts` — review session functions (`getNextCard`, `getCurrentCard`, `deleteFlashcard`, `updateFlashcardSchedulingMetadata`, `getSourcesForReview`, `resetBookReviewState`, `getFlashcardById`)
- `src/application/source-api.ts` — source/book listing (`getBookById`, `getAnnotationsNoteById`, `getSectionTreeForBook`, `getBookChapters`, `getSourceCapabilities`, `getSourcesAvailableForDeckCreation`, deprecated `getNotesWithoutReview`)
- `src/application/import-api.ts` — import/export functions
- `src/application/annotation-api.ts` — annotation CRUD and paragraph helpers
- `src/application/deck-api.ts` — deck creation
- `src/application/navigation-api.ts` — breadcrumb and annotation navigation

### Remaining Issues

**Stale/deprecated exports in `src/api.ts`:** `getNotesWithoutReview` and the `NotesWithoutBooks` type are re-exported alongside their replacements. These deprecated symbols increase the API surface without adding value (see DEBT-008).

**Facade is not the documented public surface:** Route files import from `src/api` directly. If a module is added to `src/application/` without a corresponding re-export in `src/api.ts`, it is not accessible to the UI layer. The indirection layer provides no contract tests to lock what is public vs internal.

**`src/ui/routes/books/api.ts`** exists as a second route-level API adapter (wrapping `src/api` navigation functions). This is an additional indirection layer that is not documented.

**No module-level contract tests:** The application modules (`review-api.ts`, `source-api.ts`, etc.) have tests in `tests/api.test.ts` and `tests/api_orchestrator.test.ts`, but these test through the facade rather than the modules directly. Per the original acceptance criteria, each module should have targeted contract tests.

## Acceptance Criteria
- [ ] Remove deprecated exports from `src/api.ts` facade (after DEBT-008 call sites migrated)
- [ ] Document which symbols are intentionally public (re-exported via `src/api.ts`) vs internal to `src/application/`
- [ ] Each `src/application/` module has at least one targeted contract test that does not go through the `src/api.ts` facade
- [ ] No behavior change in migration phase (structure-only refactor first)

## Suggested Module Shape (Current Reality)
- `src/application/review-api.ts` — exists
- `src/application/source-api.ts` — exists
- `src/application/deck-api.ts` — exists
- `src/application/import-api.ts` — exists
- `src/application/navigation-api.ts` — exists
- `src/application/annotation-api.ts` — exists
- `src/api.ts` — thin facade re-exporting all of the above

## Likely Touchpoints
- `src/api.ts` — facade re-exports, deprecated symbols
- `src/application/review-api.ts` — review module
- `src/application/source-api.ts` — source listing module
- `src/application/deck-api.ts` — deck creation module
- `src/application/import-api.ts` — import module
- `src/application/annotation-api.ts` — annotation CRUD module
- `src/application/navigation-api.ts` — navigation module
- `src/ui/routes/books/api.ts` — second route-level adapter (wraps navigation functions)
- All imports in `src/ui/routes/**` that import from `src/api`
- `tests/api.test.ts`
- `tests/api_orchestrator.test.ts`
- `tests/routes_books_api.test.ts`

## Related
- [DEBT-013](DEBT-013-source-polymorphism.md)
- [DEBT-008](DEBT-008-notes-without-review-naming.md) — deprecated exports that need removal
