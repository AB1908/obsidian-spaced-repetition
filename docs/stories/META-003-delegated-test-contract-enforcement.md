# META-003: Delegated Test-Contract Enforcement and Transcript Logging

## Status
Ready

## User Story
As a maintainer, I want delegated Codex sessions to be verifiably aligned with pre-approved test contracts, so that autonomous runs cannot silently drift from intended validation goals.

## Acceptance Criteria
- [x] Delegation script supports `--test-contract` and validates required test files/names/commands after run.
- [x] Delegation script supports `--log-file` and captures full visible terminal transcript.
- [ ] Workflow guide documents contract-first delegated execution pattern.
- [ ] Execution logs include links to raw transcript and contract verification output.

## Likely Touchpoints
- `docs/guides/workflow.md`
- `scripts/delegate-codex-task.sh`
- `docs/executions/` log format

## Related
- [META-002](META-002-deterministic-execution-protocol.md)
- [META-004](META-004-delegation-observability-and-guardrails.md)
