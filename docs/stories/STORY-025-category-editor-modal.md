# STORY-025: CategoryEditorModal

## Status
Ready

## Epic
[STORY-010](../archive/stories/STORY-010-markdown-engagement.md)

## Depends on
- [BUG-009](BUG-009-import-annotation-editor-state-leak.md) (editor state reset must work before modal integration into PersonalNotePage)

## Supersedes
- [STORY-022](../archive/stories/STORY-022-category-deletion-handling.md)
- [STORY-023](../archive/stories/STORY-023-rich-icon-picker-for-categories.md)
- [STORY-024](../archive/stories/STORY-024-category-icon-defaults-and-tooltips.md)

## User Story
As a user, I want a dedicated place to manage my annotation categories — add, rename, reorder, delete, and choose icons — so that category management doesn't clutter the annotation editing flow.

## Problem
Category management is currently an inline form embedded inside `PersonalNotePage`. This is awkward to use, hard to iterate on, and cannot be reused in the plugin settings page. Adding icon picking, reordering, and deletion to an inline form would make the editor page unusable. A dedicated modal solves all of this cleanly.

## Design

### Modal Structure
`CategoryEditorModal` extends Obsidian's `Modal` class. It renders a list of all configured categories, each showing:
- Icon (rendered via `setIcon`)
- Name label
- Up/down reorder buttons
- Edit button (opens inline edit row: name input + icon picker)
- Delete button (with orphan warning)

A footer row adds new categories: name input + icon picker + confirm button.

### Icon Picker
A curated grid of ~30 visually distinct Obsidian icon names rendered as icon buttons. Displayed inline in the "add" and "edit" rows — no sub-modal needed. The full Obsidian icon-set search is deferred.

### Orphan Warning on Delete
Before deleting, show a count of annotations currently using that category name (requires a vault scan via the annotation index). User confirms or cancels. Annotations with the deleted category name remain on disk as-is; the category field is treated as unrecognised by the UI (shown with a fallback indicator).

### Tooltips on Category Buttons
`CategoryFilter` and `PersonalNotePage` category buttons gain `aria-label={category.name}` and `title={category.name}`. This lands here since we are already touching those files during modal integration.

### Entry Points
- `PersonalNotePage`: "Manage categories" button replaces the inline add-category form
- Plugin settings page: future reuse (modal is instantiated with the plugin reference, no route coupling)

## Business Logic (pure, extracted to `annotation-categories.ts`)
```typescript
addCategoryToList(categories, newCategory): CategoryConfig[] | { error: string }
removeCategoryFromList(categories, name): CategoryConfig[]
reorderCategoryInList(categories, name, direction: 'up' | 'down'): CategoryConfig[]
editCategoryInList(categories, name, updates): CategoryConfig[] | { error: string }
```
These are pure functions — testable with no Obsidian mock.

## Testing Strategy
- Pure logic functions in `annotation-categories.ts` → unit tests, no Obsidian required
- `CategoryEditorModal` class methods → instantiated with mock app, methods called directly
- `onOpen()` DOM rendering → not unit tested (Obsidian responsibility)
- `PersonalNotePage` → spy that modal is opened on button click

## Acceptance Criteria
- [ ] `CategoryEditorModal` extends Obsidian `Modal`
- [ ] Modal lists all configured categories with icon and name visible
- [ ] Add new category: name input + icon picker (curated grid) + persist to settings
- [ ] Edit category: rename and/or swap icon + persist
- [ ] Delete category: orphan warning with annotation count + confirm + persist
- [ ] Reorder: move up/down within the list + persist
- [ ] Pure category CRUD functions extracted to `annotation-categories.ts` and unit tested
- [ ] PersonalNotePage: inline add-category form replaced by "Manage categories" button
- [ ] `CategoryFilter` buttons have `aria-label` and `title` with category name
- [ ] PersonalNotePage category buttons have `aria-label` and `title` with category name
- [ ] All existing PersonalNotePage tests remain green

## Likely Touchpoints
- `src/config/annotation-categories.ts` — pure CRUD functions, curated icon list
- `src/ui/modals/CategoryEditorModal.ts` — new Obsidian Modal class
- `src/ui/routes/import/personal-note.tsx` — remove inline form, add "Manage categories" button, add tooltips
- `src/ui/components/category-filter.tsx` — add aria-label/title tooltips
- `tests/config/annotation-categories.test.ts` — new: pure function unit tests
- `tests/ui/modals/CategoryEditorModal.test.ts` — new: modal business logic tests
- `tests/routes/import/PersonalNotePage.test.tsx` — update for new trigger, add tooltip assertions

## Notes
- Modal does not use React — it is a plain Obsidian Modal with vanilla DOM in `onOpen()`
- Settings page reuse: pass `plugin` reference to constructor; no react-router dependency
- Full Obsidian icon-set search deferred to a later refinement
- Renaming with bulk markdown update is tracked separately in STORY-021

## Related
- [BUG-009](BUG-009-import-annotation-editor-state-leak.md) — must land first
- [STORY-020](STORY-020-auto-save-annotation-editor.md) — depends on this
- [STORY-021](STORY-021-category-rename-bulk-update.md) — future: rename + bulk update
