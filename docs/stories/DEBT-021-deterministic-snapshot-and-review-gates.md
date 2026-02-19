# DEBT-021: Deterministic Snapshot and Review Gates

## Status
Backlog

## Epic
None

## User Story
As a maintainer, I want deterministic review gates around snapshots and behavior contracts, so regressions are caught before merge during rapid prototype shipping.

## Problem
Recent regressions slipped through because test/snapshot coverage did not include representative fixtures (for example MoonReader `Annotations.md` naming case), and review steps did not require targeted snapshot inspection.

## Acceptance Criteria
- [x] Define required test/snapshot review checklist for PRs touching source strategy, naming, or navigation.
- [x] Add fixture matrix covering source-type-specific edge cases.
- [ ] Add explicit snapshot assertions for source labels and navigable section strategy.
- [x] Document gate sequence in a maintainer-facing checklist.

## Likely Touchpoints
- `tests/api.test.ts`
- `tests/api.clippings.test.ts`
- `tests/routes/import/PersonalNotePage.test.tsx`
- `tests/fixtures/*`
- `docs/guides/*` (workflow/checklist location)

## Notes
- Goal is signal quality, not snapshot volume. Prefer focused contract snapshots over broad opaque snapshots.

## Contract Reference
- `docs/guides/testing-contract-0.6.0.md`
