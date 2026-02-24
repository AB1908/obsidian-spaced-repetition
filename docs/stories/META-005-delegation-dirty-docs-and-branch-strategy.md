# META-005: Delegation Dirty-Docs Guardrail and Branch Strategy

## Status
Ready

## Description

Two related workflow gaps surfaced during STORY-027 delegation:

### 1. Dirty-docs check is too broad

The delegate script blocks if ANY file in `docs/plans/` is uncommitted, not just the
files for the story being delegated. This causes false positives: having a draft plan
for STORY-B on disk blocks delegation of STORY-A even though STORY-B's files are
irrelevant to that delegation.

**Proposed fix:** Scope the dirty-docs check to the specific `--scope-file` and
`--test-contract` arguments being passed. Other uncommitted docs/plans are not the
script's concern.

### 2. Planning docs accumulate as noise on main

Committing plan files to main (to satisfy the guardrail) adds commits that don't
represent code changes and pollute `git log`. The current workaround is squashing
plan commits into feat commits post-merge, but the plan commit still exists ephemerally
on main during the delegation window.

**Proposed fix (longer term):** Use story branches (`story-NNN`) for in-flight work.
Plan files are committed to the story branch. After delegation and review, the whole
branch is squashed into one commit on main. The dirty-docs check remains meaningful
(the story branch IS the context), and main only ever sees completed work.

These are separable:
- Fix 1 (scope check) is a small script change, immediate value.
- Fix 2 (story branches) is a larger workflow change requiring updates to the
  delegate script, agents.md, and session habits.

## Acceptance Criteria
- [ ] `delegate-codex-task.sh` dirty-docs check is scoped to `--scope-file` and
      `--test-contract` only, not all of `docs/plans/`
- [ ] Decision documented on story branch strategy (adopt or defer)
- [ ] If adopted: delegate script and agents.md updated to reflect branch-based flow

## Related
- [META-004](META-004-delegation-observability-and-guardrails.md)
- [META-003](META-003-delegated-test-contract-enforcement.md)
