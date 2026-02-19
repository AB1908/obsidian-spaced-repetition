# STORY-016: Customizable Annotation Categories and Icons

## Status
Proposed

## Epic
[STORY-010](STORY-010-markdown-engagement.md)

## User Story
As a user, I want to customize annotation categories and icons, so categorization matches my workflow.

## Problem
Category buttons/icons are currently static (`ANNOTATION_CATEGORY_ICONS`) and not user-configurable. This limits usefulness for varied annotation workflows.

## Acceptance Criteria
- [ ] Category configuration model exists in plugin settings.
- [ ] Users can define category label + icon mapping.
- [ ] Processing UI renders categories from settings instead of hardcoded constants.
- [ ] Backward compatibility path exists for existing numeric categories.
- [ ] Tests cover default config and custom config rendering.

## Likely Touchpoints
- `src/config/annotation-categories.ts`
- `src/settings.ts`
- `src/ui/routes/import/personal-note.tsx`
- `src/ui/components/category-filter.tsx`
- `src/lang/locale/en.ts`

## Notes
- Keep v1 small: edit in settings first; richer management UX can follow.
