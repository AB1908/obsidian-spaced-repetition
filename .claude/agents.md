# Agent Workflow Guide

Conventions for how AI agents (Claude Code and Codex) operate in this project.
Referenced from CLAUDE.md.

---

## Role Split

| Agent | Owns |
|-------|------|
| **Claude Code** | Docs, plans, stories, git operations, script changes, delegation orchestration, review/approval |
| **Codex** | `src/`, `tests/`, running the test suite, build verification |

The rule of thumb: if it touches source code or tests, it goes through Codex delegation.
If it's planning, documentation, or git operations, Claude Code handles it directly.

---

## Delegation Decision Framework

Use this to decide whether to handle a task inline (Claude Code) or delegate to Codex.

| Signal | Inline | Delegate |
|--------|--------|----------|
| All changes in `docs/`, `scripts/`, git ops | ✅ Always | — |
| 1–2 src/test files, change is obvious | ✅ | — |
| 3+ src/test files | — | ✅ |
| Test suite must run to verify | — | ✅ |
| Snapshots likely affected | — | ✅ (Codex handles churn) |
| Commits needed: 1–2 | ✅ | Either |
| Commits needed: 3+ | — | ✅ |
| Implementation choice is unresolved | ❌ Never delegate — decide first | — |

**Token break-even:** Delegation overhead (prompt, worktree setup, log review) costs roughly
the equivalent of ~10–15 targeted file edits inline. If the task is smaller than that,
inline is cheaper. If it's larger, delegation wins on both tokens and human attention.

**Time note:** Delegation is slower wall-clock for small tasks but can run in background
while planning continues — factor this in when tasks are independent.

---

## Plan Quality Standard

Every plan file delegated to Codex must include a **Design Decisions** section.

### What goes in Design Decisions

For every non-trivial implementation choice in the plan:
- Options considered (even if only 2–3)
- Key tradeoffs
- Chosen approach and why
- Any deferred alternatives worth noting for future reference

### Decision Points Pass

After writing a plan, sweep it asking: *"Where would a competent engineer pause and
consider options?"* Each pause point is a decision that must be resolved in the plan
before delegation. Common examples:

- State management approach (useEffect vs key vs derived state)
- Where to put a new abstraction (new file vs extend existing)
- Error handling policy (throw vs return null vs Result type)
- Test strategy (unit vs integration vs both)
- Backward compatibility approach

If a decision is left open, Codex will pick the first reasonable path. That choice
becomes load-bearing. Resolve it in the plan first.

### Plan file template (minimum)

```markdown
# Plan: <title>

## Goal
One paragraph.

## Design Decisions

### <Decision 1 name>
Options considered:
- Option A: ...pros/cons
- Option B: ...pros/cons

Chosen: Option B because ...

### <Decision 2 name>
...

## Implementation
...

## Commit sequence
...

## Verification gates
...
```

---

## Pre-Delegation Checklist

Before running `scripts/delegate-codex-task.sh`:

- [ ] All plan and story files are committed (script now enforces this automatically)
- [ ] `scripts/story-catalog.sh check` passes
- [ ] Scope file exists and is complete
- [ ] Test contract exists with concrete test names
- [ ] All Design Decisions are resolved — no open "TBD" or "either approach works"
- [ ] Commit sequence in plan is realistic (each commit must be independently green)
- [ ] Verification gates listed in plan and contract match

---

## Reviewing Codex Output

After a delegation completes:

1. Read the semantic log first (`docs/executions/semantic/`), not the raw log
2. Check for reported deviations — these signal either scope drift or a real problem
3. Run `scripts/verify-test-contract.sh` locally if the contract check failed due to tooling
4. Review snapshot diffs explicitly before approving merge
5. For cherry-picks: confirm the commit message follows the project convention before landing

---

## Optimization Tips

- **Batch doc changes before delegating** — uncommitted plans are the most common
  reason a delegation produces incorrect output
- **Background delegation** — use `run_in_background: true` when the Codex task is
  independent of the planning work happening in the main session
- **Phase sequencing** — if a story has phases where phase B depends on phase A,
  delegate phase A, review, merge, then delegate phase B. Don't delegate both at once
  unless using worktrees with explicit sequencing (wave-runner)
- **Dry-run first** — use `--dry-run` on the delegation script to verify the generated
  prompt before spending tokens on execution
