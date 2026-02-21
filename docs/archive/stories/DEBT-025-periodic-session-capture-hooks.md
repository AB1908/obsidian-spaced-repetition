# DEBT-025: Periodic Session Capture Hooks

## Status
Done

## Epic
None

## Description
Session insights are being generated faster than they are captured. Manual end-of-session logging misses reasoning, prompt patterns, and decision context needed later for review and process improvement.

Add lightweight time-based capture hooks for session notes without forcing full automation.

## Proposed Direction
- Periodic reminders/checkpoints (for example every 30 minutes) to append:
  - decisions made
  - assumptions
  - unresolved questions
  - next actions
- Standard append target: `docs/sessions/YYYY-MM-DD-<FOCUS>.md`
- Keep manual approval for final note quality and commit.

## Acceptance Criteria
- [x] Define cadence and minimal log schema in work-organization guide.
- [x] Add a lightweight script/checklist command for appending checkpoint notes.
- [x] Link periodic notes from the active story/plan.
- [x] Confirm this stays optional for exploratory sessions.

## Likely Touchpoints
- `docs/guides/work-organization.md`
- `docs/sessions/*`
- optional `scripts/` helper for checkpoint append

## Delivered
- `scripts/session-checkpoint.sh` appends timestamped checkpoints with a stable schema.
- `docs/guides/work-organization.md` now documents cadence, schema, and command usage.

## Related
- [DEBT-017](DEBT-017-session-notes-location.md)
- [DEBT-018](DEBT-018-plan-storage-linking.md)
- [SPIKE-005](SPIKE-005-intent-contract-and-drift-loop.md)
