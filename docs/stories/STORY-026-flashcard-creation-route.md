# STORY-026: Flashcard Creation as a Separate Route

## Status
Backlog

## Epic
[STORY-010](../archive/stories/STORY-010-markdown-engagement.md)

## Depends on
- [BUG-009](BUG-009-import-annotation-editor-state-leak.md) (state reset needed before adding new routes)
- [STORY-025](STORY-025-category-editor-modal.md) (category management UX must be stable)

## Description

The flashcard creation flow currently shares the annotation list with the general browsing
and import flows. This creates friction: users creating flashcards must look past unprocessed
annotations that aren't ready for card creation, and the UI tries to serve three different
intents from one view.

The analysis in `docs/guides/architecture/navigation-contexts.md` identifies three distinct
navigation contexts that warrant their own routes:

1. **Annotation browsing** — flexible filtering, current route (`/books/:id/annotations`)
2. **Flashcard creation** — processed-only, focused card creation UX (this story)
3. **Import/processing** — unprocessed-only, current import route (existing)

This story introduces the flashcard creation route as a separate context. It does not change
the import or browsing routes.

### Route

```
/books/:bookId/sections/:sectionId/flashcards/:annotationId
```

### Behaviour

- Shows only processed annotations (category is set)
- Navigation skips unprocessed entirely — uses `getNextAnnotationIdForSection` with
  `NavigationFilter` already implemented in `src/ui/routes/books/api.ts`
- Escape hatch: link to full annotation list when no processed annotations exist
- Header communicates context clearly ("Create Flashcard" vs generic title)
- Card creation UI focused — no category editing, no personal note textarea

### Entry Point

From `AnnotationListPage` in card-creation mode: each annotation row links to
`/flashcards/:annotationId` instead of the current shared annotation route.

## Acceptance Criteria
- [ ] Route `/books/:bookId/sections/:sectionId/flashcards/:annotationId` exists
- [ ] Only processed annotations are navigable via prev/next in this route
- [ ] Navigation uses `NavigationFilter` with `{ processed: true }` (no new API needed)
- [ ] Escape hatch rendered when section has no processed annotations
- [ ] Existing import and browsing routes unchanged
- [ ] Tests cover processed-only navigation and empty state

## Likely Touchpoints
- `src/routes/routes.tsx` — add new route
- `src/ui/routes/books/flashcards/` — new directory with route component
- `src/ui/routes/books/book/annotation/AnnotationListPage.tsx` — update card-creation links
- `tests/routes/books/flashcards/` — new test directory

## Notes
- The `NavigationFilter` type and `getNextAnnotationIdForSection` filter param are already
  implemented — this story is a routing/UX layer on top of existing infrastructure
- Context-specific keyboard shortcuts and bulk card creation are future iterations
- See `docs/guides/architecture/navigation-contexts.md` for full architectural analysis

## Related
- [STORY-015](STORY-015-annotation-processing-workspace-ux.md) — import/processing workspace (complementary)
- [STORY-025](STORY-025-category-editor-modal.md) — category management must be settled first
- [ADR-019](../decisions/ADR-019-navigation-filter-contract.md) — filter contract this story builds on
