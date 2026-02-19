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
6. trust/delegation metrics to guide where autonomy should increase or decrease

## Proposed Artifact Model (v0)
- `intent.json` - goal, constraints, allowed files, risk level
- `test_contract.json` - required tests and pass/fail gates
- `commit_plan.json` - planned commit units and dependencies
- `run_report.json` - actual commits/tests/artifacts/deviations
- `lessons.jsonl` - normalized plan-vs-actual records for iterative improvement
- `trust_metrics.json` - review quality and delegation confidence indicators by workflow area

## Trust/Review Metrics (v0)
Track per run and aggregate by workflow domain (for example: deps, release, refactor, UI):
- `plan_drift_rate`: touched files or commits outside approved plan
- `review_churn_rate`: number of human-requested rework cycles per commit
- `post_merge_defect_rate`: issues discovered after merge that escaped review/test gates
- `test_gate_failure_rate`: % of runs failing required gates before approval
- `approval_latency_minutes`: time from proposed commit to human approval
- `rollback_or_revert_count`: reversals after merge as confidence signal

Use these to classify delegation level:
- `high-trust`: low drift/churn/defects over recent runs
- `medium-trust`: occasional drift requiring moderate oversight
- `low-trust`: high drift/churn/defects, require stricter human gates

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
- Emit run-level trust metrics into `trust_metrics.json`.

### Phase 3: Retrospective and Learning
- Generate a human-readable end-of-run drift summary.
- Record accepted deviations and rationale.
- Append structured lessons to `lessons.jsonl`.
- Update delegation recommendations per workflow domain from trust metric trends.

## Acceptance Criteria
- [ ] A run can be started only after intent/test/plan artifacts are approved.
- [ ] End-of-run report clearly shows planned vs actual deltas.
- [ ] At least one pilot run demonstrates useful drift findings.
- [ ] The process stays lightweight enough for solo usage (no mandatory infra).
- [ ] Trust metrics are produced and understandable without a telemetry backend.
- [ ] At least one domain gets a delegation recommendation from measured metrics.

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
