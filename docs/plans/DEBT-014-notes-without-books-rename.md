# Plan: DEBT-014 — Rename NotesWithoutBooks to SourceListingEntry

## Goal

Rename the `NotesWithoutBooks` interface to `SourceListingEntry` everywhere. Pure
mechanical rename — no behavior changes, no field changes, no file moves.

---

## Confirmed Usages (verified against live codebase)

```
src/application/source-api.ts:24   export interface NotesWithoutBooks {
src/application/source-api.ts:102  getSourcesAvailableForDeckCreation(): NotesWithoutBooks[]
src/api.ts:19                       export type { NotesWithoutBooks, frontEndBook }
src/ui/components/book-list.tsx:2   import { ..., NotesWithoutBooks } from "src/api"
src/ui/components/book-list.tsx:11  useLoaderData() as NotesWithoutBooks[]
src/ui/components/book-list.tsx:22  async function clickHandler(book: NotesWithoutBooks)
```

No test files directly reference the type name (confirmed — tests reference values, not
the type).

---

## Changes

### 1. `src/application/source-api.ts`

Rename the interface declaration:
```ts
// before
export interface NotesWithoutBooks {

// after
export interface SourceListingEntry {
```

Update the return type annotation on `getSourcesAvailableForDeckCreation`:
```ts
// before
export function getSourcesAvailableForDeckCreation(): NotesWithoutBooks[]

// after
export function getSourcesAvailableForDeckCreation(): SourceListingEntry[]
```

### 2. `src/api.ts`

Update the type re-export:
```ts
// before
export type { NotesWithoutBooks, frontEndBook }

// after
export type { SourceListingEntry, frontEndBook }
```

### 3. `src/ui/components/book-list.tsx`

Update import and all three usage sites:
```ts
// before
import { createFlashcardNoteForAnnotationsNote, getSourcesAvailableForDeckCreation, NotesWithoutBooks } from "src/api";

// after
import { createFlashcardNoteForAnnotationsNote, getSourcesAvailableForDeckCreation, SourceListingEntry } from "src/api";
```

Replace `NotesWithoutBooks` with `SourceListingEntry` on lines 11 and 22.

---

## Out of Scope

- Field renames inside the interface — names (`sourceType`, `requiresSourceMutationConfirmation`, `tags`) stay as-is
- Any other structural changes to `source-api.ts`

---

## Verification

Run: `npm test -- --testPathPattern="api|book"` — all tests must pass.
Run: `npm run build` — must compile clean.
Run: `bash -c '! grep -rn "NotesWithoutBooks" src/ tests/'` — must return zero results.
