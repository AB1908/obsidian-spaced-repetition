# BUG-001: Navigation Ignores UI Filters

## Status
Done

## Epic
None

## User Story
As a user browsing filtered annotations, I want Previous/Next navigation to respect my active filter, so that I don't jump to annotations that should be hidden.

## Severity
High

## Root Cause
- UI filtering (`src/utils/annotation-filters.ts`): filters by `category !== null`
- Navigation logic (`src/api.ts:getNextAnnotationId`): only checks `deleted`, ignores `category`
- No shared contract between layers

## Reproduction
1. Open a book with mixed processed/unprocessed annotations
2. Apply "processed" filter
3. Navigate to last visible annotation
4. Click "Next" — expected: disabled. Actual: attempts navigation

## Acceptance Criteria
- [x] `getNextAnnotationId` / `getPreviousAnnotationId` accept optional `NavigationFilter`
- [x] Navigation respects filter when provided
- [x] Backward compatible (no filter = current behavior)
- [x] Integration tests in `api.test.ts`

## Related
- ADR: [ADR-019](../decisions/ADR-019-navigation-filter-contract.md)
- Context: `docs/archive/navigation-architecture-analysis.md`
- Tests: Reproduction tests already in `tests/api.test.ts` (currently failing)

## Session Notes
- 2026-02-15 (Agent B, `fix/navigation-filter-contract`): implemented CP-3 filter-aware navigation contract in API and route wrappers, wired UI filter context via session storage, and replaced BUG placeholders with passing assertions for processed/unprocessed/category/color navigation behavior.
