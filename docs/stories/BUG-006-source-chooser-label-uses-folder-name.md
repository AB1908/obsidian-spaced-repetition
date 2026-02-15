# BUG-006: Source Chooser Shows Folder Name Instead of File Name

## Status
Ready

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

Likely this comes from `getParentOrFilename` being reused where filename should be displayed.

## Likely Touchpoints
- `src/ui/components/book-list.tsx`
- `src/api.ts` (if display label assembled there)
- `src/infrastructure/disk.ts` (`getParentOrFilename` call-chain)
- `tests/deck-landing-page.test.tsx` and/or `tests/api.test.ts`

## Related
- [DEBT-012](DEBT-012-component-reusability.md)
- [DEBT-006](DEBT-006-disk-business-logic.md)
