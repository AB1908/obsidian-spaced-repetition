# STORY-017: Card Creation Visibility Signals (Chapter + Category)

## Status
Ready

## Epic
[STORY-010](../archive/stories/STORY-010-markdown-engagement.md)

## Depends on
- [DEBT-030](../archive/stories/DEBT-030-complete-markdown-source-migration.md)

## User Story
As a user creating flashcards, I want to immediately see coverage and category distribution so I can find the right annotations without guesswork.

## Problem
Card creation currently lacks clear visibility signals:
- Chapter list does not clearly show how many annotations already have flashcards vs how many do not.
- Category controls do not indicate counts per category.
- Current filtering modes can hide context and force trial-and-error exploration.

## Scope (Design + Implementation)
- Add chapter-level indicators in flashcard creation showing counts:
  - with flashcards
  - without flashcards
- Add category-level indicators (count badges) in card creation context.
- Evaluate interaction direction:
  - keep filters with clear counts
  - or show all items and annotate each item with category icon/badge

## Acceptance Criteria
- [ ] Chapter list in card creation displays both counts (with/without flashcards).
- [ ] Category controls (or equivalent per-item category markers) show meaningful count/context.
- [ ] Behavior is source-aware:
  - MoonReader path supports processed/category semantics.
  - Direct-markdown path is not forced into MoonReader semantics.
- [ ] UX direction is documented before final implementation choice.
- [ ] Tests cover selected behavior and prevent regressions.

## Notes
- "Jump to annotation processing" CTA is captured separately in [IDEA-002](IDEA-002-card-creation-jump-to-processing-cta.md) and requires product design.

## Related
- [BUG-012](BUG-012-card-creation-category-filter-regression.md)
- [IDEA-002](IDEA-002-card-creation-jump-to-processing-cta.md)
- [STORY-015](STORY-015-annotation-processing-workspace-ux.md)
