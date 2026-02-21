# Test Contract: DEBT-019 Wave Runner (Level 2 Shell)

**Story:** `docs/stories/DEBT-019-wave-runner-automation.md`  
**Style:** Spec-first

## Scope
Upgrade `scripts/wave-runner.sh` from checklist helper to a Level-2 orchestrator that:
1. Parses wave/track/branch/scope entries from plan files.
2. Creates per-branch worktrees.
3. Prints per-track agent prompts.
4. Supports merge mode with explicit human approval gates.
5. Runs gate checks automatically after each approved merge.

## Behaviors to Protect
- No destructive git actions without explicit user confirmation.
- Dry-run mode prints actions without side effects.
- Existing plan-table format remains the source of truth for branches.

## Files Expected
- `scripts/wave-runner.sh`
- `docs/guides/work-organization.md` or dedicated wave-runner guide section
- `docs/stories/DEBT-019-wave-runner-automation.md` status/acceptance updates

## Verification Plan
1. Parse/list smoke test (dry-run) on `docs/plans/DEBT-011-source-model-seam-repair.md`.
2. Worktree creation dry-run (no filesystem writes) confirms expected commands.
3. Merge mode dry-run confirms approval gates + per-merge gate-check commands.
4. `npm test -- --runInBand`.

## Drift Policy
Pause if implementation needs:
- non-shell dependencies,
- background agent launching/monitoring,
- automatic rebases or destructive cleanup actions.
