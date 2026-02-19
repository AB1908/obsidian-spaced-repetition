# Test Contract: DEBT-021 Explicit Contract Snapshots

**Story:** `docs/stories/DEBT-021-deterministic-snapshot-and-review-gates.md`  
**Status:** Draft for implementation gate  
**Style:** TDD-first (spec before test/code)

## Scope
Close the remaining DEBT-021 acceptance criterion:
- Add explicit snapshot assertions for source labels and navigable section strategy.

This task is test-contract hardening only. No intended behavior change.

## Behaviors to Protect
1. Source labels shown by API outputs remain deterministic and source-type aware.
2. Source listing contract remains stable for direct-markdown/clippings (`sourceType`, `requiresSourceMutationConfirmation`, label).
3. Navigable sections contract remains stable for chapter listing (`getBookChapters` shape and expected headings from fixtures).

## Tests to Add/Update
1. `tests/api.test.ts`
- Add an explicit "DEBT-021 contract snapshot" test for source labels via `getSourcesAvailableForDeckCreation()`.
- Add an explicit "DEBT-021 contract snapshot" test for navigable section strategy via `getBookChapters(bookId)`.

2. `tests/api.clippings.test.ts`
- Add an explicit "DEBT-021 contract snapshot" test for clipping/direct-markdown label + mutation-confirmation contract.

## Fixture Strategy
- Reuse existing fixtures only.
- No new fixtures unless contract coverage is impossible with current fixture set.

## Pass/Fail Gates
1. Targeted:
- `npm test -- --runInBand tests/api.test.ts tests/api.clippings.test.ts`
2. Full suite:
- `npm test -- --runInBand`
3. Build:
- `OBSIDIAN_PLUGIN_DIR=. npm run build`

## Snapshot Review Rules
- Each new snapshot must be tied to one named contract above.
- If unrelated snapshots change, stop and investigate before commit.

## Planned Commit Sequence
1. `docs(test-plan): add DEBT-021 explicit snapshot contract`
2. `test(contract): add explicit source-label and section-strategy snapshots`

## Drift Policy
Pause for re-approval if:
- production code changes become necessary,
- new fixtures are required,
- snapshot updates exceed planned contract surfaces.
