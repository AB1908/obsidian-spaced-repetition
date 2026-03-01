# BUG-009: Import Annotation Editor State Leaks Across Navigation

## Status
Done

## Epic
[STORY-010](../archive/stories/STORY-010-markdown-engagement.md)

## User Story
As a user processing annotations, when I move to the next annotation, the editor should load that annotation's state instead of retaining stale textbox/category state from the previous one.

## Problem
In import annotation processing, navigating to previous/next annotation reuses `PersonalNotePage` component state. `useAnnotationEditor` initializes state from props once, so `personalNote` / `selectedCategory` can remain stale after navigation.

## Acceptance Criteria
- [x] Reproduce stale state issue in a deterministic test.
- [x] Personal note text and category state reinitialize when `annotation.id` changes.
- [x] Save-before-navigation behavior remains intact.
- [x] No regression in existing PersonalNotePage tests.

## Likely Touchpoints
- `src/ui/routes/import/useAnnotationEditor.ts`
- `src/ui/routes/import/personal-note.tsx`
- `tests/routes/import/PersonalNotePage.test.tsx`

## Notes
- Expected fix direction: sync editor state with incoming annotation identity, not only initial mount.
