# META-017: Plan Folders with Snippet Files

## Status
Proposed

## Epic
None

## Description

Implementation plans currently embed code snippets inline in markdown. This makes plan files
hard to skim, mixes "what to do" with "how to do it", and makes side-by-side review of
before/after code awkward.

### Proposed Convention

For plans with significant code changes (>~50 lines of code), use a folder instead of a
single file:

```
docs/plans/STORY-NNN/
  plan.md          ← prose only: decisions, rationale, steps, file list
  snippets/
    before.ts      ← current code at the affected site (copy-pasted)
    after.ts       ← proposed implementation
```

The plan.md references snippet files by name but contains no inline code blocks. Reviewer
opens plan.md and snippets/ side-by-side in the editor.

Simple plans (single file touched, minimal changes) stay as single `.md` files.

### Motivation

- Code snippets in plan markdown are token-heavy for AI sessions
- Syntax highlighting and side-by-side diff is awkward when code is buried in markdown
- Separates "plan review mode" (prose) from "code review mode" (snippets)
- Plan files stay skimmable at a glance

### Tradeoffs

- Con: snippets drift from implementation reality (no freshness check)
- Con: `--scope-file` in `delegate-codex-task.sh` assumes a single file; complex plans
  would need either a combined prompt or a `--scope-dir` flag
- Con: more filesystem overhead per story

## Acceptance Criteria

- [ ] Convention documented in `docs/guides/work-organization.md`
- [ ] `delegate-codex-task.sh` supports `--scope-dir` or a plan-folder convention so
  snippets are included in the delegation prompt
- [ ] At least one existing complex plan migrated to the folder format as example

## Likely Touchpoints
- `docs/guides/work-organization.md`
- `scripts/delegate-codex-task.sh`
- `docs/plans/` (one example migration)

## Related
- [META-010](META-010-plan-storage-linking.md)
- `docs/prompts/meta-improvements-2026-02-25.md`
