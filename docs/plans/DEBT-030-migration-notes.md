# DEBT-030 Migration Notes

## Scope Completed
This migration introduced a source-capability seam and moved annotation-list behavior to capability-driven policy, then unified list and navigation filtering under one shared policy implementation.

## Existing Vault Data Impact
- No data-format migration required.
- Existing MoonReader and direct-markdown source notes continue to load through existing discovery and model initialization.
- Existing flashcard files and metadata remain compatible; no storage schema change was introduced.

## Behavior Changes
- Card-creation list behavior is now source-capability-driven instead of route-only assumptions.
- Filter inclusion logic is shared between list filtering and navigation filtering.

## Test/Fixture Compatibility
- Existing integration fixtures remain valid.
- Verified fixture-heavy suites remain green:
  - `tests/api.test.ts`
  - `tests/api.clippings.test.ts`
  - `tests/routes_books_api.test.ts`
- Added targeted capability/behavior parity assertions without introducing fixture bloat.

## Rollout and Fallback
- Rollout is incremental and backward-compatible.
- Fallback path: revert post-seam behavior commits while retaining capability contract scaffolding.
- Because data shape on disk is unchanged, rollback does not require vault-side recovery.

## Remaining Follow-ups
- UX expansion tracked separately:
  - `STORY-017` (visibility signals)
  - `IDEA-002` (jump-to-processing CTA)
