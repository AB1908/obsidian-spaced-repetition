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
- **Examples:**
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

---

## Current Development Plan: Improving Development Velocity

This section outlines the active strategy to improve the codebase's test coverage and reliability.

### Completed Work

- **Action:** Stabilized the test suite by fixing failing tests and updating outdated snapshots.
- **Action:** Fixed the failing `api.test.ts` by creating a fixture for `updateCardOnDisk` and correcting the mock implementation.
- **Action:** Configured `esbuild.config.mjs` to use an environment variable for the output path to support local plugin testing.
- **Action:** Added unit tests for navigation scroll state persistence (`tests/navigation_scrolling.test.tsx`), decoupling tests from router internals.

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