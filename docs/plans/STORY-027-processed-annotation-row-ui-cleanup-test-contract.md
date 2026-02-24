# Test Contract: STORY-027 — Processed Annotation Row UI Cleanup

## Contract tests

TEST_FILE: tests/routes/books/book/annotation/AnnotationListPage.test.tsx

TEST_NAME: MoonReader card creation is processed/category-focused
TEST_NAME: processed annotation row renders category icon, not color swatch
TEST_NAME: processed annotation row renders neutral placeholder when annotation is uncategorized
TEST_NAME: processed annotation row renders flashcard count
TEST_NAME: unprocessed annotation row renders color swatch
TEST_NAME: unprocessed annotation row does not render flashcard count

## Verification commands

TEST_CMD: npm test -- --testPathPattern="AnnotationListPage"
TEST_CMD: npm run build
