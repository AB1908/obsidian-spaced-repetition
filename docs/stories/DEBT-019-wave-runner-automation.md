# DEBT-019: Wave Runner — Parallel PR Automation

**Status:** Backlog
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
3. **Launch agents** — spawn agent sessions (Claude Code, Codex) per track with PR-scoped prompts
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

- [ ] At minimum: shell script that creates worktrees from a plan file and prints per-track agent prompts
- [ ] Gate checks run automatically after merge
- [ ] Plan file format documented (what fields the tool expects)

## Notes

- Start with Level 2 (shell script) — validate the workflow before investing in a skill
- Plan file format is already semi-structured (DEBT-011 plan has waves, branches, file lists)
- Agent prompt generation: extract PR scope + files + test criteria from plan
- Consider: should the tool also generate execution records after completion?
