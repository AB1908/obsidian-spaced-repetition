# BUG-005: Source Path Goes Stale After User Moves Source File

## Status
Ready

## Epic
[STORY-010](../archive/stories/STORY-010-markdown-engagement.md)

## Depends on
- [DEBT-011](../archive/stories/DEBT-011-book-metaphor-clippings.md) - same clippings navigation surface

## User Story
As a user, I want deck/source navigation to keep working after moving source files or folders, so that my decks do not break when I reorganize notes.

## Acceptance Criteria
- [ ] Reproduce the `getTFileForPath` failure for moved clippings sources in an integration-style test.
- [ ] Refresh/re-resolve source path before metadata reads so stale paths do not crash navigation initialization.
- [ ] Opening a moved source through deck/book routes no longer throws `no getTFileForPath`.
- [ ] Error handling for unresolved moved files is explicit and user-safe (no uncaught crash path).

## Context
Observed runtime error:
`no getTFileForPath: no TFile found for Clippings/Claude's Constitution/Claude's Constitution.md`

This suggests index/model state keeps an old path after user-driven vault moves/renames.

## Likely Touchpoints
- `src/data/models/AnnotationsNote.ts`
- `src/api.ts` (if source/index refresh is API-triggered)
- `src/infrastructure/disk.ts` (`getTFileForPath` call sites / guard behavior)
- targeted tests in `tests/api.test.ts` and/or `tests/models/annotations.test.ts`

## Related
- [DEBT-011](../archive/stories/DEBT-011-book-metaphor-clippings.md)
- [STORY-013](../archive/stories/STORY-013-markdown-deck-creation-source-chooser.md)
