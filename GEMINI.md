# Gemini AI's Plan for Improving Development Velocity

This document outlines a phased strategy to improve the codebase's test coverage and reliability. The ultimate goal is to enable faster, more confident feature development and refactoring by creating a robust automated testing suite.

## Completed Work

- **Action:** Stabilized the test suite by fixing failing tests and updating outdated snapshots. The test suite is now consistently passing, providing a reliable baseline for further work.
- **Action:** Fixed the failing `api.test.ts` by creating a fixture for `updateCardOnDisk` and correcting the mock implementation.
- **Action:** Configured `esbuild.config.mjs` to use an environment variable for the output path, preventing build artifacts from appearing in git changes.

## Phase 2: Introduce Comprehensive UI Testing

The user interface, built with React, has zero test coverage. This is the highest-risk area for user-facing bugs.

- **Next Step:** Finalize Jest's configuration for React Testing Library by creating a `tests/setup.ts` file to globally import `@testing-library/jest-dom` for better UI assertions.
- **Next Step:** Write a "golden path" test for a simple component (e.g., `src/routes/tags.tsx`) to validate the testing setup and provide a template for future tests.
- **Next Step:** Systematically add tests for critical, interactive components like the review screen (`src/routes/review.tsx`), card creation forms (`src/routes/upsert-card.tsx`), and the main navigation (`src/routes/notes-home-page.tsx`).

## Phase 3: Strengthen Core Logic & Data Layer Tests

The existing tests for the core business logic are sparse and, in some cases, brittle.

- **Next Step:** Refactor fragile tests like `api.test.ts` to focus on testing public inputs and outputs rather than internal implementation details. This will make them more resilient to code refactoring.
- **Next Step:** Increase unit test coverage for critical data models, specifically `src/data/models/sourceNote.ts` and `src/data/models/flashcard.ts`, which are central to the plugin's operation.
- **Next Step:** Add tests for currently uncovered utility files, such as `src/utils.ts`.

## Phase 4: Establish a CI/CD Quality Gate

To ensure the quality of the codebase is maintained and improved over time, these standards must be automated.

- **Next Step:** Modify the existing CI pipeline in `.github/workflows/pr.yml` to execute the full test suite (`npm test`) on every pull request. The build should fail if any test fails.
- **Next Step:** Add a coverage check step to the CI pipeline (using a tool like `jest-cov-fail`). This will fail the build if a pull request causes total test coverage to drop below a specified threshold. The threshold can be increased over time as the test suite matures.
