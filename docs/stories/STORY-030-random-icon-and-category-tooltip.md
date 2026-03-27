# STORY-030: Random Icon Assignment and Category Name Tooltip

## Status
Proposed

## Epic
None

## Description

When a new annotation category is created, the plugin always defaults to the "asterisk" icon. This means every category looks identical until the user manually changes it — which requires navigating a full icon picker (STORY-023, not yet built).

Two improvements to address this:

1. **Random icon on creation** — when a new category is created, assign a random icon from a curated shortlist of sensible, visually distinct icons (e.g. bookmark, star, heart, flag, circle, tag, lightning, checkmark). The user can still change it later but gets a useful default immediately.

2. **Hover tooltip showing category name** — category buttons currently show only the icon with no label. Users must memorize which icon maps to which category. A tooltip on hover (native `title` attribute or lightweight custom tooltip) solves this without sacrificing the compact icon-only layout. Must remain mobile-friendly: tap-and-hold should trigger the tooltip on touch devices (standard browser behavior for `title`).

This is a stepping stone before STORY-023 (full searchable icon picker). The random icon list here is the candidate pool that STORY-023 will expand into a browsable UI.

### Curated icon shortlist (candidate)

Drawn from Obsidian's Lucide icon set. Approximate list — exact names to be confirmed against available icons:

`bookmark`, `star`, `heart`, `flag`, `circle-dot`, `tag`, `zap`, `check-circle`, `bell`, `eye`, `flame`, `coffee`, `compass`, `key`, `leaf`, `moon`, `sun`, `cloud`, `droplet`, `feather`

~20 icons is enough variety that repeated category creation rarely produces duplicates in a small set.

## Acceptance Criteria

- [ ] New category creation assigns a random icon from the curated shortlist (not always "asterisk")
- [ ] Icon pool is defined as a named constant (easy to extend before STORY-023)
- [ ] Category buttons show a tooltip with the category name on hover / tap-and-hold
- [ ] Tooltip implementation does not break mobile layout (icons remain primary, tooltip is supplementary)
- [ ] Existing categories are unaffected (only new categories get a random icon at creation time)
- [ ] Unit test: random icon is always a member of the curated pool

## Likely Touchpoints

- `src/settings.ts` — category creation logic (where default icon is currently set)
- `src/ui/` — category button component (where tooltip markup is added)
- New constant file or inline in settings: `CATEGORY_ICON_POOL`

## Depends on

- [STORY-016](../archive/stories/STORY-016-customizable-annotation-categories.md) — annotation category infrastructure must exist

## Related

- [STORY-023](STORY-023-icon-picker.md) — full searchable icon picker (this story is a prerequisite)
