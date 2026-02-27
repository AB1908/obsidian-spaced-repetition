# Plan: BUG-002 — Modal Title Doesn't Update During Navigation

**Story:** [BUG-002](../stories/BUG-002-modal-title-navigation.md)
**Test contract:** [BUG-002-modal-title-navigation-test-contract.md](BUG-002-modal-title-navigation-test-contract.md)

---

## Root Cause

`ModalTitleContext.tsx` uses `useParams()` inside `ModalTitleProvider`, which is placed at the
root route (`path: ""`). React Router v6 returns `{}` from `useParams()` at that level — the
params `:bookId` and `:sectionId` only exist in descendant routes. The title `useEffect` never
fires with real values.

A secondary issue: `edit-card.tsx` and `upsert-card.tsx` set "Editing: ..." with no cleanup, so
the title sticks when navigating away.

The existing `root.test.tsx` masks this by globally mocking `useParams` to return fake params.

---

## Approach: Route `handle` + `useMatches()` (React Router v6 idiomatic)

Rather than fixing the broken `useParams` approach, replace the entire mechanism with the
React Router v6 idiomatic pattern. Each route definition declares a `handle.title` function.
`Root` calls `useMatches()` and evaluates the deepest match with a title handle. No shared
mutable state, no `useEffect`, no cleanup functions.

**Result:** `ModalTitleContext.tsx` and `useModalTitle` are deleted entirely.

---

## Design Decisions

**1. Title as a function on `handle`, not a string.**
Title values often depend on loader data (book name, flashcard question). A function
`(match) => string` receives the match object (including `data` from the route's loader)
and returns the display string. Static titles (e.g. "Card Coverage") are simple constant functions.

**2. Extend `annotationsLoader` to return `sectionName`.**
Currently missing from loader data. The title for annotation routes needs both book name and
section name. Adding it to the loader return keeps all title-relevant data in one place and
eliminates the need for `getBreadcrumbData()` at render time.

**3. Remove `getBreadcrumbData()` from render path.**
Once loaders return the needed data, `getBreadcrumbData()` (which reaches into the plugin index
at render time) is no longer needed for title computation. It may remain for other uses, but
its role in title management ends here.

**4. `Root` computes title from `useMatches()`, not from context.**
Remove `useModalTitle()` from `Root`. Replace with `useMatches()`: find the rightmost match
with a `handle.title`, call it with the match, use the result. Fallback is "Card Coverage".

---

## Affected Files

| File | Change |
|------|--------|
| `src/ui/modals/ModalTitleContext.tsx` | **Delete** |
| `src/ui/modals/flashcard-modal.tsx` | Remove `ModalTitleProvider` wrapper |
| `src/ui/routes/root.tsx` | Replace `useModalTitle()` with `useMatches()` title logic |
| `src/ui/routes/routes.tsx` | Add `handle.title` to all ~16 routes |
| `src/ui/routes/books/book/annotation/annotation-with-outlet.tsx` | Remove `setModalTitle` calls |
| `src/ui/routes/books/card/edit-card.tsx` | Remove `setModalTitle` calls |
| `src/ui/routes/books/card/upsert-card.tsx` | Remove `setModalTitle` calls |
| `src/data/loaders/` (annotationsLoader) | Add `sectionName` to return shape |
| `tests/root.test.tsx` | Remove `useParams` mock; update title assertions |

---

## Routes Needing `handle.title`

Grouped by title type:

**Static ("Card Coverage"):** `/books`, `/import`, `/tags`, `/books/create`

**Book name only:** `/books/:bookId`, `/import/books/:bookId/details`

**Book + section name:** `/books/:bookId/chapters/:sectionId/annotations`,
`/books/:bookId/chapters/:sectionId/annotations/:annotationId`,
`/import/books/:bookId/chapters/:sectionId/annotations`,
`/import/books/:bookId/chapters/:sectionId/annotations/:annotationId`,
`/import/books/:bookId/chapters/:sectionId/annotations/:annotationId/personal-note`

**Card editing ("Editing: …" or "Creating New Flashcard"):**
`/books/:bookId/chapters/:sectionId/annotations/:annotationId/flashcards/:flashcardId`,
`/books/:bookId/chapters/:sectionId/annotations/:annotationId/flashcards/new/regular`,
`/books/:bookId/flashcards/:flashcardId/edit`

---

## Implementation Steps

**Step 1 — Fix the masking test first (red-first)**

Remove the global `useParams` mock from `tests/root.test.tsx` and confirm the test now fails.
This proves the bug is real. Do not implement anything until failure is confirmed.

**Step 2 — Add `sectionName` to `annotationsLoader` return**

The annotation-level routes need section name for the breadcrumb title. Extend the loader
return shape to include it. Update any types that reference the loader return.

**Step 3 — Add `handle.title` to all routes in `routes.tsx`**

For each route, add a `handle` property with a `title` function. The function receives the
route match object and returns a display string using `match.data` (loader return) and
`match.params`.

**Step 4 — Rewrite `Root` to use `useMatches()`**

Replace the `useModalTitle()` call with `useMatches()`. Scan matches from deepest to shallowest
for the first one with `handle.title`. Evaluate it and render the result. Fallback to
"Card Coverage".

**Step 5 — Delete `ModalTitleContext.tsx` and clean up call sites**

Remove `ModalTitleProvider` from `flashcard-modal.tsx`. Remove `setModalTitle` calls from
`annotation-with-outlet.tsx`, `edit-card.tsx`, `upsert-card.tsx`. Remove all imports of
`useModalTitle` across the codebase.

**Step 6 — Verify tests pass**

Run the full suite. Update `root.test.tsx` assertions to reflect the new title source
(`useMatches` with mocked route matches rather than mocked `useParams`).

---

## Test Coverage

### Must add
- `tests/routes/root-title.test.tsx` — `useMatches()` title computation: deepest handle wins,
  falls back to "Card Coverage", handles missing data gracefully
- `tests/routes/books/book/annotation/annotation-with-outlet-title.test.tsx` — verify breadcrumb
  title comes from route handle, not `setModalTitle` side effect

### Must update
- `tests/root.test.tsx` — remove `useParams` mock; confirm default title without it

### Snapshot-first
Run `npm test -- tests/root.test.tsx` after Step 1 (mock removal) to capture the failing
snapshot. This is the regression anchor.

---

## Acceptance Criteria

- [ ] Navigating Prev/Next while a card editor is active updates the title to the breadcrumb
- [ ] Navigating away from card edit resets the title correctly
- [ ] `ModalTitleContext.tsx` is deleted; no `setModalTitle` calls remain in the codebase
- [ ] `root.test.tsx` passes without a `useParams` mock returning fake params
- [ ] `npm test` passes, `npm run build` clean

---

## Verification Commands

```bash
npm test -- --testPathPattern="root|annotation-with-outlet-title"
npm test
npm run build
```
