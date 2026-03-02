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

## Delegation
```bash
scripts/delegate-codex-task.sh \
  --branch <branch-name> \
  --base main \
  --scope-file docs/plans/<this-file>.md \
  --test-contract docs/plans/<this-file>-test-contract.md \
  --log-file docs/executions/logs/<branch-name>.log \
  --semantic-log docs/executions/semantic/<branch-name>.md \
  --quiet \
  --execute
```

`--quiet` suppresses per-turn Codex transcript (reduces context cost ~80%); prints only the
final summary block + contract result + semantic log path after the run completes.
Requires `--log-file`. Omit `--quiet` only when debugging a delegation failure.

---

## Pre-Delegation Checklist

Before running `scripts/delegate-codex-task.sh`:

- [ ] All plan and story files are committed (script now enforces this automatically)
- [ ] Scope file has `## Reviewed: Approved` — do not delegate a `Draft` plan
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
5. Cherry-pick the feat commit(s), then **amend** to include:
   - Story closure files (status → Done, acceptance criteria checked)
   - Semantic log file
   - A one-line body note: `Closes: STORY-NNN. Semantic log: docs/executions/semantic/<slug>.md`
   This keeps history to 2 commits per story (plan + feat+closure) rather than 3.

---

## Optimization Tips

- **Session start** — use `./scripts/project-status.sh --brief` for a minimal
  orientation (~8 lines). Add `--release` for release plan items.
- **Batch doc changes before delegating** — uncommitted plans are the most common
  reason a delegation produces incorrect output
- **Background delegation** — use `run_in_background: true` when the Codex task is
  independent of the planning work happening in the main session. **Never add `&` to
  the command** — the Bash tool already backgrounds it. Adding `&` double-backgrounds
  the process, drops the post-run steps (contract check, semantic log), and the task
  reports exit 0 from the wrong process.
- **Phase sequencing** — if a story has phases where phase B depends on phase A,
  delegate phase A, review, merge, then delegate phase B. Don't delegate both at once
  unless using worktrees with explicit sequencing (wave-runner)
- **Dry-run first** — use `--dry-run` on the delegation script to verify the generated
  prompt before spending tokens on execution

---

## Operation Tiers

Classify work by token cost before scheduling. Mixing tiers in the same session
wastes context and blocks cheap work behind expensive work.

**Tier 1 — cheap (background-safe, low token):**
file reads, search, grep, doc/story updates, story catalog checks, project-status,
commit/archive steps, guide updates

**Tier 2 — moderate (foreground, bounded):**
single-file code edits, targeted test runs (`npm test -- --testPathPattern`),
contract verification, semantic log writes, worktree inspection

**Tier 3 — expensive (foreground, high token, block other work):**
Codex delegation, full test suite (`npm test`), large codebase scans,
multi-file refactors, build verification

**Scheduling rules:**
- Tier 1 work can run in background or be batched freely
- Tier 3 work should run alone — don't start a second delegation while one is active
- Background delegation (`run_in_background: true`) is fine only when the main
  session work is Tier 1 (doc updates, story management) — not while doing other
  Tier 3 work in the foreground
- At session start: do all Tier 1 orientation (project-status, story reads) before
  committing to any Tier 3 delegation
