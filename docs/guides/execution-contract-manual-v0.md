# Execution Contract (Manual v0)

## Purpose
Prevent execution drift by enforcing a deterministic sequence:
tests contract first, then plan, then implementation, each with explicit human approval before commit and before moving to the next phase.

## Scope
Applies to all non-trivial work (bug fixes, refactors, feature work, release-impacting changes).

## Hard Rules
1. No implementation before a test contract is drafted and approved.
2. No plan execution before plan doc is drafted and approved.
3. No commit without human review of staged diff and commit message.
4. One approved phase at a time. Do not batch-advance phases.
5. If new scope appears mid-run, pause and return to contract + plan update.

## Phase Workflow

## Phase 0: Intake
Artifacts:
- story links
- constraints
- allowed files (optional but recommended)

Gate:
- human confirms scope

## Phase 1: Test Contract
Artifacts:
- target behaviors/invariants
- exact tests to add/update
- fixture changes expected
- pass/fail gate commands

Gate:
- human approves test contract text
- then and only then commit test-contract artifact

## Phase 2: Plan Contract
Artifacts:
- sequence of commits (structure-only first when possible)
- verification checkpoints per commit
- rollback notes

Gate:
- human approves plan text
- then and only then commit plan artifact

## Phase 3: Implementation
Rules:
- execute only planned commit units
- run planned verification at each gate
- stop on drift and request approval for plan update
- perform at least one explicit mid-execution divergence check against the approved plan for multi-commit work

Gate:
- human reviews each commit diff + message before commit

## Phase 4: Closeout
Artifacts:
- planned vs actual summary
- deferred items and rationale
- links to session notes

Gate:
- human approves final cleanup and merge readiness

Closeout checklist:
- story status moved to `Done`
- `CHANGELOG.md` updated when user-facing behavior changed
- session notes entry added/updated in `docs/sessions/`

## Required Human Review Prompts
Before each commit:
1. "Proposed commit message"
2. "Files to include"
3. "Behavior impact summary"
4. "Verification run summary"
5. explicit approval request

## Minimal Templates

## Test Contract Template
```markdown
# Test Contract: <work-item>

## Behaviors to Protect
- ...

## Tests to Add/Update
- file: ...
  - assertion: ...

## Fixtures
- add/update: ...

## Gate Commands
- npm test
- OBSIDIAN_PLUGIN_DIR=. npm run build
```

## Plan Contract Template
```markdown
# Plan Contract: <work-item>

## Commit Units
1. ...
2. ...

## Verification Per Unit
- unit 1: ...
- unit 2: ...

## Drift Policy
- if scope changes, pause and re-approve
```

## Drift Triggers (Mandatory Pause)
- touching files outside agreed scope
- introducing unplanned behavior changes
- failing planned gate tests
- ambiguous naming/domain policy decisions

## Notes
- This is a manual enforcement layer aligned with SPIKE-005 intent/test/plan/run-report model.
- Tooling automation remains optional until revisit trigger is met.
