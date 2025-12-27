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
