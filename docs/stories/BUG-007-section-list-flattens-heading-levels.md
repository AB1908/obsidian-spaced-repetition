# BUG-007: Section List Flattens Heading Levels for Markdown Sources

## Status
Ready

## Epic
[STORY-010](STORY-010-markdown-engagement.md)

## Depends on
- [DEBT-011](DEBT-011-book-metaphor-clippings.md) - section navigation model for clippings

## User Story
As a user navigating markdown content, I want section lists to follow a predictable heading strategy, so that the structure is meaningful and not noisy.

## Acceptance Criteria
- [ ] Define and document heading selection strategy for direct-markdown sources:
  - prefer H1 sections
  - fallback to H2 when no H1 exists
- [ ] Section list does not mix all heading levels by default.
- [ ] Behavior is test-covered for files with:
  - H1 + H2 + H3 mixed
  - only H2 headings
  - no headings
- [ ] Existing MoonReader/chapter behavior remains unchanged.

## Context
Observed behavior: current view can show multiple heading levels in one flat list, which reduces signal for large notes.

## Likely Touchpoints
- `src/api.ts` (`getBookChapters` behavior for direct-markdown sources)
- `src/ui/routes/books/book/index.tsx`
- `tests/api.test.ts`

## Related
- [DEBT-011](DEBT-011-book-metaphor-clippings.md)
- [DEBT-013](DEBT-013-source-polymorphism.md)
