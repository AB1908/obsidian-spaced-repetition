# BUG-012: Card Creation List Shows Color Filtering Instead of Category Filtering

## Status
Ready

## Epic
[STORY-010](../archive/stories/STORY-010-markdown-engagement.md)

## Depends on
- [STORY-019](../archive/stories/STORY-019-remove-filter-buttons-card-creation.md)
- [DEBT-024](DEBT-024-filter-policy-single-source-of-truth.md)

## User Story
As a user creating flashcards from MoonReader-style sources, I want category-based filtering in card creation, so I can find already-processed annotations by category instead of color.

## Problem
After STORY-016, card creation hides filter controls and forces an all-annotations view. This removed category controls that are still useful in card creation for processed annotations and implicitly leaves color-oriented behavior as the only filtering concept.

This does **not** apply to direct-markdown strategy sources where processed/unprocessed semantics are not the same as MoonReader exports.

## Acceptance Criteria
- [ ] MoonReader card-creation flow shows category filter controls.
- [ ] MoonReader card-creation flow is processed-annotation-focused (category-driven), not color-driven.
- [ ] Direct-markdown card-creation behavior remains unchanged.
- [ ] Import flow behavior remains unchanged.
- [ ] Tests cover source-type-specific behavior (MoonReader vs direct-markdown) and prevent regression.

## Likely Touchpoints
- `src/ui/components/annotation-display-list.tsx`
- `src/ui/routes/books/book/annotation/AnnotationListPage.tsx`
- `src/ui/routes/books/book/annotation/annotation-with-outlet.tsx` (if source type is routed via loader)
- `tests/routes/books/book/annotation/AnnotationListPage.test.tsx`

## Related
- [BUG-001](../archive/stories/BUG-001-navigation-ignores-filters.md)
- [BUG-007](../archive/stories/BUG-007-section-list-flattens-heading-levels.md)
- [DEBT-013](DEBT-013-source-polymorphism.md)
