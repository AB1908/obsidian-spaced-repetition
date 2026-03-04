# META-026: Claude Code Plugin Exploration

## Status
Proposed

## Epic
None

## Description

The Claude Code plugin ecosystem is unexplored. Plugins can add tools, hooks, and
capabilities beyond the built-in set. This spike evaluates what's available and
identifies anything worth enabling for this project's workflow.

### Scope

- Audit official marketplace and notable community plugins
- Evaluate fit for: TypeScript/React dev, git-heavy workflow, Codex delegation, mobile usage
- Focus areas: session management, git workflow, code quality, GitHub integration
- Decide which (if any) to enable and document why

### Known gaps that plugins might address

- No automatic session index updates when sessions end
- No dangling link detection in story files
- No GitHub issue/PR integration in Claude Code sessions
- No structured code quality gate beyond running `npm run lint` manually

## Research Findings (2026-03-03)

| Plugin | Verdict | Reason |
|--------|---------|--------|
| `typescript-lsp` | **Install** | Real-time type errors without running tsc — high value for TS/React |
| `github` | **Install** | MCP-based GitHub API — useful for story/PR workflow |
| `commit-commands` | **Trial** | Overlaps with `.commit-approval` hook — test for conflict |
| `hookify` | **Trial** | Interactive hook creation — relevant given active hook work |
| `feature-dev` | **Skip** | Conflicts with Codex delegation philosophy |
| `code-review` | **Defer** | No review bottleneck currently |
| Context7 (community) | **Install** | Live React 19/TS 5.x docs injected into sessions |

Community resources worth bookmarking:
- https://github.com/hesreallyhim/awesome-claude-code
- https://github.com/ChrisWiles/claude-code-showcase (full working config example)

## Acceptance Criteria

- [ ] `typescript-lsp` installed and confirmed working (requires `typescript-language-server` globally)
- [ ] `github` MCP plugin installed and authenticated
- [ ] `commit-commands` trialled — decision: replace or coexist with `.commit-approval` hook
- [ ] Context7 community plugin evaluated
- [ ] Any enabled plugins added to `.claude/settings.json` at project scope

## Likely Touchpoints

- `~/.claude/settings.json` — `enabledPlugins`
- `.claude/settings.json` — project-level plugin config

## Related

- META-027 — custom subagents (overlapping capability space)
