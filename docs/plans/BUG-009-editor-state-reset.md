# Plan: BUG-009 — Editor State Reset on Annotation Navigation

**Story:** [BUG-009](../stories/BUG-009-import-annotation-editor-state-leak.md)
**Test contract:** [BUG-009-editor-state-reset-test-contract.md](BUG-009-editor-state-reset-test-contract.md)

---

## Problem

`PersonalNotePage` navigates to sibling annotations via:
```typescript
navigate(pathGenerator(location.pathname, params, targetAnnotationId), { replace: true });
```

`replace: true` is intentional — it keeps the component mounted across annotation changes
(no remount flash, history stays clean for the user). The loader re-runs and delivers fresh
annotation data, but `useAnnotationEditor` initialises `personalNote` and `selectedCategory`
via `useState`, which only runs once on mount. Navigating to a new annotation re-renders
with new props but stale state.

---

## Design Decision: How to Reset State on Navigation

### Options considered

| Option | Mechanism | Double-render | Maintenance burden | Notes |
|--------|-----------|--------------|-------------------|-------|
| `useEffect` reset | `useEffect([annotation.id])` sets state | Yes (flash of stale state) | High — every new field must be added manually | Brittle as hook grows |
| `key` on whole `PersonalNotePage` | Router-level key per annotation | No | None | Full unmount; against the intent of `replace: true` |
| `key` on scoped sub-component | Extract editor fields; `key={annotation.id}` on that component | No | None — fresh mount guarantees all state | **Chosen** |
| Edit-overlay / derived state | Track delta edits, derive effective state from annotation | No | Medium — two-layer state model | Good future direction with STORY-020 auto-save; too complex now |

### Chosen: Option 3 — scoped `key` on extracted sub-component

Extract an `AnnotationEditorCard` component containing `useAnnotationEditor` and all
editable fields. `PersonalNotePage` renders it with `key={annotation.id}`. When the
annotation changes, `AnnotationEditorCard` unmounts and remounts with fresh state —
no `useEffect`, no manual field list, no stale flash.

Navigation chrome that should persist across annotation changes (header, annotation
display block) stays in `PersonalNotePage`.

```
PersonalNotePage (stays mounted across annotation navigation)
├── Header + delete button
├── NavigationControl (prev/next)
├── HighlightBlock + NoteBlock       ← updates via new loader data
└── AnnotationEditorCard key={annotation.id}   ← remounts per annotation
    ├── useAnnotationEditor (all form state)
    ├── textarea (personalNote)
    ├── CategoryFilter (selectedCategory)
    └── Save / Back buttons
```

The `save()` call in `handleNavigate` must happen before navigation. Since `save` lives
inside `AnnotationEditorCard`, `PersonalNotePage` must call it before navigating.
Implementation options for this:

1. Expose `save` via a `useImperativeHandle` / `forwardRef` pattern — over-engineered.
2. Lift `handleNavigate` into `AnnotationEditorCard` — cleaner. The card knows its own
   save state and owns the navigate-after-save flow. `PersonalNotePage` passes
   `previousAnnotationId` and `nextAnnotationId` as props; the card handles the rest.

**Chosen:** lift `handleNavigate` into `AnnotationEditorCard`. PersonalNotePage computes
prev/next IDs from params and passes them as props; AnnotationEditorCard owns the
save-then-navigate behaviour.

---

## Implementation

### New: `src/ui/routes/import/AnnotationEditorCard.tsx`

Contains:
- `useAnnotationEditor(annotation, bookId)` hook
- `useNavigate()` for navigation after save
- `handleNavigate(targetId)` — saves then navigates
- Renders: textarea, `<CategoryFilter>`, save/back buttons, "Manage categories" stub

Props:
```typescript
interface AnnotationEditorCardProps {
    annotation: Annotation;
    bookId: string;
    previousAnnotationId: string | null;
    nextAnnotationId: string | null;
}
```

### Modified: `src/ui/routes/import/personal-note.tsx`

- Computes `previousAnnotationId` and `nextAnnotationId` from params
- Renders `<AnnotationEditorCard key={annotation.id} ... />`
- Retains: header, color swatch, delete button, highlight/note display
- Removes: direct usage of `useAnnotationEditor`, nav handlers, form state

### Modified: `tests/routes/import/PersonalNotePage.test.tsx`

Add tests for:
- `personalNote` resets when annotation id changes
- `selectedCategory` resets when annotation id changes
- Save is called with previous annotation data before navigating to next

---

## Incidental debt fixed

- `annotation` typed as `any` in loader data — export `Annotation` from
  `useAnnotationEditor.ts` and use it in the loader cast
- Duplicate `iconRefs`/`setIcon` useEffect in PersonalNotePage — removed when the
  custom category buttons are replaced with `<CategoryFilter>` inside
  `AnnotationEditorCard` (the full CategoryFilter integration is STORY-025, but
  `AnnotationEditorCard` should use `<CategoryFilter>` from the start to avoid
  re-introducing the duplication)

---

## Commit sequence

1. `refactor(personal-note): extract AnnotationEditorCard with key-based state reset`
2. `test(bug-009): add state reset assertions for annotation navigation`

---

## Verification gates

```bash
npm test -- --runInBand tests/routes/import/PersonalNotePage.test.tsx
npm test -- --runInBand
OBSIDIAN_PLUGIN_DIR=. npm run build
```
