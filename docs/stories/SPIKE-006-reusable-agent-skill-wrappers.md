# SPIKE-006: Reusable Agent Skill Wrappers for Common Workflows

## Status
Backlog

## Epic
None

## Depends on
- [SPIKE-005](SPIKE-005-intent-contract-and-drift-loop.md) - intent/test/plan structure for execution mode

## User Story
As a maintainer, I want small reusable skill wrappers for repetitive workflows (review, squash, merge, release prep), so that chaining common operations is fast and deterministic without removing exploratory flexibility.

## Scope
Define and prototype lightweight wrappers that are:
- agent-agnostic (Codex/Gemini/Claude)
- composable (single-purpose commands)
- optional (not mandatory for exploratory sessions)

## Candidate Wrappers (v0)
- `review-lane` - one-shot lane audit (`log`, `diffstat`, `status`, test gate summary)
- `squash-lane` - deterministic branch squash pattern with backup/stash safeguards
- `merge-lane` - ordered merge helper with rebase + ff-only checks
- `release-preflight` - version/tag consistency + required checks before release prep

## Acceptance Criteria
- [ ] Define wrapper contract per command (inputs, outputs, side effects, failure modes)
- [ ] Propose one implementation strategy usable by all agents (script + prompt templates)
- [ ] Include rollback/recovery guidance per wrapper
- [ ] Validate wrappers on one pilot branch flow

## Non-Goals
- No large orchestration framework in v0
- No mandatory usage in exploratory mode

## Related
- [SPIKE-003](SPIKE-003-prototype-acceleration-parallel-execution-plan.md)
- [SPIKE-005](SPIKE-005-intent-contract-and-drift-loop.md)
