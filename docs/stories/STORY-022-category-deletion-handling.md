# STORY-022: Category Deletion Handling

## Status
Backlog

## Epic
[STORY-010](../archive/stories/STORY-010-markdown-engagement.md)

## Depends on
- [STORY-016](STORY-016-customizable-annotation-categories.md) (named categories)

## Description
When a user removes a category from settings, annotations with that name on disk become orphaned. Need a policy: show as raw name with warning indicator? Require reassignment before deletion? This also covers the settings management UI for reorder, rename, and delete operations.

## Acceptance Criteria
- [ ] Settings UI for category management (reorder, delete)
- [ ] Deletion policy defined and implemented (warn, reassign, or allow orphans)
- [ ] Orphaned categories handled gracefully in UI (shown with indicator, not silently dropped)

## Related
- [STORY-016](STORY-016-customizable-annotation-categories.md)
- [STORY-021](STORY-021-category-rename-bulk-update.md)
