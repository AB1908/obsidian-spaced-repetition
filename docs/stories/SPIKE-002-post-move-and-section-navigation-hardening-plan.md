# SPIKE-002: Post-Move Reliability and Section Navigation Hardening

## Status
Ready

## Epic
[STORY-010](STORY-010-markdown-engagement.md)

## Depends on
- [SPIKE-001](SPIKE-001-annotation-flashcard-parallel-implementation-plan.md) - active parallel execution lanes already in progress

## Blocks
- [BUG-005](BUG-005-source-path-stale-after-file-move.md)
- [BUG-006](BUG-006-source-chooser-label-uses-folder-name.md)
- [BUG-007](BUG-007-section-list-flattens-heading-levels.md)

## User Story
As a user working with markdown/clippings sources, I want source selection and navigation to stay correct after file moves and to present meaningful sections, so that deck creation and card authoring remain reliable.

## Scope
Plan and sequence three follow-up issues found during manual validation:
1. stale source path crash after file/folder moves (BUG-005)
2. chooser label semantics (BUG-006)
3. heading-level selection policy (BUG-007)

## Execution Plan

### Phase 1: Reliability First (BUG-005)
- Add failing reproduction test for moved source path.
- Implement source-path refresh/re-resolution before metadata-dependent initialization.
- Confirm navigation/open flows are resilient to source moves.

### Phase 2: Source Chooser Label Correctness (BUG-006)
- Split display label from location context in source list API/UI contract.
- Keep path/folder as secondary text only.
- Add tests for nested vs root-level files.

### Phase 3: Section Strategy (BUG-007)
- For direct-markdown sources, use:
  - H1 list when present
  - else H2 list
  - else empty-state guidance
- Add behavior tests for mixed-heading fixtures.

## Ownership and Conflict Plan
- BUG-005 should run in same lane as clippings/navigation model fixes (Agent A lane) because it likely touches model/index refresh behavior.
- BUG-006 can run in UI/source-chooser lane once Agent A lane is stable (overlaps `book-list.tsx` area).
- BUG-007 should run after BUG-005 stabilizes, because both can touch section retrieval behavior in `src/api.ts`.

## Test Expectations
- `yarn test tests/api.test.ts`
- `yarn test tests/models/annotations.test.ts`
- `yarn test tests/deck-landing-page.test.tsx`
- plus targeted route tests if section rendering behavior changes.

## Exit Criteria
- [ ] Moved source files do not crash deck/source navigation.
- [ ] Source chooser primary label is filename/title, not folder surrogate.
- [ ] Section list follows a documented and test-covered heading-level policy.

## Related
- [BUG-005](BUG-005-source-path-stale-after-file-move.md)
- [BUG-006](BUG-006-source-chooser-label-uses-folder-name.md)
- [BUG-007](BUG-007-section-list-flattens-heading-levels.md)
- [DEBT-011](DEBT-011-book-metaphor-clippings.md)
