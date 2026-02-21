# Archived (Duplicate): BUG-008 Source Name Strategy Regression (MoonReader vs Direct Markdown)

This story was superseded by `docs/stories/BUG-008-moonreader-name-shows-annotations.md`.
The implementation and TDD coverage live in:
- `docs/plans/BUG-008-moonreader-name-regression.md`
- `docs/plans/BUG-008-test-contract.md`
- `tests/bug008.source-naming.test.ts`

## Status
Archived

## Epic
`docs/stories/STORY-010-markdown-engagement.md`

## Depends on
- `docs/stories/BUG-006-source-chooser-label-uses-folder-name.md`

## User Story
As a user, I want source names to follow source-specific rules, so MoonReader books and direct-markdown notes both display meaningful labels.

## Problem
After BUG-006 standardized to basename, MoonReader-style notes can show generic filenames (for example `Annotations`) instead of a meaningful book label.

Direct-markdown sources needed basename (`constitution`), but MoonReader sources likely need a different policy (frontmatter title or folder/book label).

## Acceptance Criteria
- [ ] Define source-specific naming policy and document it.
- [ ] Direct-markdown source chooser labels continue to use filename/basename.
- [ ] MoonReader source labels use a meaningful book label (not generic `Annotations` filenames).
- [ ] `getSourcesForReview` and `getSourcesAvailableForDeckCreation` reflect the same naming policy.
- [ ] Tests cover:
  - MoonReader file named `Annotations.md` inside book folder
  - direct-markdown file in root and nested folders
  - fallback behavior when title/frontmatter is missing

## Likely Touchpoints
- `src/data/models/AnnotationsNote.ts` (`initialize`, `updatePath`, naming derivation)
- `src/api.ts` (`getSourcesForReview`, `getSourcesAvailableForDeckCreation`)
- `tests/api.test.ts`
- `tests/api.clippings.test.ts`
- fixture set under `tests/fixtures/`

## Notes
- This is a follow-up regression class that snapshot coverage did not catch because current fixtures use `Untitled.md` (not `*/Annotations.md` for MoonReader).
