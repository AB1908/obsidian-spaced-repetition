# Test Contract: DEBT-024 — Filter Policy Single Source of Truth

## Commit 1 — refactor only, no new tests

All existing tests must pass unchanged after extracting the shared module.

TEST_FILE: tests/routes/books/book/annotation/AnnotationListPage.test.tsx
TEST_NAME: filter state is written to sessionStorage

TEST_FILE: tests/routes/import/PersonalNotePage.test.tsx
TEST_NAME: renders previous and next buttons when not at boundary

## Commit 2 — new tests

TEST_FILE: tests/routes/import/PersonalNotePage.test.tsx
TEST_NAME: navigation respects active filter from session storage
TEST_NAME: navigation works without filter in session storage

## Verification commands

TEST_CMD: npm test -- --testPathPattern="PersonalNotePage|AnnotationListPage"
TEST_CMD: npm run build
TEST_CMD: grep -r "NAVIGATION_FILTER_SESSION_KEY" src/ | grep -v navigation-filter-session
