# Technical Debt & Architectural Risks

## 1. Global `app` Dependency in `disk.ts`
**Identified:** 2025-12-27
**Risk:** High
**Description:** `src/data/disk.ts` relies heavily on the global `app` object provided by Obsidian. This makes unit testing extremely difficult as it requires mocking the entire Obsidian API surface.
**Impact:** `tests/disk.test.ts` (if it exists/is created) will be fragile. Logic in `api.ts` that depends on `disk.ts` is also harder to test in isolation.
**Future Solution:** Implement Dependency Injection or an Adapter Pattern where `disk.ts` receives an `IFileSystem` interface, and the Obsidian implementation is just one concrete version of that.

## 2. Hardcoded File Names
**Identified:** 2025-12-27
**Risk:** Medium
**Description:** usage of "Annotations.md" and "Flashcards.md" is hardcoded in strings.
**Impact:** Changing naming conventions requires grepping the codebase.
**Future Solution:** Move these to `src/constants.ts` or a configuration object.

## 3. Bloated `api.ts` (God Object)
**Identified:** 2025-12-27
**Risk:** Medium
**Description:** `src/api.ts` is accumulating disparate domain logic (Flashcard Scheduling, Annotation Import, File Management). It is becoming a catch-all for "Business Logic" rather than a clean interface.
**Impact:** Harder to split "Annotation Processing" into a separate plugin later. Increases cognitive load when debugging.
**Future Solution:** Refactor into `src/domain/import/` and `src/domain/scheduling/`. Use `api.ts` only as a facade/re-exporter.

## 4. Inconsistent Data Models & Type Weakness
**Identified:** 2025-12-27
**Risk:** High
**Description:** The `SourceNote.bookSections` array holds a mix of `Heading`, `annotation`, and `paragraph` objects. Methods that operate on this array do not always handle the different types robustly, as seen in the `updateAnnotation` method which passed a `paragraph` to a function expecting an `annotation`.
**Impact:** Leads to runtime `TypeError`s that are not caught by TypeScript. The existence of `transform` functions in the API layer is a symptom of this, attempting to paper over model inconsistencies for the UI.
**Future Solution:** Create a unified `BookSection` interface or class that all items in `bookSections` implement. Alternatively, refactor methods like `updateAnnotation` to robustly check and handle the type of the section before processing, or use discriminated unions more effectively throughout the models. Colocate type guards with their type definitions.

## 5. Fragile UI/Model State Interaction
**Identified:** 2025-12-27
**Risk:** Medium
**Description:** UI components receive data from `react-router-dom` loaders, which pull from the in-memory data models (`SourceNoteIndex`). These models appear to be mutable. Passing mutable objects as props or `useLoaderData` return values can lead to subtle UI bugs where React does not re-render correctly, or where state is unexpectedly reset.
**Impact:** Can lead to difficult-to-diagnose UI bugs, such as the non-editable textarea in `personal-note.tsx`. It makes the UI's behavior dependent on the implementation details of the data layer.
**Future Solution:** Loaders should return plain, immutable data objects, not class instances. The data models should be treated as a data source, and the API layer should be responsible for mapping model objects to plain DTOs (Data Transfer Objects) for the UI.

## 6. UI Test Coverage Gaps
**Identified:** 2025-12-27
**Risk:** Medium
**Description:** The UI has low test coverage. Critical user interactions, such as editing a textarea or saving a form, are not covered by automated tests.
**Impact:** User-facing regressions, like the non-editable textarea, can be easily introduced and go unnoticed until manual testing.
**Future Solution:** Systematically add UI tests using React Testing Library. Prioritize tests for critical, interactive components and forms, such as `personal-note.tsx` and card creation/editing routes. Simulate user events like typing and clicking to verify the components behave as expected.

## 7. Icon List Centralization

**Issue:** The `ICON_LIST` constant, currently defined and managed manually within `src/types/obsidian-icons.ts` (previously `src/constants.ts`), appears to be an exhaustive list of icons available in Obsidian.

**Problem:** Manually maintaining this list is brittle and prone to errors. If Obsidian's icon set changes, this list would need manual updates.

**Proposed Solution:** Investigate if Obsidian exposes its internal icon list via an official API or a more stable programmatic method. If so, `ICON_LIST` should be dynamically imported or generated from that source. This would improve maintainability and ensure consistency with the host application.

**Priority:** Low (for now), as the current implementation is functional, but marked for future investigation to reduce technical debt.