# META-030: Cross-Project Agent Orchestration Visibility

## Status
Proposed

## Reviewed
No

## Epic
None

## Description

When running agents across multiple projects simultaneously, there's no unified view of
what's in-flight, waiting for review, or blocked. The current state lives in the
operator's head. This becomes a bottleneck as parallelism increases.

### The gap

- `git worktree list` shows worktrees within a single project but not across projects
- No tool surfaces "Agent A is working on project X, Agent B finished on project Y and
  needs review, Agent C is blocked on project Z"
- Review queue depth is invisible until you manually check each project

### Research-first

This is almost certainly a partially-solved problem. Before building anything custom,
audit what exists:

- **Tmux / terminal multiplexer patterns** — session naming conventions, status bars
- **Claude Code native features** — `/tasks`, task tracking, session management
- **MCP servers** — any orchestration-focused MCP servers in the ecosystem
- **Third-party tools** — e.g. `git-worktree` dashboards, monorepo task runners
  (Turborepo, Nx, Bazel) with cross-project status views, GitHub Projects / Linear
  for cross-repo tracking
- **Simple conventions** — a shared `~/agent-queue.md` scratch file, tmux window
  naming, or a small shell script that polls worktree branches across repos

### Research Findings (2026-03-04)

| Tool/Approach | Verdict | Reason |
|---|---|---|
| **CCManager** (`github.com/kbwo/ccmanager`) | **EVALUATE FIRST** | Session manager for Claude Code, Gemini CLI, Codex, Cursor, Copilot. Cross-worktree, cross-project unified view. Directly solves the problem. |
| **Maestro-Gemini** (`github.com/josstei/maestro-gemini`) | **EVALUATE** | 12 specialized subagents, parallel dispatch using `gemini --approval-mode=yolo --output-format json`. Interesting orchestration layer on top of Gemini CLI. |
| Gemini CLI structured output | **ADOPT** | `gemini --approval-mode=yolo --output-format json` — scriptable, composable with existing `summarize-session.sh` usage. |
| VS Code Agent Sessions sidebar (v1.109+) | **ADOPT if using VS Code** | Native unified view of all running agents. Already shipped Jan 2026. |
| Claude Code `/tasks` + `CLAUDE_CODE_TASK_LIST_ID` | **ADOPT** | Built-in, persistent, scoped per project. No shell query API yet. |
| tmux `<repo>_<branch>` naming | **ADOPT** | Simple convention, makes active agents visible in `tmux ls` with no tooling. |
| `.agent-status/<task>.json` polling | **ADOPT** | Standard pattern. Agent writes status on exit; polling script reads across repos. |
| Lightweight `~/bin/agent-queue` script | **ADOPT if CCManager too heavy** | Fallback: ~50 lines bash, no deps. |
| Swarmify, Agentastic | **SKIP** | Commercial/macOS-specific. Overkill. |
| MCP orchestration servers | **SKIP** | Experimental, adds complexity. |
| Nx / Turborepo / Bazel | **SKIP** | Monorepo-only. |

### Key pattern (now standardized across tools)

Gemini CLI, Cursor, Claude Code subagents all use the same agent definition format:
YAML-frontmatter Markdown files in `.agents/` or `~/.gemini/agents/` or `.claude/agents/`.
This project already follows the pattern. Cross-tool compatibility is high.

### Likely outcome

1. Evaluate CCManager first — if it works, it's the unified view with no custom code
2. Adopt `<repo>_<branch>` tmux naming regardless (zero cost convention)
3. Add `.agent-status/` writes to `delegate-codex-task.sh` for polling fallback
4. Gemini CLI `--output-format json` worth exploring for scriptable orchestration on top of existing Gemini usage

## Acceptance Criteria

- [x] Research completed: existing tools surveyed, verdict per tool
- [ ] `~/bin/agent-queue` script written: polls worktrees + `.agent-status/` across projects, < 10 lines output
- [ ] `.agent-status/` write convention added to delegation script (`delegate-codex-task.sh`)
- [ ] tmux status bar shows agent count (calls `agent-queue --count`)
- [ ] Integrated into `claude-mobile.sh` session start view

## Likely Touchpoints

- `~/.claude/scripts/` — any new orchestration script lives here (global, not per-project)
- `~/.tmux.conf` — if tmux status bar is the chosen surface
- `claude-mobile.sh` — may want orchestration view on mobile session start

## Related

- [META-028](META-028-claude-home-dir-versioning.md) — ~/.claude versioning (scripts here need versioning too)
- [META-025](META-025-session-management-tooling.md) — session tooling (adjacent problem space)
