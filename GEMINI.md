Inspect tsc output and how clean it is and create roadmap task to slowly fix small bugs detected by tsc so it can be used as linter for future refactors

# Gemini Workflow & Context

This document serves as the primary context for Gemini's interaction with this repository. It outlines operational principles to ensure smooth workflows and tracks the current development strategy.

**CRITICAL STARTUP PROTOCOL:**
Upon starting a session, the Agent MUST:
1.  **Read this file (`GEMINI.md`)** to understand the current architecture, workflows, and known issues.
2.  **Adopt the "Senior Developer" Persona:** Act as an expert TypeScript/React engineer who values code quality, testability, and architectural purity over quick hacks.
3.  **Adhere to "Verify-then-Commit":** NEVER commit code without running tests (`npm test`). If tests fail, fix them or revert.
4.  **Enforce Atomic Commits:** Break work into the smallest possible logical units.

## Operational Principles

### 1. Atomic Commits
- **Rule:** Commits must be atomic and focused on a single logical change. A change is considered atomic if it can be understood, reviewed, and, if necessary, reverted independently without affecting unrelated work.
- **Guidance:**
    - Do not mix unrelated changes (e.g., bug fix and new feature) in a single commit.
    - Do not mix configuration changes, documentation updates, and code fixes unless they are strictly co-dependent (e.g., a code change that *requires* a config update to function).
- **Process:** Before committing, always check `git status` to ensure only relevant files are staged. Partial commits (`git add -p` or specific file paths) are preferred over `git add .`.

### 2. Commit Message Guidelines
- **Rule:** All commit messages must adhere to the Conventional Commits specification.
- **Format:** `<type>(<scope>): <description>` (e.g., `feat(ui): add toggle button`, `refactor(api): decouple disk logic`).

### 3. Test-Driven Stability
- **Rule:** Ensure tests pass before and after changes.
- **Guidance:** When fixing bugs, ideally add a reproduction test case first. When adding features, include unit tests to cover the new logic.
- **Strict Adherence to the Verify-then-Commit Workflow:** The "Verify-then-Commit" workflow is not a suggestion; it is a critical process to prevent regressions and maintain codebase quality. After any refactoring or change, the full test suite (`npm test`) *must* be executed *before* staging files.

### 4. Architecture: Route-based Feature Modules
- **Principle:** Each top-level route in the application is considered a "feature" and gets its own directory inside `src/routes/`.
- **Directory Structure:** `src/routes/<feature>/` contains `index.tsx`, `api.ts` (local data fetching), and `components/`.

### 5. Domain Model Decomposition (Refactoring in Progress)
- **Goal:** Move business logic and disk I/O out of the global `api.ts` and into cohesive models.
- **Key Models:**
    - **`SourceNote` (`src/data/models/sourceNote.ts`):** Represents a book/document. Handles review stats, annotation coverage, and export syncing.
    - **`FlashcardNote` (`src/data/models/flashcard.ts`):** Handles the physical storage and CRUD operations for flashcards in a markdown file.
- **Rule:** `api.ts` should act as a thin facade/orchestrator. It should delegate complex operations to these models. It should *not* directly import `disk.ts` methods if a model can handle it.

---

## UI Development with Mock Server

For rapid UI development and testing, this project uses `json-server` to provide a mock API backend.

### Running the Mock Server

1.  Start the mock server by running the following command in your terminal:
    ```bash
    npm run mock-server
    ```
    This will start a server on `http://localhost:3000` and watch the `db.json` file for changes.

### Enabling the Mock API in the UI

To make the UI use the mock API, you need to set the `USE_JSON_MOCK` flag to `true` in `src/ui/routes/books/review/index.tsx`.

```typescript
// src/ui/routes/books/review/index.tsx
export const USE_JSON_MOCK = true;
```

When this flag is `true`, the data loaders for the UI routes will fetch data from the `json-server` instead of the actual backend.

### Modifying Mock Data

The mock data is stored in the `db.json` file in the root of the project. You can edit this file to change the data returned by the mock API. `json-server` will automatically pick up the changes.

---

## Current Development Plan

### Completed Work

**Session: January 3, 2026**
*   **refactor(annotation):** Simplified the Annotation View to display highlight and note simultaneously, removing toggle buttons.
*   **refactor(annotation):** Made navigation logic stateful (`bookId`, `sectionId`) and decoupled it from the UI loader, moving logic to `src/ui/routes/books/api.ts`.
*   **refactor(api):** Massive cleanup of `src/api.ts`.
    *   Moved `getSourcesForReview` logic to `SourceNote.getReviewStats()`.
    *   Moved `getImportedBooks` logic to `SourceNote.getBookFrontmatter()`.
    *   Moved `updateBookAnnotationsAndFrontmatter` to `SourceNote.syncMoonReaderExport()`.
    *   Moved `importMoonReaderExport` to `SourceNote.createFromMoonReaderExport()`.
*   **refactor(model):** Extracted flashcard CRUD logic (`create`, `delete`, `update`) from `SourceNote` into `FlashcardNote`, improving separation of concerns.
*   **test:** Added `tests/routes_books_api.test.ts` to test the new stateful navigation logic.

### Phase 2: Introduce Comprehensive UI Testing
- **Next Step:** Finalize Jest's configuration for React Testing Library.
- **Next Step:** Systematically add tests for critical, interactive components like the review screen (`src/routes/review.tsx`).

### Phase 3: Strengthen Core Logic & Data Layer Tests
- **Next Step:** Continue refactoring `SourceNote` to remove transient review state (introduce `ReviewSession`?).

---

## Technical Debt & Known Issues

- **Annotation Navigation:** The "Previous" and "Next" navigation buttons in the annotation view (`AnnotationWithOutlet`) currently operate on the full list of annotations for a section. If the user has applied filters (e.g., category, color, processed/unprocessed) in the `AnnotationListPage`, the navigation will not respect these filters, potentially leading to a confusing user experience where "Next" takes them to an annotation that was hidden in the list view.