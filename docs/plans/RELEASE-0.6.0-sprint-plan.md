# Plan: 0.6.0 Sprint (Usable Processing + Strategy Corrections)

**Target release:** `0.6.0`  
**Date:** 2026-02-17  
**Branch context:** `chore/polish-usable-version-2026-02-17`

## Goals
- Stabilize source-model behavior where user-facing regressions were observed.
- Reduce human verification bottlenecks by improving module boundaries and contracts.
- Tighten annotation processing UX for day-to-day usability (after correctness + verifiability).
- Add deterministic review gates to reduce repeat regression classes.

## What We Observed
1. Source naming policy regressed for MoonReader-like notes after basename standardization.
2. Markdown navigation strategy currently returns all headings; desired behavior is H1-first strategy.
3. Import annotation editor can retain stale textbox/category state when navigating annotations.
4. Processing UX is fragmented (toggle-heavy) and slows throughput.
5. Snapshot and fixture coverage did not include key path variants, so regressions were not caught.

## Existing Stories Reused
- [BUG-007](../stories/BUG-007-section-list-flattens-heading-levels.md) (heading selection strategy)
- [BUG-006](../stories/BUG-006-source-chooser-label-uses-folder-name.md) (context for name policy drift)
- [BUG-001](../stories/BUG-001-navigation-ignores-filters.md) (navigation/filter contract history)
- [STORY-013](../stories/STORY-013-markdown-deck-creation-source-chooser.md) (source chooser flow baseline)

## New Stories Added for 0.6.0
- [BUG-008](../stories/BUG-008-source-name-strategy-regression.md)
- [BUG-009](../stories/BUG-009-import-annotation-editor-state-leak.md)
- [STORY-015](../stories/STORY-015-annotation-processing-workspace-ux.md)
- [STORY-016](../stories/STORY-016-customizable-annotation-categories.md)
- [DEBT-021](../stories/DEBT-021-deterministic-snapshot-and-review-gates.md)
- [DEBT-022](../stories/DEBT-022-api-module-decomposition-for-verifiability.md)
- [DEBT-023](../stories/DEBT-023-storage-port-and-obsidian-adapter-boundary.md)
- [DEBT-024](../stories/DEBT-024-filter-policy-single-source-of-truth.md)
- [DEBT-025](../stories/DEBT-025-periodic-session-capture-hooks.md)

## Proposed Execution Order

## Phase 1: Correctness First
1. BUG-008 source naming strategy fix + tests.
2. BUG-007 heading strategy enforcement (H1-first, fallback H2) + tests.
3. BUG-009 editor state reset on annotation navigation + tests.

## Phase 2: Verifiability Through Refactor Seams
1. DEBT-022 split `api.ts` into reviewable modules (structure-only first).
2. DEBT-024 unify filter policy module used by list + navigation.
3. DEBT-023 define storage-port boundary plan and no-new-direct-disk-calls rule for API layer.

## Phase 3: Usability Improvements
1. STORY-015 consolidated annotation processing workspace (trim primary toggle noise).
2. STORY-016 configurable categories/icons (minimal settings-driven v1).

## Phase 4: Workflow Hardening
1. DEBT-021 fixture matrix + review checklist.
2. Add release gate section for snapshot-contract review before merge to main.
3. DEBT-025 periodic session-capture cadence to preserve decision trace.

## Review Gates (Per PR)
1. `npm test`
2. `OBSIDIAN_PLUGIN_DIR=. npm run build`
3. Targeted contract checks:
   - source labels (MoonReader vs direct markdown)
   - chapter list strategy for mixed headings
   - import editor state reset across next/previous navigation
4. Snapshot review checklist:
   - Identify which snapshots changed and why
   - Confirm changed snapshots map to intended behavior change
   - Confirm unaffected source strategy snapshots remain stable

## Open Decisions Needed
1. Source naming policy precedence for MoonReader:
   - frontmatter `title`
   - parent folder name
   - filename fallback
2. Markdown chapter strategy exact contract:
   - strict H1 only
   - H1 with H2 fallback when no H1
3. Processing UX scope for 0.6.0:
   - remove processed/unprocessed buttons entirely
   - keep as secondary controls under advanced/filter panel
4. Refactor depth for 0.6.0:
   - minimal seam extraction only (verification speed)
   - deeper architectural migration (higher risk)

## Risks
- UX changes may broaden scope if design details are not constrained.
- Category configurability can sprawl into settings UX work; keep v1 narrow.
- Missing fixture realism can repeat regressions if DEBT-021 is deferred.

## Definition of Done for 0.6.0
- BUG-008, BUG-007, BUG-009 merged and verified in plugin smoke flow.
- Processing workflow is measurably simpler for import path.
- Snapshot/fixture gates exist and are part of merge checklist.
