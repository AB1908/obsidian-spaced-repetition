# DEBT-030: Complete Markdown Source Migration Off `AnnotationsNote` Coupling

## Status
Done

## Epic
[STORY-010](STORY-010-markdown-engagement.md)

## Depends on
- [DEBT-013](DEBT-013-source-polymorphism.md)
- [DEBT-011](DEBT-011-book-metaphor-clippings.md)
- [DEBT-024](DEBT-024-filter-policy-single-source-of-truth.md)

## Problem
Current source behavior is still split across `AnnotationsNote`, route/UI assumptions, and source-type checks. As new UX requirements appear (for example BUG-012 source-specific filtering), implementation friction increases because markdown and MoonReader flows are not cleanly isolated by a stable source-model contract.

DEBT-013 established architecture direction and partial seam repair, but a full migration backlog item is still needed to finish the transition and reduce recurring coupling cost.

## Acceptance Criteria
- [x] Define target end-state contract for source-specific list/filter/navigation behavior.
- [x] Remove remaining book-metaphor coupling points that leak into markdown behavior.
- [x] Ensure UI/API consume source capabilities through a stable contract instead of scattered conditionals.
- [x] Provide migration path notes for existing vault data and existing tests/fixtures.
- [x] Deliver a phased execution plan with explicit rollback points.

## Likely Touchpoints
- `src/data/models/AnnotationsNote.ts`
- `src/data/models/ISourceStrategy.ts`
- `src/data/models/strategies/*`
- `src/api.ts`
- `src/ui/routes/books/book/annotation/*`
- `tests/*` (source-type behavioral contracts)

## Related
- [DEBT-013](DEBT-013-source-polymorphism.md)
- [DEBT-014](DEBT-014-source-listing-dto-typing.md)
- [DEBT-023](DEBT-023-storage-port-and-obsidian-adapter-boundary.md)
- [BUG-012](BUG-012-card-creation-category-filter-regression.md)

## Plan
- [DEBT-030 Migration Plan](../plans/DEBT-030-markdown-migration-plan.md)
- [DEBT-030 Test Contract](../plans/DEBT-030-test-contract.md)
- [DEBT-030 Migration Notes](../plans/DEBT-030-migration-notes.md)

## Session Notes
- 2026-02-18: Implemented source capability seam in model/API and moved annotation list route/component to source-driven view policy. Remaining phases: filter-policy convergence and migration closeout.
- 2026-02-18: Completed filter-policy convergence and migration closeout documentation; story marked done.
