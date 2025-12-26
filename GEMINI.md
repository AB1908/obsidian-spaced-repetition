# Gemini Workflow & Context

This document serves as the primary context for Gemini's interaction with this repository. It outlines operational principles to ensure smooth workflows and tracks the current development strategy.

## Operational Principles

### 1. Atomic Commits
- **Rule:** Commits must be atomic and focused on a single logical change.
- **Guidance:** Do not mix configuration changes, documentation updates, and code fixes in the same commit unless they are strictly related (e.g., a code change that requires a config update).
- **Process:** Before committing, always check `git status` to ensure only relevant files are staged. Partial commits (`git add -p` or specific file paths) are preferred over `git add .`.

### 2. Test-Driven Stability
- **Rule:** Ensure tests pass before and after changes.
- **Guidance:** When fixing bugs, ideally add a reproduction test case first. When adding features, include unit tests to cover the new logic.

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