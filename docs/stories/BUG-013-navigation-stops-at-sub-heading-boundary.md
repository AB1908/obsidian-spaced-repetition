# BUG-013: Navigation Stops at Sub-Heading Boundary Within Section

## Status
Ready

## Severity
Medium

## Epic
None

## Description
When viewing annotations under a section (e.g., an H2 heading), the next/previous navigation buttons disappear or return null when the next annotation is under a different sub-heading (H3) within the same section. The annotation list correctly shows all annotations across sub-headings, but navigation treats every heading as a boundary.

### Root Cause
`getNextAnnotationId` and `getPreviousAnnotationId` in `navigation-api.ts` scan `book.bookSections` linearly and return `null` when encountering ANY heading while `sectionId` is provided:

```typescript
if (isHeading(item)) {
    if (sectionId) return null;  // stops at ANY heading, including sub-headings
    continue;
}
```

Meanwhile, `getAnnotationsForSection` uses `getProcessedAnnotations(sectionId)` which calls `findNextHeader` — this correctly respects heading hierarchy and only stops at headings of equal or lower level. So the list shows annotations across H3 sub-headings within an H2, but navigation stops at the first H3.

**Two systems computing the same boundary differently.**

### Fix
Navigation should operate on the same annotation list that the UI displays, by reusing `getProcessedAnnotations(sectionId)` instead of scanning `bookSections` directly:

```typescript
function getNextAnnotationId(bookId, blockId, sectionId?, filter?) {
  const book = getBook(bookId);
  const annotations = sectionId
    ? book.getProcessedAnnotations(sectionId)
    : book.annotations();
  const filtered = annotations.filter(a => matchesAnnotationFilter(a, filter));
  const index = filtered.findIndex(a => a.id === blockId);
  if (index === -1) return null;
  return index < filtered.length - 1 ? filtered[index + 1].id : null;
}
```

This eliminates the heading boundary logic entirely — navigation defers to the same source of truth as the display list. Future changes to section extraction (trees, H2 sub-lists) automatically propagate to navigation.

## Acceptance Criteria
- [ ] Failing test demonstrating the bug (annotation under H3 within an H2 section, navigation returns null)
- [ ] Navigation rewritten to use `getProcessedAnnotations` instead of `bookSections` linear scan
- [ ] Existing navigation tests updated (snapshot changes expected — review required)
- [ ] `npm test` passes

## Likely Touchpoints
- `src/application/navigation-api.ts` — rewrite `getPreviousAnnotationId` / `getNextAnnotationId`
- `tests/api.test.ts` — navigation tests, potentially new fixture with H2+H3 structure
- `src/ui/routes/books/api.ts` — route adapter (may simplify)

## Related
- [BUG-001](../archive/stories/BUG-001-navigation-ignores-filters.md) — prior navigation/filter fix
- [ADR-019](../decisions/ADR-019-navigation-filter-contract.md) — navigation filter contract
- Session: [2026-02-18 Architecture Refinement](../sessions/2026-02-18-domain-model-architecture-refinement.md) — identified navigation as leaked business logic
