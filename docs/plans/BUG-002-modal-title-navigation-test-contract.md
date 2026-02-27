# Test Contract: BUG-002 — Modal Title Navigation

**Story:** BUG-002
**Plan:** [BUG-002-modal-title-navigation.md](BUG-002-modal-title-navigation.md)

## Contract tests

TEST_FILE: tests/routes/root-title.test.tsx
TEST_FILE: tests/routes/books/book/annotation/annotation-with-outlet-title.test.tsx
TEST_FILE: tests/root.test.tsx

TEST_NAME: renders with default title "Card Coverage" when no route handle defines a title
TEST_NAME: renders title from the deepest matched route handle
TEST_NAME: AnnotationWithOutlet route handle returns book and section name as breadcrumb title
TEST_NAME: card editing route handle returns truncated question as title
TEST_NAME: title falls back to "Card Coverage" when handle title function throws or returns undefined

TEST_CMD: npm test -- --testPathPattern="root-title|annotation-with-outlet-title"
TEST_CMD: npm test -- --runInBand tests/root.test.tsx
TEST_CMD: npm test
TEST_CMD: npm run build

## Notes

- **Red-first**: Remove the `useParams` mock from `root.test.tsx` FIRST and confirm failure
  before implementing anything
- `ModalTitleContext.tsx` must not exist after the fix — no `useModalTitle` imports anywhere
- Mock `useMatches` in `root-title.test.tsx` to return controlled match arrays
- The `annotation-with-outlet-title` test verifies the route `handle.title` function directly,
  not a React component — it's a unit test of the handle function's output given mock match data
