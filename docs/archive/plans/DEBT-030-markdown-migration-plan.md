# Plan: DEBT-030 Complete Markdown Source Migration

**Story:** [DEBT-030](../stories/DEBT-030-complete-markdown-source-migration.md)
**Status:** Completed (2026-02-18)
**Primary branch (execution):** `refactor/source-capability-seams`

## Why Now
Recurring UI/API bugs (for example BUG-012) indicate source-type coupling is still active debt, not background debt. Paying this down now reduces repeated bug-fix overhead and avoids further route-level conditionals.

## Target End State
1. Source-specific behaviors (list mode, filtering affordances, navigation semantics, mutation requirements) are exposed via one source-capability contract.
2. UI routes consume source capabilities from one seam, not scattered source-type conditionals.
3. API orchestration delegates behavior to model/strategy capability seams.
4. Markdown behavior and MoonReader behavior can evolve independently without leaking assumptions.

## Non-Goals
- No full storage-port rewrite in this effort (DEBT-023 remains separate).
- No product redesign of processing CTA/workflow (IDEA-002 / STORY-015).
- No large route renaming cosmetic work.

## Proposed Capability Contract
Add explicit source capability object surfaced from model/API:
- `sourceType`: `moonreader | direct-markdown`
- `cardCreationMode`: `processed-category` or `all-no-processing`
- `showCategoryFilter`: boolean
- `showColorFilter`: boolean
- `supportsProcessingFlow`: boolean
- `requiresMutationConfirmation`: boolean

Contract can live in model layer and be mapped to UI DTO in API.

## Execution Path (Phased)

### Phase 0: Contract-first docs + test lock
Goal: lock desired behavior before refactor.

Commit unit:
1. `docs(contract): add DEBT-030 source capability contract [DEBT-030]`

### Phase 1: Capability seam introduction (no behavior change)
Goal: add seam with current behavior mapping.

Commit units:
1. `refactor(model): add source capability contract types [DEBT-030]`
2. `refactor(api): expose source capability in annotation list loader DTO [DEBT-030]`
3. `test(contract): lock current source capability mapping [DEBT-030]`

### Phase 2: Card-creation behavior split by source capability
Goal: eliminate route-only assumptions, use capability seam.

Commit units:
1. `test(route): lock MoonReader vs markdown card creation behavior [DEBT-030]`
2. `refactor(ui): drive annotation list controls from source capabilities [DEBT-030]`

### Phase 3: Filter-policy convergence with DEBT-024 seam
Goal: prevent future drift between list and navigation semantics.

Commit units:
1. `refactor(filter): centralize source-aware filter policy entrypoints [DEBT-030]`
2. `test(integration): assert list/navigation parity across source types [DEBT-030]`

### Phase 4: Debt closure and migration notes
Goal: document migration impact and close story.

Commit units:
1. `docs(migration): add DEBT-030 rollout and fallback notes [DEBT-030]`
2. `docs(story): mark DEBT-030 complete with phased evidence [DEBT-030]`

## General Execution Path Alternative
If commit-by-commit overhead is too high, run in two larger execution PRs:
1. PR-A: Phase 1 only (introduce seam, no behavior change)
2. PR-B: Phases 2-3 (behavior switch + policy convergence)
Then docs closeout commit.

## Rollback Strategy
- Keep Phase 1 backward-compatible; behavior switch occurs only in Phase 2.
- If Phase 2 regresses, revert Phase 2 commit(s) while retaining Phase 1 seam.
- Use existing integration tests + targeted route tests as gate criteria.

## Human Review Focus
- Is capability contract minimal but sufficient?
- Are markdown semantics preserved without MoonReader leakage?
- Are we adding one seam or multiple parallel conditionals?

## Execution Outcome
- Phase 0 completed: contract/test docs added.
- Phase 1 completed: source capability types and model/API seam introduced.
- Phase 2 completed: annotation list UI behavior driven by source capabilities.
- Phase 3 completed: list and navigation filtering now share one policy implementation.
- Phase 4 completed: migration notes captured and story closed.
