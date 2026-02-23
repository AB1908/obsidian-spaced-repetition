# STORY-028: Collapse Add Row in CategoryEditorModal Until Triggered

## Status
Ready

## Epic
[STORY-010](../archive/stories/STORY-010-markdown-engagement.md)

## Depends on
- [STORY-025](STORY-025-category-editor-modal.md)

## Description

The current CategoryEditorModal renders the "add new category" form (name input + icon
grid + Add button) permanently at the bottom of the modal. This wastes vertical space and
visually competes with the category list on first open.

The edit row for existing categories is already collapsed by default (only revealed on
Edit click). The add row should follow the same pattern: collapsed by default, expanded
when the user clicks an "Add category" trigger button.

### Proposed behaviour

- On open: category list is shown, a single "+ Add category" button sits below it
- Click "+ Add category": the button is replaced by the inline add form (name input +
  icon grid + [Add] [Cancel] buttons)
- Click Cancel or confirm Add: form collapses back to the trigger button

This matches the edit-row pattern already in place and keeps the modal surface minimal
on first open.

## Acceptance Criteria
- [ ] On modal open, the add form is not visible — only a trigger button
- [ ] Clicking the trigger expands the inline add form
- [ ] Confirming or cancelling collapses the form back to the trigger button
- [ ] Existing add behaviour (validation, onSave callback) unchanged
- [ ] Tests updated to reflect the trigger-first interaction

## Likely Touchpoints
- `src/ui/modals/CategoryEditorModal.ts`
- `tests/ui/modals/CategoryEditorModal.test.ts`
