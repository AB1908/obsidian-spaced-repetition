# META-010: Plan Storage and Linking

## Status
Ready

## Description

Plans are intermediate artifacts — more concrete than stories, less permanent than ADRs. They capture the "how" that connects "what" (story) to "why" (ADR). Currently they exist as ephemeral Claude plan files that are lost between sessions, wasting reusable context.

Plans should be persisted and linked to their corresponding stories and ADRs. After implementation, they serve as a record of intent — useful for reviewing whether implementation followed the plan.

### Proposed structure

```
docs/plans/<STORY-ID>-<slug>.md
```

Example: `docs/plans/DEBT-011-source-model-seam-repair.md`

### Plan template

```markdown
# Plan: <Title>

**Stories:** <linked story IDs>
**Date:** <creation date>
**ADRs:** <linked ADR IDs>

## Context
Why this change is being made.

## Approach
What will be done, in what order, touching which files.

## Verification
How to confirm the changes work end-to-end.
```

### Linking convention

- Story files gain a `## Plan` field linking to the plan file
- Plan files link back to stories and relevant ADRs
- After implementation, plans either stay as-is (historical record) or get promoted to ADR amendments if they revealed architectural decisions

## Acceptance Criteria

- [x] Create `docs/plans/` directory
- [ ] Define plan template in `docs/guides/work-organization.md`
- [ ] Story template updated: add `## Plan` field
- [ ] Existing plans (e.g., DEBT-011 seam repair) stored in new location
- [ ] Document plan lifecycle (creation → implementation → archive/promote)

## Related

- [DEBT-016](../archive/stories/DEBT-016-stale-documentation.md) — stale docs cleanup
- [DEBT-017](../archive/stories/DEBT-017-session-notes-location.md) — session notes (similar separation concern)
- First plan already created: `docs/plans/DEBT-011-source-model-seam-repair.md`
