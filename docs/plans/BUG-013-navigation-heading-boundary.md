# Plan: BUG-013 — Navigation stops at sub-heading boundary

## Story
[BUG-013](../stories/BUG-013-navigation-stops-at-sub-heading-boundary.md)

## Problem
`getPreviousAnnotationId` / `getNextAnnotationId` in `src/application/navigation-api.ts`
scan `book.bookSections` linearly and return `null` when hitting any heading while a
`sectionId` is active. Meanwhile the display list uses `book.getProcessedAnnotations(sectionId)`
which respects heading hierarchy. Two systems compute the same boundary differently.

## Fix
Replace the linear scan in both functions with the same source of truth the display uses:

```typescript
// sectionId present  → book.getProcessedAnnotations(sectionId)
// no sectionId       → book.annotations()
// then apply matchesAnnotationFilter and find neighbours by index
```

`getProcessedAnnotations` already returns `BookMetadataSection[]` which includes annotations
and paragraphs filtered by heading hierarchy. The heading-boundary logic is removed entirely.

## Acceptance Criteria (from story)
- [ ] Failing test: annotation under H3 within H2 section, navigation returns null → pass after fix
- [ ] Both `getPreviousAnnotationId` and `getNextAnnotationId` rewritten to use `getProcessedAnnotations`
- [ ] Existing navigation tests updated (snapshot changes expected)
- [ ] `npm test` passes

## Phases

### Phase 1 — Failing test
File: `tests/navigation_scrolling.test.tsx` or `tests/api.test.ts`
- Add fixture data with H2 containing an H3 sub-heading, annotations under each
- Write test that calls `getNextAnnotationId` with `sectionId` of the H2, expects the H3-nested annotation to be reachable

**Fixture strategy:** Use inline test fixtures (construct `BookMetadataSection[]` directly
in the test), not Obsidian vault captures. The bug is in navigation logic on the in-memory
model — no Obsidian API boundary is crossed, so synthetic construction is appropriate and
avoids the capture cycle. Pattern: build the section tree directly in the test's `beforeEach`,
pass to `newFunction()` or equivalent setup, then assert navigation behaviour.

### Phase 2 — Implementation
File: `src/application/navigation-api.ts`

Rewrite both functions:
```typescript
export function getNextAnnotationId(
    bookId: string,
    blockId: string,
    sectionId?: string,
    filter?: NavigationFilter
) {
    const plugin = getPluginContext();
    const book = plugin.annotationsNoteIndex.getBook(bookId);
    const annotations = sectionId
        ? book.getProcessedAnnotations(sectionId)
        : book.annotations();
    const filtered = annotations.filter(a => isAnnotationOrParagraph(a) && matchesAnnotationFilter(a as annotation | paragraph, filter));
    const index = filtered.findIndex(a => a.id === blockId);
    if (index === -1 || index >= filtered.length - 1) return null;
    return filtered[index + 1].id;
}
```
Same pattern for `getPreviousAnnotationId` (search backward).

### Phase 3 — Update existing tests
File: `tests/api.test.ts` (navigation tests)
- Run with `--updateSnapshot` if inline snapshots change
- Review snapshot diffs before committing

## Touchpoints
- `src/application/navigation-api.ts` — primary change
- `tests/api.test.ts` — new failing test + snapshot updates
- `src/ui/routes/books/api.ts` — check for any wrapper that may need updating

## Notes
- `getProcessedAnnotations` returns `BookMetadataSections` which is `BookMetadataSection[]`.
  Each element has an `id` field. Need to verify filter works on the returned type.
- `book.annotations()` returns `(annotation | paragraph)[]` — both have `.id`.
- Type cast may be needed since `getProcessedAnnotations` returns broader type.
