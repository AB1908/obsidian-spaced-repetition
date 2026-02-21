# STORY-015: Annotation Processing Workspace UX (Consolidated View)

## Status
Proposed

## Epic
[STORY-010](../archive/stories/STORY-010-markdown-engagement.md)

## Depends on
- [BUG-009](BUG-009-import-annotation-editor-state-leak.md)
- [BUG-001](../archive/stories/BUG-001-navigation-ignores-filters.md)

## User Story
As a user, I want one coherent processing workspace showing progress and current context, so I can process annotations quickly without toggling disjoint controls.

## Context
Current flow is button-heavy (`Unprocessed` / `Processed` / `All`, category/color filter controls) and does not clearly communicate processing state across a section. For prototype velocity, this can be simplified.

## Proposed Direction
- De-emphasize toggle-heavy list controls.
- Present a consolidated processing view:
  - clear "current item"
  - compact processed/unprocessed progress
  - direct next/previous actions
  - optional filtered views behind secondary controls

## Acceptance Criteria
- [ ] UX proposal documented (wireframe-level is enough for prototype).
- [ ] Import flow no longer depends on primary processed/unprocessed button toggles in section list.
- [ ] Navigation and filtering contracts remain deterministic and test-covered.
- [ ] Updated tests validate the new primary workflow.

## Likely Touchpoints
- `src/ui/components/annotation-display-list.tsx`
- `src/ui/routes/books/book/annotation/AnnotationListPage.tsx`
- `src/ui/routes/import/personal-note.tsx`
- `tests/routes/import/PersonalNotePage.test.tsx`
- `tests/api.test.ts`

## Notes
- This story intentionally focuses on reducing cognitive load first; full redesign/polish can iterate post-0.6.0.
