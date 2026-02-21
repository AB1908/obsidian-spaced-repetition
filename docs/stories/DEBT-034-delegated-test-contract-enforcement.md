# DEBT-034: Delegated Test-Contract Enforcement and Transcript Logging

## Status
Ready

## Epic
None

## User Story
As a maintainer, I want delegated Codex sessions to be verifiably aligned with pre-approved test contracts, so that autonomous runs cannot silently drift from intended validation goals.

## Acceptance Criteria
- [ ] Delegation script supports `--test-contract` and validates required test files/names/commands after run.
- [ ] Delegation script supports `--log-file` and captures full visible terminal transcript.
- [ ] Workflow guide documents contract-first delegated execution pattern.
- [ ] Execution logs include links to raw transcript and contract verification output.

## Context
Current delegated runs can include scope text but do not deterministically verify that required tests were actually created/executed. Also, transcript capture is ad-hoc.

## Related
- `docs/plans/STORY-016-test-contract.md`
- `docs/stories/STORY-016-customizable-annotation-categories.md`
- `docs/stories/DEBT-033-deterministic-execution-protocol.md`
