# Plan: DEBT-024 — Filter Policy Single Source of Truth

## Reviewed: Approved

## Goal

Eliminate the duplicated `NAVIGATION_FILTER_SESSION_KEY` constant and
`getNavigationFilterFromSessionStorage` helper, and fix `PersonalNotePage` which
currently navigates without respecting the active filter. After this work, every
navigation consumer reads the filter from a single shared module, and the
personal-note page passes it through to navigation functions.

## Current State

| What | Where | Status |
|------|-------|--------|
| Filter logic (`matchesAnnotationFilter`) | `src/utils/annotation-filters.ts` | ✅ Single source of truth — already shared by UI list and navigation-api |
| `NavigationFilter` type | `src/application/navigation-api.ts` (alias for `AnnotationFilter`) | ✅ Already unified |
| `NAVIGATION_FILTER_SESSION_KEY` constant | Duplicated: `annotation-display-list.tsx:70` AND `annotation-with-outlet.tsx:15` | ❌ Duplicated |
| `getNavigationFilterFromSessionStorage()` | Only in `annotation-with-outlet.tsx:17-25` | ❌ Not shared |
| `PersonalNotePage` navigation | `personal-note.tsx:36-37` — calls nav functions **without** filter | ❌ Bug: ignores active filter |

The original DEBT-024 acceptance criteria about "duplicate filter logic in api.ts"
is already resolved — `navigation-api.ts` delegates to `matchesAnnotationFilter`.
What remains is the session-storage plumbing duplication and the personal-note bug.

## Design Decisions

### DD-1: Where to put the shared constant and session-storage helper

**Options considered:**

- **A) `src/utils/annotation-filters.ts`** — co-locate with filter types.
  Pro: single file for all filter concerns. Con: mixes pure logic (filter
  predicates) with browser-side-effect code (sessionStorage), making the
  pure module harder to test without DOM mocks.

- **B) `src/application/navigation-api.ts`** — co-locate with navigation.
  Pro: navigation is the consumer. Con: this module currently has no browser
  dependencies (only plugin-context); adding sessionStorage couples it to
  the browser and breaks the clean application-layer boundary.

- **C) New file `src/utils/navigation-filter-session.ts`** — dedicated
  module for the session-storage contract.
  Pro: clear responsibility (serialize/deserialize filter for session
  boundary), keeps annotation-filters.ts pure, keeps navigation-api.ts
  free of browser deps. Con: one more file.

**Chosen: C** — a small dedicated module. The constant + helper are exactly
3 exports (~15 lines). The alternative of polluting either pure module with
sessionStorage is worse than one focused file. The test in
`AnnotationListPage.test.tsx` that currently re-declares the constant will
import it instead, catching any future key rename.

### DD-2: Personal-note fix — one commit or two?

**Options considered:**

- **A) Two commits:** first extract the shared module, then fix personal-note
  in a separate commit. Pro: each commit is independently green and
  reviewable. Con: slightly more overhead.

- **B) One commit:** extract + fix + test together. Pro: atomic change,
  less overhead. Con: mixes refactor with bug fix, harder to revert one
  without the other.

**Chosen: A — two commits.** Commit 1 is a pure refactor (extract, update
imports, zero behavior change). Commit 2 is a bug fix (personal-note reads
filter and passes it). This matches the project convention of separating
refactor from fix types.

### DD-3: Test strategy for personal-note navigation filter

**Options considered:**

- **A) Unit test in `PersonalNotePage.test.tsx`** — seed sessionStorage
  with a filter before render, assert that the mocked
  `getPreviousAnnotationIdForSection` / `getNextAnnotationIdForSection`
  are called with the expected filter argument. This uses the existing
  mock infrastructure (the nav functions are already mocked in this file).

- **B) Integration test with real navigation-api** — unmock the nav
  functions and supply real bookSections data. Pro: higher confidence.
  Con: requires full plugin initialization with annotations that have
  mixed processed/unprocessed state, heavy fixture setup, and the
  existing test file already mocks these functions.

**Chosen: A — unit test verifying the filter is forwarded.** The contract
that navigation-api correctly applies the filter is already tested in
`tests/api.test.ts:871-1072`. What's missing is the test that
`PersonalNotePage` actually reads and passes the filter. A simple unit test
that seeds sessionStorage and checks the mock call args is sufficient and
does not require new fixtures.

### DD-4: Should the AnnotationListPage test import the shared constant?

**Yes.** `tests/routes/books/book/annotation/AnnotationListPage.test.tsx:20`
currently re-declares `NAVIGATION_FILTER_SESSION_KEY`. After commit 1, it
should import from the new shared module. This way, if someone renames the
key, the test stays in sync.

## Implementation

### Commit 1: `refactor: extract navigation filter session helpers to shared module`

**New file:** `src/utils/navigation-filter-session.ts`
```typescript
import type { AnnotationFilter } from "src/utils/annotation-filters";

export const NAVIGATION_FILTER_SESSION_KEY = "annotationNavigationFilter";

export function getNavigationFilterFromSessionStorage(): AnnotationFilter | undefined {
    const serialized = sessionStorage.getItem(NAVIGATION_FILTER_SESSION_KEY);
    if (!serialized) return undefined;
    try {
        return JSON.parse(serialized) as AnnotationFilter;
    } catch {
        return undefined;
    }
}

export function setNavigationFilterInSessionStorage(filter: AnnotationFilter): void {
    sessionStorage.setItem(NAVIGATION_FILTER_SESSION_KEY, JSON.stringify(filter));
}
```

**Modified files:**

1. `src/ui/components/annotation-display-list.tsx`
   - Remove `const NAVIGATION_FILTER_SESSION_KEY = ...` (line 70)
   - Import `{ NAVIGATION_FILTER_SESSION_KEY, setNavigationFilterInSessionStorage }` from `src/utils/navigation-filter-session`
   - Replace the `sessionStorage.setItem(...)` call with `setNavigationFilterInSessionStorage({...})`

2. `src/ui/routes/books/book/annotation/annotation-with-outlet.tsx`
   - Remove `const NAVIGATION_FILTER_SESSION_KEY = ...` (line 15)
   - Remove local `getNavigationFilterFromSessionStorage` function (lines 17-25)
   - Import `{ getNavigationFilterFromSessionStorage }` from `src/utils/navigation-filter-session`

3. `tests/routes/books/book/annotation/AnnotationListPage.test.tsx`
   - Remove `const NAVIGATION_FILTER_SESSION_KEY = ...` (line 20)
   - Import `{ NAVIGATION_FILTER_SESSION_KEY }` from `src/utils/navigation-filter-session`

**Verification:** `npm test` passes with no behavior change. Snapshot tests unchanged.

### Commit 2: `fix: PersonalNotePage navigation respects active filter`

**Modified files:**

1. `src/ui/routes/import/personal-note.tsx`
   - Import `{ getNavigationFilterFromSessionStorage }` from `src/utils/navigation-filter-session`
   - Call `getNavigationFilterFromSessionStorage()` and pass result to both nav functions

   Before:
   ```typescript
   const previousAnnotationId = getPreviousAnnotationIdForSection(bookId, params.sectionId, annotation.id);
   const nextAnnotationId = getNextAnnotationIdForSection(bookId, params.sectionId, annotation.id);
   ```
   After:
   ```typescript
   const navigationFilter = getNavigationFilterFromSessionStorage();
   const previousAnnotationId = getPreviousAnnotationIdForSection(bookId, params.sectionId, annotation.id, navigationFilter);
   const nextAnnotationId = getNextAnnotationIdForSection(bookId, params.sectionId, annotation.id, navigationFilter);
   ```

2. `tests/routes/import/PersonalNotePage.test.tsx`
   - Add test: `"navigation respects active filter from session storage"`
   - Add test: `"navigation works without filter in session storage"`

**Verification:** `npm test` passes. New tests green.

## Test Contract

### Commit 1 — no new tests, existing tests pass unchanged

All existing tests in `AnnotationListPage.test.tsx`, `PersonalNotePage.test.tsx`,
and `api.test.ts` must pass with zero changes to assertions (only import changes
in `AnnotationListPage.test.tsx`).

### Commit 2 — new tests

**File:** `tests/routes/import/PersonalNotePage.test.tsx`

```
test: "navigation respects active filter from session storage"
```
- Seed `sessionStorage` with `NAVIGATION_FILTER_SESSION_KEY` →
  `{ mainFilter: "processed", categoryFilter: null, colorFilter: null }`
- Render `PersonalNotePage`
- Assert `getPreviousAnnotationIdForSectionMock` was called with
  `(bookId, sectionId, annotationId, { mainFilter: "processed", categoryFilter: null, colorFilter: null })`
- Assert `getNextAnnotationIdForSectionMock` called with same filter arg

```
test: "navigation works without filter in session storage"
```
- Ensure `sessionStorage` has no `NAVIGATION_FILTER_SESSION_KEY`
- Render `PersonalNotePage`
- Assert `getPreviousAnnotationIdForSectionMock` called with `(bookId, sectionId, annotationId, undefined)`
- Assert `getNextAnnotationIdForSectionMock` called with `undefined`

### Existing snapshot tests

The two inline snapshots in `PersonalNotePage.test.tsx` will NOT change —
the navigation filter only affects which annotation IDs are returned by the
already-mocked functions, not the rendered DOM structure.

## Verification Gates

1. `npm test` — full suite green after each commit
2. `npm run build` — no TypeScript errors
3. No file in `src/` still declares `NAVIGATION_FILTER_SESSION_KEY` locally:
   `grep -r "NAVIGATION_FILTER_SESSION_KEY" src/ | grep -v navigation-filter-session`
4. `getNavigationFilterFromSessionStorage` defined only in `src/utils/navigation-filter-session.ts`
5. Both `PersonalNotePage` and `AnnotationWithOutlet` import from `src/utils/navigation-filter-session`

## Delegation

```bash
scripts/delegate-codex-task.sh \
  --branch debt-024-filter-policy \
  --base main \
  --scope-file docs/plans/DEBT-024-filter-policy.md \
  --test-contract docs/plans/DEBT-024-filter-policy-test-contract.md \
  --log-file docs/executions/logs/debt-024-filter-policy.log \
  --semantic-log docs/executions/semantic/debt-024-filter-policy.md \
  --quiet \
  --execute
```
