# DEBT-022: Decompose `api.ts` into Verifiable Modules

## Status
Ready

## Epic
None

## Description
`src/api.ts` has become a mixed orchestration surface (review flow, deck/source creation, import/export, navigation, filtering, and source mutation helpers). This increases human review cost and makes regression verification slower.

The primary goal is verification throughput: isolate concerns so diffs and tests are easy to reason about.

## Acceptance Criteria
- [ ] Split `api.ts` into focused modules with clear ownership (for example review/decks/import/navigation/source-listing).
- [ ] Keep a stable top-level API surface for routes/components during migration.
- [ ] Each module has targeted contract tests.
- [ ] No behavior change in migration phase (structure-only refactor first).

## Suggested Module Shape
- `src/api/review.ts`
- `src/api/sources.ts`
- `src/api/decks.ts`
- `src/api/imports.ts`
- `src/api/navigation.ts`
- `src/api/index.ts` (public exports)

## Likely Touchpoints
- `src/api.ts` (split source)
- imports in `src/ui/routes/**`, `src/ui/components/**`
- `tests/api.test.ts`
- `tests/api_orchestrator.test.ts`
- `tests/routes_books_api.test.ts`

## Related
- [DEBT-021](DEBT-021-deterministic-snapshot-and-review-gates.md)
- [DEBT-013](DEBT-013-source-polymorphism.md)
