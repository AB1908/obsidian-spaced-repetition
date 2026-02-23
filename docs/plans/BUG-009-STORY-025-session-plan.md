# Session Plan: BUG-009 + STORY-025

**Date:** 2026-02-23
**Stories:** [BUG-009](../stories/BUG-009-import-annotation-editor-state-leak.md), [STORY-025](../stories/STORY-025-category-editor-modal.md)
**Test contract:** [BUG-009-STORY-025-test-contract.md](BUG-009-STORY-025-test-contract.md)

---

## Goal

Fix editor state not resetting on annotation navigation (BUG-009), then build the
CategoryEditorModal (STORY-025): a standalone Obsidian Modal for full category management
that replaces the inline add-category form in PersonalNotePage.

---

## Phase A: BUG-009 — Editor State Reset

### Problem
`useAnnotationEditor` initialises `personalNote` and `selectedCategory` via `useState`.
React only runs `useState` on first mount, so navigating to a new annotation (which does a
`{ replace: true }` route change without unmounting the component) leaves stale state from
the previous annotation.

### Fix
Add a `useEffect` in `useAnnotationEditor` keyed on `annotation.id` that resets both
fields to the incoming annotation's values:

```typescript
useEffect(() => {
    setPersonalNote(initialAnnotation.personalNote ?? "");
    setSelectedCategory(initialAnnotation.category ?? null);
}, [initialAnnotation.id]);
```

### Touchpoints
- `src/ui/routes/import/useAnnotationEditor.ts`
- `tests/routes/import/PersonalNotePage.test.tsx` — add state-reset tests

### Commit
```
fix(editor): reset personalNote and selectedCategory on annotation change
```

---

## Phase B: STORY-025 — CategoryEditorModal

### B1: Pure business logic + curated icon list

Extract category CRUD as pure functions in `annotation-categories.ts`. These have no
Obsidian dependency and are the primary test surface.

```typescript
// All return new array (immutable) or { error: string } on validation failure
addCategoryToList(categories, newCategory): CategoryConfig[] | { error: string }
removeCategoryFromList(categories, name): CategoryConfig[]
reorderCategoryInList(categories, name, 'up' | 'down'): CategoryConfig[]
editCategoryInList(categories, name, updates): CategoryConfig[] | { error: string }
```

Add `CURATED_ICON_POOL: Icon[]` — ~30 visually distinct Obsidian icon names.

**Touchpoints:**
- `src/config/annotation-categories.ts`
- `tests/config/annotation-categories.test.ts` (new)

**Commit:**
```
feat(annotation-categories): add CRUD functions and curated icon pool
```

### B2: CategoryEditorModal class

Plain Obsidian Modal (no React). Renders category list with icon, name, reorder
buttons, edit affordance, and delete button. Footer row for adding new categories.
Icon picker is an inline grid of `CURATED_ICON_POOL` icons rendered via `setIcon`.

Delete flow: count annotations using the category via `AnnotationsNoteIndex`, show
count in confirmation string, then call `removeCategoryFromList` and persist.

All mutations call the pure functions from B1, then write back to
`plugin.data.settings.annotationCategories` and call `plugin.savePluginData()`.

```typescript
// src/ui/modals/CategoryEditorModal.ts
export class CategoryEditorModal extends Modal {
    constructor(app: App, private plugin: CardCoveragePlugin) { super(app); }

    // Thin wrappers over pure functions — testable by calling directly
    addCategory(name: string, icon: Icon): void
    deleteCategory(name: string): void
    editCategory(name: string, updates: Partial<CategoryConfig>): void
    reorderCategory(name: string, direction: 'up' | 'down'): void

    onOpen(): void   // DOM rendering only — not unit tested
    onClose(): void  // cleanup
}
```

**Touchpoints:**
- `src/ui/modals/CategoryEditorModal.ts` (new)
- `tests/ui/modals/CategoryEditorModal.test.ts` (new)

**Commit:**
```
feat(modals): add CategoryEditorModal with category CRUD
```

### B3: PersonalNotePage integration + tooltips

- Remove `newCategoryName`, `newCategoryError`, `handleAddCategory` state and the
  inline add-category form from `PersonalNotePage`
- Remove `iconRefs` array and `useEffect(setIcon)` loop for category buttons — replace
  the custom button block with `<CategoryFilter>` (eliminates duplication with the
  `CategoryFilter` component which already handles this)
- Add "Manage categories" button that opens `new CategoryEditorModal(app, plugin).open()`
- Add `aria-label={category.name}` and `title={category.name}` to buttons in
  `CategoryFilter`

**Touchpoints:**
- `src/ui/routes/import/personal-note.tsx`
- `src/ui/components/category-filter.tsx`
- `tests/routes/import/PersonalNotePage.test.tsx`

**Commits:**
```
refactor(personal-note): use CategoryFilter, remove inline add-category form
feat(category-filter): add aria-label and title tooltips to category buttons
```

---

## Incidental Debt Fixed

| Issue | Fixed in |
|-------|---------|
| Custom category button block in `PersonalNotePage` duplicates `CategoryFilter` logic | Phase B3 |
| `annotation` typed as `any` in PersonalNotePage loader data | Phase B3 (export `Annotation` from `useAnnotationEditor`, use it in loader) |
| Inline `"asterisk" as const` icon default for new categories | Phase B1/B2 (icon picker replaces the default entirely) |

---

## Touchpoint Summary

| File | Phase |
|------|-------|
| `src/ui/routes/import/useAnnotationEditor.ts` | A |
| `src/config/annotation-categories.ts` | B1 |
| `src/ui/modals/CategoryEditorModal.ts` (new) | B2 |
| `src/ui/routes/import/personal-note.tsx` | B3 |
| `src/ui/components/category-filter.tsx` | B3 |
| `tests/routes/import/PersonalNotePage.test.tsx` | A, B3 |
| `tests/config/annotation-categories.test.ts` (new) | B1 |
| `tests/ui/modals/CategoryEditorModal.test.ts` (new) | B2 |

---

## Proposed Full Commit Sequence

1. `fix(editor): reset personalNote and selectedCategory on annotation change`
2. `feat(annotation-categories): add CRUD functions and curated icon pool`
3. `feat(modals): add CategoryEditorModal with category CRUD`
4. `refactor(personal-note): use CategoryFilter, remove inline add-category form`
5. `feat(category-filter): add aria-label and title tooltips to category buttons`
6. `docs(story-025): mark story criteria met`

---

## Verification Gates

```bash
npm test -- --runInBand tests/routes/import/PersonalNotePage.test.tsx
npm test -- --runInBand tests/config/annotation-categories.test.ts
npm test -- --runInBand tests/ui/modals/CategoryEditorModal.test.ts
npm test -- --runInBand
OBSIDIAN_PLUGIN_DIR=. npm run build
```

---

## Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Obsidian `Modal` DOM APIs unavailable in Jest | Mock `Modal` base class in jest setup (already mocked for other Obsidian APIs); test modal methods directly, not `onOpen()` |
| Replacing category buttons with `<CategoryFilter>` breaks snapshots | Isolate in its own commit; review snapshot diff explicitly |
| `plugin.savePluginData()` unavailable in modal tests | Pass mock plugin with `savePluginData: jest.fn()` |
| Annotation count for orphan warning requires index scan | Use `AnnotationsNoteIndex` already available on plugin; mock in tests |
