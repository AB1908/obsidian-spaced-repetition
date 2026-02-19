# DEBT-032: Task Organization Model to Reduce Planning Duplication

## Status
Backlog

## Epic
None

## Description
Planning work is being duplicated across stories, plans, and session notes. Scope is often re-articulated instead of advanced. This creates overhead and makes execution harder to start.

We need a lightweight organization model that keeps planning artifacts minimal, linked, and execution-first.

## Proposed Direction Options

1. **Stream-based backlog (recommended)**
   - Organize work by long-lived streams, not only by ticket type.
   - Suggested streams: `S1-domain-model`, `S2-api-surface`, `S3-storage-boundary`, `S4-test-contracts`, `S5-release-ops`.
   - Stories belong to one primary stream and optionally one supporting stream.

2. **Single source plan per stream**
   - Keep one active plan document per stream.
   - Story files link to stream plan sections instead of creating new full plans repeatedly.

3. **Two-level execution cadence**
   - Weekly: choose 1-2 stream goals.
   - Daily/session: create only an execution slice (small checklist), not a new architecture restatement.

4. **Tagging and lifecycle discipline**
   - Add tags/metadata fields in story docs:
     - `stream`
     - `phase` (`discovery`, `design`, `execution`, `hardening`)
     - `artifact` (`story`, `plan`, `session-note`)
   - Require explicit `supersedes` links when a new doc replaces prior planning text.

5. **Anti-duplication guardrails**
   - New plan docs must include: “What is new vs existing plan?”
   - If <20% new, append to existing plan instead of creating a new file.
   - Session notes reference checklists and outcomes, not re-proposed architecture.

## Acceptance Criteria
- [ ] Agree on one operating model (streams + cadence + linking rules).
- [ ] Document the model in a short guide (`docs/guides/work-organization.md` update or new companion page).
- [ ] Update story template expectations for tags/phase/supersedes metadata.
- [ ] Pilot for one stream (recommended: domain modularization stream) across at least 2 sessions.
- [ ] Retrospective note records whether duplicate planning volume dropped.
- [ ] Workflow guardrail added: worktrees are created via repository scripts (`scripts/delegate-codex-task.sh` or `scripts/wave-runner.sh`) instead of ad-hoc `git worktree add`.

## Likely Touchpoints
- `docs/guides/work-organization.md`
- `docs/stories/*`
- `docs/plans/*`
- `docs/sessions/*`
- `scripts/delegate-codex-task.sh`
- `scripts/wave-runner.sh`

## Related
- [DEBT-017](DEBT-017-session-notes-location.md)
- [DEBT-018](DEBT-018-plan-storage-linking.md)
- [DEBT-029](DEBT-029-formalize-test-methodology-in-plans.md)
- [DEBT-031](DEBT-031-deterministic-modularization-and-domain-model-evolution.md)
