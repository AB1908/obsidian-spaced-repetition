# User Stories

## Active / Planned

### (EPIC) As a developer, I want to refactor the data model to support multiple source types so that the application is scalable and maintainable.

**Metadata:**
- **Priority:** High
- **Related Files:** `docs/decisions/ADR-018-source-model-architecture.md`, `src/data/models/`
- **Tags:** #epic, #architecture, #refactor
- **Effort/Scale:** Epic

**Context:**
- **Problem:** Our core data model is not scalable. The `SourceNote` class is doing too much, making it hard to add support for new source types like plain Markdown files.
- **Solution:** Implement the new architecture defined in ADR-018, refactoring the codebase to use the `Source`, `ISourceStrategy`, and `AnnotationsNote` models.

**Execution (Sub-Stories):**
- `refactor: Rename SourceNote to AnnotationsNote`
- `feat: Create generic Source class and ISourceStrategy interface`
- `feat: Implement MoonReaderStrategy for sync logic`
- `refactor: Update API layer to use the new Source/AnnotationsNote models`
- `feat: Implement MarkdownStrategy for extraction logic`

---

### (EPIC) As a developer, I want to decouple AnnotationsNote from FlashcardNote and ReviewSession for improved separation of concerns, scalability, and maintainability.

**Status:** Proposed
**Metadata:**
- **Priority:** High
- **Related Files:** `context/architecture_decoupling.md`, `src/data/models/AnnotationsNote.ts`, `src/data/models/flashcard.ts`, `src/api.ts`
- **Tags:** #epic, #architecture, #refactor
- **Effort/Scale:** Large

**Context:**
- **Problem:** `AnnotationsNote` is currently a "God Object," handling responsibilities for source content, flashcard management, and review session state. This leads to tight coupling, difficulty in testing, and problems with optional dependencies (e.g., `flashcardNote` being null).
- **Solution:** Implement the new architecture defined in `context/architecture_decoupling.md` to separate `AnnotationsNote` (source data), `FlashcardNote` (flashcard persistence), and `ReviewSession` (transient study state).

**Execution (Sub-Stories):**
- **Phase 1: Service/Index decoupling**
    - [ ] Expose `FlashcardIndex` capabilities to look up notes by their "Source ID" (parent book).
    - [ ] Update `api.ts` to fetch `FlashcardNote` directly from `FlashcardIndex` instead of accessing `book.flashcardNote`.
- **Phase 2: Extract CRUD Logic**
    - [ ] Move `createFlashcard`, `deleteFlashcard`, etc. calls in `api.ts` to use the `FlashcardNote` directly.
    - [ ] Remove proxy methods from `AnnotationsNote`.
- **Phase 3: Extract Review State**
    - [ ] Create `ReviewSession` class.
    - [ ] Update `api.ts` to instantiate a session when `startReview` is called.
    - [ ] Remove `reviewDeck`, `reviewIndex`, `getReviewStats` from `AnnotationsNote`.
- **Phase 4: Cleanup**
    - [ ] Remove `flashcardNote` property from `AnnotationsNote`.
    - [ ] Fix all resulting TypeScript errors.

**Acceptance Criteria:**
- [ ] `AnnotationsNote` focuses solely on source content and structure.
- [ ] `FlashcardNote` manages its own lifecycle and persistence.
- [ ] `ReviewSession` manages the active study session state.
- [ ] `api.ts` orchestrates interactions between these decoupled models.
- [ ] No regression in existing functionality.

---

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

### As a user, I want consistent UI across different annotation views for a unified experience.

**User Story:** Align `PersonalNotePage` rendering style with `AnnotationWithOutlet`.

**Problem:** The `PersonalNotePage` (used in Import flow) renders the highlight, note, and navigation controls differently than `AnnotationWithOutlet` (used in main Flashcard flow). This leads to a fragmented user experience.

**Tasks:**
1.  **Refactor `PersonalNotePage` Layout:** Move navigation buttons to be side-by-side with the annotation content, matching the `sr-annotation` class structure used in `AnnotationWithOutlet`.
2.  **Unify Styling:** Ensure consistent margins, padding, and block usage between the two views.

**Priority:** Medium
**Type:** Refactor / UX
**Est. Effort:** Low
**Tags:** #ui #consistency

---

### As a developer, I want to ensure navigation logic is robust and correctly handles boundary cases.

**User Story:** Add comprehensive navigation tests for `PersonalNotePage`.

**Problem:** Navigation between annotations needs to be verified for various states (first annotation, middle, last) to ensure buttons are correctly enabled/disabled and target IDs are correct.

**Tasks:**
1.  **Test 1st Annotation:** Verify only "Next" is enabled.
2.  **Test Middle Annotation:** Verify both "Previous" and "Next" are enabled.
3.  **Test Last Annotation:** Verify only "Previous" is enabled.
4.  **Verify ID calculation:** Ensure the correct target IDs are derived from the mock model.

**Priority:** High
**Type:** Test
**Est. Effort:** Low
**Tags:** #testing #navigation

---

### As a developer, I want to remove brittle path generation logic to improve maintainability.

**User Story:** Replace `pathGenerator` with React Router native features.

**Problem:** `pathGenerator` is brittle and difficult to maintain due to hardcoded route strings.

**Tasks:**
1.  **Analyze Navigation:** Determine if relative navigation (`../:id`) can replace the current logic.
2.  **Refactor:** Remove `pathGenerator` and update `AnnotationWithOutlet` and `PersonalNotePage` to use native navigation strategies.

**Priority:** Low
**Type:** Tech Debt
**Est. Effort:** Medium
**Tags:** #refactor #react-router

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

### As a user, I want a tree-based layout for annotation display so that I can visualize the document structure while reviewing.

**User Story:** Implement a hierarchical tree view for the annotation list.

**Problem:** The current flat list of annotations (even when grouped by section) can feel disconnected from the overall document structure. A tree-based layout would allow users to see annotations nested within their respective chapters and sub-sections, providing better context.

**Current Status:** **Product Scoping Required.** We need to define how the tree handles deep nesting, whether sections can be collapsed/expanded, and how filtering (by color/category) affects the tree visibility (e.g., do we hide empty branches?).

**Tasks (Initial):**
1.  **UI Research:** Explore existing tree-view implementations in Obsidian (like the File Explorer) for design inspiration.
2.  **Mock Layout:** Create low-fidelity wireframes for the tree navigation vs. content area.
3.  **Data Mapping:** Determine how `SourceNote.bookSections` can be transformed into a tree structure without expensive re-computations.

**Priority:** Medium
**Type:** Feature / UX
**Est. Effort:** Medium (Scoping) / High (Implementation)
**Tags:** #feature #ui #ux #tree-view #scoping

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

## User Story: Decouple MoonReader Parsing from Sync Logic

**Status:** Completed
**Priority:** Medium
**Related File:** `src/data/import/moonreader.ts`

**Outcome:** Resolved by extracting MoonReader sync logic into `MoonReaderStrategy`.

**Acceptance Criteria:**
- [x] `parseMoonReaderExport` signature only accepts `content: string`.
- [x] Filtering logic is moved to a separate, named function.
- [x] Unit tests cover the incremental sync filtering logic.
- [x] No regression in the existing `SourceNote` sync functionality.

---

### As a developer, I want a clean TypeScript build to use it as a reliable linter and verification step.

**User Story:** Resolve all 80+ TypeScript errors detected by `npx tsc --noEmit`.

**Metadata:**
- **Priority:** High
- **Related Files:** Entire codebase
- **Tags:** #tech-debt, #typescript, #dx
- **Effort/Scale:** Large

**Context:**
- **Problem:** Currently, `npx tsc --noEmit` reports over 80 errors. This prevents using TSC as a mandatory verification step in CI or during development, allowing type-related bugs to persist.
- **Solution:** Systematically address high-priority type errors (null checks, interface mismatches) and eventually integrate TSC into the "Verify-then-Commit" workflow.

**Tasks:**
1.  **High Priority:**
    - [ ] Fix "Object is possibly 'null'" in `src/api.ts` and `AnnotationsNote.ts` (especially `flashcardNote` and `plugin` access).
    - [ ] Fix type mismatches between `annotation` and `MoonReaderAnnotation` in strategy logic.
    - [ ] Resolve missing property errors (`deleted`, `title`) on union types (`annotation | paragraph`).
2.  **Medium Priority:**
    - [ ] Fix React Router loader type mismatches in `routes.tsx`.
    - [ ] Resolve `EventTarget` property access errors in UI components (`e.target.question.value`).
    - [ ] Export missing types/interfaces from `obsidian-facade.ts`.
3.  **Low Priority:**
    - [ ] Fix implicit 'any' types in utility functions.
    - [ ] Clean up unused imports and legacy type definitions.

**Acceptance Criteria:**
- [ ] `npx tsc --noEmit` returns 0 errors.
- [ ] No use of `@ts-ignore` for easily fixable issues.

---

## Technical Debt / Long Term

### As a developer, I want to fix a failing test so that I can ensure the quality of the codebase.

**User Story:** Fix the failing `PersonalNotePage.test.tsx` test.
**Outcome:** Resolved by mocking disk and initializing test plugin.
