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

**Status:** Proposed
**Priority:** Medium
**Related File:** `src/data/import/moonreader.ts`

**Problem Statement:**
The `parseMoonReaderExport` function currently performs two distinct tasks:
1.  **Parsing:** Transforming raw `.mrexpt` string data into structured `MoonReaderAnnotation` objects.
2.  **Filtering/Syncing:** Using a `sinceId` parameter to filter results, returning only "new" annotations.

This violates the Single Responsibility Principle, making the code harder to test, less predictable, and obscuring the intent of the "incremental sync" feature.

**Proposed Refactor (Strategy 1: Explicit Filtering):**
1.  **Simplify Parser:** Remove the `sinceId` parameter from `parseMoonReaderExport`. It should return all valid annotations found in the string.
2.  **Extract Filtering:** Create a new utility function (e.g., `filterAnnotationsSinceId`) that takes an array of annotations and an ID, returning only those with a higher ID.
3.  **Update Callers:** Update `src/data/models/sourceNote.ts` to call the parser first, then explicitly apply the filter.

**Future Considerations:**
*   **Stateful Sync:** As the sync logic grows (e.g., handling deleted annotations or modified notes), we should consider a dedicated `SyncEngine` or `MoonReaderSync` class to manage the state of what has already been imported.

**Testing Plan (Currently Missing):**
New tests must be added to `tests/moonreader_parser.test.ts` or a new test file:
*   **Parser Purity:** Verify that `parseMoonReaderExport` always returns the full set of annotations regardless of outside state.
*   **Filtering Logic Unit Tests:**
    *   **Basic Filtering:** Given IDs `[10, 11, 12]`, filtering since `10` should return `[11, 12]`.
    *   **Boundary - All:** Since `null` or `0` should return all.
    *   **Boundary - None:** Since an ID higher than any present should return `[]`.
    *   **Robustness:** Handle non-numeric ID strings gracefully (return all or throw explicit error).

**Acceptance Criteria:**
- [ ] `parseMoonReaderExport` signature only accepts `content: string`.
- [ ] Filtering logic is moved to a separate, named function.
- [ ] Unit tests cover the incremental sync filtering logic.
- [ ] No regression in the existing `SourceNote` sync functionality.

---

## Technical Debt / Long Term

### As a developer, I want to fix a failing test so that I can ensure the quality of the codebase.

**User Story:** Fix the failing `PersonalNotePage.test.tsx` test.
**Outcome:** Resolved by mocking disk and initializing test plugin.

---

## Active / In Progress

### As a user, I want focused flashcard creation without distraction from unprocessed annotations.

**User Story:** Separate flashcard creation into dedicated route with processed-only navigation.

**Problem:**
- Flashcard creation currently shows ALL annotations (processed + unprocessed)
- Users creating flashcards get distracted by unprocessed annotations they need to categorize
- Navigation in flashcard creation context should only move through processed annotations
- No affordance to jump back to processing if annotation is missing

**Current State:**
- Annotation browsing and flashcard creation share same UI and navigation
- Same navigation buttons try to serve multiple contexts with different needs
- Cross-cutting concerns make navigation logic complex and hard to maintain

**Proposed Solution: Route-Based Separation**

Create dedicated flashcard creation route with context-specific behavior:

```
/books/:id/annotations          → Full annotation management (all filters)
/books/:id/flashcards/create    → Flashcard creation (processed-only, NEW)
/import/:id/process             → Import processing (unprocessed-only)
```

**Benefits:**
- **Focus:** Users creating flashcards only see learning-ready (processed) content
- **Independent UX:** Can evolve flashcard creation without affecting annotation management
  - Bulk card creation
  - AI-suggested cards
  - Mobile-optimized gestures
- **Clearer API contracts:** Different routes = different navigation scopes
- **Better performance:** Pre-filter processed annotations once
- **Testability:** Test flashcard creation flow independently

**UX Affordances:**
1. **Visual Distinction:** Header shows "Create Flashcards" + count of processed annotations
2. **Escape Hatch:** "Can't find annotation? → Browse all" link
3. **Workflow Integration:** After processing annotation, "Create flashcard" button jumps to creation view
4. **Keyboard Shortcuts:** Context-specific (e.g., Space = quick-add card)

**Tasks:**
1. Create new route: `/books/:id/flashcards/create`
2. Build `FlashcardCreationPage` component (processed annotations only)
3. Build `ProcessedAnnotationNav` component (opinionated navigation)
4. Add affordance links: "Browse all annotations" / "Process unprocessed"
5. Add breadcrumbs showing current context
6. Document context-specific keyboard shortcuts
7. Update navigation to use filter parameter when available (depends on ADR-019)

**Technical Notes:**
- Prerequisite: Navigation filter system (ADR-019)
- Shares primitive components (`<NavigationButton>`) with different orchestration
- Separate state management per context
- URL structure naturally separates contexts

**Priority:** Medium
**Type:** Feature / UX / Architecture
**Scale:** Large
**Effort:** Medium-High
**Tags:** #feature #ux #navigation #context-separation #flashcards

**Related:**
- Bug #1: Navigation ignores UI filters (docs/bugs.md)
- ADR-019: Navigation Filter Contract
- Technical Debt #3: Bloated api.ts

---

### As a developer, I want to remove unnecessary API indirection to reduce complexity and improve maintainability.

**User Story:** Remove `src/ui/routes/books/api.ts` wrapper functions and consolidate into `src/api.ts`.

**Problem:**
- `src/ui/routes/books/api.ts` contains 15 lines of parameter-reordering wrappers with no business value
- Creates confusion about which API to use where
- Adds indirection that must be maintained and tested
- Parameter order differences are a footgun (easy to pass wrong values)

**Current State:**
```typescript
// src/ui/routes/books/api.ts - just reorders params
export function getNextAnnotationIdForSection(bookId, sectionId, blockId) {
    return getNextAnnotationId(bookId, blockId, sectionId);
}
```

**Tasks:**
1. Delete `src/ui/routes/books/api.ts`
2. Update 2 component imports to use `src/api` directly:
   - `src/ui/routes/books/book/annotation/annotation-with-outlet.tsx`
   - `src/ui/routes/import/personal-note.tsx`
3. Update parameter order at call sites (swap `sectionId` and `blockId` positions)
4. Update `tests/routes_books_api.test.ts` to test `src/api` functions directly or consolidate into `tests/api.test.ts`

**Benefits:**
- Single source of truth for navigation API
- Simpler testing (mock one module, not two)
- Clearer when adding filter parameter (ADR-019)
- Less cognitive load for developers

**Priority:** High (unblocks ADR-019 filter work)
**Type:** Tech Debt / Refactor
**Est. Effort:** Low (30 min)
**Tags:** #tech-debt #api #refactor

---

### (ROADMAP) As a developer, I want a domain-organized API layer to improve code discoverability and maintainability at scale.

**User Story:** Refactor monolithic `src/api.ts` into domain-specific API modules under `src/apis/`.

**Context:**
- **Problem:** `src/api.ts` is 600+ lines and growing, mixing disparate concerns (navigation, flashcards, review, import)
- **Impact:** Hard to find relevant APIs, high merge conflict risk, difficult to test in isolation
- **Architectural Goal:** Maintain clean API layer separation (UI never imports from `data/models`) while organizing by domain for scalability

**Proposed Structure:**
```
src/
├── apis/
│   ├── sourcenote.ts     # Navigation, annotations, book structure (~150 lines)
│   ├── flashcard.ts      # Flashcard CRUD, scheduling (~100 lines)
│   ├── review.ts         # Review sessions, deck building (~80 lines)
│   ├── import.ts         # MoonReader imports (~60 lines)
│   └── index.ts          # Convenience re-exports
├── api.ts                # DEPRECATED: Re-exports for backward compatibility
```

**Benefits:**
- **Discoverability:** Navigation APIs in `apis/sourcenote.ts` vs Ctrl+F in 600-line file
- **Testability:** Mock specific domains instead of entire API surface
- **Maintainability:** Domain boundaries reduce merge conflicts
- **Scalability:** Easier to evolve/version individual domains
- **Future-proofing:** Backend substitution at domain level (e.g., swap `apis/sourcenote.ts` for REST client)
- **Preserves Architecture:** UI still imports from `apis/*`, never from `data/models/*`

**Migration Strategy:**
1. **Phase 1:** Create `src/apis/sourcenote.ts`, move navigation functions
2. **Phase 2:** Update `api.ts` to re-export for backward compatibility
3. **Phase 3:** Gradually migrate component imports to new structure
4. **Phase 4:** Create remaining domain modules (`flashcard.ts`, `review.ts`, etc.)
5. **Phase 5:** Remove deprecated `api.ts` once all imports migrated

**Use Cases Enabled:**
- React Native mobile app: Swap API implementations without touching UI
- Server-backed mode: `apis/sourcenote.ts` calls REST endpoints instead of local models
- Independent UI evolution: Change React to Svelte without model coupling

**Priority:** Medium (architectural improvement, not blocking)
**Type:** Architecture / Refactor
**Scale:** Epic
**Effort:** High (gradual migration over multiple PRs)
**Tags:** #epic #architecture #api-layer #domain-driven-design #scalability

**Related:**
- Short-term prerequisite: Remove `src/ui/routes/books/api.ts` indirection
- Aligns with ADR-018 (Source Model Architecture) for future domain model decomposition

---
