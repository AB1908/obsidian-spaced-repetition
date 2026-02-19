# Test Contract: DEBT-025 Session Checkpoint Hook

**Story:** `docs/stories/DEBT-025-periodic-session-capture-hooks.md`  
**Style:** Spec-first (docs + script)

## Scope
Add a lightweight command that appends periodic session checkpoint notes to `docs/sessions/YYYY-MM-DD-<FOCUS>.md` with a consistent schema and optional story/plan links.

## Behaviors to Protect
1. Command can create session file when missing.
2. Command appends a timestamped checkpoint block with stable section schema:
   - Decisions
   - Assumptions
   - Open Questions
   - Next Actions
3. Command supports linking active story/plan references in the checkpoint block.
4. Workflow guidance defines cadence and marks feature as optional for exploratory sessions.

## Files Expected
- `scripts/session-checkpoint.sh` (new)
- `docs/guides/work-organization.md` (cadence + schema + command usage)
- `docs/stories/DEBT-025-periodic-session-capture-hooks.md` (status/tasks update if complete)

## Verification Plan
1. Script dry-run style checks:
- `scripts/session-checkpoint.sh` with no args exits with usage message.
- Run with sample focus + notes and confirm output file path and appended schema.
2. Idempotence check:
- Run command twice, verify two checkpoint blocks appended (no corruption).
3. Repo gates:
- `npm test -- --runInBand`

## Drift Policy
Pause and re-approve if implementation requires:
- non-shell runtime/tool dependencies,
- mandatory automation hooks,
- changes outside docs/scripts scope.
