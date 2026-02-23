# DEBT-039: CategoryEditorModal UX Revisit with Obsidian Native Patterns

## Status
Backlog

## Depends on
- [STORY-025](../stories/STORY-025-category-editor-modal.md)
- [STORY-028](../stories/STORY-028-category-modal-collapsed-add-row.md)

## Description

The current CategoryEditorModal uses bespoke vanilla DOM layout. While functional, it
doesn't leverage Obsidian's native UI patterns, which could give a more polished and
platform-consistent feel — especially on mobile.

Areas worth revisiting:

- **Obsidian Setting API**: `Setting` objects with name/description/control provide
  accessible, themed rows without manual DOM construction
- **Mobile layout**: Obsidian's modal sizing, scrolling, and touch targets on mobile
  differ from desktop — validate and optimise
- **Button affordances**: Obsidian's standard button classes (`mod-cta`, `mod-warning`)
  should be audited for correct use throughout the modal
- **Icon rendering**: `setIcon` usage is correct but placement and sizing could align
  more closely with how Obsidian uses icons in its own settings and modals
- **Keyboard nav**: Tab order and Enter/Escape handling for the add/edit rows

This is not urgent — the modal is functional. The goal is a polish pass once the core
CRUD behaviour is stable and STORY-028 (collapsed add row) is shipped.

## Acceptance Criteria
- [ ] UX audit documented: what works, what diverges from Obsidian patterns
- [ ] At least one concrete improvement shipped (mobile layout or Setting API adoption)
- [ ] No regression in existing CRUD behaviour or tests

## Likely Touchpoints
- `src/ui/modals/CategoryEditorModal.ts`
- `tests/ui/modals/CategoryEditorModal.test.ts`
