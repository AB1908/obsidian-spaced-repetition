# STORY-021: Category Rename with Bulk Markdown Update

## Status
Backlog

## Epic
[STORY-010](../archive/stories/STORY-010-markdown-engagement.md)

## Depends on
- [STORY-016](STORY-016-customizable-annotation-categories.md) (named categories)

## Description
When a user renames a category in settings, find-and-replace `category: oldname` → `category: newname` across all annotation files. Needed because the category name is the stored value on disk — renaming in settings alone would orphan existing annotations.

## Acceptance Criteria
- [ ] Settings UI allows renaming a category
- [ ] Rename operation scans all annotation files and updates `category:` metadata lines
- [ ] Confirmation prompt before bulk update showing affected file count
- [ ] Undo/backup mechanism or dry-run option

## Related
- [STORY-016](STORY-016-customizable-annotation-categories.md)
- [STORY-022](STORY-022-category-deletion-handling.md)
