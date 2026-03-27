# Plan: DEBT-045 — Annotate Skipped Tests

## Summary

10 skipped tests across 5 files. 4 should be deleted (dead code), 6 should be annotated.

## Deletions (4)

| File | Line | Test | Reason |
|------|------|------|--------|
| `tests/lang/helpers.test.ts` | 51 | Czech translation | `cs` locale removed, permanently broken |
| `tests/lang/helpers.test.ts` | 77 | German translation | `de` locale removed, permanently broken |
| `tests/scheduling.test.ts` | 71 | Load balancing (small interval) | Feature commented out in scheduler, structurally wrong |
| `tests/scheduling.test.ts` | 92 | Load balancing (standard) | Same |

## Annotations (6)

### `tests/api.test.ts:106` — getAnnotationById
```ts
// SKIP: snapshot reflects old return shape — getAnnotationById now returns raw annotation
// without hasFlashcards; update snapshot or replace with type-correct assertion
```

### `tests/api.test.ts:303` — updateAnnotationMetadata
```ts
// SKIP: requires disk mock to support write-then-read mutation; fixture system is
// read-only. Unblock when disk mock supports stateful update or model layer is
// testable without disk.
```

### `tests/api.test.ts:319` — softDeleteAnnotation
```ts
// SKIP: mutation not reflected through static fixture mock — softDelete calls
// updateAnnotation on disk but in-memory state isn't updated; unblock alongside
// disk mock refactor or when model layer is independently testable.
```

### `tests/api.test.ts:339` — getAnnotationsForSection
```ts
// SKIP: inline snapshot is stale — annotation shape or section structure has drifted
// since snapshot was captured; refresh snapshot or delete if covered by integration test.
```

### `tests/book.test.ts:18` — bookSections
```ts
// SKIP: snapshot never captured — test was written but skipped before first run;
// un-skip to generate snapshot, then verify output matches current bookSections behavior.
```

### `tests/navigation_scrolling.test.tsx:57` — AnnotationList scroll behavior
```ts
// SKIP: AnnotationDisplayList props interface changed — test calls component with no
// props but now requires chapterData, filter, viewPolicy etc.; update test to pass
// required props and re-enable.
```

## Commit Structure

1. `test: delete dead skipped tests for removed locale and scheduler features`
2. `test: annotate remaining skipped tests with skip reasons`
