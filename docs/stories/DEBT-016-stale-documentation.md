# DEBT-016: Update Stale Documentation

## Status
Done

## Branch
chore/workflow-docs-and-wave-runner

## Description

`docs/guides/workflow.md` contradicts `docs/guides/work-organization.md`. The workflow guide still references the old directory structure (`docs/context/`, `docs/features/`, `docs/todo/`) that was migrated to `docs/stories/`. It also contains templates for context files, feature docs, and TODO organization that are superseded by the story file convention.

### Specific issues

- Project structure diagram shows `docs/context/`, `docs/features/`, `docs/todo/` — directories that no longer exist (or shouldn't be used)
- Templates for "Work Context", "Feature Documentation", "TODO Organization" duplicate what `work-organization.md` defines via story files
- "When to Document What" table references old locations
- `ccmanager` / dual-level workflow section may be stale (verify if still in use)

## Acceptance Criteria

- [x] `workflow.md` updated to reflect current `docs/stories/` structure
- [x] Remove or update templates that reference old directories
- [x] Reconcile with `work-organization.md` — single source of truth for where things go
- [x] Verify no other guides reference old directory structure

## Related

- [DEBT-017](DEBT-017-session-notes-location.md) — session notes formalization
- [DEBT-018](DEBT-018-plan-storage-linking.md) — plan storage and linking

## Session Notes
- [2026-02-17](../sessions/2026-02-17-DEBT-016.md)
