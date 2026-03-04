# META-027: Custom Subagents Design

## Status
Proposed

## Epic
None

## Description

Claude Code supports custom subagents defined in `.claude/agents/` with frontmatter
specifying tools, model, permissions, and skills. This story designs and implements
subagents that encode this project's workflow conventions so they don't need to be
re-established each session.

### Proposed subagents

**`story-reviewer`**
Validates story files before committing: correct format, no dangling links, concrete
acceptance criteria, consistent ID numbering. Invoked before `git commit` on story files.
- Tools: Read, Glob, Grep (read-only)
- Model: haiku (cheap, mechanical checks)
- Skills: story-format

**`delegation-prep`**
Runs the pre-delegation checklist against a plan file: Design Decisions resolved,
test contract exists, scope file approved, no uncommitted doc changes.
Invoked before `delegate-codex-task.sh`.
- Tools: Read, Glob, Bash (read-only git commands)
- Model: sonnet
- Skills: delegation-checklist

**`session-orienteer`**
Runs `project-status.sh --brief`, reads scratch.md, reads sessions-index.md, and
proposes a work order for the session. Replaces manual session-start ritual.
- Tools: Bash, Read
- Model: haiku
- Trigger: SessionStart hook or manual invocation

**`closure-assistant`**
After Codex delegation returns: cherry-pick commits, update story status, move to
archive, commit semantic log. Encodes the close-out workflow from META-025.
- Tools: Bash, Read, Edit, Write
- Model: sonnet
- Skills: commit-conventions

### Skills to extract

- `commit-conventions` — from CLAUDE.md commit section
- `story-format` — prefix rules, status values, acceptance criteria standards
- `delegation-checklist` — pre-delegation checklist from agents.md

## Acceptance Criteria

- [ ] At least one subagent implemented and tested in a real session
- [ ] Skills directory created at `.claude/skills/` with at least `commit-conventions`
- [ ] `session-orienteer` replaces manual project-status at session start
- [ ] `story-reviewer` catches a real formatting issue before it hits git

## Likely Touchpoints

- `.claude/agents/` — subagent definition files
- `.claude/skills/` — reusable prompt snippets
- `~/.claude/settings.json` — SessionStart hook for session-orienteer

## Related

- META-026 — plugin exploration (overlapping capability space)
- META-025 — session management tooling
