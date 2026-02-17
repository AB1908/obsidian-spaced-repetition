# SPIKE-005: Intent Contract, Test Contract, and Drift Loop

## Status
Backlog

## Epic
None

## Depends on
- [SPIKE-003](SPIKE-003-prototype-acceleration-parallel-execution-plan.md) - parallel lane execution baseline and retrospectives

## User Story
As a maintainer, I want an intent-driven execution contract that maps requests to tests, commit plans, and drift reports, so that agentic runs stay aligned with what I actually want.

## Problem
Execution intent currently lives in prompt text and ad-hoc corrections. This creates drift between:
- what was requested
- what was approved
- what was actually implemented

## Scope
Design a minimal control loop for:
1. intent capture and approval
2. test/acceptance contract approval
3. commit-plan approval
4. execution evidence capture
5. drift analysis and learning for future runs

## Proposed Artifact Model (v0)
- `intent.json` - goal, constraints, allowed files, risk level
- `test_contract.json` - required tests and pass/fail gates
- `commit_plan.json` - planned commit units and dependencies
- `run_report.json` - actual commits/tests/artifacts/deviations
- `lessons.jsonl` - normalized plan-vs-actual records for iterative improvement

## Execution Plan

### Phase 1: Schema and Approval Loop
- Define v0 JSON schemas for intent, test contract, commit plan, and run report.
- Add a lightweight approval checklist for each artifact.
- Require explicit “approved” state before execution starts.

### Phase 2: Execution Tracking
- Implement a small script to stamp run metadata (branch/worktree/session/time).
- Capture executed tests and commit references into `run_report.json`.
- Add simple drift checks:
  - files touched outside allowed scope
  - planned vs actual commits
  - planned vs executed tests

### Phase 3: Retrospective and Learning
- Generate a human-readable end-of-run drift summary.
- Record accepted deviations and rationale.
- Append structured lessons to `lessons.jsonl`.

## Acceptance Criteria
- [ ] A run can be started only after intent/test/plan artifacts are approved.
- [ ] End-of-run report clearly shows planned vs actual deltas.
- [ ] At least one pilot run demonstrates useful drift findings.
- [ ] The process stays lightweight enough for solo usage (no mandatory infra).

## Non-Goals (for v0)
- No Kubernetes/job scheduler integration.
- No mandatory telemetry backend (Langfuse/OpenTelemetry optional later).
- No fully autonomous policy engine.

## Revisit Trigger
If discoverability/drift friction repeats at least two more times in active runs, prioritize implementation of v0 artifacts and tooling in the next cycle.

## Related
- [SPIKE-003](SPIKE-003-prototype-acceleration-parallel-execution-plan.md)
- [SPIKE-004](SPIKE-004-worktree-agent-orchestration-tooling-evaluation.md)
- [SPIKE-006](SPIKE-006-reusable-agent-skill-wrappers.md)
- [SPIKE-007](SPIKE-007-cross-agent-prompt-harmonization.md)
