# BUG-006: Source Chooser Shows Folder Name Instead of File Name

## Status
In Progress

## Epic
[STORY-013](STORY-013-markdown-deck-creation-source-chooser.md)

## User Story
As a user selecting a source, I want the list label to match the source note name, so I can confidently choose the correct file.

## Acceptance Criteria
- [ ] Reproduce issue where chooser row displays folder name (for example `Clippings`) instead of expected source note filename.
- [ ] Source chooser primary label uses source filename/title consistently for root and nested files.
- [ ] Supporting subtitle/path can still show parent folder/path context.
- [ ] Regression tests cover nested and root-path source cases.

## Context
Observed behavior: add-new-deck flow displays `Clippings` instead of the actual source filename.

### Root Cause (confirmed 2026-02-16)

**Data flow:** `book-list.tsx` displays `book.name` → set during `AnnotationsNote.initialize()` at `src/data/models/AnnotationsNote.ts:319` → calls `getParentOrFilename(this.path)` from `src/infrastructure/disk.ts:107-112`.

**The problem:** `getParentOrFilename` returns `tFile.parent?.name || tFile.basename` — it prioritizes the parent folder name over the filename. For a file at `Clippings/constitution.md`, this returns `"Clippings"` instead of `"constitution"`. For MoonReader books where folder = filename (e.g., `BookTitle/BookTitle.md`), the bug is invisible.

**Why it's a separation-of-concerns issue:** `getParentOrFilename` bakes a domain heuristic ("prefer parent folder as book name") into the infrastructure layer. The infrastructure should provide a simple `getBasename(path)` accessor, and the domain decides what the display name should be.

### Approach

1. Add `getBasename(path)` to `src/infrastructure/disk.ts` — wraps `getTFileForPath(path).basename`, platform-agnostic
2. Replace `getParentOrFilename` calls in `AnnotationsNote.ts:319` and `api.ts:348` with `getBasename`
3. Delete `getParentOrFilename` (no remaining callers)
4. Migrate `getParentOrFilename_*` test fixtures to `getBasename_*`
5. Add regression test with folder ≠ filename case

### Blocker: coupling in api.ts

`api.ts:348` updates `book.name = getParentOrFilename(newPath)` after moving a file to its own folder during deck creation. This name-update logic belongs in the domain model (AnnotationsNote), not the API orchestration layer. Refactoring this call site first would simplify the bug fix and avoid making the API module more coupled.

## Likely Touchpoints
- `src/data/models/AnnotationsNote.ts:319` — primary: `this.name` assignment
- `src/api.ts:348` — secondary: `book.name` update after file move (needs refactoring first)
- `src/infrastructure/disk.ts:107-112` — `getParentOrFilename` to be replaced with `getBasename`
- `src/ui/components/book-list.tsx:46` — displays `book.name` (no change needed)
- `tests/api.clippings.test.ts` — fixture migration
- `tests/api.test.ts`, `tests/models/annotations.test.ts`, `tests/deck-landing-page.test.tsx`, `tests/routes/import/PersonalNotePage.test.tsx` — fixture list updates

## Related
- [DEBT-012](DEBT-012-component-reusability.md)
- [DEBT-006](DEBT-006-disk-business-logic.md)
