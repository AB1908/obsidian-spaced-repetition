# META-002: Deterministic Execution Protocol

## Status
Ready

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

## Acceptance Criteria

### Wave 1: Runbook + prompt template (documentation only)
- [ ] `docs/guides/execution-runbook.md` exists with the 11-step protocol
- [ ] Each step has: entry conditions, actions, exit conditions, tool references
- [ ] Autonomous prompt template exists (given story + plan + phase → Claude can execute)

### Wave 2: Hook enforcement
- [ ] Pre-merge hook validates: execution file exists (if >6 commits), session notes exist
- [ ] `safe-merge.sh` becomes the default merge path

### Wave 3: Drift detection
- [ ] Script compares planned commit topology with actual `git log`
- [ ] Drift report appended to execution file automatically

## Likely Touchpoints
- `docs/guides/execution-runbook.md` (new)
- `scripts/safe-merge.sh`
- `scripts/drift-report.sh` (new)
- `CLAUDE.md`

## Related
- [DEBT-032](DEBT-032-task-organization-model-to-reduce-planning-duplication.md)
- [META-003](META-003-delegated-test-contract-enforcement.md)
- [META-004](META-004-delegation-observability-and-guardrails.md)
