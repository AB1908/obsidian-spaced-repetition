# SPIKE-010: Codex-Delegated Parallel Scoping

## Status
Backlog

## Description
Current workflow bottleneck: ideas arrive faster than they can be scoped and implemented sequentially. When a new idea surfaces mid-session, the pattern is to file a story and move on — but scoping itself is work that could be parallelized.

### Proposed Pattern
1. Human shares idea in Claude Code session
2. Claude Code creates a git worktree with relevant context (story file, related docs, code pointers)
3. Claude Code delegates scoping to a Codex session on that worktree
4. Codex session autonomously: explores codebase, writes story/plan, identifies files, estimates scope
5. Human reviews scoped output asynchronously
6. Implementation can start immediately (same or different session)

### Benefits
- Shifts bottleneck to human review (desirable)
- Multiple ideas can be scoped in parallel
- Main session stays focused on current implementation
- Codex gets full repo context via worktree

### Open Questions
- Codex session lifecycle: how to pass context (story file path? custom system prompt?)
- Worktree management: naming, cleanup, branch strategy
- Quality gate: how to validate Codex scoping output before acting on it
- Cost model: each Codex session has token cost

### Time Box
2 hours exploration + prototype

## Impact
High — workflow multiplier if it works.

## Related
- Current workflow: `docs/guides/work-organization.md`
- Execution contract: `docs/guides/execution-contract-manual-v0.md`
