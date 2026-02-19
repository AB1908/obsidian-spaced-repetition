# Work Organization Guide

## Philosophy

Three directories, lifecycle-driven:

```
docs/
├── decisions/     # Architecture Decision Records (immutable once accepted)
├── stories/       # ALL work items: features, bugs, debt, ideas
└── guides/        # Reference material: testing, workflow, conventions, learnings
```

Plus `docs/archive/` for completed or stale context.

**Why this structure:**
- `ls docs/stories/` shows all work at a glance
- One file per work item — no monolith files to search
- Status field inside each file tracks lifecycle
- Scales with prefixes, not new directories

## Story File Convention

### Naming

```
<PREFIX>-<NUMBER>-<slug>.md
```

Prefixes:
- `STORY` — feature work (user-facing value)
- `BUG` — confirmed defects
- `DEBT` — technical debt / refactoring
- `SPIKE` — time-boxed research / exploration
- `IDEA` — enhancement ideas, not yet actionable (lightweight, no acceptance criteria required)

### Template

```markdown
# <PREFIX>-<NUMBER>: <Title>

## Status
Backlog | Ready | In Progress | Done

## Epic
<Parent story or "None">

## Branch
<git branch name, if actively being worked>

## Depends on
- [DEBT-001](DEBT-001-whatever.md) — reason

## Blocks
- [STORY-012](STORY-012-whatever.md)

## User Story
As a <role>, I want <goal>, so that <benefit>.

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2

## Context
<Background, investigation notes, links to ADRs>

## Tasks
- [ ] Task 1
- [ ] Task 2

## Session Notes
- [YYYY-MM-DD](../sessions/YYYY-MM-DD-<STORY-ID>.md)

## Related
- ADR: docs/decisions/ADR-020-...
- Guide: docs/guides/testing.md
```

### Required fields

Only `Status` and the title are mandatory. Everything else is "fill in when relevant." A BUG might skip Epic/Branch. A SPIKE might only have Status + Context.

## Recording Knowledge and Ideas

Not everything is a work item. Some things are observations, platform quirks, or enhancement ideas that need recording but don't need a status lifecycle.

### Where things go

| Type | Location | Example |
|------|----------|---------|
| Platform/API knowledge | `docs/guides/<topic>-notes.md` | Obsidian API quirks, gotchas |
| Workflow learnings | `docs/guides/<topic>-notes.md` | Testing strategies, capture cycle |
| Enhancement ideas (not yet actionable) | `docs/stories/IDEA-<N>-<slug>.md` | "someday maybe" improvements |
| Session-specific logs | `docs/sessions/YYYY-MM-DD-<STORY-ID>.md` | Investigation logs, agent output |

### Guide knowledge files

Topic files in `docs/guides/` for durable reference knowledge. Append entries as they surface. Format: date + observation. These grow into useful reference docs over time.

Example: `docs/guides/obsidian-api-notes.md`
```markdown
# Obsidian API Notes

## 2026-02-15: frontmatter.tags can be a string
Obsidian's `CachedMetadata.frontmatter.tags` returns a string (not array)
when YAML has inline form `tags: review/book`. Always normalize.
See BUG-003.
```

### IDEA prefix in stories/

For enhancement ideas that aren't bugs or debt but worth tracking. Lightweight template — just description and related items, no acceptance criteria required.

```markdown
# IDEA-001: <Title>

## Description
<What and why it's interesting>

## Related
- links to relevant stories, guides, or ADRs
```

### Session note template

For temporal artifacts (investigation logs, agent output, intermediate findings) that bloat story files.

Location: `docs/sessions/YYYY-MM-DD-<STORY-ID>.md`

```markdown
# Session: <STORY-ID> — <date>

## Story
[STORY-ID](../stories/<filename>.md)

## Goal
What we set out to accomplish this session.

## Findings
- Finding 1
- Finding 2

## Decisions
- Decision 1 (rationale)

## Next Steps
- What remains
```

### Periodic checkpoint hook (optional)

Recommended cadence for non-trivial execution sessions: every 30-45 minutes append a checkpoint.

Use:
```bash
scripts/session-checkpoint.sh <FOCUS> \
  --story <STORY-ID-or-path> \
  --plan <plan-path> \
  --decision "..." \
  --assumption "..." \
  --question "..." \
  --next "..." \
  --print-path
```

Checkpoint schema appended to `docs/sessions/YYYY-MM-DD-<focus>.md`:
- `Checkpoint HH:MM`
- `Active Links` (story/plan when provided)
- `Decisions`
- `Assumptions`
- `Open Questions`
- `Next Actions`

This is intentionally optional for exploratory sessions. Use it when decision traceability matters.

## Wave runner (Level 2 shell)

Use `scripts/wave-runner.sh` to orchestrate multi-branch plans that define wave tables.

Plan format expected per wave:

```markdown
### Wave 1 (parallel)

| Track | Branch | PR | Scope |
|---|---|---|---|
| A | `branch/name` | PR 1 | scope summary |
```

Supported modes:

```bash
# list waves/tracks
scripts/wave-runner.sh docs/plans/DEBT-011-source-model-seam-repair.md --list

# create worktree commands (safe preview)
scripts/wave-runner.sh docs/plans/DEBT-011-source-model-seam-repair.md --prepare-wave 1 --dry-run

# merge gate simulation (safe preview)
scripts/wave-runner.sh docs/plans/DEBT-011-source-model-seam-repair.md --merge-wave 1 --dry-run
```

Operational behavior:
- `--prepare-wave` creates/attaches worktrees for each branch and prints per-track implementation prompts.
- `--merge-wave` enforces explicit per-branch approval and runs `npm test -- --runInBand` after each approved merge.
- `--dry-run` prints intended actions without writing or merging.

## Codex delegation runner

Use `scripts/delegate-codex-task.sh` when you want one branch/task delegated to a non-interactive Codex run from its own worktree.

Required input is a scope file that already includes:
- plan scope,
- test plan,
- execution steps.

Example:

```bash
# preview only
scripts/delegate-codex-task.sh \
  --branch fix/heading-level-strategy \
  --scope-file docs/plans/BUG-007-delegation-scope.md \
  --dry-run

# execute autonomous run with full permissions in worktree
scripts/delegate-codex-task.sh \
  --branch fix/heading-level-strategy \
  --scope-file docs/plans/BUG-007-delegation-scope.md \
  --execute
```
## Session Start Workflow

Claude scans at session start:

1. **What's in progress?** — `grep -l "Status: In Progress" docs/stories/*`
2. **Dependency check** — read `Depends on:` fields, flag blockers
3. **Propose work order** — topological sort of ready items
4. **User approves or adjusts**

## Commit Convention

```
<type>(<scope>): <what> [<STORY-ID>]

<why — one line linking to user need>
```

Examples:
```
feat(fingerprint): add content hash for drift detection [STORY-010a]

Enable detecting when source text changes after flashcard creation.
```

```
fix(parser): handle metadata without fingerprint segment [STORY-010a]

Backward compatibility for flashcards created before fingerprinting.
```

## Grouping: Epics and Branches

- **Epic** = logical grouping. Stories share `Epic: STORY-010`.
- **Branch** = physical grouping. Stories declare `Branch: feat/markdown-source-strategy`.
- An epic story file lists sub-stories. Sub-stories reference the epic.
- `grep -l "Epic: STORY-010" docs/stories/*` finds everything in the epic.
- `grep -l "Branch: feat/markdown" docs/stories/*` finds everything on the branch.

## Lifecycle

```
Backlog → Ready → In Progress → Done
```

- **Backlog**: Identified but not prioritized
- **Ready**: Prioritized, dependencies resolved, can start
- **In Progress**: Actively being worked (branch exists)
- **Done**: Merged, acceptance criteria met

When a story reaches Done, it stays in `docs/stories/`. It's now documentation of what was done and why.

## Migration from Old Structure

| Old location | New location |
|---|---|
| `docs/features/user_stories.md` | Split into individual `docs/stories/` files |
| `docs/bugs.md` | Split into `docs/stories/BUG-*.md` files |
| `docs/todo/technical_debt.md` | Split into `docs/stories/DEBT-*.md` files |
| `docs/feedback_and_ideas.md` | Items become stories or fold into related stories |
| `docs/context/*.md` (active) | Fold into relevant story's Context/Session Notes |
| `docs/context/*.md` (stale) | Move to `docs/archive/` |
| `docs/testing_guide.md` | `docs/guides/testing.md` |
| `docs/git_workflow.md` | `docs/guides/workflow.md` |
| `docs/architecture/*.md` | `docs/guides/architecture/` |
