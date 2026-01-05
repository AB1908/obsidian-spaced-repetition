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
