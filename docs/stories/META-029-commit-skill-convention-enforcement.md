# META-029: /commit Skill for Convention Enforcement at Draft Time

## Status
Done

## Reviewed
No

## Epic
None

## Description

Context drift causes commit convention violations (e.g., short codes in subjects) because
rules live in MEMORY.md background context, which gets crowded out during long sessions.
The hook catches violations *after* the draft is shown to the user — too late to prevent
the review burden.

A `/commit` skill fixes this by loading commit rules as **primary context** on every
invocation, making drift structurally impossible within the skill's execution.

### Why not `commit-commands` plugin?

`commit-commands` is a message *generator* — it reads the diff and produces a suggestion.
It has no rule-enforcement capability and no knowledge of project-specific conventions
(no short codes, specific type taxonomy, `.commit-approval` workflow). Not the same
problem. The skill could optionally use `commit-commands` for generation, then add
project-specific validation on top.

### Skill behaviour

1. Read staged files and diff
2. Draft subject — rules are top of prompt, not background memory
3. Self-validate: subject contains no `[A-Z]+-[0-9]+` pattern, ≤72 chars, valid type
4. Write `.commit-approval` file
5. Show proposed message + files to user
6. On approval: execute `git commit`

### Secondary fix (independent)

The pre-commit hook reads `.git/COMMIT_EDITMSG` for early validation. A stale
`COMMIT_EDITMSG` from a prior failed commit will block the next attempt with a
misleading error. The hook should delete `COMMIT_EDITMSG` before reading it, or
skip the check if the file predates the current staged index.

## Acceptance Criteria

- [ ] `.claude/skills/commit/SKILL.md` created with commit rules as primary context
- [ ] Skill self-validates subject: no `[A-Z]+-[0-9]+`, ≤72 chars, valid type prefix
- [ ] Skill writes `.commit-approval` and presents message + files before committing
- [ ] Pre-commit hook stale-COMMIT_EDITMSG bug fixed (clear or skip if predates index)
- [ ] CLAUDE.md updated: reference `/commit` skill as the standard commit workflow

## Likely Touchpoints

- `.claude/skills/commit/SKILL.md` (new)
- `.husky/pre-commit` (stale COMMIT_EDITMSG fix)
- `CLAUDE.md` (session workflow section)

## Related

- [META-024](META-024-commit-type-taxonomy-for-llm-driven-development.md) — commit type taxonomy the skill enforces
- [META-026](META-026-claude-code-plugin-exploration.md) — `commit-commands` plugin evaluated here
