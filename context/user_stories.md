# User Stories

## Active / Planned

### As a developer, I want to associate annotations with their parent sections in the model to decouple UI logic from routing.

**User Story:** Add `sectionId` to the `annotation` model and inject it during parsing.

**Problem:** Currently, components and loaders rely on `sectionId` being passed via URL parameters or external context. The `annotation` object itself doesn't know which section it belongs to. This makes navigation and data fetching brittle, especially in views like the Import route where the URL structure might differ.

**Tasks:**
1.  **Refactor `annotation` interface:** Add `sectionId?: string` to `src/data/models/annotations.ts`.
2.  **Update Parser (`bookSections`):** Modify the parsing loop in `src/data/models/sourceNote.ts` to track the current `Heading` and assign its `id` to every `annotation` and `paragraph` encountered.
3.  **Handle Root Sections:** Ensure annotations appearing before any header are assigned a consistent "root" or "null" section ID.
4.  **Decouple Loaders:** Update `personalNoteLoader` and others to derive `sectionId` from the fetched annotation instead of URL params.

**Priority:** Medium
**Type:** Architecture / Refactor
**Scale:** Large
**Effort:** High
**Tags:** #architecture #dx #datamodel

---

### As a developer, I want efficient annotation navigation to improve application performance.

**User Story:** Refactor `getPreviousAnnotationIdForSection` to use the ordered `bookSections` state.

**Problem:** The current implementation of `getPrevious/NextAnnotationIdForSection` fetches the entire list of annotations for a section and then performs an index lookup. This is inefficient ($O(N)$) and repetitive.

**Solution:**
1.  **SourceNote Methods:** Add `getPreviousAnnotation(id)` and `getNextAnnotation(id)` methods to the `SourceNote` class that leverage the already-ordered `bookSections` array.
2.  **API Update:** Update `src/ui/routes/books/api.ts` to delegate to these new `SourceNote` methods.
3.  **Filter Awareness (Future):** Ensure navigation eventually respects UI filters (though the immediate goal is architectural efficiency).

**Priority:** Medium
**Type:** Refactor / Performance
**Scale:** Medium
**Effort:** Medium
**Tags:** #performance #refactor

---

### As a user, I want to navigate between annotations in the Import view so that I can process them efficiently.

**User Story:** Fix missing/hidden navigation buttons in the Import Route's annotation view.

**Problem:** In the Import/Review flow (specifically the Annotation View within the import route), the "Previous" and "Next" buttons are reportedly not displayed or are disabled incorrectly.

**Investigation:**
*   Likely location: `src/ui/routes/import/personal-note.tsx` (or equivalent view).
*   Potential cause: `getPreviousAnnotationIdForSection` returning null due to missing context (e.g., `sectionId`), or the `NavigationControl` component rendering an invisible placeholder when disabled.
*   **Note:** This is a high-priority bug that will be naturally resolved by the "Annotation Model Refactor" above, but should be verified independently.

**Goal:** Ensure navigation buttons appear and function correctly in the Import context.

**Priority:** High
**Type:** Bug / UX
**Est. Effort:** Low
**Tags:** #bug #ui #navigation #import

---

### As a user, I want to configure annotation categories so that I can customize my review workflow.

**User Story:** Implement configurable annotation categories (icons + names).

**Problem:** Currently, categories (icons like lightbulb, quote, etc.) are hardcoded in `src/config/annotation-categories.ts`. Users cannot add their own or change the meaning of existing ones.

**Solution:**
1.  **Data Layer:** Move category definitions to the `Settings` object/store.
2.  **Settings UI:** Create a settings section to Add, Edit, Delete, and Reorder categories.
    *   Include an Icon Picker (browse Obsidian/Lucide icons).
3.  **Annotation View UI:**
    *   Render categories dynamically from Settings.
    *   Add an "Add Category" button (plus icon) that allows creating a category on the fly (default icon or quick picker).
    *   Implement tooltips on hover (desktop) or long-press (mobile) to show the category name.

**Priority:** Medium
**Type:** Feature
**Est. Effort:** High
**Tags:** #feature #ui #settings

---

## Technical Debt / Long Term

### As a developer, I want to address technical debt related to React Router to ensure the application remains up-to-date and maintainable.

**User Story:** Investigate and resolve the `v7_startTransition` warning from React Router.

**Priority:** Medium
**Type:** Tech Debt
**Est. Effort:** Medium

---

### As a developer, I want to ensure that the application's navigation is consistent and predictable for the user.

**User Story:** Investigate all uses of the `navigate()` function and refactor routing logic where necessary.

**Priority:** Low (Long-term architectural improvement)
**Type:** Refactor
**Est. Effort:** High

---

## Completed

### As a developer, I want to fix a failing test so that I can ensure the quality of the codebase.

**User Story:** Fix the failing `PersonalNotePage.test.tsx` test.
**Outcome:** Resolved by mocking disk and initializing test plugin.
