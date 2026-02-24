# STORY-029: Navigation Button Touch Targets

## Status
Backlog

## Epic
[STORY-010](../archive/stories/STORY-010-markdown-engagement.md)

## Description

Navigation buttons in the annotation processing flow (previous / next annotation) have
undersized tap targets that are difficult to use on mobile. Obsidian's mobile first-class
support expectation means touch targets should meet the 44×44pt minimum recommended by
Apple HIG and Google Material Design.

The issue affects any tappable nav control in the import/annotation workflow where buttons
are rendered small or tightly spaced.

## Acceptance Criteria
- [ ] Navigation buttons meet 44×44px minimum touch target size on mobile
- [ ] Sizing does not break the desktop layout
- [ ] No regression to existing navigation behaviour

## Likely Touchpoints
- `src/ui/routes/import/` — navigation controls in annotation processing view

## Related
- [DEBT-039](DEBT-039-category-modal-ux-revisit.md) — broader mobile UX revisit
- [STORY-027](STORY-027-processed-annotation-row-ui-cleanup.md) — annotation row UI cleanup
