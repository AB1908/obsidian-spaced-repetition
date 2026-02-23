# Plan: STORY-025 — CategoryEditorModal

## Goal

Replace the inline add-category form in `PersonalNotePage` with a standalone Obsidian `Modal`
that supports the full category management lifecycle: add, edit, rename, reorder, delete (with
orphan warning). Extract the business logic as pure functions in `annotation-categories.ts`
so they are testable without Obsidian. Add tooltips to all category icon buttons.

---

## Design Decisions

### 1. Modal rendering: vanilla DOM vs React root inside Modal

**Options:**
- **A — Vanilla DOM in `onOpen()`**: Build the UI with `document.createElement` /
  `createEl` / `setIcon` directly. No React dependency in the modal.
- **B — React root inside Modal**: Mirror `FlashcardModal`, call `createRoot(this.contentEl)`
  in `onOpen()` and render a React component tree.

**Chosen: A — Vanilla DOM.**

Reason: The modal is reused in the plugin settings page (no React router context there). Using
vanilla DOM keeps the modal context-free. The UI is a simple CRUD list — no need for React's
reconciliation. `FlashcardModal` embeds React because it hosts the entire app router; this
modal has no such requirement. Vanilla DOM is also easier to test by calling `onOpen()` and
querying `contentEl` children.

---

### 2. Settings mutation pattern

**Options:**
- **A — Direct mutation**: `plugin.data.settings.annotationCategories = newList; await plugin.savePluginData()`
- **B — Injected callback**: pass `onSave: (categories: CategoryConfig[]) => Promise<void>`
  to the constructor, called after each mutation.
- **C — Dedicated helper in `settings.ts`**: `updateAnnotationCategories(plugin, newList)`

**Chosen: B — injected callback.**

Reason: A tight coupling to `plugin.data.settings` makes the modal hard to test (requires a
real or fully-mocked plugin instance). With a callback, tests can pass a simple jest.fn() and
assert it was called with the expected list. The callback pattern also makes settings-page
reuse explicit (the settings tab passes its own save function). This is one step more
indirection than A but the testing benefit is concrete.

Constructor signature:
```typescript
constructor(
    app: App,
    categories: CategoryConfig[],
    onSave: (updated: CategoryConfig[]) => Promise<void>,
    getOrphanCount: (categoryName: string) => number
)
```

---

### 3. Orphan count source

**Options:**
- **A — Scan `annotationsNoteIndex.getAllAnnotationsNotes()`** at delete-confirm time:
  iterate all annotations, count those with `category === deletedName`.
- **B — Pass a pre-computed map** at modal construction time.
- **C — Skip orphan count entirely**, just show a generic "annotations may reference this
  category" warning.

**Chosen: A — scan index at confirm time, injected as a callback.**

The `getOrphanCount` callback in the constructor takes a category name and returns a count.
This keeps the modal agnostic of the index API while being testable (pass a jest.fn() that
returns a fixed number). The caller (`PersonalNotePage`) provides the implementation that
queries `annotationsNoteIndex`.

If the index is unavailable in a given context, the caller can pass `() => 0` and the warning
will be shown without a count.

---

### 4. Post-save re-render in PersonalNotePage

**Options:**
- **A — Accept stale display**: categories read on render; next navigation will pick up new
  settings. User must navigate away and back.
- **B — Modal onClose callback triggers re-render**: PersonalNotePage passes a refresh
  function to the modal; modal calls it in its `onClose()`.
- **C — React state lifted**: PersonalNotePage holds `categories` in local state and updates
  it after modal closes.

**Chosen: C — local React state in PersonalNotePage.**

PersonalNotePage passes the initial list to `AnnotationEditorCard` (and thus `CategoryFilter`)
via state. On modal open, pass a callback that receives the new list and calls `setCategories`.
This is idiomatic React and avoids the need for an imperative refresh signal. The modal
receives `onSave` which updates both plugin settings AND returns the new list to the caller,
who then calls `setCategories`.

---

### 5. Curated icon list

A fixed exported constant `CURATED_CATEGORY_ICONS: Icon[]` in `annotation-categories.ts`
(~30 icons). Selected for semantic range and visual distinctiveness at small size.

Proposed list:
```
lightbulb, quote, whole-word, sticky-note, star, asterisk,
bookmark, tag, flag, heart, zap, flame, trophy, target,
puzzle, brain, coffee, pencil, eye, search, link, check-circle,
alert-circle, help-circle, info, compass, map, layers, code, music
```

Rendered as a grid of icon-buttons in the add/edit inline rows. No sub-modal needed. The
full Obsidian icon-set search is deferred (STORY-023 intent, now deprioritized).

---

### 6. Edit row UX: inline vs. sub-modal

**Options:**
- **A — Inline edit row**: clicking Edit replaces the row with a name input + icon grid.
- **B — Sub-modal**: opens a nested modal for editing.

**Chosen: A — inline edit row.**

Keeps all category management on one surface. Easier to implement without Obsidian modal
nesting issues. The icon grid is small enough (~30 icons) to display inline without
overwhelming the layout.

---

## Implementation

### New files
- `src/ui/modals/CategoryEditorModal.ts` — Obsidian Modal class, vanilla DOM
- `tests/config/annotation-categories.test.ts` — unit tests for pure CRUD functions
- `tests/ui/modals/CategoryEditorModal.test.ts` — modal business logic tests (DOM-lite)

### Modified files
- `src/config/annotation-categories.ts` — add CRUD functions + `CURATED_CATEGORY_ICONS`
- `src/ui/routes/import/personal-note.tsx` — remove inline form, add "Manage categories"
  button, hold categories in local state, pass to `AnnotationEditorCard`
- `src/ui/routes/import/AnnotationEditorCard.tsx` — accept `categories` as prop (not
  read from plugin directly), remove `getPluginContext` call
- `src/ui/components/category-filter.tsx` — add `aria-label` + `title` to buttons
- `tests/routes/import/PersonalNotePage.test.tsx` — update for new trigger, add tooltip
  assertions

### Pure functions to add in `annotation-categories.ts`

```typescript
addCategoryToList(
    categories: CategoryConfig[],
    newCategory: CategoryConfig
): CategoryConfig[] | { error: string }
// Error if name already exists or name/icon empty.

removeCategoryFromList(
    categories: CategoryConfig[],
    name: string
): CategoryConfig[]
// Returns list without the named category.

reorderCategoryInList(
    categories: CategoryConfig[],
    name: string,
    direction: 'up' | 'down'
): CategoryConfig[]
// No-op if already at boundary.

editCategoryInList(
    categories: CategoryConfig[],
    oldName: string,
    updates: Partial<CategoryConfig>
): CategoryConfig[] | { error: string }
// Error if new name conflicts with existing entry.
```

### Modal structure (`onOpen` DOM)

```
contentEl
  h2 "Manage Categories"
  .category-list
    for each category:
      .category-row
        [icon]  [name]  [↑] [↓] [Edit] [Delete]
      if editing this row:
        .edit-row
          <input name>  icon-grid  [Save] [Cancel]
  .add-row (footer)
    <input name>  icon-grid  [Add]
```

Persist on every confirmed action (add / edit / delete / reorder) via `onSave` callback.
The working list is held in a local `let categories = [...initialCategories]` variable
inside `onOpen` — no class state needed.

---

## Commit sequence

1. **`feat(annotation-categories): add CRUD pure functions and curated icon list`**
   - Adds `addCategoryToList`, `removeCategoryFromList`, `reorderCategoryInList`,
     `editCategoryInList`, `CURATED_CATEGORY_ICONS`
   - Tests in `tests/config/annotation-categories.test.ts`
   - No UI changes — build + tests green

2. **`feat(modal): add CategoryEditorModal with vanilla DOM`**
   - New `src/ui/modals/CategoryEditorModal.ts`
   - Unit tests in `tests/ui/modals/CategoryEditorModal.test.ts`
   - Constructor takes `(app, categories, onSave, getOrphanCount)`
   - Tests call `onOpen()` on a mocked modal instance, query DOM
   - No UI integration yet — build + tests green

3. **`feat(personal-note): integrate CategoryEditorModal, add category tooltips`**
   - `personal-note.tsx`: remove inline form, add "Manage categories" button, local
     categories state, open modal on click
   - `AnnotationEditorCard.tsx`: accept `categories` prop, remove `getPluginContext` call
   - `category-filter.tsx`: add `aria-label` + `title`
   - Update `PersonalNotePage.test.tsx`: new trigger, tooltip assertions
   - All tests green

---

## Verification gates

- `npm test` passes (38 suites, all green)
- `npm run build` exits 0
- Manual smoke: open modal, add category, reorder, edit, delete with orphan warning
- `CategoryFilter` buttons show tooltip on hover (manual check)
- New categories persist after closing and reopening the modal
