# Gemini Workflow & Context

This document serves as the primary context for Gemini's interaction with this repository. It outlines operational principles to ensure smooth workflows and tracks the current development strategy.

## Operational Principles

### 1. Atomic Commits
- **Rule:** Commits must be atomic and focused on a single logical change. A change is considered atomic if it can be understood, reviewed, and, if necessary, reverted independently without affecting unrelated work.
- **Guidance:**
    - Do not mix unrelated changes (e.g., bug fix and new feature) in a single commit.
    - Do not mix configuration changes, documentation updates, and code fixes unless they are strictly co-dependent (e.g., a code change that *requires* a config update to function).
- **Examples of an Atomic Change:**
    - Implementing a single, small feature.
    - Fixing one specific bug.
    - Refactoring a single component or function.
    - Adding tests for a specific component or feature.
    - Updating a single dependency.
- **Process:** Before committing, always check `git status` to ensure only relevant files are staged. Partial commits (`git add -p` or specific file paths) are preferred over `git add .`.

### 2. Commit Message Guidelines
- **Rule:** All commit messages must adhere to the Conventional Commits specification.
- **Format:**
    ```
    <type>(<scope>): <description>

    [body]

    [footer(s)]
    ```
- **Elements:**
    - **`<type>` (Required):** Short, imperative, lowercase verb indicating the nature of the change.
        - `feat`: A new feature (introduces new functionality).
        - `fix`: A bug fix (corrects unexpected behavior).
        - `refactor`: Code change that neither fixes a bug nor adds a feature (e.g., restructuring code for clarity).
        - `test`: Adding or correcting tests.
        - `docs`: Documentation only changes.
        - `style`: Formatting, whitespace (no code meaning change).
        - `perf`: Code change that improves performance.
        - `build`: Changes affecting the build system or external dependencies.
        - `ci`: Changes to CI configuration files and scripts.
        - `chore`: Other changes that don't modify src or test files.
        - `revert`: Reverts a previous commit.
    - **`<scope>` (Optional):** A noun describing the part of the codebase affected. Examples: `(ui)`, `(api)`, `(routing)`, `(flashcard)`, `(tests)`.
    - **`<description>` (Required):** Concise, imperative, present-tense summary of the change (max ~72 chars). Starts lowercase, no period.
    - **`<body>` (Optional):** Longer explanation providing context, motivation, and detailed implementation notes. Explain *why* the change was made. Wrap lines at ~72 chars.
    - **`<footer>(s)` (Optional):**
        - `BREAKING CHANGE:`: Indicates a breaking API change. Include a description of the change and migration instructions. (e.g., `BREAKING CHANGE: <description>`)
        - References: Link to issues (e.g., `Closes #123`, `Refs #456`).
    - **Minimalist Approach for Clear Atomic Changes:** For very clear, atomic changes where the type, scope, and concise description already convey the full intent (e.g., introducing a simple abstraction or fixing a singular, well-understood bug), a body might be omitted to maintain conciseness and avoid redundancy. The change should be self-evident from its commit line and diff.
    - `feat(ui): add highlight/note toggle to annotation view`
    - `fix(review): prevent infinite loop in card navigation`
    - `refactor(NoteAndHighlight)!: require displayMode prop` (Note the `!` for breaking changes in description)
    - `test(annotation): add UI test for toggle functionality`

### 3. Test-Driven Stability
- **Rule:** Ensure tests pass before and after changes.
- **Guidance:** When fixing bugs, ideally add a reproduction test case first. When adding features, include unit tests to cover the new logic.
- **UI Testing Specifics:**
    - **Global Setup:** `tests/setup.ts` should globally import `@testing-library/jest-dom` for extended DOM assertions. If not working consistently, explicitly import it in individual test files (`import '@testing-library/jest-dom';`).
    - **React Router Hooks:** When testing components that use `react-router-dom` hooks (`useLoaderData`, `useParams`, `useLocation`, `useNavigate`, etc.), ensure these hooks are mocked using `jest.mock('react-router-dom', () => ({ ...jest.requireActual('react-router-dom'), ...mockedHooks }));`.
    - **Internal Functions:** For functions defined and used within the same component file (e.g., `pathGenerator` in `annotation-with-outlet.tsx`), consider extracting them to a separate utility file (e.g., `src/utils/path-generators.ts`). This allows them to be mocked using `jest.mock` on the utility module or `jest.spyOn` on the imported function, improving test isolation.

### 4. Lessons Learned: Atomic Commits & Architectural Adherence
- **Early and Frequent Commits:** Avoid bundling multiple logically separate changes into a single commit, even if they contribute to a larger feature. Committing early and frequently, with granular atomic changes, is critical for maintainability, reviewability, and debugging.
- **Strict Adherence to Atomic Commits:** Each commit should represent a single, isolated, and understandable change. This ensures that `git revert` and `git bisect` remain effective tools.
- **Rigorous Architectural Pattern Enforcement:** When introducing new features or refactoring, always ensure changes align with established architectural patterns (e.g., using facades for external APIs, encapsulating file system operations within designated modules like `disk.ts`). This prevents "technical debt" and improves testability and maintainability.
- **Client API Facades:** Encapsulate direct dependencies on client-specific APIs (e.g., Obsidian's `Notice`, `app.fileManager.processFrontMatter`) behind facades. This isolates the core logic from the client environment, making the code more portable and testable.
- **Interactive Staging:** When dealing with complex diffs or refactorings, use interactive staging (`git add -p`) to precisely select changes for atomic commits, especially when guided by user feedback.
- **Flatter, Minimalist UI Architecture:** Prefer simple, "dumb" UI components and flat API structures (e.g., returning a flat list of headings instead of a tree) to reduce complexity and improve maintainability. Complex tree-based UIs should be avoided unless strictly necessary for the user experience.
- **Prefer Nested Routes for Hierarchy:** Avoid defining flat routes for hierarchical resources (e.g., `:bookId`, `:annotationId`). Use nested `children` in `routes.tsx` to ensure relative navigation (`..`) remains predictable and intuitive.
- **Intentional Coupling vs. Isolation:** Note that some components (e.g., `AnnotationList`) currently use path-based logic (`location.pathname.startsWith("/import")`) to decide navigation behavior. While this simplifies the current "dumb" UI, it couples the component to the routing structure and should be addressed if these flows need to be isolated into separate plugins or packages.
- **Mind the Semantic Gap:** Be aware that technical terms (e.g., `Heading`) often differ from domain terms (e.g., `Chapter`). Proactively clarify if a technical filter matches the intended business logic.

### 5. Verify-then-Commit Workflow
- **Rule:** Never commit code without running the full test suite and verifying the diff.
- **Process:**
    1.  **Verify:** Run `npm test` and other relevant checks (linting, type-checking) before staging.
    2.  **Stage:** Use targeted staging (`git add <file>`) for logically related changes.
    3.  **Confirm:** Provide a concise summary of staged changes for human validation.
    4.  **Commit:** Use an atomic Conventional Commit message.

### 6. Diagnostic Snapshot Rule
- **Rule:** Before using a new or unfamiliar API to drive a UI component, generate a temporary or permanent test case in `tests/api.test.ts` to capture a snapshot of the data.
- **Purpose:** This prevents "hallucinations of intent" where the AI assumes an API's technical output matches the UI's semantic needs (e.g., assuming `isHeading` only returns level 1 chapters).
- **Process:**
    1.  Implement/Identify the API method.
    2.  Write a test case that calls the method with fixture data.
    3.  Share the resulting snapshot with the user for semantic verification.
    4.  Proceed to UI implementation only after the data structure is confirmed.

---

## Current Development Plan: Improving Development Velocity

This section outlines the active strategy to improve the codebase's test coverage and reliability.

### Completed Work

**Current Session: December 27, 2025**
*   **refactor(api):** Centralized `ReviewBook` and `FlashCount` interfaces in `src/api.ts` to improve reusability across routes.
*   **feat(api):** Implemented `getBookChapters` to provide a flat list of book headings, supporting a simpler, non-hierarchical UI.
*   **feat(ui):** Simplified the `ImportDashboard` to a minimalistic, clickable list of book names.
*   **feat(ui):** Overhauled `BookDetailsPage` to display a flat, clickable list of chapters with placeholder links.
*   **test:** Updated `AnnotationWithOutlet` and `api_orchestrator` tests to reflect UI changes and fix regressions.
*   **Workflow:** Formalized the "Verify-then-Commit" workflow to protect commit history quality.

**Session: December 26, 2025**

**Core Feature: Dynamic Modal Title & Breadcrumbs**
*   **feat(title):** Implemented a dynamic breadcrumb title in the flashcard modal that updates during navigation to show book/chapter context and specific editing/creation states.
*   **refactor(title):** Decoupled the title logic from the UI by creating a `getBreadcrumbData` API function, making the UI more modular.
*   **chore(utils):** Added a `truncate` utility to abbreviate long titles, keeping the UI clean.

**Major Refactoring & UI Improvements:**
*   **feat(ui):** Created new single-responsibility display components (`HighlightBlock`, `NoteBlock`) to replace the monolithic `NoteAndHighlight` component.
*   **refactor:** Migrated multiple components (`EditCard`, `AnnotationWithOutlet`, `ClozeCard`) to use these new, cleaner display components.
*   **feat(ui):** Enhanced the annotation view by disabling the "Note" toggle button when no note is present, improving user experience.
*   **refactor:** Moved the `EditCard` component into its own dedicated route file (`src/routes/edit-card.tsx`) and updated the routing table accordingly.

**Testing & Stability:**
*   **test:** Added a new UI test for the highlight/note toggle functionality in `AnnotationWithOutlet`.
*   **test:** Added unit tests to verify that the navigation scroll position is correctly persisted when switching between annotations.
*   **fix:** Corrected a bug where the scroll position was not restored correctly when navigating up from an annotation to the list view.

**Workflow & Process Improvements:**
*   **docs(context):** Made multiple updates to `GEMINI.md`, formalizing commit conventions, UI architecture guidelines, and testing specifics.
*   **Workflow:** Diagnosed and solved the GPG `pinentry` issue that was blocking commits and established a much more efficient, robust, and collaborative commit workflow.

### Phase 2: Introduce Comprehensive UI Testing

The user interface, built with React, has zero test coverage. This is the highest-risk area for user-facing bugs.

- **Next Step:** Finalize Jest's configuration for React Testing Library by creating a `tests/setup.ts` file to globally import `@testing-library/jest-dom` for better UI assertions.
- **Next Step:** Write a "golden path" test for a simple component (e.g., `src/routes/tags.tsx`) to validate the testing setup.
- **Next Step:** Systematically add tests for critical, interactive components like the review screen (`src/routes/review.tsx`) and card creation forms (`src/routes/upsert-card.tsx`).

### Phase 3: Strengthen Core Logic & Data Layer Tests

- **Next Step:** Refactor fragile tests like `api.test.ts` to focus on public inputs/outputs.
- **Next Step:** Increase unit test coverage for critical data models (`sourceNote.ts`, `flashcard.ts`).

### Phase 4: Establish a CI/CD Quality Gate

- **Next Step:** Modify `.github/workflows/pr.yml` to execute `npm test` on every pull request.
- **Next Step:** Add a coverage check step to the CI pipeline.