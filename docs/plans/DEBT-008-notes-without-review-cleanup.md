# Plan: DEBT-008 — Remove getNotesWithoutReview Deprecated Alias

## Goal

Remove the `getNotesWithoutReview` deprecated alias and its re-exports. Three files,
no architectural decisions, no type renames (those are DEBT-014 scope).

---

## Confirmed Usages (verified against live codebase)

```
src/application/source-api.ts:118   export const getNotesWithoutReview = getSourcesAvailableForDeckCreation;
src/api.ts:24                        getNotesWithoutReview,   (named export)
tests/api.test.ts:58                 getNotesWithoutReview,   (import)
tests/api.test.ts:517-518            deprecated alias test
```

`src/ui/components/book-list.tsx` already uses `getSourcesAvailableForDeckCreation` —
no function change needed there.

`NotesWithoutBooks` type stays in `source-api.ts` and `api.ts` — rename is DEBT-014.

---

## Changes

### 1. `src/application/source-api.ts`

Remove line 118:
```ts
export const getNotesWithoutReview = getSourcesAvailableForDeckCreation;
```
Also remove the `@deprecated` JSDoc comment on the line above if present.

### 2. `src/api.ts`

Remove `getNotesWithoutReview` from the named export block (line 24).
The `NotesWithoutBooks` type export on line 19 stays untouched.

### 3. `tests/api.test.ts`

- Remove `getNotesWithoutReview` from the import on line 58
- Delete the test block at lines 517-518 (the "deprecated alias getNotesWithoutReview
  returns the same results" test and its wrapping describe/test structure)

---

## Out of Scope

- `NotesWithoutBooks` type rename → DEBT-014
- Any changes to `book-list.tsx` — already correct
- Any changes to `source-api.ts` beyond removing the alias line

---

## Verification

Run: `npm test -- --testPathPattern="api"` — all tests must pass.
Run: `npm run build` — must compile clean with no references to `getNotesWithoutReview`.
Confirm with: `grep -rn "getNotesWithoutReview" src/ tests/` — must return zero results.
