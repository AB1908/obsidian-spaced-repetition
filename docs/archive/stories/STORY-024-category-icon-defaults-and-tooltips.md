# STORY-024: Category Icon Defaults and Tooltips

## Status
Ready

## Epic
[STORY-010](../archive/stories/STORY-010-markdown-engagement.md)

## Depends on
- [STORY-016](STORY-016-customizable-annotation-categories.md) (named categories must exist first)

## Description
When a user creates a new annotation category, the plugin currently always assigns the `asterisk` icon as the default. This makes all user-created categories visually indistinguishable. Additionally, there is no way to identify what a category icon represents without memorizing the mapping — a problem especially on mobile where text labels aren't practical.

Two improvements:
1. **Random icon from a curated list** — when creating a new category, pick a random icon from a small set of sensible, visually distinct Obsidian icons. This avoids icon collisions without requiring user interaction.
2. **Tooltips on category buttons** — show the category name as a tooltip on hover (and ideally on long-press on mobile), so users can identify categories without memorizing icons.

This is a stepping stone before STORY-023 (full searchable icon picker). It improves the default experience without adding UI complexity.

## Acceptance Criteria
- [ ] A curated list of icon names (≥ 10 distinct icons) is defined in `annotation-categories.ts`
- [ ] When creating a new category, an icon is picked at random from the curated list (excluding icons already in use)
- [ ] If all curated icons are in use, fall back to a safe default (e.g. `tag`)
- [ ] Category buttons in `PersonalNotePage` show a tooltip with the category name
- [ ] Category buttons in `category-filter.tsx` show a tooltip with the category name
- [ ] Tooltips are accessible (use `aria-label` or `title` attribute at minimum)
- [ ] Tests cover random icon selection logic (mock `Math.random()` for determinism)
- [ ] Tests cover tooltip rendering in category button components

## Likely Touchpoints
- `src/config/annotation-categories.ts` — add curated icon list, add `pickRandomIcon()` utility
- `src/ui/routes/import/personal-note.tsx` — use `pickRandomIcon()` on new category creation
- `src/ui/components/category-filter.tsx` — add tooltip to category buttons
- `tests/config/annotation-categories.test.ts` — test random icon selection
- `tests/routes/import/PersonalNotePage.test.tsx` — test tooltip rendering

## Notes
- Do not use `Math.random()` directly in components; extract to a testable utility function
- `aria-label` is sufficient for mobile tooltip fallback; avoid JS-only tooltip libraries
- Curated icon list should be visually diverse: avoid icons that look similar at small sizes

## Related
- [STORY-016](STORY-016-customizable-annotation-categories.md) — prerequisite
- [STORY-023](STORY-023-rich-icon-picker-for-categories.md) — next step (full picker)
