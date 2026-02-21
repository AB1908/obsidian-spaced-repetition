# DEBT-024: Filter Policy Single Source of Truth (UI + Navigation)

## Status
Ready

## Epic
None

## Description
Filter semantics are duplicated:
- UI list filtering uses `src/utils/annotation-filters.ts`
- navigation filtering uses `matchesNavigationFilter` in `src/api.ts`

Duplicated policy invites drift and makes verification harder. This already caused historical navigation/filter mismatches.

## Acceptance Criteria
- [ ] Define one shared filter policy module and type contract.
- [ ] UI list filtering and next/previous navigation both consume the same policy.
- [ ] Remove duplicate filter logic from `api.ts`.
- [ ] Add integration tests asserting UI-visible list and navigation use identical inclusion rules.

## Likely Touchpoints
- `src/utils/annotation-filters.ts`
- `src/api.ts` (or `src/api/navigation.ts` after split)
- `src/ui/components/annotation-display-list.tsx`
- `tests/api.test.ts`
- `tests/routes_books_api.test.ts`

## Related
- [BUG-001](../archive/stories/BUG-001-navigation-ignores-filters.md)
- ADR: [ADR-019](../decisions/ADR-019-navigation-filter-contract.md)
