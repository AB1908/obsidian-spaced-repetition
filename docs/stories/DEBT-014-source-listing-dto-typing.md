# DEBT-014: Source Listing DTO Naming and Typing Cleanup

## Status
Backlog

## Epic
None

## Depends on
- [DEBT-008](DEBT-008-notes-without-review-naming.md) — establishes the new source-listing API contract used by deck creation

## Description
The `NotesWithoutBooks` interface is the DTO for deck-creation source listing. It is defined in `src/application/source-api.ts` and re-exported from `src/api.ts`. The name and fields do not reflect the current domain vocabulary.

Current state:
- `NotesWithoutBooks` is still the exported DTO name from `src/api.ts` (re-exported via `source-api.ts`)
- `getSourcesAvailableForDeckCreation()` returns `NotesWithoutBooks[]` — the function name is now accurate, but the return type name is not
- `src/ui/components/book-list.tsx` imports `NotesWithoutBooks` from `src/api` and uses it as the `useLoaderData()` type
- Fields `sourceType` and `requiresSourceMutationConfirmation` are computed from `AnnotationsNote.getSourceCapabilities()` — the derivation is now clean (single source of truth in `sourceCapabilities.ts`), but the DTO name does not communicate this

Current pain points:
- `NotesWithoutBooks` does not reflect current responsibility (listing sources available for deck creation, not "notes without books")
- Type ownership unclear at a glance — the interface is in the application layer (`source-api.ts`) but named like a legacy data concept
- `tags: string[]` in the DTO has no explicit semantics — it is the raw file tags array, used only for display in `book-list.tsx`

## Impact
- Makes API surface harder to read and reason about for new contributors
- `book-list.tsx` imports a type named `NotesWithoutBooks` while rendering a "Choose a source" UI — naming mismatch at point of use
- Slows follow-up refactors around source polymorphism (DEBT-013)

## Acceptance Criteria
- [ ] Replace `NotesWithoutBooks` with an idiomatic source-listing DTO name (e.g. `SourceListingEntry`, `DeckCreationSource`)
- [ ] Clarify where the listing contract is defined (keep in `src/application/source-api.ts`, not `src/api.ts`)
- [ ] Preserve runtime behavior (`sourceType`, `requiresSourceMutationConfirmation`) and backwards compatibility where required
- [ ] Update affected tests/call sites with minimal churn

## Tasks
- [ ] Propose final DTO name and ownership location
- [ ] Refactor type exports/imports in `src/api.ts` and UI callers
- [ ] Add/adjust tests to lock contract semantics

## Likely Touchpoints
- `src/application/source-api.ts` — `NotesWithoutBooks` interface definition, `getSourcesAvailableForDeckCreation()`
- `src/api.ts` — re-exports `NotesWithoutBooks` and `getNotesWithoutReview` (deprecated alias)
- `src/ui/components/book-list.tsx` — `BookCreator` imports `NotesWithoutBooks` as loader data type
- `tests/api.test.ts` — may reference `NotesWithoutBooks` type or `getNotesWithoutReview`
- `tests/routes_books_api.test.ts` — may reference `NotesWithoutBooks`

## Related
- [DEBT-008](DEBT-008-notes-without-review-naming.md)
- [DEBT-013](DEBT-013-source-polymorphism.md)
