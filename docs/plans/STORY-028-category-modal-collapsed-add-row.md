# Plan: STORY-028 — Collapse Add Row in CategoryEditorModal

## Goal

The "add new category" form in `CategoryEditorModal` is always visible on open. It should
be hidden behind a trigger button, revealing itself only when the user asks to add a
category — matching the existing edit-row pattern.

---

## Design Decisions

### 1. State variable: boolean flag vs. null sentinel

**Options:**
- **A — Boolean flag**: `let addFormOpen = false`
- **B — Null sentinel**: reuse a string like `addNameDraft` being non-null to signal open
  state (implicit)

**Chosen: A — boolean flag.**

Mirrors `editingName: string | null` in intent but is simpler: add form has no "which
item" context, only open/closed. `addFormOpen` is explicit and readable.

---

### 2. Draft state reset on cancel

**Options:**
- **A — Reset both name and icon on cancel**: `addNameDraft = ""; addIconDraft = CURATED_CATEGORY_ICONS[0]`
- **B — Preserve drafts on cancel**: reopen shows what the user had typed

**Chosen: A — reset on cancel.**

The trigger pattern implies "start fresh" intent. Preserving partial input across a
cancel/reopen cycle is surprising and could surface stale names. On successful add, state
is already reset; cancel should match.

---

### 3. Trigger button placement and label

**Options:**
- **A — `+ Add category`** button below the list, same position as the current add-row
- **B — `Add` icon-only button** (no text label)

**Chosen: A — labelled text button.**

Labelled text is clearer than an icon alone, especially on first use. Mobile targets
benefit from the larger touch area. Matches the verbosity of the Edit/Delete/Save/Cancel
buttons already in the modal.

---

## Implementation

### Modified files
- `src/ui/modals/CategoryEditorModal.ts` — add `addFormOpen` state, branch add-row render
- `tests/ui/modals/CategoryEditorModal.test.ts` — update add-path tests to click trigger first

### Changes to `CategoryEditorModal.ts`

In `onOpen()`, alongside existing state variables, add:
```typescript
let addFormOpen = false;
```

In `render()`, replace the unconditional add-row block (lines 292–336) with:

```typescript
const addSection = document.createElement("div");
addSection.style.marginTop = "12px";
addSection.style.paddingTop = "12px";
addSection.style.borderTop = "1px solid var(--background-modifier-border)";

if (!addFormOpen) {
    const triggerButton = document.createElement("button");
    triggerButton.type = "button";
    triggerButton.textContent = "+ Add category";
    triggerButton.dataset.role = "add-category-trigger";
    triggerButton.addEventListener("click", () => {
        addFormOpen = true;
        render();
    });
    addSection.appendChild(triggerButton);
} else {
    // existing add-row content (input, icon grid, Add button)
    // + Cancel button:
    const cancelAdd = document.createElement("button");
    cancelAdd.type = "button";
    cancelAdd.textContent = "Cancel";
    cancelAdd.dataset.role = "cancel-add-category";
    cancelAdd.addEventListener("click", () => {
        addFormOpen = false;
        addNameDraft = "";
        addIconDraft = CURATED_CATEGORY_ICONS[0];
        errorMessage = "";
        render();
    });
    // on successful add: addFormOpen = false; addNameDraft = ""; before persistAndRender
}

this.contentEl.appendChild(addSection);
```

### Changes to `CategoryEditorModal.test.ts`

Tests that call `add-category-name` or `add-category-submit` must first query and click
`[data-role="add-category-trigger"]` to open the form. Update:
- "CategoryEditorModal calls onSave with updated list after add"
- Any other test that fills the add form

New test to add:
- "CategoryEditorModal shows trigger button on open, not add form"
- "CategoryEditorModal shows add form after trigger click"
- "CategoryEditorModal collapses add form on cancel"

---

## Commit sequence

1. **`feat(modal): collapse add row behind trigger button`**
   - `src/ui/modals/CategoryEditorModal.ts`
   - `tests/ui/modals/CategoryEditorModal.test.ts`
   - All tests green

---

## Verification gates

- `npm test -- --testPathPattern="CategoryEditorModal"` passes
- `npm run build` exits 0

## Delegation

```bash
scripts/delegate-codex-task.sh \
  --branch story-028-category-modal-collapsed-add-row \
  --base main \
  --scope-file docs/plans/STORY-028-category-modal-collapsed-add-row.md \
  --test-contract docs/plans/STORY-028-category-modal-collapsed-add-row-test-contract.md \
  --log-file docs/executions/logs/story-028-category-modal-collapsed-add-row.log \
  --semantic-log docs/executions/semantic/story-028-category-modal-collapsed-add-row.md \
  --execute
```
