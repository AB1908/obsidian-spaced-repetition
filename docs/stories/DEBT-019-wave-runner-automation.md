# DEBT-019: Wave Runner — Parallel PR Automation

**Status:** Done
**Priority:** Low
**Depends on:** DEBT-018 (plan storage)

## Problem

Multi-PR execution plans (like DEBT-011's 4-PR seam repair) require manual orchestration:
- Create worktrees for each track
- Launch agents in each worktree
- Monitor completion
- Run gate checks (npm test) after each wave
- Merge, rebase remaining branches, repeat

This is tedious and error-prone. The parallelism analysis is already formalized in plan files (file-region conflict matrices, dependency graphs, wave schedules), but execution is manual.

## Proposed Solution

A CLI tool or Claude Code skill (`/wave-run`) that reads a plan file and orchestrates wave execution:

### Capabilities

1. **Parse plan** — extract PRs, branches, waves, dependencies, gate checks from plan file
2. **Create worktrees** — `git worktree add .worktrees/<branch> -b <branch> main`
3. **Launch agents** — spawn agent sessions using `claude --print` (headless invocation) or tmux panes for parallel execution
4. **Monitor** — poll for completion, stream status
5. **Gate check** — run `npm test` on main after each wave merge
6. **Rebase** — auto-rebase next wave branches onto updated main

### Levels of Automation

| Level | Scope | Effort |
|---|---|---|
| 1. Manual checklist | Print steps from plan, human executes | Trivial |
| 2. Shell script | `wave-run.sh` — creates worktrees, prints agent prompts, runs gates | Small |
| 3. Claude Code skill | `/wave-run <plan-file>` — full orchestration with approval gates | Medium |

## Acceptance Criteria

- [x] At minimum: shell script that creates worktrees from a plan file and prints per-track agent prompts
- [x] Gate checks run automatically after merge
- [x] Plan file format documented (what fields the tool expects)
- [x] Human approval gates before merges (reviewing diffs, handling surprises, approving wave transitions)

## Notes

- Start with Level 2 (shell script) — validate the workflow before investing in a skill (~15 min investment)
- Plan file format is already semi-structured (DEBT-011 plan has waves, branches, file lists)
- Agent prompt generation: extract PR scope + files + test criteria from plan
- Human-in-the-loop touchpoints:
  - Reviewing diffs before merge approval
  - Handling agent surprises or design mistakes mid-implementation
  - Approving wave transitions after gate checks pass
- Consider: should the tool also generate execution records after completion?
- Example invocation: `claude --print "Implement PR 1 from docs/plans/DEBT-011-source-model-seam-repair.md. Run npm test when done."`
