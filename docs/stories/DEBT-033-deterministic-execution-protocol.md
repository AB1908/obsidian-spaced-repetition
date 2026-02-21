# DEBT-033: Deterministic Execution Protocol

## Status
Ready

## Epic
None

## Depends on
- [DEBT-032](DEBT-032-task-organization-model-to-reduce-planning-duplication.md) (planning model)

## Description
Formalize the end-to-end development workflow into a deterministic, repeatable protocol that a Claude session can follow autonomously. The target is a single reference document (a "runbook") that governs every implementation session, with progressive enforcement via hooks and scripts.

### Target Flow
```
1. Plan          — read story, read/create plan, identify phases
2. Test          — write/update test contracts for the phase
3. Commit Plan   — create execution file with planned commit topology
4. Worktree      — checkout worktree via wave-runner or delegate script
5. Implement     — execute phase, commit per plan, mid-run drift check
6. History Check — if >6 commits, curate history (rebase/squash/fixup)
7. Merge         — safe-merge.sh with all gates passing
8. Session Log   — write session notes capturing decisions and drift
9. Plan Checkoff — update story status, check off plan acceptance criteria
10. Cleanup      — remove worktree, verify main is clean
11. Drift Review — compare planned vs actual topology, note lessons
```

### What Exists Today
| Step | Doc/Tool | Enforcement |
|------|----------|-------------|
| Plan | stories + `docs/plans/` | Manual |
| Test | test contract docs | `npm test` baseline |
| Commit Plan | execution files | Manual |
| Worktree | `wave-runner.sh`, `delegate-codex-task.sh` | Ad-hoc bypass possible |
| Implement | execution contracts manual | Manual gates |
| History Check | `require-history-curation.sh` | Optional via `safe-merge.sh` |
| Merge | `safe-merge.sh` | Manual invocation |
| Session Log | session files, `session-checkpoint.sh` | Opt-in |
| Plan Checkoff | story status field | Manual |
| Cleanup | n/a | Manual |
| Drift Review | execution file "Drift Notes" section | Manual |

### What's Missing
1. **Single runbook** — no unified reference doc tying all steps together
2. **Pre-merge enforcement** — session notes + story status not gated
3. **Mid-execution drift detection** — no automated plan-vs-actual comparison
4. **Worktree guardrail** — ad-hoc `git worktree add` bypasses scripts
5. **Autonomous handoff format** — no standard prompt template that gives a Claude session everything it needs to execute a phase independently
6. **Reasoning artifact capture** — raw Codex logs capture visible output/tool actions but not private chain-of-thought; no standard requirement exists for explicit decision logs, assumptions, and rejected alternatives in execution artifacts
7. **Stale base branch** — `delegate-codex-task.sh` defaults `--base main` which uses local main (may be behind `origin/main`). Should fetch and verify freshness before creating worktree.

## Acceptance Criteria

### Wave 1: Runbook + prompt template (documentation only)
- [ ] `docs/guides/execution-runbook.md` exists with the 11-step protocol
- [ ] Each step has: entry conditions, actions, exit conditions, tool references
- [ ] Autonomous prompt template exists (given story + plan + phase → Claude can execute)
- [ ] Template tested on one real implementation (e.g., DEBT-031 Phase 1)

### Wave 2: Hook enforcement (lightweight automation)
- [ ] Pre-merge hook validates: execution file exists (if >6 commits), session notes exist
- [ ] `safe-merge.sh` becomes the default merge path (documented, not bypassable for story branches)
- [ ] Worktree creation routed through scripts (document the convention, not a hard block)

### Wave 3: Drift detection (analysis tooling)
- [ ] Script compares planned commit topology (from execution file) with actual `git log`
- [ ] Outputs drift report: missing commits, extra commits, reordered commits
- [ ] Drift report appended to execution file automatically

### Wave 4: Autonomous execution (stretch)
- [ ] Claude session can execute a full phase given only: story ID + phase number
- [ ] Session reads plan, creates worktree, implements, commits, runs tests, writes session log
- [ ] Human reviews PR/merge only — no mid-execution intervention needed

### Wave 5: Traceability without CoT
- [ ] Delegation scripts support `--log-file` to persist full terminal transcript for each autonomous run
- [ ] Execution logs require explicit sections: `Decision Log`, `Assumptions`, `Alternatives Rejected`, `Evidence (tests/commands)`
- [ ] Runbook clarifies that private chain-of-thought is unavailable and defines audit-ready substitutes

## Likely Touchpoints
- `docs/guides/execution-runbook.md` (new)
- `docs/guides/execution-contract-manual-v0.md` (superseded or merged)
- `scripts/safe-merge.sh` (update)
- `scripts/require-history-curation.sh` (update)
- `scripts/drift-report.sh` (new)
- `.githooks/pre-merge-commit` (new or update)
- `CLAUDE.md` (update session start workflow section)

## Design Notes

### Incremental enforcement, not big bang
Each wave adds enforcement without breaking existing workflow. Wave 1 is pure documentation — anyone can follow it manually. Wave 2 adds soft gates. Wave 3 adds analysis. Wave 4 is the aspiration.

### The runbook is the single source of truth
Today the protocol is scattered across `workflow.md`, `work-organization.md`, `execution-contract-manual-v0.md`, and CLAUDE.md. The runbook consolidates into one actionable reference. Other docs become background/rationale.

### Autonomous prompt template pattern
```
You are executing Phase {N} of {STORY-ID}.

Story: {story file contents}
Plan: {plan file contents}
Phase scope: {specific phase section from plan}
Test contract: {test expectations}

Execute the phase following docs/guides/execution-runbook.md.
Write commits per the planned topology.
At completion, write session notes and update story status.
```

This is what `delegate-codex-task.sh` evolves toward — structured enough that the executing agent doesn't need to make architectural decisions, only implementation ones.

## Related
- [DEBT-032](DEBT-032-task-organization-model-to-reduce-planning-duplication.md)
- [DEBT-028](../archive/stories/DEBT-028-enforce-session-and-divergence-checks.md)
- [DEBT-031](DEBT-031-deterministic-modularization-and-domain-model-evolution.md) — first candidate for autonomous execution
- Session: [2026-02-18 Domain Model Architecture Refinement](../sessions/2026-02-18-domain-model-architecture-refinement.md)
