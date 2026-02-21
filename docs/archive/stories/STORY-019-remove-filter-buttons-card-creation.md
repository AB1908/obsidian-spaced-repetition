# STORY-019: Remove Processed/Unprocessed Filter from Flashcard Creation Flow

## Status
Done

## Epic
None

## User Story
As a user creating flashcards, I want to see all annotations without filter buttons, so I don't have to think about processed/unprocessed state when my goal is to create cards.

## Rationale
In the flashcard creation context, the processed/unprocessed/all filter is meaningless:
- The point of creating flashcards is to work through annotations — showing "processed" by default is backwards
- For markdown-strategy sources, there is no Annotations.md file, so there are no "processed" annotations at all
- The filter adds UI noise and a confusing extra click to reach annotations

The import flow retains filter buttons because there, "unprocessed" is a meaningful default (showing annotations that haven't been turned into flashcards yet).

## Current State
- `src/ui/components/annotation-display-list.tsx:121-140` — renders Unprocessed/Processed/All button group
- `src/ui/routes/books/book/annotation/AnnotationListPage.tsx:43-44` — sets default filter: `isImportFlow ? 'unprocessed' : 'processed'`
- Filter drives sub-filters: CategoryFilter (when processed) and ColorFilter (when unprocessed) at lines 142-156
- `AnnotationListPage` is used in two route contexts:
  1. Import flow (path includes `/import/`) — keeps filter buttons
  2. Flashcard creation flow (all other paths) — remove filter buttons

## Approach
1. Add optional `showFilterButtons?: boolean` prop to `AnnotationDisplayList` (default `true`)
2. In `AnnotationListPage`, pass `showFilterButtons={isImportFlow}`
3. When `!showFilterButtons`: hide the button group and sub-filters, set filter to `'all'`
4. Import flow behavior unchanged

## Acceptance Criteria
- [x] Flashcard creation flow shows all annotations with no filter buttons
- [x] Import flow retains filter buttons with current behavior (default 'unprocessed')
- [x] Sub-filters (category, color) hidden when main filter hidden
- [x] Snapshot tests updated (no snapshot changes required; existing snapshots remain green)
- [x] No regression in navigation filter behavior (BUG-001)

## Session Notes
- 2026-02-18: Added route-context tests for import vs card-creation filter behavior, implemented `showFilterButtons` gating in `AnnotationDisplayList`, and defaulted card-creation filter to `all`.

## Key Files
- `src/ui/components/annotation-display-list.tsx` — add conditional rendering
- `src/ui/routes/books/book/annotation/AnnotationListPage.tsx` — pass prop
- `tests/components/annotation-display-list.test.tsx` or snapshots — update

## Related
- [BUG-001](BUG-001-navigation-ignores-filters.md) — navigation filter contract (must not regress)
