# User Stories

## As a developer, I want to fix a failing test so that I can ensure the quality of the codebase.

**User Story:** Fix the failing `PersonalNotePage.test.tsx` test.

**Problem:** The `PersonalNotePage.test.tsx` test was failing with a `TypeError: Cannot read properties of undefined (reading 'sourceNoteIndex')`. This was because the `plugin` object, which the component's underlying API calls depend on, was not initialized.

**Solution:**
1.  Mocked `src/infrastructure/disk.ts` using `createDiskMockFromFixtures` to provide a mock disk implementation.
2.  Imported and called `initializeTestPlugin` in the `beforeEach` block of `PersonalNotePage.test.tsx` to ensure the mock plugin is initialized before each test.
3.  Replaced hardcoded `mockBookId` and `mockAnnotationId` with dynamic values fetched from the initialized plugin to make the tests more robust.
4.  Updated the snapshots to match the new, correctly rendered component.

**Outcome:** The `PersonalNotePage.test.tsx` test now passes, and the component is rendering correctly with the mock data.

---

## As a developer, I want to address technical debt related to React Router to ensure the application remains up-to-date and maintainable.

**User Story:** Investigate and resolve the `v7_startTransition` warning from React Router.

**Problem:** When running tests, a warning from React Router is displayed: `v7_startTransition`. The official documentation suggests this is related to how state updates are wrapped and may involve issues with relative pathing in `Route` or `Link` components.

**Goal:** Eliminate the warning by identifying and fixing any incorrect relative pathing in routing components. This is considered technical debt that should be addressed to ensure a smooth upgrade path to future versions of React Router and to maintain best practices.

**Priority:** Medium.

---

## As a developer, I want to ensure that the application's navigation is consistent and predictable for the user.

**User Story:** Investigate all uses of the `navigate()` function and refactor routing logic where necessary.

**Problem:** The application's back button behaves irregularly in some cases. This is often caused by improper use of the `navigate()` function with history manipulation (e.g., using `replace: true`), which bypasses the browser's history stack. Some components that are currently implemented as separate routes might be better managed as internal state within a parent component, which would prevent unnecessary history entries.

**Goal:**
1.  **Investigate:** Catalog every instance where `navigate()` is used in the codebase.
2.  **Analyze & Categorize:** For each usage, determine if it is correct. Categorize the findings by criticality:
    *   **High:** Usages that directly cause user-facing bugs or major inconsistencies in back-button behavior.
    *   **Medium:** Usages that are architecturally suboptimal (i.e., should be state, not a route) but don't cause major bugs.
    *   **Low:** Minor deviations from best practices.
3.  **Refactor:** Based on the analysis, create a plan to refactor the routing logic to be more consistent and rely on component state where appropriate, making back-button behavior predictable.

**Priority:** Low (Long-term architectural improvement).
