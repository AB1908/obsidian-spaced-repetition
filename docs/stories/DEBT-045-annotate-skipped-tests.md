# DEBT-045: Annotate all test.skip entries with skip reasons

## Status
Proposed

## Reviewed
No

## Epic
None

## Description
There are 10+ `test.skip` calls across the test suite with no comment explaining why the test is skipped. An agent reading the test file cannot distinguish between:
- Tests blocked on an in-progress refactor
- Tests not yet implemented
- Tests that are known flaky
- Tests that were abandoned

Affected files include `api.test.ts` (5 skips), `scheduling.test.ts` (2 skips), `book.test.ts` (1 skip), `navigation_scrolling.test.tsx` (1 skip), `lang/helpers.test.ts` (2 skips).

Without reasons, an agent may silently ignore skipped tests or incorrectly treat them as passing coverage.

## Acceptance Criteria
- [ ] Every `test.skip` has an inline comment explaining the reason (e.g., `// SKIP: blocked on ADR-023 refactor`, `// SKIP: not yet implemented`, `// SKIP: requires Obsidian env`)
- [ ] Any skipped test that is actually dead (will never be unskipped) is deleted instead

## Likely Touchpoints
- `tests/api.test.ts`
- `tests/scheduling.test.ts`
- `tests/book.test.ts`
- `tests/navigation_scrolling.test.tsx`
- `tests/lang/helpers.test.ts`
