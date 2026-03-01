# DEBT-008: getNotesWithoutReview Naming and Complexity

## Status
Ready

## Epic
None

## Description
`getNotesWithoutReview()` has been deprecated and aliased in `src/application/source-api.ts` (line 117-118):

```ts
/** @deprecated Use getSourcesAvailableForDeckCreation instead. */
export const getNotesWithoutReview = getSourcesAvailableForDeckCreation;
```

The canonical function is now `getSourcesAvailableForDeckCreation`. However, `getNotesWithoutReview` is still re-exported from `src/api.ts` alongside the new name, and the `NotesWithoutBooks` DTO type (which is the misleading legacy name for the return type) is also still exported from `src/api.ts` and imported in `src/ui/components/book-list.tsx`.

### Remaining Issues

**Stale alias in api.ts:** `src/api.ts` re-exports both `getNotesWithoutReview` and `getSourcesAvailableForDeckCreation` from `src/application/source-api.ts`. The deprecated alias needs to be removed once all call sites migrate.

**DTO name still stale:** `NotesWithoutBooks` is the return type for `getSourcesAvailableForDeckCreation`. The name does not reflect current responsibility — it is a source-listing DTO, not a "notes without books" concept. This overlaps with DEBT-014.

**Mutation-confirmation logic:** The original duplication concern (mutation-confirmation logic duplicated between listing and creation) has been resolved. `requiresSourceMutationConfirmation` is now derived from `AnnotationsNote.getSourceCapabilities()`, which delegates to `sourceCapabilities.ts` — a single source of truth. The creation path (`deck-api.ts`) calls `book.requiresSourceMutationConfirmation()` on the same model. No more duplication.

**sourceType computation:** This is now correctly owned by `AnnotationsNote.getSourceType()` → `source-strategy.ts` → `source-discovery.ts`. Clean.

## Impact
- The deprecated `getNotesWithoutReview` export pollutes the public API surface
- `NotesWithoutBooks` type name is misleading at all call sites (`book-list.tsx`, tests)
- New developers may use the deprecated name from habit or autocomplete

## Acceptance Criteria
- [ ] Remove `getNotesWithoutReview` export from `src/api.ts` (breaking change, update call sites first)
- [ ] Migrate `book-list.tsx` to import `getSourcesAvailableForDeckCreation` directly
- [ ] Rename `NotesWithoutBooks` (see DEBT-014 for the full DTO naming cleanup)
- [ ] Confirm no test files import `getNotesWithoutReview`

## Likely Touchpoints
- `src/api.ts` — deprecated re-export of `getNotesWithoutReview`, `NotesWithoutBooks` type
- `src/application/source-api.ts` — `getSourcesAvailableForDeckCreation`, deprecated alias at line 117-118
- `src/ui/components/book-list.tsx` — imports both `getSourcesAvailableForDeckCreation` and `NotesWithoutBooks` from `src/api`
- `tests/api.test.ts` — may reference old function name

## Related
- [DEBT-005](../archive/stories/DEBT-005-source-discovery-policy-boundary.md) — source discovery policy boundary
- [DEBT-014](DEBT-014-source-listing-dto-typing.md) — follow-up for source-listing DTO naming/typing cleanup
