# DEBT-014: Source Listing DTO Naming and Typing Cleanup

## Status
Backlog

## Epic
None

## Depends on
- [DEBT-008](DEBT-008-notes-without-review-naming.md) — establishes the new source-listing API contract used by deck creation

## Description
`src/api.ts` still exposes `NotesWithoutBooks` as the DTO for deck-creation source listing. The name and typing are non-idiomatic now that listing includes multiple source categories (not just "notes without books").

Current pain points:
- DTO name does not reflect current responsibility (`getSourcesAvailableForDeckCreation` output).
- Type ownership is unclear (API layer vs domain model property derivation).
- Mutation-confirmation policy and source classification fields should be represented with clearer app-layer contracts.

## Impact
- Makes API surface harder to read and reason about.
- Increases risk of ad-hoc typing workarounds in call sites/tests.
- Slows follow-up refactors around source polymorphism.

## Acceptance Criteria
- [ ] Replace `NotesWithoutBooks` with an idiomatic source-listing DTO name.
- [ ] Clarify where the listing contract is defined (API/app layer) and keep domain boundaries explicit.
- [ ] Preserve runtime behavior (`sourceType`, `requiresSourceMutationConfirmation`) and backwards compatibility where required.
- [ ] Update affected tests/call sites with minimal churn.

## Tasks
- [ ] Propose final DTO name and ownership location.
- [ ] Refactor type exports/imports in `src/api.ts` and UI callers.
- [ ] Add/adjust tests to lock contract semantics.

## Related
- [DEBT-008](DEBT-008-notes-without-review-naming.md)
- [DEBT-013](DEBT-013-source-polymorphism.md)
