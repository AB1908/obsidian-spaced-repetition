# Execution: Story Status Audit (Unfinished vs Implemented)

## Date
2026-02-20

## Goal
Audit stories not marked `Done` against repository evidence (tests, commits, acceptance checkboxes) and reconcile clear status drift.

## Inputs
- `scripts/story-catalog.sh list`
- `rg` references in `tests/`
- Recent history (`git log --grep bug-008`)
- Story acceptance checkboxes and status blocks

## High-Confidence Reconciliations Applied

1. `BUG-001` (`docs/stories/BUG-001-navigation-ignores-filters.md`)
- Evidence: acceptance checklist already fully checked; test references present in `tests/api.test.ts` and `tests/routes/books/book/annotation/AnnotationListPage.test.tsx`.
- Change: `Status` updated `Ready -> Done`.

2. `BUG-008` (`docs/stories/BUG-008-moonreader-name-shows-annotations.md`)
- Evidence:
  - Implementation commit: `55c619d` (`fix(bug-008): restore MoonReader naming and plugin reload notice`)
  - Contract test exists and passes: `tests/bug008.source-naming.test.ts`
- Change:
  - `Status` updated `Ready -> Done`
  - Acceptance criteria checkboxes marked complete
  - Session note added with commit/test evidence

3. `STORY-010` (`docs/stories/STORY-010-markdown-engagement.md`)
- Evidence:
  - Story acceptance criteria already fully checked
  - Sub-stories listed under this epic are all marked `Done` (`STORY-010a`, `STORY-010b`, `STORY-010c`, `STORY-011`, `STORY-013`)
- Change: `Status` updated `In Progress -> Done`.

4. `DEBT-019` (`docs/stories/DEBT-019-wave-runner-automation.md`)
- Evidence: story content already indicated done, but status was non-standard (`**Status:** Done`) so catalog tooling reported `Unknown`.
- Change: normalized to canonical status block:
  - `## Status`
  - `Done`

## Remaining Unfinished Stories
After this reconciliation pass, unfinished count is expected to decrease. Remaining items should be reviewed in smaller follow-up batches (Ready first, then Backlog/Proposed) using the same evidence model.

