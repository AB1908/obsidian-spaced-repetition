# DEBT-036: Complexity and readability audit with branch-state reconciliation

## Status
Ready

## Epic
None

## User Story
As a maintainer, I want to reduce architectural complexity and naming drift while reconciling branch/main state deterministically, so that implementation intent and runtime behavior stay aligned.

## Acceptance Criteria
- [ ] Branch-state reconciliation is completed and verified (planned commit state matches effective `main` runtime state for current refactor slices).
- [ ] Review flow ownership is finalized: review session state machine and persistence boundaries are explicit and test-covered.
- [ ] `AnnotationsNote` responsibilities are reduced by extracting at least one mixed concern into a focused module.
- [ ] `settings.ts` is split into focused units (schema/defaults/UI construction), preserving behavior and tests.
- [ ] Naming drift at the API boundary is reduced (legacy aliases documented, canonical names clear).
- [ ] Dead/placeholder abstractions are either removed or explicitly marked as deprecated with migration notes.
- [ ] A lightweight complexity report format is added to execution semantic logs (size/churn hotspots + unresolved risk markers).

## Context
Audit snapshot identified the following risks:

1. **Critical:** branch/history drift between planned and effective runtime state.
- Refactor commits existed in worktree history but `main` runtime still reflected legacy review API/model ownership.
- Risk: decisions appear completed in commit narratives but not in effective code paths.

2. **High:** `AnnotationsNote` remains a mixed-concern aggregate (identity, querying, review lifecycle, persistence orchestration, flashcard mutations).
- Risk: high cognitive load and regression risk during incremental refactors.

3. **High:** naming drift persists at API boundaries (`book` and `source` terms intermixed).
- Risk: domain model ambiguity and accidental coupling.

4. **Medium:** `settings.ts` is oversized and mixes schema/defaults/UI rendering concerns.
- Risk: low readability, high edit friction, higher chance of UI/config regression.

5. **Medium:** dead or half-migrated abstractions remain (for example `Source` stub).
- Risk: unclear canonical abstractions and onboarding confusion.

## Deterministic Follow-up Slices

### Slice A: Branch-State Reconciliation
- Reconcile worktree outputs and `main` actual runtime code.
- Record expected vs actual topology in an execution log.
- Require explicit approval before any history rewrite/curation operation.

### Slice B: Review Responsibility Boundary
- Finalize pure review session ownership and application-layer persistence ownership.
- Add/maintain explicit contract tests for lifecycle + scheduling intent.

### Slice C: Settings Decomposition
- Split settings schema/defaults/UI into focused modules without behavior change.
- Keep compatibility surface stable for plugin loading and tests.

### Slice D: API Naming and Dead Abstraction Cleanup
- Mark canonical API/domain names.
- Deprecate or remove non-canonical stubs and aliases deliberately.

## Related
- `docs/stories/DEBT-031-deterministic-modularization-and-domain-model-evolution.md`
- `docs/stories/DEBT-033-deterministic-execution-protocol.md`
- `docs/stories/DEBT-035-evaluate-oob-workflow-orchestration-primitives.md`
- `docs/guides/workflow.md`
- `docs/guides/work-organization.md`
