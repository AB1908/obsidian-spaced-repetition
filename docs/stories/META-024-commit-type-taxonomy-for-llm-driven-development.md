# META-024: Commit Type Taxonomy for LLM-Driven Development

## Status
Proposed

## Epic
None

## Description

The conventional commit spec (`feat/fix/refactor/docs/chore/test`) was designed for
human-authored changelogs. LLM-driven development produces artifact types the spec
never anticipated: planning files, test contracts, story lifecycle events, delegation
execution logs, workflow tooling changes. Today, all of these collapse into `docs:` or
`chore:`, making `git log` semantically meaningless and CHANGELOG generation noisy.

### Problems with current state

- `docs:` covers ADRs, guides, story creation, story closure, story archival, plan
  files, test contracts, scratch updates — completely different audiences and lifecycles
- `chore:` mixes hook changes, script changes, dep updates, release prep
- No way to filter "code changes only" from git log without manual triage
- Closing and archiving a story looks identical to updating a README
- Planning artifacts (scope files, test contracts) show up in the same bucket as
  reference documentation

### Proposed extended taxonomy

Extend, don't replace. Keep `feat/fix/refactor/chore/test` unchanged so standard-version
and CHANGELOG generation continue to work. Add three new types:

| Type | Covers |
|---|---|
| `plan:` | Scope files, test contracts, ADRs, architectural decisions, session plans |
| `story:` | Story lifecycle events — create, update, close, archive |
| `wf:` | Workflow tooling — hooks, scripts, skills, delegation infrastructure |

`docs:` narrows back to genuine reference documentation: guides, README, CLAUDE.md.

### What this enables

- `git log --oneline \| grep -Ev "^story:\|^plan:"` → clean code + workflow history
- `git log --oneline \| grep "^story:"` → full story lifecycle trail
- `git log --oneline \| grep "^plan:"` → all planning artifacts
- CHANGELOG only includes `feat/fix/refactor` (configure standard-version to ignore others)
- Each commit type communicates intent to an agent reorienting at session start

### Example before/after

Before:
```
docs(stories): close type rename and yarn removal stories
docs(plans): add scope and contract for type rename
docs(stories): rewrite stale debt stories, add meta stories
chore(hooks): optimize pre-commit
```

After:
```
story: close and archive DEBT-014, DEBT-041
plan: add scope and contract for type rename and yarn removal
story: rewrite stale DEBT stories, add META-020-022
wf(hooks): optimize pre-commit for docs-only commits
```

### Commit-msg hook changes

- Update `commit-msg` hook to allow `plan|story|wf` in addition to current valid types
- CHANGELOG config: add `plan`, `story`, `wf` to ignored types in `.versionrc.json`
- Update CLAUDE.md commit convention section

## Acceptance Criteria

- [ ] `plan:`, `story:`, `wf:` added to allowed types in `commit-msg` hook
- [ ] `.versionrc.json` configured to exclude new types from CHANGELOG
- [ ] CLAUDE.md commit convention section updated with new taxonomy
- [ ] Existing commits not rewritten (convention applies going forward only)

## Likely Touchpoints

- `.husky/commit-msg` — allowed type validation
- `.versionrc.json` — CHANGELOG type exclusions
- `CLAUDE.md` — commit convention quick reference
- `docs/guides/workflow.md` — commit convention details

## Related

- [META-025](META-025-delegation-workflow-hardening.md) — delegation workflow improvements
