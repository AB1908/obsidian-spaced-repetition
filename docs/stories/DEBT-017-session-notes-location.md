# DEBT-017: Formalize Session Notes Location

## Status
Done

## Branch
chore/workflow-docs-and-wave-runner

## Description

Session notes are currently embedded in story files under a `## Session Notes` section. This works for short investigations but bloats stories with temporal context (investigation logs, agent output, intermediate findings) that has different lifecycle characteristics than the story specification itself.

Stories should stay focused on **what** and **why**. Session notes capture **how** and **when** — temporal artifacts that are valuable during implementation but become noise once the story is Done.

### Proposed structure

```
docs/sessions/YYYY-MM-DD-<STORY-ID>.md
```

Example: `docs/sessions/2026-02-15-DEBT-011.md`

### Session note template

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

## Acceptance Criteria

- [x] Create `docs/sessions/` directory
- [x] Define session note template in `docs/guides/work-organization.md`
- [x] Story template updated: Session Notes section links to session files instead of embedding
- [x] Migrate existing session notes from active (non-Done) stories
- [x] Done stories: leave existing session notes in place (not worth migrating)

## Related

- [DEBT-016](DEBT-016-stale-documentation.md) — stale docs cleanup
- [DEBT-018](DEBT-018-plan-storage-linking.md) — plan storage (similar separation concern)

## Session Notes
- [2026-02-17](../sessions/2026-02-17-DEBT-017.md)
